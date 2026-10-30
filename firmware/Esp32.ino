/**
 * KneeGait-Edge: Phone-Powered Mobile Data Logger
 * Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
 * Hardware Lead: Prateek Dhar Dwivedi
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <esp_wifi.h>

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

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println(">>> [BLE] Phone Connected!");
    }

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println(">>> [BLE] Phone Disconnected. Waiting for reconnection...");
    }
};

void initMPU() {
    Serial.println("[I2C] Waking up MPU at 0x68...");
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x6B); // Power Management 1 register
    Wire.write(0x00); // 0 = wake up
    byte err = Wire.endTransmission(true);
    if (err == 0) {
        Serial.println("[I2C SUCCESS] MPU-6050/6500 is awake and ready!");
    } else {
        Serial.print("[I2C ERROR] Failed to wake MPU, code: ");
        Serial.println(err);
    }
}

bool readMPU(float &acc_pitch, float &gyro_rate) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B); // Starting from ACCEL_XOUT_H
    if (Wire.endTransmission(false) != 0) {
        return false;
    }
    
    Wire.requestFrom((int)MPU_ADDR, 14, (int)true);

    if (Wire.available() >= 14) {
        int16_t ax = Wire.read() << 8 | Wire.read();
        int16_t ay = Wire.read() << 8 | Wire.read();
        int16_t az = Wire.read() << 8 | Wire.read();
        Wire.read(); Wire.read(); // Skip temp
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
    Serial.println("[CALIB] Keep sensor still on your leg for 2 seconds...");
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
        Serial.print("[CALIB SUCCESS] Gyro bias zeroed: ");
        Serial.println(gyro_bias);
    } else {
        Serial.println("[CALIB ERROR] Check sensor wires!");
    }
}

void setup() {
    Serial.begin(115200);
    delay(500);

    // Cut power consumption: stop Wi-Fi radio to protect phone battery
    esp_wifi_stop();

    // Start I2C bus at 100kHz for reliable wire connection
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

    Serial.println("[READY] KneeGait-Edge BLE advertising. Connect phone / web now!");
    last_sample_time = millis();
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

            // Send over BLE to phone if connected
            if (deviceConnected && pDataChar != nullptr) {
                char payload[40];
                snprintf(payload, sizeof(payload), "%lu,%.2f,%.2f\n", now, knee_angle, gyro_rate);
                
                pDataChar->setValue((uint8_t*)payload, strlen(payload));
                pDataChar->notify();
            }
        }
    }
}