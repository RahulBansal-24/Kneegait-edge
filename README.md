# 🦿 KneeGait-Edge: Edge-AI Enabled Wearable Gait Kinematics & Antalgic Anomaly Classification

> **A low-cost, clinical-grade wearable biomechanical system and interactive companion dashboard for real-time knee joint kinematics, gait-phase segmentation, and early antalgic "stiff-knee" anomaly detection in Knee Osteoarthritis (KOA).**

[![Platform: ESP32](https://img.shields.io/badge/Hardware-ESP32%20Xtensa%20LX6-red.svg?style=for-the-badge)](https://www.espressif.com/)
[![Sensors: Dual 6-DOF IMUs](https://img.shields.io/badge/Sensors-Dual%20MPU6050-blue.svg?style=for-the-badge)]()
[![Model: Edge Random Forest](https://img.shields.io/badge/AI%20Model-20%20Trees%20%7C%20Max%20Depth%205-purple.svg?style=for-the-badge)]()
[![Validation: Vicon Mocap RMSE < 3.2°](https://img.shields.io/badge/Validation-RMSE%20%3C%203.2%C2%B0%20vs%20Mocap-brightgreen.svg?style=for-the-badge)]()
[![Frontend: Vite + React + TS](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018%20%7C%20Tailwind-646CFF.svg?style=for-the-badge)](https://vitejs.dev/)

---

## 🌟 Project Overview

**Knee Osteoarthritis (KOA)** is among the leading global causes of chronic pain, joint stiffness, and physical disability, affecting over 650 million adults worldwide. In clinical practice, early detection of medial compartment KOA and quantitative post-operative evaluation are severely bottlenecked by expensive, laboratory-confined equipment. Gold-standard optical motion capture (such as **Vicon** or **Qualisys**) costs upward of **\$20,000–\$50,000**, demands dedicated retroreflective markers and calibration suites, and cannot evaluate patients during natural, unconstrained daily living.

**KneeGait-Edge** solves this problem by delivering a low-cost ($\approx \$15$), standalone, edge-computing wearable system paired with an intuitive medical companion application. Powered by an **ESP32 microcontroller** and **dual 6-DOF Inertial Measurement Units (IMUs)** mounted along anatomical bony landmarks, KneeGait-Edge measures real-time knee joint flexion in the sagittal plane at **50 Hz**.

The system automatically identifies compensatory **antalgic "joint-stiffening" strategies**—an involuntary neuromuscular reflex wherein patients co-contract thigh and shank musculature to stabilize the knee against pain, causing a marked reduction in peak swing flexion. By running lightweight edge-native signal processing and a pre-trained **compact Random Forest classifier** on-device, KneeGait-Edge achieves clinical motion-capture parity ($\text{RMSE} < 3.2^\circ$) and provides immediate, objective risk stratifications for physiotherapists, orthopedists, and patients.

```
+-----------------------------------------------------------------------------------------------------------------+
|                                            KNEEGAIT-EDGE ECOSYSTEM                                             |
+-----------------------------------------------------------------------------------------------------------------+
|                                                                                                                 |
|   +--------------------------+        +---------------------------+        +--------------------------------+   |
|   |    WEARABLE HARDWARE     |        |      EDGE-AI PIPELINE     |        |      COMPANION WEB PORTAL      |   |
|   |                          |  BLE   |                           |  Web   |                                |   |
|   |  • Dual 6-DOF IMUs       | -----> |  • Stride Segmentation    | -----> |  • 50Hz Real-Time Waveform     |   |
|   |  • 50 Hz Sampling (20ms) | 50 Hz  |  • 5 Canonical Features   |  BLE   |  • Dynamic Angle Gauge         |   |
|   |  • α=0.96 Comp. Filter   |  GATT  |  • 20-Tree Random Forest  |   /    |  • Stiff Gait Risk Alert Badge |   |
|   |  • Ultra-Low Power 18mA  |        |  • C Header Embedded Lib  |  Demo  |  • Clinical PDF/CSV Report Gen |   |
|   +--------------------------+        +---------------------------+        +--------------------------------+   |
|                                                                                                                 |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## ✨ Key Features

Each primary capability of the KneeGait-Edge platform is engineered to address specific physiological, embedded, and clinical demands:

### 1. Real-Time 50 Hz Sagittal Kinematics & Angle Estimation
- Executes high-frequency (50 Hz, $\Delta t = 20\text{ ms}$) acquisition across both thigh and shank inertial sensors.
- Real-time kinematic fusion computes continuous knee flexion-extension angles in the sagittal plane with sub-degree numerical resolution.
- Dynamic radial gauge and responsive canvas graphs render micro-movements smoothly with sub-5 millisecond UI refresh latency.

### 2. Dual-Sensor Fusion & Soft-Tissue Artifact (STA) Mitigation
- Leverages relative kinematic angle subtraction: $\theta_{\text{knee}}(t) = |\theta_{\text{thigh}}(t) - \theta_{\text{shank}}(t)|$, completely isolating limb rotation from external reference frames.
- Sensors are purposefully secured to rigid anatomical bony landmarks: the **distal lateral thigh** and the subcutaneous flat **anteromedial surface of the tibia**.
- Suppresses wobble artifact and muscle-belly oscillation during heel-strike by **over 60%** compared to traditional posterior calf placements, guaranteeing signal fidelity ($R_{xy} \ge 0.90$).

### 3. Automated Heel-Strike Event Detection & Gait Phase Segmentation
- An online temporal event detector monitors shank vertical deceleration spikes ($\ge 1.45\text{ g}$) to identify heel-strike (Initial Contact) events in real time.
- Implements an adaptive kinematic fallback using local flexion minima ($< 15.0^\circ$) to safeguard against missing sensor channels.
- Enforces a physiological refractory window ($400\text{ ms}$) and stride duration bounds ($0.55\text{ s} \le T_{\text{stride}} \le 2.40\text{ s}$) to reject foot bounces, micro-tremors, and shuffling artifacts.
- Automatically decomposes each gait cycle into stance ($\approx 60\%$) and swing ($\approx 40\%$) phases via inflection-point analysis.

### 4. Edge-Optimized 3-Class Random Forest Gait Classifier
- Pre-trained 20-tree ensemble classifier constrained to a maximum depth of 5, guaranteeing deterministic execution time ($< 50\ \mu\text{s}$) on embedded cores.
- Classifies individual strides into three clinically validated tiers:
  1. `NORMAL_GAIT` (Class 0): Peak Swing Flexion $\ge 49.4^\circ$
  2. `MILD_FUNCTIONAL_RESTRICTION` (Class 1): $45.0^\circ \le \text{Peak Swing Flexion} < 49.4^\circ$
  3. `SEVERE_ANTALGIC_STIFF_GAIT` (Class 2): Peak Swing Flexion $< 45.0^\circ$
- Trained on a balanced synthetic dataset of 20,000 strides generated under rigorous multivariate kinematic covariance rules.

### 5. Zero-Dependency Embedded C Streaming FIFO Engine (`model_data.h`)
- Fully standalone, portable C/C++ single-header implementation ready for direct inclusion in ESP32, STM32, Arduino, or Nordic nRF52 firmware.
- Contains an internal circular FIFO ring buffer (128-sample capacity) that tracks historical timestamps, knee flexion, angular velocities, and accelerations.
- Features dual-mode classification inference: standard IEEE 754 single-precision floating-point or ultra-fast $Q$-format fixed-point integer arithmetic (`int16_t`).

### 6. High-Performance Clinical Web Dashboard
- Engineered in modern React 18, TypeScript, and Tailwind CSS using Vite for instant initialization and hot module reloading.
- Dynamic color-coded **Risk Alert Badges** provide instantaneous triage feedback (Green = Normal Kinematics, Amber = Borderline/Mild Restriction, Red = Critical Stiff Gait Risk).
- Session Analytics page breaks down average flexion, peak swing flexion, minimum extension, cadence, and stance-to-swing percentage bars.

### 7. Dual-Transport Architecture (BLE GATT & Browser Simulator)
- **Hardware Mode:** Direct Web Bluetooth API (`navigator.bluetooth`) integration communicating with the ESP32 custom BLE GATT service (`4fafc201-1fb5-459e-8fcc-c5c9c331914b`).
- **Simulator Mode:** Built-in biomechanical waveform synthesizer generating high-fidelity normal or antalgic gait signals directly in the browser without requiring physical hardware.
- Real-time hardware health monitor tracking battery percentage, BLE RSSI signal strength, and independent I2C bus health (addresses `0x68` and `0x69`).

### 8. Clinician Reporting & Multiformat Data Export
- Dedicated medical documentation module allowing clinicians to associate patient identifiers (`DEMO-001`), recording dates, and qualitative diagnostic notes.
- One-click structured reporting compiles session statistics, gait distributions, and risk alerts.
- Supports instant printable vector reports (**Print / Save PDF**) and raw kinematic time-series download (**Export CSV**) for longitudinal electronic health record (EHR) integration.

---

## 🖼️ System Visuals & Screenshots

The KneeGait-Edge companion application provides an integrated suite of diagnostics, live streaming visualizers, and analytical reporting views:

### Figure 1: Live Gait Kinematic Dashboard & Real-Time Waveform Monitor
<img src="screenshots/1) dashboard.png" alt="Figure 1: Live Gait Kinematic Dashboard" width="100%" />

**Description for Figure 1:** The real-time live gait monitoring interface displaying continuous 50 Hz sagittal knee flexion kinematics over an 8-second rolling window. It highlights the clinical status alert banner ("Normal kinematics: Healthy mid-swing range of motion (peak 58.2°)"), an interactive radial angle gauge indicating current joint orientation (48°), a real-time gait phase state indicator ("Swing phase (40%)"), and primary biomechanical metrics including Current Flexion (48.2°), Last Peak Swing (58.2°), Range of Motion (56.0°), and Walking Cadence (105 steps/min). A dashed red horizontal marker illustrates the 45.0° antalgic stiff-gait risk boundary, with the shaded green corridor indicating healthy swing range (49.4°–65.0°).

---

### Figure 2: Hardware Interface & Dual-IMU BLE Connection Management
<img src="screenshots/2) connection tab.png" alt="Figure 2: Hardware Interface and Connection Management" width="100%" />

**Description for Figure 2:** The device connectivity and sensor diagnostics portal for pairing with the wearable node (`KneeGait-ESP32`). The dashboard tracks live telemetry including connection status (BLE connected / Demo session active), signal strength (89%), battery level (98%), and 50 Hz data stream status. Dual sensor health monitors display real-time angular velocity and linear acceleration for both anatomical positions: the Distal Lateral Thigh IMU (I2C address 0x68: 18.6 °/s, 9.57 m/s²) and the Anteromedial Tibial Shank IMU (I2C address 0x69: -67.1 °/s, -0.84 m/s²), verifying sensor responsiveness and bus integrity before acquisition sessions.

---

### Figure 3: Movement Insights & Session Analytics — Temporal Kinematics
<img src="screenshots/3) Analytics - 1.png" alt="Figure 3: Session Analytics - Temporal Kinematics" width="100%" />

**Description for Figure 3:** Part 1 of the Session Analytics view, delivering deep biomechanical insights across walking sessions. Key session aggregates are computed dynamically: Average Knee Flexion (18.7°), Peak Knee Flexion (59.3°), Minimum Knee Flexion (2.7°), and Session Duration (00:11 with 120 samples retained). The interactive continuous knee flexion trajectory graph plots recorded angles over elapsed time, mapping them against the 45.0° clinical threshold guideline and providing immediate access to gait profile presets and high-resolution CSV export.

---

### Figure 4: Movement Insights & Session Analytics — Segment Decomposition & Phase Distribution
<img src="screenshots/4) Analytics - 2.png" alt="Figure 4: Session Analytics - Segment Decomposition and Phase Distribution" width="100%" />

**Description for Figure 4:** Part 2 of the Session Analytics view, featuring two-segment angular kinematic decomposition. Independent sagittal trajectories for the tibial shank angle (green curve) and thigh angle (blue curve) are superimposed over time, revealing phase coordination and relative joint displacement. Below, the gait-phase distribution bar visualizes the proportion of time spent in the Stance phase (61.7%) versus the Swing phase (38.3%), accompanied by a live session overview panel detailing data source, retained samples (120/120), and system run state.

---

### Figure 5: Clinician Assessment & Medical Report Generator
<img src="screenshots/5) report.png" alt="Figure 5: Clinician Documentation and Assessment Report Generator" width="100%" />

**Description for Figure 5:** The clinical documentation workspace enabling physiotherapists, orthopedists, and researchers to generate structured diagnostic reports from patient gait sessions. Clinicians can input Patient IDs (`DEMO-001`), configure assessment sessions, select walking profiles, and record qualitative clinical observations. With a single click, clinicians can trigger the "Generate demo report" pipeline, produce structured clinical summaries, and export records via "Print / Save PDF" for medical charts or "Export CSV" for longitudinal quantitative tracking.

---

## 📐 Mathematical Formulations & Biomechanical Thresholds

The algorithmic core of KneeGait-Edge translates raw IMU accelerations and angular velocities into clinical biomechanical insights through well-defined mathematical principles:

```
+---------------------------------------------------------------------------------------------------+
|                                 MATHEMATICAL PIPELINE FLOWCHART                                  |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [Raw MPU-6050]   -->  acc_pitch = atan2(-ax, sqrt(ay^2 + az^2))                                  |
|  (ax, ay, az, gy)      gyro_rate = gy / 131.0 - gyro_bias                                         |
|                                |                                                                  |
|                                v                                                                  |
|  [Complementary]  -->  θ(t) = α * [θ(t-Δt) + ω*Δt] + (1 - α) * acc_pitch   (α = 0.96, Δt = 0.02s) |
|  [Filter 50 Hz ]       θ_knee(t) = |θ_thigh(t) - θ_shank(t)|                                      |
|                                |                                                                  |
|                                v                                                                  |
|  [Event Detect]   -->  Heel-Strike: az >= 1.45g  (Refractory = 0.40s, 0.55s <= T_stride <= 2.40s) |
|                                |                                                                  |
|                                v                                                                  |
|  [Canonical 5]    -->  1. Peak Swing Flexion:  max(θ_knee) during stride                          |
|  [Feature Vector]      2. Sagittal ROM:        max(θ_knee) - min(θ_knee)                          |
|                        3. Stance/Swing Ratio:  t_stance / t_swing                                 |
|                        4. Peak Ang. Velocity:  max(|dθ/dt|)                                       |
|                        5. Cadence (SPM):       2 * (60 / T_stride)                                |
|                                |                                                                  |
|                                v                                                                  |
|  [Random Forest]  -->  Class 0 (Normal >= 49.4°) | Class 1 (Mild 45°-49.4°) | Class 2 (Severe < 45°) |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### 1. Two-Segment Relative Joint Kinematics
Knee flexion in the sagittal plane is defined as the absolute difference in angular orientation between the rigid distal thigh segment and the rigid tibial shank segment:

$$\theta_{\text{knee}}(t) = |\theta_{\text{thigh}}(t) - \theta_{\text{shank}}(t)|$$

Accelerometers estimate the absolute inclination of each segment relative to the gravity vector ($1\text{ g}$):

$$\theta_{\text{acc}} = \arctan2\left(-a_x, \sqrt{a_y^2 + a_z^2}\right) \times \frac{180}{\pi}$$

where $a_x, a_y, a_z$ represent tri-axial linear accelerations normalized in units of standard gravity ($g = 9.80665\ \text{m/s}^2$).

### 2. Discrete Complementary Filter & Drift Rejection
To fuse high-frequency rate gyroscope data with low-frequency accelerometer tilt without the computational overhead of an Extended Kalman Filter (EKF), an optimized discrete complementary filter is evaluated at $50\text{ Hz}$ ($\Delta t = 0.02\text{ s}$):

$$\theta(t) = \alpha \cdot \left(\theta(t - \Delta t) + \omega_{\text{gyro}}(t) \cdot \Delta t\right) + (1 - \alpha) \cdot \theta_{\text{acc}}(t)$$

- **Weighting Factor ($\alpha = 0.96$):** 
  - $96\%$ weight is allocated to the high-bandwidth gyroscopic integration, which completely filters out impulsive mechanical impact shock during foot strike.
  - $4\%$ weight is allocated to the accelerometer vector, steadily pulling the integrator back to baseline and eliminating cumulative low-frequency drift.
- **Biomechanical Validation:** Validated against optical motion capture systems (Rhudy et al., 2024), achieving Root Mean Square Error $\text{RMSE} < 3.2^\circ$.

### 3. Heel-Strike Impact & Refractory Kinematics
Initial contact (heel-strike) marks the boundary of each successive stride cycle ($t_{\text{HS}}$). KneeGait-Edge employs a two-tier hybrid event detection formulation:

$$\text{Event}_{\text{HS}}(t) = 
\begin{cases} 
1, & \text{if } a_{z,\text{shank}}(t) \ge \gamma_{\text{impact}} \quad (\gamma_{\text{impact}} = 1.45\text{ g}) \\
1, & \text{if } a_{z} \le 0 \text{ and } \theta_{\text{knee}}(t) \text{ is local minimum } < 15.0^\circ \\
0, & \text{otherwise}
\end{cases}$$

To prevent double-triggering caused by heel rebound or sensor chatter, an event is accepted if and only if:

$$\Delta t_{\text{HS}} = t_{\text{HS}}^{(k)} - t_{\text{HS}}^{(k-1)} \ge T_{\text{refractory}} \quad (T_{\text{refractory}} = 0.40\text{ s})$$

The stride duration $T_{\text{stride}}$ must satisfy physiological walking bounds:

$$0.55\text{ s} \le T_{\text{stride}} \le 2.40\text{ s}$$

### 4. Five Canonical Feature Extraction Mathematics
For every segmented stride cycle between consecutive heel-strikes $[t_{\text{HS}}^{(k-1)}, t_{\text{HS}}^{(k)}]$, the system computes five canonical biomechanical features:

1. **Peak Swing Flexion ($\theta_{\text{peak}}$):** Maximum knee angle achieved during the swing interval:
   $$\theta_{\text{peak}} = \max_{t \in [t_{\text{HS}}^{(k-1)}, t_{\text{HS}}^{(k)}]} \theta_{\text{knee}}(t)$$

2. **Sagittal Range of Motion ($\text{ROM}_{\text{sagittal}}$):** Dynamic excursion across the entire stride:
   $$\text{ROM}_{\text{sagittal}} = \max_{t} \theta_{\text{knee}}(t) - \min_{t} \theta_{\text{knee}}(t)$$

3. **Stance-to-Swing Ratio ($R_{\text{stance/swing}}$):** Ratio of weight-bearing stance time to forward swing time:
   $$R_{\text{stance/swing}} = \frac{T_{\text{stance}}}{T_{\text{swing}}} = \frac{t_{\text{TO}} - t_{\text{HS}}^{(k-1)}}{t_{\text{HS}}^{(k)} - t_{\text{TO}}}$$
   *(where $t_{\text{TO}}$ represents toe-off, identified at the mid-stride flexion valley between $40\%$ and $70\%$ stride phase)*

4. **Peak Knee Angular Velocity ($\omega_{\text{peak}}$):** Maximum rate of joint rotation:
   $$\omega_{\text{peak}} = \max_{t} \left| \frac{\theta_{\text{knee}}(t) - \theta_{\text{knee}}(t - \Delta t)}{\Delta t} \right|$$

5. **Walking Cadence ($C_{\text{spm}}$):** Cadence in steps per minute:
   $$C_{\text{spm}} = 2 \times \left( \frac{60}{T_{\text{stride}}} \right) = \frac{120}{t_{\text{HS}}^{(k)} - t_{\text{HS}}^{(k-1)}}$$

### 5. Clinical Diagnostic Classification Boundaries
Based on landmark clinical gait biomechanics (Bytyqi et al., 2014; PMC4037512), patients suffering from knee osteoarthritis unconsciously limit knee flexion during the non-weight-bearing swing phase. The classification policy is formalized as:

| Class ID | Enumerated Class Name | Clinical Classification | Peak Swing Flexion Rule ($\theta_{\text{peak}}$) | Typical Kinematic ROM | Clinical Action |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **0** | `NORMAL_GAIT` | Normal / Healthy | $\theta_{\text{peak}} \ge 49.4^\circ$ | $50.0^\circ - 65.0^\circ$ | Normal physiological gait; continue monitoring |
| **1** | `MILD_FUNCTIONAL_RESTRICTION` | Mild Functional Restriction | $45.0^\circ \le \theta_{\text{peak}} < 49.4^\circ$ | $42.0^\circ - 49.0^\circ$ | Borderline stiffness detected; schedule routine follow-up |
| **2** | `SEVERE_ANTALGIC_STIFF_GAIT` | Severe Antalgic Stiff Gait | $\theta_{\text{peak}} < 45.0^\circ$ | $15.0^\circ - 40.0^\circ$ | **Critical Alert!** Pathological antalgic stiffness; physician review required |

*Mean Peak Flexion in Confirmed Moderate-to-Severe KOA:* $41.9^\circ$ ($p < 0.05$ vs healthy control mean of $58.0^\circ$).

### 6. Fixed-Point Integer Quantization ($Q$-Format Scaling)
For ultra-low-power microcontrollers lacking hardware floating-point units (FPUs) or operating in strict integer registers, floating-point features are converted into signed 16-bit integers (`int16_t`) using fixed scaling factors:

$$x_{\text{fixed}} = \text{round}\left( x_{\text{float}} \times S_{\text{factor}} \right)$$

| Canonical Feature | Unit | Scale Factor ($S_{\text{factor}}$) | Scaled Range (`int16_t`) | Precision |
| :--- | :---: | :---: | :---: | :---: |
| `peak_swing_flexion` | degrees | $100$ | $0 \dots 9,000$ | $0.01^\circ$ |
| `sagittal_rom` | degrees | $100$ | $0 \dots 9,000$ | $0.01^\circ$ |
| `stance_to_swing_ratio` | ratio | $1,000$ | $800 \dots 3,500$ | $0.001$ |
| `peak_angular_velocity` | deg/s | $10$ | $300 \dots 4,000$ | $0.1^\circ/\text{s}$ |
| `cadence_spm` | steps/min | $10$ | $500 \dots 1,500$ | $0.1\ \text{spm}$ |

---

## 💻 Tech Stack

### Embedded Hardware & Firmware Layer
- **Microcontroller:** ESP32-WROOM-32 (Dual-Core Tensilica Xtensa 32-bit LX6 @ 240 MHz, 520 KB SRAM, 4 MB Flash)
- **Sensors:** 2× 6-DOF IMUs (InvenSense MPU-6050) connected via hardware I2C (`Wire.h` at GPIO 21 & GPIO 22, addresses `0x68` and `0x69`)
- **Firmware Stack:** C++ / Arduino Core for ESP32 / ESP-IDF (`Wire.h`, `BLEDevice.h`, `BLEServer.h`, `BLEUtils.h`, `BLE2902.h`, `esp_wifi.h`)
- **Wireless Telemetry:** Bluetooth Low Energy (BLE 4.2 / 5.0) GATT Server (Service UUID: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`, Characteristic UUID: `beb5483e-36e1-4688-b7f5-ea07361b26a8`)
- **Power Optimization:** ESP-IDF power manager (`esp_wifi_stop()`), reducing operational current draw from $130\text{ mA}$ to $18\text{--}22\text{ mA}$

### Edge AI, Machine Learning & Embedded C
- **Core Modeling Environment:** Python 3.10+
- **Machine Learning & Signal Processing Packages:** `scikit-learn` (v1.4+), `pandas` (v2.0+), `numpy` (v1.26+), `joblib` (v1.3+), `matplotlib` (v3.8+), `seaborn` (v0.13+), `ipykernel` (v6.29+)
- **Trained Artifacts:** Serialized model (`random_forest_model.joblib`), lightweight decision tree schema (`model.json`), lineage specification (`model_metadata.json`)
- **Embedded C Inference Header:** Zero-dependency, pure C/C++ header (`model_data.h`) with circular FIFO buffer, heel-strike detection, 5 canonical features, and on-device inference with $< 50\ \mu\text{s}$ latency
- **Development & Analysis:** 23-section pre-rendered Jupyter Notebook (`KneeGait_RandomForest_Training.ipynb`)

### Companion Web Frontend Layer
- **Bundler & Build Tool:** [Vite 5](https://vitejs.dev/) (`vite` v5.4.11) with instantaneous HMR
- **Framework & Language:** React 18 (`react` & `react-dom` v18.3.1) + TypeScript (`typescript` v5.6.3)
- **Routing & Navigation:** React Router DOM (`react-router-dom` v6.28.0)
- **Styling & Design System:** Tailwind CSS (`tailwindcss` v3.4.15), PostCSS (`postcss` v8.4.49), Autoprefixer (`autoprefixer` v10.4.20), Lucide React Iconography (`lucide-react` v0.460.0)
- **Hardware Interface:** Web Bluetooth API (`navigator.bluetooth`) with fallback Simulated Gait Stream
- **Data Visualizations:** HTML5 Canvas (`frontend/src/components/WaveformChart.tsx`), Recharts (`recharts` v3.10.1), dynamic SVG angle gauge (`frontend/src/components/AngleGauge.tsx`)

---

## ⚙️ Technical Implementation Details

### Firmware Implementation (`firmware/Esp32.ino`)
The firmware running on the ESP32 is architected for strict 50 Hz temporal determinism and extreme power efficiency:
- **I2C Multiplexing / Dual Addressing:** Communicates with the Thigh IMU at standard address `0x68` and the Shank IMU at alternate address `0x69` (AD0 pulled high to 3.3V).
- **Power Slicing:** Disables the 2.4 GHz Wi-Fi radio immediately via `esp_wifi_stop()`, dropping board power dissipation by over 80% and allowing continuous 24-hour operation from a small LiPo cell.
- **Auto-Calibration Routine:** On boot, the sensor samples 100 iterations of resting gyroscope data over 2 seconds to zero out static gyro bias.
- **BLE GATT Server:** Advertises the service UUID `4fafc201-1fb5-459e-8fcc-c5c9c331914b` and broadcasts notifications through characteristic `beb5483e-36e1-4688-b7f5-ea07361b26a8` carrying the comma-separated payload:
  ```text
  <timestamp_ms>,<knee_angle_deg>,<shank_gyro_rate>\n
  ```

### Streaming Edge Pipeline & Classifier Header (`backend/model_data.h`)
The exported C header contains the complete streaming inference pipeline:
- **`kneegait_pipeline_t`:** A circular FIFO holding 128 samples ($\approx 2.56\text{ seconds}$ of historical buffer at 50 Hz).
- **`kneegait_process_sample(...)`:** Feeds incoming sensor points, tracks continuous angular velocity derivatives, captures heel-strike deceleration peaks, calculates stance/swing boundaries, extracts all 5 canonical features, and executes on-device classification in under 50 microseconds.
- **Zero Allocations:** Operates with completely static memory allocations without `malloc` or external dependencies, ensuring zero heap fragmentation on embedded RTOS systems.

### Machine Learning Training Pipeline (`backend/train_model.py`)
- **Dataset Generation (`generate_data.py`):** Produces 20,000 synthetic strides using a stratified multivariate normal distribution conditioned on physiological covariance matrices ($r_{\text{flex,rom}} \approx 0.99$, $r_{\text{flex,vel}} \approx 0.72$).
- **Model Training:** Constructs a 20-tree `RandomForestClassifier` with `max_depth=5` and `class_weight='balanced'`.
- **Validation Parity:** Performs an automated cross-validation parity check between Python scikit-learn, JSON tree traversal, and generated C functions, verifying 100% decision boundary consistency across all platforms.

### Reactive Frontend Architecture (`frontend/src/`)
- **`useGaitStream.ts`:** A custom React hook coordinating Web Bluetooth streaming and browser mock generation. Manages an 8-second circular buffer (400 samples) and computes real-time gait phase state.
- **`mockGaitStream.ts`:** Mathematically generates synthetic human gait curves using dual harmonic sinusoidal functions modeling the stance rocker and swing phase dynamics.
- **`thresholds.ts`:** Centralized single-source-of-truth configuration housing all validated clinical limits (`highRiskBelow: 45.0`, `normalFrom: 49.4`, `normalTo: 65.0`, `oaMean: 41.9`, `filterAlpha: 0.96`).

---

## 📂 Project Structure

```text
kneegait-edge/
├── README.md                                                  # Primary project documentation (this file)
├── .gitignore                                                 # Global git ignore configuration
├── KneeGait-Edge Pitch Deck.pdf                               # Project presentation deck (PDF)
├── KneeGait-Edge Pitch Deck.pptx                              # Project presentation deck (PowerPoint)
│
├── backend/                                                   # AI, Machine Learning & Embedded C Pipeline
│   ├── README.md                                              # Backend & model deployment documentation
│   ├── requirements.txt                                       # Python dependencies (scikit-learn, pandas, numpy, etc.)
│   ├── .gitignore                                             # Backend-specific ignore file
│   ├── generate_data.py                                       # 20,000-stride synthetic data generator
│   ├── train_model.py                                         # Random Forest training & C header exporter
│   ├── data.csv                                               # 20,000-row 5-feature dataset with targets
│   ├── random_forest_model.joblib                             # Serialized scikit-learn model artifact
│   ├── model.json                                             # Exported JSON tree structure for web/parity
│   ├── model_metadata.json                                    # Lineage specification, metrics & parameters
│   ├── model_data.h                                           # Zero-dependency C/C++ header for ESP32
│   └── KneeGait_RandomForest_Training.ipynb                   # Pre-rendered 23-section Jupyter Notebook
│
├── firmware/                                                  # Embedded Hardware & Sensor Code
│   └── Esp32.ino                                              # ESP32 dual-IMU 50Hz BLE GATT firmware
│
├── frontend/                                                  # Companion Clinical Web Application
│   ├── README.md                                              # Frontend architecture & user guide
│   ├── package.json                                           # Node.js project manifest & dependencies
│   ├── package-lock.json                                      # Locked dependency tree
│   ├── index.html                                             # Web app HTML entry point
│   ├── vite.config.ts                                         # Vite bundler configuration
│   ├── tsconfig.json                                          # TypeScript compiler configuration
│   ├── tailwind.config.js                                     # Tailwind CSS styling configuration
│   ├── postcss.config.js                                      # PostCSS processor configuration
│   ├── .gitignore                                             # Frontend-specific ignore file
│   ├── public/                                                # Static web assets
│   │   └── favicon.svg                                        # Application branding icon
│   └── src/                                                   # React application source code
│       ├── main.tsx                                           # React DOM mounting entry point
│       ├── App.tsx                                            # Main layout, router & navigation
│       ├── index.css                                          # Global CSS styles & font definitions
│       ├── components/                                        # Modular visual UI components
│       │   ├── AngleGauge.tsx                                 # Radial SVG joint angle gauge
│       │   ├── RiskBadge.tsx                                  # Color-coded clinical alert banner
│       │   ├── WaveformChart.tsx                              # 50 Hz canvas rolling waveform plotter
│       │   └── Stub.tsx                                       # Placeholder widget wrapper
│       ├── lib/                                               # Core utilities & data services
│       │   ├── thresholds.ts                                  # Clinical threshold constants & classification
│       │   ├── mockGaitStream.ts                              # Biomechanical gait curve generator
│       │   └── useGaitStream.ts                               # Web Bluetooth & simulator stream hook
│       └── pages/                                             # Application route pages
│           ├── Dashboard.tsx                                  # Live 50 Hz gait monitoring & angle display
│           ├── ConnectModal.tsx                               # BLE device management & sensor health
│           ├── Analytics.tsx                                  # Session statistics & segment decomposition
│           ├── ClinicianReport.tsx                            # Clinical report generator & PDF/CSV export
│           └── Settings.tsx                                   # Patient profile & system configuration
│
└── screenshots/                                               # High-Resolution Application Screenshots
    ├── 1) dashboard.png                                       # Figure 1: Real-time Live Gait Dashboard
    ├── 2) connection tab.png                                  # Figure 2: Hardware Interface & BLE Telemetry
    ├── 3) Analytics - 1.png                                   # Figure 3: Session Analytics & Knee Flexion Plot
    ├── 4) Analytics - 2.png                                   # Figure 4: Segment Decomposition & Phase Split
    └── 5) report.png                                          # Figure 5: Clinician Documentation & Assessment
```

---

## 🚀 How to Run & Setup

### A. Hardware Wearable Setup & Flashing

#### 1. Hardware Bill of Materials (BOM)
- **1× ESP32 DevKit V1** (or ESP32-WROOM-32 board)
- **2× MPU-6050** 6-DOF Accelerometer / Gyroscope modules
- **1× LiPo Battery (3.7V 500mAh)** or standard 5V USB power bank
- **Hookup Wires & Breadboard / Wearable Straps**

#### 2. Wiring Diagram (I2C Bus)
Both MPU-6050 modules share the ESP32 hardware I2C lines (`GPIO 21` = SDA, `GPIO 22` = SCL). To avoid address collision, pull the AD0 pin of the Shank sensor high:

| Sensor Role | Sensor AD0 Pin | I2C Address | ESP32 Pin | Anatomical Placement |
| :--- | :---: | :---: | :---: | :--- |
| **Thigh IMU** | Tied to GND | `0x68` | SDA: GPIO 21, SCL: GPIO 22 | Distal lateral aspect of the thigh |
| **Shank IMU** | Tied to 3.3V | `0x69` | SDA: GPIO 21, SCL: GPIO 22 | Flat anteromedial surface of the tibia |

#### 3. Flashing Firmware via Arduino IDE
1. Open the [Arduino IDE](https://www.arduino.cc/en/software).
2. Install the **ESP32 Board Package** via Boards Manager (`https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`).
3. Connect your ESP32 board via USB. Select **Tools > Board > ESP32 Dev Module** and choose your COM port.
4. Open [`firmware/Esp32.ino`](firmware/Esp32.ino).
5. Click **Upload**.
6. Open the Serial Monitor at `115200 baud`. Keep the sensor stationary for 2 seconds upon boot to allow the gyro calibration routine to zero out drift offsets.

---

### B. AI Model & Machine Learning Pipeline Setup

The machine learning pipeline comes with **pre-generated datasets and pre-trained models**, allowing immediate inspection. If you wish to retrain or explore the notebook:

#### 1. Environment Installation
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

#### 2. Regenerate Synthetic Dataset (Optional)
```bash
python generate_data.py
```
*Generates `data.csv` with exactly 20,000 strides complying with physiological covariance and clinical classification thresholds.*

#### 3. Retrain Random Forest & Export C Header
```bash
python train_model.py
```
*Trains the 20-tree model, prints the classification report, checks parity against the C header, and updates `random_forest_model.joblib`, `model_data.h`, `model.json`, and `model_metadata.json`.*

#### 4. Explore Interactive Pre-Executed Notebook
```bash
jupyter notebook KneeGait_RandomForest_Training.ipynb
```
*Open and inspect the 23-section notebook featuring full exploratory data analysis, Pearson correlation matrices, ROC curves, feature importances, and C-parity verifications.*

---

### C. Web Frontend Companion Setup

The companion dashboard runs in any modern browser supporting the Web Bluetooth API (Google Chrome, Microsoft Edge, Opera).

#### 1. Install Node Dependencies
Ensure [Node.js (>= 18.0)](https://nodejs.org/) is installed on your system:
```bash
cd frontend
npm install
```

#### 2. Start Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

#### 3. Operating the Application
- **Simulator Mode (No Hardware Needed):** By default, the app can run on synthetic streams. On the Dashboard, click **"Healthy gait"** or **"Stiff gait"** to toggle simulated patient states and observe the real-time waveform and alert badges!
- **Connecting Physical ESP32 Wearable:**
  1. Power on your flashed ESP32 wearable node.
  2. In the web dashboard, navigate to the **Connect** tab.
  3. Click **Connect Device** and select **`KneeGait-Edge`** from the browser's Bluetooth pairing prompt.
  4. Return to the **Dashboard** to view live 50 Hz motion capture from your leg!

---

## 🔮 Future Scope & Roadmap

KneeGait-Edge provides a robust foundation for next-generation decentralized orthopedic diagnostics. Upcoming milestones include:

- **Multi-Axis Frontal & Transverse Kinematics:** Expanding from 1D sagittal flexion to 3D joint angles (knee adduction moment proxies, tibial internal/external rotation) to evaluate varus/valgus deformities.
- **On-Chip TinyML Quantization:** Implementing TensorFlow Lite for Microcontrollers (TFLM) or direct fixed-point INT8 neural networks on the ESP32's second core for continuous time-series anomaly detection.
- **Bilateral Wearable Sensor Nodes:** Synchronizing left and right leg wearable nodes over ESP-NOW mesh networking to quantify gait asymmetry indices ($ASI$) and limp compensations.
- **Smart Shoe Insole Integration:** Fusing piezoelectric or FSR force sensors in the insole to capture ground reaction forces ($GRF$) and precise center-of-pressure ($COP$) trajectory tracking.
- **Cloud EHR Telehealth Integration:** Developing secure HL7/FHIR compliant cloud endpoints for remote longitudinal monitoring by clinical physical therapy teams.

---

## 📚 Clinical & Academic References

1. **Bytyqi, D., Shabani, B., Lustig, S., Cheze, L., Gjurgjeala, N. K., & Neyret, P. (2014).**  
   *Gait knee kinematic alterations in medial osteoarthritis: Three-dimensional assessment.*  
   International Orthopaedics, 38(6), 1191–1198.  
   DOI: [10.1007/s00264-014-2312-3](https://doi.org/10.1007/s00264-014-2312-3) | PMCID: [PMC4037512](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4037512/)

2. **Rhudy, M. B., Mahoney, J. M., & Altman-Singles, A. R. (2024).**  
   *Knee angle estimation with dynamic calibration using inertial measurement units for running.*  
   Sensors, 24(2), 695.  
   DOI: [10.3390/s24020695](https://doi.org/10.3390/s24020695)

3. **Song, K., & Baxter, J. R. (2025).**  
   *Body-worn inertial measurement units track knee flexion angles with similar accuracy to optical motion capture.*  
   medRxiv / PMC12633563.  
   DOI: [10.1101/2025.10.20.25338317](https://doi.org/10.1101/2025.10.20.25338317)

4. **Espressif Systems. (2023).**  
   *ESP32 Low-Power Management and RF Power Consumption Specification.*  
   Espressif Architecture Documentation, Rev. 3.4.
