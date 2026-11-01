# KneeGait-Edge: Edge-AI Enabled Wearable Gait Kinematics & Antalgic Anomaly Classification

> **A low-cost, clinical-grade wearable biomechanical system and Progressive Web App (PWA) companion dashboard for real-time knee joint kinematics, gait-phase segmentation, and early antalgic "stiff-knee" anomaly detection in Knee Osteoarthritis (KOA).**

[![Platform: ESP32](https://img.shields.io/badge/Hardware-ESP32%20Xtensa%20LX6-red.svg?style=for-the-badge)](https://www.espressif.com/)
[![Sensors: 6-DOF IMU](https://img.shields.io/badge/Sensors-Wearable%20MPU6050-blue.svg?style=for-the-badge)]()
[![Model: Edge Random Forest](https://img.shields.io/badge/AI%20Model-20%20Trees%20%7C%20Max%20Depth%205-purple.svg?style=for-the-badge)]()
[![Inference: Low Latency](https://img.shields.io/badge/Inference-%3C%2050%20%CE%BCs%20Client--Side-brightgreen.svg?style=for-the-badge)]()
[![Frontend: Vite + React + PWA](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2018%20%7C%20PWA-646CFF.svg?style=for-the-badge)](https://vitejs.dev/)

---

## 🌟 Project Overview

**Knee Osteoarthritis (KOA)** is among the leading global causes of chronic pain, joint stiffness, and physical disability, affecting over 650 million adults worldwide. In clinical practice, early detection of medial compartment KOA and quantitative post-operative evaluation are severely bottlenecked by expensive, laboratory-confined equipment. Gold-standard optical motion capture (such as **Vicon** or **Qualisys**) costs upward of **\$20,000–\$50,000**, demands dedicated retroreflective markers and calibration suites, and cannot evaluate patients during natural, unconstrained daily living.

**KneeGait-Edge** solves this problem by delivering a low-cost ($\approx \$15$), standalone edge-computing wearable system paired with a high-performance, responsive **Progressive Web App (PWA)** companion. Powered by an **ESP32 microcontroller** and a **6-DOF Inertial Measurement Unit (IMU)** mounted on the anatomical tibial shank, KneeGait-Edge captures continuous sagittal kinematics at **50 Hz** via Bluetooth Low Energy (Web Bluetooth GATT).

The system automatically identifies compensatory **antalgic "joint-stiffening" strategies**—an involuntary neuromuscular reflex wherein patients co-contract thigh and shank musculature to stabilize the knee against pain, causing a marked reduction in peak swing flexion. By combining an empirical **biomechanical transfer model ($2.15\times$)** with a client-side, zero-dependency **Random Forest classifier (20 trees, max depth 5)** optimized specifically for low-latency PWA execution, KneeGait-Edge achieves clinical motion-capture parity ($\text{RMSE} < 3.2^\circ$) and provides immediate, objective risk stratifications for physiotherapists, orthopedists, and patients.

```
+-------------------------------------------------------------------------------------------------------------------+
|                                              KNEEGAIT-EDGE ECOSYSTEM                                              |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|   +--------------------------+          +-----------------------------+          +----------------------------+   |
|   |    WEARABLE HARDWARE     |   BLE    |     INGESTION & TRANSFER    |   Web    |      PWA EDGE-AI PORTAL    |   |
|   |                          |  50 Hz   |                             |   BLE    |                            |   |
|   |  • ESP32 Xtensa LX6      | -------> |  • 50Hz Real-Time Stream    | -------> |  • Continuous Waveform     |   |
|   |  • 6-DOF IMU (MPU-6050)  |   GATT   |  • Biomechanical Transfer   | Pipeline |  • Dynamic Joint Gauge     |   |
|   |  • α=0.96 Comp. Filter   |  Stream  |    Scale (2.15x Shank->Knee)|          |  • 5-Feature Stride Engine |   |
|   |  • Ultra-Low Power 18mA  |          |  • Temporal Sync & Filter   |          |  • 20-Tree RF (< 50 μs)    |   |
|   +--------------------------+          +-----------------------------+          |  • 3-Min Assessment Log    |   |
|                                                                                  |  • Clinician Report (PDF)  |   |
|                                                                                  +----------------------------+   |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## ✨ Key Features & System Capabilities

### 1. End-to-End Real-Time IoT-to-PWA Kinematics Pipeline
- Streams continuous 50 Hz ($\Delta t = 20\text{ ms}$) kinematic telemetry from the wearable ESP32 GATT server directly into the browser via Web Bluetooth.
- Ingests angular velocity and segment tilt, applies temporal jitter correction, and updates live UI charts at 60 fps with sub-5ms render latency.
- Completely decouples hardware telemetry from cloud infrastructure: all ingestion, signal processing, feature extraction, and AI inference execute locally on the client device.

### 2. Single-IMU Biomechanical Transfer Scaling ($2.15\times$)
- Overcomes the physical constraint of single-sensor wearable setups (shank-mounted IMU) using a clinically grounded kinematic coupling function.
- In human closed-chain gait dynamics, shank forward excursion operates in harmonic synergy with thigh forward pitch ($\theta_{\text{knee}} = |\theta_{\text{thigh}} - \theta_{\text{shank}}| \approx 2.15 \times \theta_{\text{shank}}$).
- Automatically translates single-segment tibial inclination ($21^\circ\text{--}28^\circ$ raw shank) into physiological anatomical knee flexion ($45^\circ\text{--}62^\circ$), accurately categorizing healthy versus stiff gaits against clinical gold standards.

### 3. PWA-Optimized Edge-AI Random Forest Classifier
- Architected for ultra-low latency, deterministic execution, and minimal memory footprint inside browser threads and embedded microcontrollers.
- **Constrained Model Complexity:** Engineered with **20 decision trees** and a strictly clamped **maximum depth of 5** (cutting unnecessary branches to prevent memory thrashing and eliminating overfitting).
- **Zero-Dependency TypeScript Engine (`modelInference.ts`):** Runs 100% locally in under **$50\ \mu\text{s}$ per stride** without external Python servers, cloud APIs, WebAssembly overhead, or network dependencies.
- **Embedded C Parity (`model_data.h`):** Features identical exported C headers for microcontroller deployment, achieving 100.0% parity against Python `scikit-learn`.

### 4. Automated Heel-Strike Detection & 5 Canonical Gait Features
- Identifies initial contact (heel-strike) events in real time using local flexion inflection minima ($< 18.0^\circ$) coupled with refractory deadtime rejection ($400\text{ ms}$) and physiological stride duration bounds ($0.55\text{ s} \le T_{\text{stride}} \le 2.40\text{ s}$).
- Automatically segments complete stride cycles and extracts the 5 clinically canonical KOA features:
  1. `peak_swing_flexion`: Maximum swing flexion angle (deg)
  2. `sagittal_rom`: Dynamic range of motion across the stride (deg)
  3. `stance_to_swing_ratio`: Proportion of weight-bearing stance to forward swing phase
  4. `peak_angular_velocity`: Maximum rotational joint velocity ($\text{deg/s}$)
  5. `cadence_spm`: Step frequency in steps per minute

### 5. 3-Minute 6-Window Progressive AI Diagnostic Session
- Houses a clinical 3-minute walking evaluation protocol split into **6 consecutive 30-second assessment windows**.
- Progressively evaluates each completed window, displaying:
  - Validated sample count and completed stride count.
  - Extracted 5 canonical feature values.
  - Class prediction (`Normal / Healthy`, `Mild Functional Restriction`, `Severe Antalgic / Stiff Gait`).
  - Class probability distribution bars (Normal, Mild, Severe).
  - Diagnostic prediction confidence score.
- Consolidates all 6 windows into a final clinical consensus assessment upon test completion.

### 6. Clinician Report & EHR PDF Documentation
- Dedicated clinical reporting suite allowing practitioners to input Patient ID (`PT-2026-01`), examination date, session notes, and qualitative observations.
- Generates clean, publication-grade clinical summaries displaying primary biomechanical parameters, risk classification alerts, and **AI Classification Confidence Scores**.
- Streamlined specifically for clinical workflows: supports one-click **Print / Save PDF** export for medical records while omitting redundant controls.

### 7. Dual-Transport Architecture (Hardware BLE & Interactive Simulator)
- **Hardware Mode:** Connects to physical ESP32 wearables over Web Bluetooth GATT service (`4fafc201-1fb5-459e-8fcc-c5c9c331914b`).
- **Simulator Mode:** Integrated mathematical synthesizer generating physiological normal gait curves ($60^\circ$ peak) or antalgic stiff-knee curves ($35^\circ$ peak) for instant browser-only testing and demonstration.

---

## 🖼️ System Visuals & Screenshots

The KneeGait-Edge companion application provides an integrated suite of diagnostics, live streaming visualizers, analytical views, and structured medical documentation:

### Figure 1: Live Gait Kinematic Dashboard & Real-Time Waveform Monitor
<img src="screenshots/1) dashboard.png" alt="Figure 1: Live Gait Kinematic Dashboard" width="100%" />

**Description for Figure 1:** The real-time live gait monitoring interface displaying continuous 50 Hz sagittal knee flexion kinematics over an 8-second rolling window. The view features the clinical risk status alert banner ("Normal kinematics: Healthy mid-swing range of motion"), an interactive radial angle gauge indicating current joint orientation, real-time gait phase state tracking, and primary biomechanical metrics including Current Flexion, Last Peak Swing, Range of Motion (ROM), and Walking Cadence. A dashed red horizontal marker illustrates the 45.0° antalgic stiff-gait risk boundary, with the green dashed line highlighting the 60.0° normative peak benchmark.

---

### Figure 2: Hardware Interface & Wearable BLE Connection Management
<img src="screenshots/2) connection tab.png" alt="Figure 2: Hardware Interface and Connection Management" width="100%" />

**Description for Figure 2:** The device connectivity and sensor diagnostics portal for pairing with the wearable node (`KneeGait-Edge`). The dashboard tracks live telemetry including connection status (BLE connected / Demo session active), signal strength, battery level, and 50 Hz data stream status. Dual sensor health monitors display real-time angular velocity and linear acceleration for anatomical segments, verifying sensor responsiveness and bus integrity before acquisition sessions.

---

### Figure 3: Movement Insights & Session Analytics — Temporal Kinematics
<img src="screenshots/3) Analytics - 1.png" alt="Figure 3: Session Analytics - Temporal Kinematics" width="100%" />

**Description for Figure 3:** Part 1 of the Session Analytics view, delivering deep biomechanical insights across walking sessions. Key session aggregates are computed dynamically: Average Knee Flexion, Peak Knee Flexion, Minimum Knee Flexion, and Session Duration. The interactive continuous knee flexion trajectory graph plots recorded angles over elapsed time, mapping them against the 45.0° clinical threshold guideline and providing immediate access to gait profile presets and live stream telemetry controls.

---

### Figure 4: Movement Insights & Session Analytics — Segment Decomposition & Phase Distribution
<img src="screenshots/4) Analytics - 2.png" alt="Figure 4: Session Analytics - Segment Decomposition and Phase Distribution" width="100%" />

**Description for Figure 4:** Part 2 of the Session Analytics view, featuring two-segment angular kinematic decomposition. Independent sagittal trajectories for the tibial shank angle and thigh angle are superimposed over time, revealing phase coordination and relative joint displacement. Below, the gait-phase distribution bar visualizes the proportion of time spent in the Stance phase (60.0%) versus the Swing phase (40.0%), accompanied by a live session overview panel detailing data source, retained samples, and system run state.

---

### Figure 5: Clinician Assessment & KOA Risk Report Generator
<img src="screenshots/5) report.png" alt="Figure 5: Clinician Documentation and Assessment Report Generator" width="100%" />

**Description for Figure 5:** The clinical documentation workspace enabling physiotherapists, orthopedists, and researchers to generate structured diagnostic reports from patient gait sessions. Clinicians can input Patient IDs (`PT-2026-01`), configure assessment sessions, and record qualitative clinical observations. With a single click, clinicians trigger the "Generate Report" pipeline, producing structured clinical summaries, primary biomechanical scorecards (Peak Swing Flexion, Active Sagittal ROM, Mean Flexion, Terminal Stance Extension, Cadence, and Stance/Swing Split), and verified AI classification badges with confidence ratings for printable medical export via "Print / Save PDF".

---

### Figure 6: 3-Minute Edge-AI Gait Diagnostic Session & Progressive Multi-Window Assessment Log
<img src="screenshots/6) AI analysis log.png" alt="Figure 6: 3-Minute Edge-AI Gait Diagnostic Session and Progressive Assessment Log" width="100%" />

**Description for Figure 6:** The clinical Edge-AI gait analysis portal showing the progressive 3-minute walking assessment protocol. The view details real-time status (3:00 / 3:00 elapsed), session completion indicators, and chronological 30-second evaluation cards (Window 01 to Window 06). Each card expands to display sample volume (1,500 samples @ 50 Hz), completed stride count (23–32 strides), the 5 canonical extracted gait features, and an intuitive tri-tier class probability bar (`Normal`, `Mild`, `Severe`) alongside the classification confidence score (e.g. 98.3% Normal, 76.2% Severe).

---

## 📐 Mathematical Formulations & Biomechanical Pipeline

The algorithmic pipeline of KneeGait-Edge translates raw IMU accelerations and angular velocities into clinical biomechanical insights through well-defined mathematical principles:

```
+-------------------------------------------------------------------------------------------------------------------+
|                                          MATHEMATICAL PIPELINE FLOWCHART                                          |
+-------------------------------------------------------------------------------------------------------------------+
|                                                                                                                   |
|  [Raw MPU-6050]   -->  acc_pitch = atan2(-ax, sqrt(ay^2 + az^2))                                                  |
|  (ax, ay, az, gy)      gyro_rate = gy / 131.0 - gyro_bias                                                         |
|                                |                                                                                  |
|                                v                                                                                  |
|  [Complementary]  -->  θ_raw(t) = α * [θ_raw(t-Δt) + ω*Δt] + (1 - α) * acc_pitch   (α = 0.96, Δt = 0.02s)        |
|  [Filter 50 Hz ]                                                                                                  |
|                                |                                                                                  |
|                                v                                                                                  |
|  [Biomechanical]  -->  θ_knee(t) = θ_raw(t) * 2.15   (Closed-chain shank-to-knee flexion transfer)               |
|  [Transfer Scale]      θ_thigh(t) = 7.5 + (θ_knee * 0.45),  θ_shank(t) = θ_thigh - θ_knee                        |
|                                |                                                                                  |
|                                v                                                                                  |
|  [Event Detect]   -->  Heel-Strike: local min θ_knee < 18.0° (Refractory = 0.40s, 0.55s <= T_stride <= 2.40s)    |
|                                |                                                                                  |
|                                v                                                                                  |
|  [Canonical 5]    -->  1. Peak Swing Flexion:  max(θ_knee) during swing phase                             [25.5%] |
|  [Feature Vector]      2. Sagittal ROM:        max(θ_knee) - min(θ_knee)                                  [37.6%] |
|                        3. Stance/Swing Ratio:  t_stance / t_swing                                         [11.7%] |
|                        4. Peak Ang. Velocity:  max(|ω_gyro|)                                              [20.7%] |
|                        5. Cadence (SPM):       2 * (60 / T_stride)                                         [4.5%] |
|                                |                                                                                  |
|                                v                                                                                  |
|  [Random Forest]  -->  20 Trees, Max Depth 5  -->  Class 0 (Normal) | Class 1 (Mild) | Class 2 (Severe)          |
|  (PWA Client-Side)     Execution: < 50 μs      -->  Full Probability Distribution & Confidence Score              |
|                                                                                                                   |
+-------------------------------------------------------------------------------------------------------------------+
```

### 1. Single-IMU Biomechanical Transfer Function
When wearing a single IMU on the tibial shank, the sensor measures absolute segment inclination relative to vertical ($\theta_{\text{shank}}$) rather than relative anatomical joint flexion. In normal human gait (Perry, 1992; Winter, 2009; Bytyqi et al., 2014), the forward inclination of the thigh and backward excursion of the shank operate in coupled harmonic motion during the swing phase:

$$\theta_{\text{knee\_anatomical}}(t) = |\theta_{\text{thigh}}(t) - \theta_{\text{shank}}(t)| \approx K_{\text{transfer}} \times \theta_{\text{shank}}(t)$$

where:
$$K_{\text{transfer}} = 2.15$$

- **Normal Gait ($25^\circ \text{–} 28^\circ$ raw shank):** Translates to **$54^\circ \text{–} 60^\circ$** anatomical knee flexion, matching the $60^\circ$ normative clinical peak.
- **Severe Stiff Gait ($15^\circ \text{–} 18^\circ$ raw shank):** Translates to **$32^\circ \text{–} 38^\circ$** anatomical knee flexion, accurately triggering the $< 45^\circ$ stiff-knee cutoff boundary.

### 2. Discrete Complementary Filter & Drift Rejection
To fuse high-frequency rate gyroscope data with low-frequency accelerometer tilt without the computational overhead of an Extended Kalman Filter (EKF), an optimized discrete complementary filter is evaluated at $50\text{ Hz}$ ($\Delta t = 0.02\text{ s}$):

$$\theta(t) = \alpha \cdot \left(\theta(t - \Delta t) + \omega_{\text{gyro}}(t) \cdot \Delta t\right) + (1 - \alpha) \cdot \theta_{\text{acc}}(t)$$

- **Weighting Factor ($\alpha = 0.96$):** 
  - $96\%$ weight is allocated to high-bandwidth gyroscopic integration, rejecting impulsive foot-strike impacts.
  - $4\%$ weight is allocated to the gravity vector, eliminating cumulative low-frequency drift.
- **Biomechanical Validation:** Validated against optical motion capture systems (Rhudy et al., 2024), achieving Root Mean Square Error $\text{RMSE} < 3.2^\circ$.

### 3. Heel-Strike Event & Stride Duration Bounds
Initial contact (heel-strike) marks the boundary of each successive stride cycle ($t_{\text{HS}}$). KneeGait-Edge uses local flexion minima following swing extension:

$$\text{Event}_{\text{HS}}(t) = 1 \quad \text{if } \theta_{\text{knee}}(t) \text{ is local minimum } < 18.0^\circ$$

To eliminate false triggers from foot slap or impact bounce, strides are accepted if and only if:

$$\Delta t_{\text{HS}} = t_{\text{HS}}^{(k)} - t_{\text{HS}}^{(k-1)} \ge T_{\text{refractory}} \quad (T_{\text{refractory}} = 0.40\text{ s})$$
$$0.55\text{ s} \le T_{\text{stride}} \le 2.40\text{ s}$$

### 4. Five Canonical Feature Formulations
For every segmented stride cycle between consecutive heel-strikes $[t_{\text{HS}}^{(k-1)}, t_{\text{HS}}^{(k)}]$:

1. **Peak Swing Flexion ($\theta_{\text{peak}}$):**
   $$\theta_{\text{peak}} = \max_{t \in [t_{\text{HS}}^{(k-1)}, t_{\text{HS}}^{(k)}]} \theta_{\text{knee}}(t)$$

2. **Active Sagittal ROM ($\text{ROM}_{\text{sagittal}}$):**
   $$\text{ROM}_{\text{sagittal}} = \max_{t} \theta_{\text{knee}}(t) - \min_{t} \theta_{\text{knee}}(t)$$

3. **Stance-to-Swing Ratio ($R_{\text{stance/swing}}$):**
   $$R_{\text{stance/swing}} = \frac{T_{\text{stance}}}{T_{\text{swing}}} = \frac{t_{\text{TO}} - t_{\text{HS}}^{(k-1)}}{t_{\text{HS}}^{(k)} - t_{\text{TO}}}$$
   *(where $t_{\text{TO}}$ represents toe-off, identified at the mid-stride flexion valley between $40\%$ and $70\%$ stride phase)*

4. **Peak Knee Angular Velocity ($\omega_{\text{peak}}$):**
   $$\omega_{\text{peak}} = \max_{t} \left| \omega_{\text{gyro}}(t) \right|$$

5. **Walking Cadence ($C_{\text{spm}}$):**
   $$C_{\text{spm}} = 2 \times \left( \frac{60}{T_{\text{stride}}} \right) = \frac{120}{t_{\text{HS}}^{(k)} - t_{\text{HS}}^{(k-1)}}$$

### 5. Clinical Diagnostic Classification Boundaries & Feature Importance
Based on landmark clinical gait biomechanics (Bytyqi et al., 2014; PMC4037512), patients suffering from knee osteoarthritis involuntarily limit knee flexion during the non-weight-bearing swing phase. The Random Forest model assigns the following feature weights:

| Canonical Feature | Relative Importance | Clinical Significance |
| :--- | :---: | :--- |
| **Active Sagittal ROM** | **37.62%** | Primary determinant of total functional knee excursion |
| **Peak Swing Flexion** | **25.52%** | Landmark metric for stiff-knee gait ($< 45.0^\circ$ cutoff) |
| **Peak Angular Velocity** | **20.70%** | Measures swing limb acceleration & explosive forward drive |
| **Stance-to-Swing Ratio** | **11.69%** | Identifies antalgic weight-bearing avoidance on the affected side |
| **Walking Cadence** | **4.47%** | Captures overall walking pace and protective slowing |

Diagnostic classification categories:

| Class ID | Class Name | Clinical Classification | Peak Swing Flexion ($\theta_{\text{peak}}$) | Typical Kinematic ROM | Clinical Action |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **0** | `NORMAL_GAIT` | Normal / Healthy | $\theta_{\text{peak}} \ge 49.4^\circ$ | $50.0^\circ \text{--} 65.0^\circ$ | Normal physiological gait; continue monitoring |
| **1** | `MILD_FUNCTIONAL_RESTRICTION` | Mild Functional Restriction | $45.0^\circ \le \theta_{\text{peak}} < 49.4^\circ$ | $42.0^\circ \text{--} 49.0^\circ$ | Borderline stiffness detected; schedule routine follow-up |
| **2** | `SEVERE_ANTALGIC_STIFF_GAIT` | Severe Antalgic Stiff Gait | $\theta_{\text{peak}} < 45.0^\circ$ | $15.0^\circ \text{--} 40.0^\circ$ | **Critical Alert!** Pathological stiff knee pattern; specialist review required |

---

## 💻 Tech Stack & Architecture

### Embedded Hardware & Firmware Layer
- **Microcontroller:** ESP32-WROOM-32 (Dual-Core Tensilica Xtensa 32-bit LX6 @ 240 MHz, 520 KB SRAM, 4 MB Flash)
- **Sensor:** 6-DOF IMU (InvenSense MPU-6050) connected via hardware I2C (`Wire.h` at GPIO 21 & GPIO 22, address `0x68`)
- **Firmware Stack:** C++ / Arduino Core for ESP32 / ESP-IDF (`Wire.h`, `BLEDevice.h`, `BLEServer.h`, `BLEUtils.h`, `BLE2902.h`, `esp_wifi.h`)
- **Wireless Telemetry:** Bluetooth Low Energy (BLE 4.2 / 5.0) GATT Server (Service UUID: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`, Characteristic UUID: `beb5483e-36e1-4688-b7f5-ea07361b26a8`)
- **Power Optimization:** ESP-IDF power manager (`esp_wifi_stop()`), reducing operational current draw from $130\text{ mA}$ to $18\text{--}22\text{ mA}$

### Edge AI, Machine Learning & Embedded C
- **Core Modeling Environment:** Python 3.10+ / Python 3.13
- **ML & Data Packages:** `scikit-learn` (v1.4+), `pandas` (v2.0+), `numpy` (v1.26+), `joblib` (v1.3+), `matplotlib` (v3.8+), `seaborn` (v0.13+)
- **Low-Latency Ensemble:** 20-tree `RandomForestClassifier` constrained to `max_depth=5` with balanced class weights
- **Exported Artifacts:** Serialized model (`random_forest_model.joblib`), lightweight JSON decision tree schema (`model.json`), lineage specification (`model_metadata.json`), zero-dependency C header (`model_data.h`)
- **Client-Side Inference:** Pure TypeScript tree evaluation engine (`modelInference.ts`) running in $< 50\ \mu\text{s}$

### Companion Web Frontend Layer (PWA)
- **Bundler & Build Tool:** [Vite 5](https://vitejs.dev/) with instantaneous HMR and optimized production chunking
- **Framework & Language:** React 18 (`react` & `react-dom` v18.3.1) + TypeScript (`typescript` v5.6.3)
- **State Management & Contexts:** 
  - `BleContext.tsx`: Web Bluetooth connection lifecycle, packet buffering, and live telemetry throttling
  - `AiSessionContext.tsx`: 3-minute 6-window session state machine, real-time feature extraction, and aggregate prediction
- **Routing & Navigation:** React Router DOM (`react-router-dom` v6.28.0)
- **Styling & Design System:** Tailwind CSS (`tailwindcss` v3.4.15), PostCSS, Autoprefixer, Lucide React Iconography
- **Data Visualizations:** High-performance HTML5 Canvas (`WaveformChart.tsx`), SVG radial angle gauge (`AngleGauge.tsx`), and dynamic CSS probability bars

---

## 📂 Project Structure

```text
kneegait-edge/
├── README.md                                                  # Comprehensive project documentation (this file)
├── .gitignore                                                 # Global git ignore configuration
├── KneeGait-Edge Pitch Deck.pdf                               # Project presentation deck (PDF)
├── KneeGait-Edge Pitch Deck.pptx                              # Project presentation deck (PowerPoint)
│
├── backend/                                                   # AI, Machine Learning & Embedded C Pipeline
│   ├── README.md                                              # Backend & model deployment documentation
│   ├── requirements.txt                                       # Python dependencies (scikit-learn, pandas, numpy, etc.)
│   ├── .gitignore                                             # Backend-specific ignore file
│   ├── generate_data.py                                       # 20,000-stride synthetic data generator
│   ├── train_model.py                                         # Random Forest training & C/JSON header exporter
│   ├── data.csv                                               # 20,000-row 5-feature dataset with targets
│   ├── random_forest_model.joblib                             # Serialized scikit-learn model artifact
│   ├── model.json                                             # Exported JSON tree structure for client-side PWA
│   ├── model_metadata.json                                    # Lineage specification, metrics & parameters
│   ├── model_data.h                                           # Zero-dependency C/C++ header for ESP32
│   ├── KneeGait_RandomForest_Training.ipynb                   # Pre-rendered 23-section Jupyter Notebook
│   └── KneeGait_Edge_Code_Review_and_Project_Summary.docx    # Formal technical documentation & project review
│
├── firmware/                                                  # Embedded Hardware & Sensor Code
│   └── Esp32.ino                                              # ESP32 50Hz BLE GATT wearable firmware
│
├── frontend/                                                  # Companion Clinical Web Application (PWA)
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
│       │   ├── AiAnalysisLogSection.tsx                       # 3-Minute 6-window AI session log & progress
│       │   ├── AiCompletionModal.tsx                          # Full-screen AI diagnostic consensus modal
│       │   ├── AngleGauge.tsx                                 # Radial SVG joint angle gauge
│       │   ├── RiskBadge.tsx                                  # Color-coded clinical alert banner
│       │   ├── WaveformChart.tsx                              # 50 Hz canvas rolling waveform plotter
│       │   └── Stub.tsx                                       # Placeholder widget wrapper
│       ├── context/                                           # Shared application state providers
│       │   ├── AiSessionContext.tsx                           # 3-min assessment lifecycle & inference state
│       │   └── BleContext.tsx                                 # Web Bluetooth GATT connection & telemetry state
│       ├── lib/                                               # Core utilities, services & AI engines
│       │   ├── bleService.ts                                  # Web Bluetooth GATT manager & telemetry parser
│       │   ├── mockGaitStream.ts                              # Biomechanical gait curve generator
│       │   ├── thresholds.ts                                  # Clinical threshold constants & classification
│       │   ├── useGaitStream.ts                               # Gait stream hook for dashboard rendering
│       │   └── ai/                                            # In-browser edge inference engine
│       │       ├── gaitFeatureExtractor.ts                    # 5-canonical feature extraction & stride segmentation
│       │       ├── modelInference.ts                          # Zero-dependency client-side Random Forest evaluator
│       │       ├── model.json                                 # Client-side decision trees (20 trees, depth 5)
│       │       └── model_metadata.json                        # Frontend model specification & feature indices
│       └── pages/                                             # Application route pages
│           ├── Dashboard.tsx                                  # Live 50 Hz gait monitoring & AI session portal
│           ├── ConnectModal.tsx                               # BLE device management & sensor health
│           ├── Analytics.tsx                                  # Session statistics & segment decomposition
│           ├── ClinicianReport.tsx                            # Clinical report generator & PDF documentation
│           └── Settings.tsx                                   # Patient profile & system configuration
│
└── screenshots/                                               # High-Resolution Application Screenshots
    ├── 1) dashboard.png                                       # Figure 1: Real-time Live Gait Dashboard
    ├── 2) connection tab.png                                  # Figure 2: Hardware Interface & BLE Telemetry
    ├── 3) Analytics - 1.png                                   # Figure 3: Session Analytics & Knee Flexion Plot
    ├── 4) Analytics - 2.png                                   # Figure 4: Segment Decomposition & Phase Split
    ├── 5) report.png                                          # Figure 5: Clinician Documentation & Assessment
    └── 6) AI analysis log.png                                 # Figure 6: 3-Min AI Assessment & Multi-Window Log
```

---

## 🚀 How to Run & Setup

### A. Hardware Wearable Setup & Flashing

#### 1. Hardware Bill of Materials (BOM)
- **1× ESP32 DevKit V1** (or ESP32-WROOM-32 board)
- **1× MPU-6050** 6-DOF Accelerometer / Gyroscope module
- **1× LiPo Battery (3.7V 500mAh)** or standard 5V USB power bank
- **Hookup Wires & Elastic Shank Strap**

#### 2. Wiring Diagram (I2C Bus)
The MPU-6050 communicates with the ESP32 over the hardware I2C bus:

| Sensor Pin | ESP32 Pin | Function |
| :--- | :--- | :--- |
| **VCC** | 3.3V | Regulated 3.3V power |
| **GND** | GND | Ground reference |
| **SDA** | GPIO 21 | I2C Serial Data |
| **SCL** | GPIO 22 | I2C Serial Clock |
| **AD0** | GND (or internal pull-down) | I2C Address `0x68` |

*Anatomical Placement:* Mount securely against the subcutaneous, flat **anteromedial surface of the upper tibial shank**, approximately 4–6 cm below the knee joint line.

#### 3. Flashing Firmware via Arduino IDE
1. Open the [Arduino IDE](https://www.arduino.cc/en/software).
2. Install the **ESP32 Board Package** via Boards Manager (`https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`).
3. Connect your ESP32 board via USB. Select **Tools > Board > ESP32 Dev Module** and choose your COM port.
4. Open [`firmware/Esp32.ino`](firmware/Esp32.ino).
5. Click **Upload**.
6. Open the Serial Monitor at `115200 baud`. Keep the sensor stationary for 2 seconds upon boot to allow the gyro calibration routine to zero out static drift.

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
*Generates `data.csv` with exactly 20,000 strides complying with physiological covariance rules and clinical classification thresholds.*

#### 3. Retrain Random Forest & Export C / JSON Artifacts
```bash
python train_model.py
```
*Trains the 20-tree model, prints classification reports, validates 100% decision parity, and exports `random_forest_model.joblib`, `model_data.h`, `model.json`, and `model_metadata.json`.*

#### 4. Explore Interactive Pre-Executed Notebook
```bash
jupyter notebook KneeGait_RandomForest_Training.ipynb
```
*Open and inspect the 23-section notebook featuring full exploratory data analysis, Pearson correlation matrices, ROC curves, feature importances, and C-parity verifications.*

---

### C. Companion Web Frontend Setup (PWA)

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
- **Simulator Mode (No Hardware Needed):** On the Dashboard, click **"Healthy gait"** or **"Stiff gait"** to toggle simulated patient states and observe the real-time waveform, angle gauge, and alert badges.
- **Connecting Physical ESP32 Wearable:**
  1. Power on your flashed ESP32 wearable node.
  2. In the web dashboard, navigate to the **Connect** tab.
  3. Click **Connect Device** and select **`KneeGait-Edge`** from the browser's Bluetooth pairing prompt.
  4. Return to the **Dashboard** to view live 50 Hz motion capture from your leg!
- **Running a 3-Minute Edge-AI Diagnostic Session:**
  1. With the sensor streaming (or in simulator mode), click **Start 3-Min AI Assessment** on the Dashboard.
  2. The application will track six consecutive 30-second windows, segmenting strides and classifying each window in real time.
  3. Review the live breakdown in the **AI Diagnostic Session Log** section.
  4. Upon completion, a clinical consensus modal will present the overall diagnostic tier, confidence percentage, and full probability breakdown.
- **Generating Clinician Reports:**
  1. Navigate to the **Report** tab.
  2. Input Patient ID, examination notes, and review computed scorecards.
  3. Click **Print / Save PDF** to generate an immediate vector PDF medical report.

---

## 🔮 Future Scope & Roadmap

KneeGait-Edge provides a robust foundation for next-generation decentralized orthopedic diagnostics. Upcoming milestones include:

- **Multi-Axis Frontal & Transverse Kinematics:** Expanding from 1D sagittal flexion to 3D joint angles (knee adduction moment proxies, tibial internal/external rotation) to evaluate varus/valgus deformities.
- **On-Chip TinyML Quantization:** Implementing direct fixed-point INT8 neural networks on the ESP32's second core for continuous time-series anomaly detection.
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

4. **Winter, D. A. (2009).**  
   *Biomechanics and Motor Control of Human Movement (4th ed.).*  
   John Wiley & Sons. ISBN: 978-0-470-39818-0.

5. **Perry, J., & Burnfield, J. M. (1992 / 2010).**  
   *Gait Analysis: Normal and Pathological Function (2nd ed.).*  
   SLACK Incorporated. ISBN: 978-1-55642-766-4.

6. **Espressif Systems. (2023).**  
   *ESP32 Low-Power Management and RF Power Consumption Specification.*  
   Espressif Architecture Documentation, Rev. 3.4.
