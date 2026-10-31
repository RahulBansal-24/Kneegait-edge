/**
 * KneeGait-Edge: Final ESP32 Dual-Mode Streamer & 5-Feature Stride Extractor
 * Authors: Prateek Dhar Dwivedi (Hardware) & Rahul (AI Lead)
 * 
 * Streams 50Hz continuous kinematics for the live UI graph
 * Computes & broadcasts the 5 Canonical ML features on every completed stride:
 *   1. peak_swing_flexion (deg)
 *   2. sagittal_rom (deg)
 *   3. stance_to_swing_ratio
 *   4. peak_angular_velocity (deg/s)
 *   5. cadence_spm (steps/min)
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <esp_wifi.h>
#include <math.h>

#define MPU_ADDR 0x68

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define DATA_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a8"

const float ALPHA = 0.96f; // Bytyqi et al. 2014 / Rhudy et al. 2024
const float DT = 0.02f;    // 50Hz (20ms)

BLEServer* pServer = nullptr;
BLECharacteristic* pDataChar = nullptr;
bool deviceConnected = false;
bool oldDeviceConnected = false;

float angle_est = 0.0f;
float gyro_bias = 0.0f;
unsigned long last_sample_time = 0;

// ==========================================
// REAL-TIME STRIDE DETECTION & 5-FEATURE ENGINE
// ==========================================
enum StridePhase { STANCE, SWING };
StridePhase current_phase = STANCE;

int stance_count = 0;
int swing_count = 0;
float stride_peak = 0.0f;
float stride_min = 999.0f;
float stride_max_vel = 0.0f;
unsigned long stride_start_time = 0;

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println(">>> [BLE] Client Connected!");
    }

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println(">>> [BLE] Client Disconnected. Waiting for reconnection...");
    }
};

void initMPU() {
    Serial.println("[I2C] Waking up MPU-6050 at 0x68...");
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x6B); // Power Management 1 register
    Wire.write(0x00); // 0 = wake up
    byte err = Wire.endTransmission(true);
    if (err == 0) {
        Serial.println("[I2C SUCCESS] MPU-6050 is awake and ready!");
    } else {
        Serial.printf("[I2C ERROR] Failed to wake MPU, code: %d\n", err);
    }
}

bool readMPU(float &acc_pitch, float &gyro_rate) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    if (Wire.endTransmission(false) != 0) return false;
    
    Wire.requestFrom((int)MPU_ADDR, 14, (int)true);

    if (Wire.available() >= 14) {
        int16_t ax = Wire.read() << 8 | Wire.read();
        int16_t ay = Wire.read() << 8 | Wire.read();
        int16_t az = Wire.read() << 8 | Wire.read();
        Wire.read(); Wire.read(); // Skip temperature
        int16_t gx = Wire.read() << 8 | Wire.read();
        int16_t gy = Wire.read() << 8 | Wire.read();
        int16_t gz = Wire.read() << 8 | Wire.read();

        float ax_g = (float)ax / 16384.0f;
        float ay_g = (float)ay / 16384.0f;
        float az_g = (float)az / 16384.0f;

        float denom = sqrt(ay_g * ay_g + az_g * az_g);
        if (denom > 0.001f) {
            acc_pitch = atan2(-ax_g, denom) * 180.0f / PI;
        }
        gyro_rate = (float)gy / 131.0f;
        return true;
    }
    return false;
}

void calibrateSensor() {
    Serial.println("[CALIB] Keep leg stationary for 2 seconds...");
    float sum_gyro = 0;
    int valid_samples = 0;
    for (int i = 0; i < 100; i++) {
        float ap = 0, gy = 0;
        if (readMPU(ap, gy)) {
            sum_gyro += gy;
            valid_samples++;
        }
        delay(20);
    }
    if (valid_samples > 0) {
        gyro_bias = sum_gyro / (float)valid_samples;
        Serial.printf("[CALIB SUCCESS] Gyro bias zeroed: %.2f deg/s\n", gyro_bias);
    } else {
        Serial.println("[CALIB ERROR] Check sensor wiring!");
    }
}

void processStride(float knee, float gyro, unsigned long now) {
    float abs_vel = fabs(gyro);

    if (knee > stride_peak) stride_peak = knee;
    if (knee < stride_min) stride_min = knee;
    if (abs_vel > stride_max_vel) stride_max_vel = abs_vel;

    if (current_phase == STANCE) {
        stance_count++;
        // Toe-off trigger: knee flexes past 18° and leg swings forward (> 35°/s)
        if (knee > 18.0f && gyro > 35.0f) {
            current_phase = SWING;
        }
    } else {
        swing_count++;
        // Heel-strike detection: angle drops back towards extension (< 16°)
        // Must be at least 550ms to reject impact bounce
        bool heel_strike = (knee < 16.0f && gyro < 15.0f) || 
                           ((now - stride_start_time) > 650 && knee < (stride_peak - 14.0f) && abs_vel < 25.0f);

        if (heel_strike && (now - stride_start_time) >= 550) {
            float duration_s = (now - stride_start_time) / 1000.0f;
            
            // The 5 Canonical Features
            float feat_peak = stride_peak;
            float feat_rom = stride_peak - stride_min;
            if (feat_rom < 5.0f) feat_rom = 5.0f;
            float feat_ratio = (swing_count > 0) ? ((float)stance_count / (float)swing_count) : 1.5f;
            float feat_vel = stride_max_vel;
            float feat_cadence = (duration_s > 0.3f) ? (120.0f / duration_s) : 100.0f;

            // Broadcast ML Stride features
            if (deviceConnected && pDataChar != nullptr) {
                char stride_buf[80];
                snprintf(stride_buf, sizeof(stride_buf), "#STRIDE,%.2f,%.2f,%.2f,%.2f,%.1f\n",
                         feat_peak, feat_rom, feat_ratio, feat_vel, feat_cadence);
                pDataChar->setValue((uint8_t*)stride_buf, strlen(stride_buf));
                pDataChar->notify();
                Serial.print(stride_buf);
            }

            // Reset for next stride
            stride_start_time = now;
            stride_peak = knee;
            stride_min = knee;
            stride_max_vel = abs_vel;
            stance_count = 0;
            swing_count = 0;
            current_phase = STANCE;
        }
    }
}

void setup() {
    Serial.begin(115200);
    delay(500);

    // Disable Wi-Fi radio to reduce current draw to ~20mA
    esp_wifi_stop();

    Wire.begin(21, 22, 100000);
    initMPU();

    delay(1000);
    calibrateSensor();

    // BLE GATT Server Setup
    BLEDevice::init("KneeGait-Edge");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService* pService = pServer->createService(SERVICE_UUID);
    pDataChar = pService->createCharacteristic(
        DATA_CHAR_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pDataChar->addDescriptor(new BLE2902());
    pService->start();

    // Start BLE Advertising
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    BLEDevice::startAdvertising();

    Serial.println("[READY] KneeGait-Edge BLE Advertising started.");
    last_sample_time = millis();
    stride_start_time = millis();
}

void loop() {
    unsigned long now = millis();

    // Auto-reconnect handling
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);
        pServer->startAdvertising();
        oldDeviceConnected = deviceConnected;
    }
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = deviceConnected;
    }

    // 50Hz Sampling Loop (Every 20ms)
    if (now - last_sample_time >= 20) {
        last_sample_time = now;

        float acc_pitch = 0.0f, gyro_rate = 0.0f;
        if (readMPU(acc_pitch, gyro_rate)) {
            gyro_rate -= gyro_bias;

            // Complementary filter (alpha = 0.96)
            angle_est = ALPHA * (angle_est + gyro_rate * DT) + (1.0f - ALPHA) * acc_pitch;
            float knee_angle = fabs(angle_est);

            // 1. Process stride cycle and broadcast 5 ML features upon completion
            processStride(knee_angle, gyro_rate, now);

            // 2. Stream 50Hz live kinematic telemetry for Saksham's React chart
            if (deviceConnected && pDataChar != nullptr) {
                char payload[40];
                snprintf(payload, sizeof(payload), "%lu,%.2f,%.2f\n", now, knee_angle, gyro_rate);
                pDataChar->setValue((uint8_t*)payload, strlen(payload));
                pDataChar->notify();
            }
        }
    }
}