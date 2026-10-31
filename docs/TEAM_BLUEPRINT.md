# KneeGait-Edge — Team Execution Plan & Technical Blueprint 📋🚀
### Hackathon: ZINNOVATIO 4.0 (Chandigarh University 2026)

> **Target Platform:** Edge-AI Wearable & Clinical Web Dashboard for Medial Compartment Knee Osteoarthritis (KOA) & Stiff-Gait Detection  
> **Team Roster:**  
> • **Rahul (Team Leader)** — AI & Kinematic Analytics Lead  
> • **Prateek Dhar Dwivedi** — Hardware & Embedded Firmware Lead  
> • **Saksham Verma** — Frontend & Companion Application Lead  

---

## 🎯 Project Overview & Hackathon Objective

The goal of **KneeGait-Edge** is to build a high-precision, edge-computing gait monitoring system that detects the compensatory **antalgic "joint-stiffening" gait pattern** adopted by patients with medial compartment knee osteoarthritis (KOA).

### Key Clinical & Scientific Benchmarks (From Research)
1. **Diagnostic Threshold (Bytyqi et al. 2014 — PMC4037512):**
   * Healthy reference peak swing flexion: **$49.4^\circ \text{ to } 65.0^\circ$**
   * Medial KOA impaired mean peak: **$41.9^\circ$**
   * **Clinical Firmware Rule:** Peak swing flexion **$< 45.0^\circ$** triggers the **"Stiff Gait Risk" Alert Badge**.
2. **Kinematic Fusion (Rhudy, Mahoney, & Altman-Singles 2024 — MDPI Sensors):**
   * 1D Sagittal knee flexion calculated as $\theta_{\text{knee}} = |\theta_{\text{thigh}} - \theta_{\text{shank}}|$.
   * Discrete complementary filter constant: **$\alpha = 0.96$ at $50\text{ Hz}$** ($\Delta t = 0.02\text{ s}$).
   * Validated accuracy: $\text{RMSE} < 3.2^\circ$ against $\$20,000+$ Vicon optical motion capture.
3. **Anatomical Mounting (Song & Baxter 2025 — PMC12633563):**
   * Shank sensor mounted directly on the **flat anteromedial tibia** to reduce soft-tissue wobble artifact by **$> 60\%$**.
4. **Power Profile (Espressif Systems 2023 — Rev. 3.4 Architecture):**
   * Disable Wi-Fi baseband (`esp_wifi_stop()`) and stream over BLE GATT notifications to drop ESP32 current draw from $130\text{ mA}$ to **$18\text{--}22\text{ mA}$** for $24\text{+ hr}$ battery life.

---

## 🧑‍💻 1. Prateek Dhar Dwivedi — Hardware & Embedded Firmware Lead

### Primary Role
Prateek is responsible for physical sensor integration, microcontroller wiring, low-noise anatomical mounting, and writing the ESP32 embedded C++ firmware that executes the 50Hz complementary filter and broadcasts BLE GATT packets.

### Bill of Materials (BOM) & Wiring Schematic
* **Microcontroller:** ESP32-WROOM-32 Development Board.
* **Sensors:** 2× 6-DOF IMUs (MPU6050, BMI160, or ICM-42670) measuring 3-axis acceleration and 3-axis angular velocity.
* **I2C Addressing without Multiplexer:**
  * **IMU 1 (Thigh):** Pull `AD0` pin to `GND` $\rightarrow$ I2C Address `0x68`.
  * **IMU 2 (Shank):** Pull `AD0` pin to `3.3V` $\rightarrow$ I2C Address `0x69`.
  * **Shared Bus:** Connect both sensors' `SDA` to ESP32 `GPIO 21` and `SCL` to ESP32 `GPIO 22`.
* **Power Source:** 3.7V LiPo battery (with TP4056 charge board) or standard 5V USB power bank via Micro-USB/USB-C.
* **Mounting Straps:** 2× Velcro elastic straps with rigid backing plates.

```
       ESP32 Dev Board
     +-----------------+
     |          3.3V   +-------------------+------------+
     |           GND   +-----------+       |            |
     |        GPIO21   +---+       |       |            |
     |        GPIO22   +-+ |       |       |            |
     +-----------------+ | |       |       |            |
                         | |  +----+---+   |       +----+----+
                         | |  |        |   |       |         |
                         | +--+ SDA    |   |  +----+ SDA     |
                         +----+ SCL    |   |  |    | SCL     |
                              | VCC    +---+  |    | VCC     |
                              | GND    +------+    | GND     |
                              | AD0    +-- GND     | AD0     +-- 3.3V
                              +--------+           +---------+
                              IMU 1 (Thigh)        IMU 2 (Shank)
                              Address: 0x68        Address: 0x69
```

### Firmware Tasks & Features to Implement

#### 1. Anatomical Placement Alignment
* **Thigh IMU:** Mount on the distal lateral thigh, aligned with the long axis of the femur.
* **Shank IMU:** Mount strictly on the **flat, subcutaneous anteromedial surface of the tibia** (Song & Baxter 2025). This eliminates muscle wobble artifacts from the gastrocnemius calf muscle during heel-strike impact.

#### 2. 50Hz Discrete Complementary Filter (`ComplementaryFilter.h`)
* Implement a non-blocking 50Hz timer loop ($\Delta t = 20\text{ ms}$).
* For each sensor, compute pitch angle from accelerometer:
  $$\theta_{\text{acc}} = \text{atan2}(a_x, \sqrt{a_y^2 + a_z^2}) \cdot \left(\frac{180}{\pi}\right)$$
* Integrate gyroscope pitch rate and combine with $\alpha = 0.96$:
  $$\theta(t) = 0.96 \cdot (\theta(t - \Delta t) + \omega_y \cdot 0.02) + 0.04 \cdot \theta_{\text{acc}}$$
* Compute real-time knee joint angle:
  $$\theta_{\text{knee}} = |\theta_{\text{thigh}} - \theta_{\text{shank}}|$$

#### 3. Power Optimization
* Invoke `esp_wifi_stop()` in `setup()` to shut down the power-hungry RF analog baseband.
* Confirm continuous current drops to **$18\text{--}22\text{ mA}$**.

#### 4. BLE GATT Server Implementation
* Advertise Service Name: `KneeGait-Edge`
* Service UUID: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
* Characteristic UUID (Notify): `beb5483e-36e1-4688-b7f5-ea07361b26a8`
* Pack data into a packed C struct (16 bytes per 50Hz frame):
  ```cpp
  struct __attribute__((packed)) GaitPacket {
      uint32_t timestamp_ms; // Milliseconds
      int16_t thigh_angle;   // Scaled by 100 (e.g. 24.50° = 2450)
      int16_t shank_angle;   // Scaled by 100
      int16_t knee_angle;    // Scaled by 100
      int16_t gyro_z;        // Scaled angular velocity
      uint8_t  gait_phase;   // 0 = Stance, 1 = Swing
      uint8_t  flags;        // Bit 0: Alert (<45°), Bit 1: Calibrated
  };
  ```

#### 5. Zero-Calibration Routine
* On power-up or upon receiving a "CALIBRATE" command over BLE, sample 150 frames (3 seconds of quiet standing) to determine initial gyro bias offsets and set neutral standing angle to $0^\circ$.

---

## 💻 2. Saksham Verma — Frontend & Companion Application Lead

### Primary Role
Saksham will build the clinician-facing web application and real-time gait visualization dashboard.  
**Recommended Tech Stack:** **Vite + React (TypeScript) + Tailwind CSS + Lucide Icons + Chart.js / Canvas**.

### Why Vite?
* **Instant Hot Module Replacement (HMR):** Sub-second reload speed during rapid hackathon prototyping.
* **Native Web Bluetooth Support:** Smooth integration with modern browser APIs (`navigator.bluetooth`).
* **High-FPS Canvas/Chart rendering:** Zero-lag plotting of continuous 50Hz incoming telemetry.

### Pages & Views to Build

```
+-----------------------------------------------------------------------------------------------+
|  KneeGait-Edge Web App Sitemap                                                                |
+-------------------+-------------------+-------------------+-------------------+---------------+
| 1. Dashboard (/)  | 2. Connect BLE    | 3. Gait Analytics | 4. Clinician      | 5. Settings   |
|                   |    (/connect)     |    (/analytics)   |    Report (/rep)  |    (/settings)|
| - 50Hz Waveform   | - Scan & Pair     | - Gait Cycle norm | - Patient details | - Thresholds  |
| - Angle Dial      | - RSSI / Battery  | - Stance vs Swing | - PDF / CSV Export| - Alpha filter|
| - Stiff Gait Alert| - Stand Calibrate | - Bilateral ROM   | - Bytyqi Ref      | - Mock toggle |
| - Live Phase Pill | - Mock Stream Sim | - Stride cadence  | - Medical Summary | - Audio alert |
+-------------------+-------------------+-------------------+-------------------+---------------+
```

#### Page 1: Live Gait Telemetry Dashboard (`src/pages/Dashboard.tsx`)
The centerpiece of the application during judge presentations:
* **Real-time 50Hz Flexion Waveform Graph:**
  * Rolling 5–10 second window showing knee flexion angle ($\theta_{\text{knee}}$) in degrees.
  * Shaded green target band representing normal healthy swing range ($49.4^\circ \text{--} 65.0^\circ$).
  * Red horizontal reference line at $45.0^\circ$ (the critical Bytyqi et al. diagnostic boundary).
* **Live Angular Gauge / Circular Meter:**
  * Visualizes the current knee angle ($0^\circ \text{ to } 90^\circ$) with an animated needle or radial arc.
* **Dynamic "Stiff Gait Risk" Alert Badge (`src/components/RiskBadge.tsx`):**
  * **🔴 HIGH RISK (STIFF GAIT DETECTED):** Displayed when mid-swing peak flexion fails to reach $45.0^\circ$. Displays text: *"Antalgic Joint-Stiffening Strategy Observed (Peak: XX.X° < 45.0° - Medial KOA Biomarker)"*.
  * **🟢 NORMAL KINEMATICS:** Displayed when peak swing is within $49.4^\circ \text{--} 65.0^\circ$. Displays text: *"Healthy Mid-Swing Range of Motion"*.
  * **🟡 BORDERLINE / MILD RESTRICTION:** Displayed when peak swing is between $45.0^\circ \text{ and } 49.3^\circ$.
* **Live Gait Phase Pill:**
  * Animated badge alternating between **"STANCE PHASE (60%)"** and **"SWING PHASE (40%)"**.
* **Live KPI Metric Cards:**
  * *Current Flexion Angle ($^\circ$)*
  * *Last Peak Swing Flexion ($^\circ$)*
  * *Range of Motion / ROM ($^\circ$)*
  * *Cadence (steps/min)*

#### Page 2: Bluetooth Pairing & Calibration Hub (`src/pages/ConnectModal.tsx`)
* Web Bluetooth connect button triggering `navigator.bluetooth.requestDevice`.
* Connection state card (Connected, Disconnected, Reconnecting, Signal Strength RSSI, Battery %).
* **3-Second Standing Calibration Wizard:** Interactive countdown asking patient to stand erect to set zero-baseline.
* **Hardware-Free "Simulator Mode" Toggle:**  
  * **CRITICAL FOR HACKATHON DEMOS!** If physical hardware is being flashed or debugged by Prateek, this button switches the dashboard to a high-fidelity synthetic stream (`mockGaitStream.ts`), letting judges test both healthy ($58^\circ$ peak) and medial KOA stiff-gait ($39^\circ$ peak) scenarios at the flick of a switch.

#### Page 3: Session Analytics & Gait Cycles (`src/pages/Analytics.tsx`)
* **Normalized Gait Cycle Plot:** Overlays multiple gait strides normalized from $0\%$ (Heel Strike) to $100\%$ (Next Heel Strike).
* **Kinematic Parameter Comparison:**
  * Average Peak Swing Flexion vs Population Norms.
  * Stance-to-Swing Time Ratio (Normal: ~60:40; OA: prolonged stance to minimize swing pain).
  * ROM Trend chart across consecutive walking trials.

#### Page 4: Clinician Diagnostic Report & Export (`src/pages/ClinicianReport.tsx`)
* Formatted clinical report card displaying:
  * Patient ID / Session Date / Duration.
  * Mean peak swing flexion vs Bytyqi et al. (2014) threshold ($41.9^\circ$ OA vs $49.4^\circ\text{--}65.0^\circ$ Control).
  * System Risk Assessment: *Medial Compartment Antalgic Stiffening Detected*.
* **Export Action Buttons:**
  * **Export PDF:** Clean, printable medical document layout using `@media print` or `jsPDF`.
  * **Download CSV:** Exports time-series kinematic log (timestamp, thigh, shank, knee, phase, alert).

#### Page 5: Settings & Calibration Parameters (`src/pages/Settings.tsx`)
* Threshold configuration slider (default: $45.0^\circ$).
* Filter smoothing constant display ($\alpha = 0.96$ at $50\text{ Hz}$).
* Sound Alert Toggle (beeps when high-risk stride occurs).

---

## 🧠 3. Rahul — Team Leader & AI / Kinematic Analytics Lead 👑

### Primary Role & Leadership
As **Team Leader**, Rahul oversees overall project vision, manages task integration across Prateek (Hardware) and Saksham (Frontend), and anchors the ZINNOVATIO 4.0 technical presentation/pitch for the judges. Technically, Rahul architects the biomechanical feature extraction pipeline, real-time gait phase segmentation, and the AI classification model to score KOA progression and detect gait anomalies.

### Team Leadership Responsibilities (ZINNOVATIO 4.0)
* **Cross-Layer Synchronization:** Ensure the ESP32 packet definitions from Prateek align with the Web Bluetooth parser in Saksham's Vite app.
* **Clinical Integrity:** Verify all thresholds adhere to *Bytyqi et al. (2014)* ($< 45^\circ$) and *Rhudy et al. (2024)* ($\alpha = 0.96$).
* **Hackathon Pitch Lead:** Lead the final demonstration, explaining the clinical problem of antalgic stiffening, the edge-AI architecture, and demonstrating live or simulated telemetry.

### AI Tasks & Algorithms to Implement

#### 1. Real-Time Gait Phase Segmentation (`segmentation.py`)
Segment continuous 50Hz knee angle and angular velocity data into standard clinical gait phases:
* **Heel-Strike (0% Cycle):** Detected by sharp deceleration peak in shank acceleration vector and local minimum in knee flexion.
* **Mid-Stance (10%–30% Cycle):** Stance phase flexion (~$15^\circ\text{--}20^\circ$) to absorb body weight.
* **Toe-Off (~60% Cycle):** Rapid onset of positive angular velocity ($\omega_y > 0$).
* **Mid-Swing Peak (~75%–80% Cycle):** Maximum sagittal knee flexion reached ($\theta_{\text{peak}}$).
* **Terminal Swing (100%):** Deceleration leading into the subsequent heel strike.

```
Flexion
Angle (°)
  70 |                          _--_ (Mid-Swing Peak: 50°-65° Healthy / <45° OA)
  60 |                         /    \
  50 |                        /      \
  40 |    _--_ (Stance Flex) /        \
  20 |   /    \             /          \
   0 |--/------\-----------/------------\--- (Heel-Strike)
     0%        30%       60%    75%    100% of Gait Cycle
      <---- STANCE (60%) ----><- SWING (40%) ->
```

#### 2. Biomechanical Feature Extractor (`feature_extraction.py`)
From each segmented stride cycle, calculate:
1. **$\theta_{\text{peak}}$ (Peak Swing Flexion):** Primary clinical biomarker (Bytyqi et al. 2014).
2. **$\text{ROM}_{\text{sagittal}}$ (Range of Motion):** $\theta_{\text{peak}} - \theta_{\text{min}}$.
3. **$\omega_{\text{max}}$ (Peak Swing Angular Velocity):** Maximum rate of extension/flexion in deg/sec.
4. **Stance/Swing Ratio ($R_{ss}$):** $T_{\text{stance}} / T_{\text{swing}}$ (prolonged in antalgic gait).
5. **Stride Cadence:** Steps per minute derived from stride duration $\Delta T_{\text{stride}}$.
6. **Waveform Root-Mean-Square (RMS) & Smoothness Metric:** Quantifies jerky or hesitating transitions.

#### 3. Gait Anomaly Classifier (`train_classifier.py` & `models/`)
* **Task:** Classify walking strides into 3 clinical categories:
  * `0`: **Normal / Healthy Gait** ($\theta_{\text{peak}} \ge 49.4^\circ$, smooth pendular swing)
  * `1`: **Mild Functional Stiffening** ($45.0^\circ \le \theta_{\text{peak}} < 49.4^\circ$)
  * `2`: **Severe Medial KOA Antalgic Stiffening** ($\theta_{\text{peak}} < 45.0^\circ$, decreased swing velocity, prolonged stance)
* **Model Choices:**
  * **Option A (Lightweight Tree / Random Forest):** Extremely fast, interpretable, feature importances directly explain clinical reasons.
  * **Option B (1D-CNN / Edge Impulse):** Raw 50-sample window classifier that classifies without manual peak extraction.
* **Edge Deployment:**
  * Export model to **TensorFlow Lite for Microcontrollers (TFLite Micro)** as a C byte array (`model_data.h`) for Prateek's ESP32 ($<1.2\text{ ms}$ inference time).
  * Also export an **ONNX / JSON model** for Saksham's browser dashboard using `onnxruntime-web` or client-side JavaScript rules.

#### 4. Synthetic Gait Dataset & Validation Suite (`datasets/`)
* Create a Python generator script (`generate_synthetic_gait.py`) to synthesize:
  * 1,000 healthy strides ($\mu = 57.2^\circ, \sigma = 4.1^\circ$).
  * 1,000 medial KOA stiffened strides ($\mu = 41.9^\circ, \sigma = 3.8^\circ$ based on Bytyqi et al. 2014).
* Provide exported CSV files for:
  * Saksham to feed the Vite frontend simulator mode.
  * Benchmarking classifier sensitivity, specificity, and ROC-AUC ($> 95\%$).

---

## 📡 Shared Interface & Communication Contracts

To ensure Prateek, Saksham, and Rahul work seamlessly in parallel, all three adhere to this common data contract:

### 1. BLE GATT Service & Characteristics
* **Service Name:** `KneeGait-Edge`
* **Service UUID:** `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
* **Data Characteristic UUID (Notify @ 50Hz):** `beb5483e-36e1-4688-b7f5-ea07361b26a8`
* **Control Characteristic UUID (Write - Calibrate/Zero):** `beb5483e-36e1-4688-b7f5-ea07361b26a9`

### 2. Binary Packet Format (16 Bytes, Little-Endian)
```
[ Byte 0-3 ]: uint32 timestamp_ms     (e.g., 10420 ms)
[ Byte 4-5 ]: int16  thigh_angle_deg  (val / 100.0, e.g., 1520 -> 15.20°)
[ Byte 6-7 ]: int16  shank_angle_deg  (val / 100.0, e.g., -3480 -> -34.80°)
[ Byte 8-9 ]: int16  knee_angle_deg   (val / 100.0, e.g., 5000 -> 50.00°)
[ Byte 10-11]: int16 gyro_y_dps       (val / 10.0, e.g., 1250 -> 125.0 deg/s)
[ Byte 12   ]: uint8  gait_phase      (0 = Heel-Strike/Stance, 1 = Toe-Off/Swing)
[ Byte 13   ]: uint8  alert_flags     (Bit 0: Stiff Knee Risk <45°, Bit 1: Calibrated)
[ Byte 14-15]: uint16 checksum / CRC  (Integrity check)
```

### 3. JavaScript / Web Bluetooth Parser (for Saksham's Vite app)
```typescript
function parseGaitPacket(dataView: DataView) {
  return {
    timestampMs: dataView.getUint32(0, true),
    thighAngle: dataView.getInt16(4, true) / 100.0,
    shankAngle: dataView.getInt16(6, true) / 100.0,
    kneeAngle: dataView.getInt16(8, true) / 100.0,
    gyroY: dataView.getInt16(10, true) / 10.0,
    gaitPhase: dataView.getUint8(12) === 1 ? 'SWING' : 'STANCE',
    isStiffGaitRisk: (dataView.getUint8(13) & 0x01) === 1,
    isCalibrated: (dataView.getUint8(13) & 0x02) === 2,
  };
}
```

---

## ⏱️ Hackathon Sprint Schedule

| Sprint Phase | Prateek (Hardware/Firmware) | Saksham (Frontend - Vite) | Rahul (Team Leader & AI) |
| :--- | :--- | :--- | :--- |
| **Phase 1: Setup & Protocol** | Wire dual IMUs to ESP32 (0x68 & 0x69); verify I2C communication. | Scaffold Vite + React + TS + Tailwind app; create layout & mock stream. | Write `generate_synthetic_gait.py`; create healthy vs KOA test CSVs. |
| **Phase 2: Core Engineering** | Implement 50Hz timer loop & complementary filter ($\alpha = 0.96$). | Build `LiveGauge.tsx`, `WaveformChart.tsx`, and `RiskBadge.tsx`. | Implement peak detection & gait phase segmentation (`segmentation.py`). |
| **Phase 3: Wireless & AI** | Implement BLE GATT server & `esp_wifi_stop()` power savings. | Hook up Web Bluetooth API (`bleService.ts`) & calibrate dialog. | Train KOA classifier; export TFLite C array & browser inference weights. |
| **Phase 4: Full Integration** | Mount sensors to straps (thigh & anteromedial tibia); live walk test. | Connect live BLE to dashboard; verify <45° dynamic red alert badge. | Validate segmentation & anomaly metrics on live walking trials. |
| **Phase 5: Pitch & Polish** | Polish physical wearable demo unit & power bank setup. | Polish Clinician Report export (PDF/CSV) and demo toggle switch. | Prepare confusion matrix, ROC curve, and clinical accuracy slides. |

---

## 🏆 Hackathon Winning Criteria Checklist
- [x] **Rigorous Science:** Built on peer-reviewed citations (Bytyqi 2014, Rhudy 2024, Song & Baxter 2025, Espressif Systems 2023).
- [x] **Validated Accuracy:** 2-segment fusion with $\text{RMSE} < 3.2^\circ$ vs $\$20,000+$ Vicon systems.
- [x] **Direct Clinical Relevance:** Explicit antalgic joint-stiffening detection with the $< 45^\circ$ decision threshold.
- [x] **Edge Efficiency:** $\sim 20\text{ mA}$ power consumption via `esp_wifi_stop()` for all-day wearable operation.
- [x] **Polished Presentation:** Vite-powered live dashboard with real-time waveform, instant alert badges, and clinician reports.

---

## 📜 Peer-Reviewed Research & Engineering Literature

1. **Bytyqi, D., Shabani, B., Lustig, S., Cheze, L., Gjurgjeala, N. K., & Neyret, P. (2014).**  
   *Gait knee kinematic alterations in medial osteoarthritis: Three-dimensional assessment.*  
   **International Orthopaedics**, 38(6), 1191–1198.  
   DOI: [10.1007/s00264-014-2312-3](https://doi.org/10.1007/s00264-014-2312-3) | PMCID: [PMC4037512](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4037512/)

2. **Rhudy, M. B., Mahoney, J. M., & Altman-Singles, A. R. (2024).**  
   *Knee angle estimation with dynamic calibration using inertial measurement units for running.*  
   **Sensors**, 24(2), 695.  
   DOI: [10.3390/s24020695](https://doi.org/10.3390/s24020695)

3. **Song, K., & Baxter, J. R. (2025).**  
   *Body-worn inertial measurement units track knee flexion angles with similar accuracy to optical motion capture.*  
   **medRxiv / PMC12633563**.  
   DOI: [10.1101/2025.10.20.25338317](https://doi.org/10.1101/2025.10.20.25338317)

4. **Espressif Systems. (2023).**  
   *ESP32 Low-Power Management and RF Power Consumption Specification.*  
   **Espressif Architecture Documentation**, Rev. 3.4.

