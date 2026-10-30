# KneeGait-Edge: 3-Class Wearable Gait Pattern Classification Pipeline

**KneeGait-Edge** is a low-cost, wearable biomechanical gait analysis system using an ESP32 microcontroller and dual 6-DOF IMUs (MPU-6050) attached to the distal lateral thigh and anteromedial shank. The wearable measures knee joint flexion at 50 Hz in the sagittal plane to screen for dynamic joint stiffness associated with Knee Osteoarthritis (KOA).

---

## 🌟 Key Architecture & Specifications

1. **3-Class Clinical Gait Impairment System**:
   - **Class 0 (`NORMAL_GAIT`)**: Normal / Healthy ($\text{Peak Swing Flexion} \ge 49.4^\circ$)
   - **Class 1 (`MILD_FUNCTIONAL_RESTRICTION`)**: Mild Restriction ($45.0^\circ \le \text{Peak Swing Flexion} < 49.4^\circ$)
   - **Class 2 (`SEVERE_ANTALGIC_STIFF_GAIT`)**: Severe Antalgic / Stiff Gait ($\text{Peak Swing Flexion} < 45.0^\circ$)
2. **Canonical 5-Feature Input Schema (6 Columns with `target`)**:
   1. `peak_swing_flexion` (degrees)
   2. `sagittal_rom` (degrees)
   3. `stance_to_swing_ratio` (dimensionless ratio)
   4. `peak_angular_velocity` (degrees/second)
   5. `cadence_spm` (walking cadence in steps per minute)
   6. `target` (ground truth clinical class label)
3. **Compact Edge-Optimized Random Forest**:
   - 20 decision trees, maximum depth 5 (~40 KB model size, < 50 µs host latency).
4. **Embedded C Deployment & Streaming FIFO Processor**:
   - Zero-dependency C/C++ header (`model_data.h`) containing:
     - 50 Hz circular FIFO ring buffer and online heel-strike event segmenter.
     - Automated calculation of the 5 canonical features per detected stride.
     - Direct on-device Random Forest inference (supporting both floating-point and `int16_t` fixed-point).
5. **Interactive Jupyter Notebook**:
   - Fully documented, pre-executed 23-section notebook (`KneeGait_RandomForest_Training.ipynb`) with all tables, evaluation metrics, and plots pre-rendered.

---

## 🚀 Quick Start & Viewing

> **Note:** The compact 3-class model is **already trained**, and the notebook is **pre-executed with all outputs, evaluation tables, and visual plots rendered**. You do not need to retrain or rerun anything to inspect the results.

### 1. Installation

```bash
pip install -r requirements.txt
```

### 2. View the Jupyter Notebook

Open [`KneeGait_RandomForest_Training.ipynb`](KneeGait_RandomForest_Training.ipynb) in **VS Code**, **JupyterLab**, or directly on **GitHub**:

```bash
jupyter notebook KneeGait_RandomForest_Training.ipynb
```

The 22-section notebook documents:
- Exploratory data analysis, 5-feature distributions, and class frequencies.
- Pearson correlation analysis among features (including $r \approx 0.99$ kinematics).
- Verification of zero data leakage and 100% agreement with the $49.4^\circ$ and $45.0^\circ$ clinical boundary policy.
- Stratified 80/20 train/test evaluation metrics, confusion matrix, and Gini feature importances.
- Prediction parity tests between Python scikit-learn, C header, and browser JSON models.

---

## 🛠️ Execution Commands

### 1. Regenerate Synthetic Dataset (20,000 Records, 6 Columns)
```bash
python generate_data.py
```
*Generates `data.csv` with exactly 20,000 rows adhering to physical kinematic constraints and clinical boundary thresholds.*

### 2. Retrain Model & Export Artifacts
```bash
python train_model.py
```
*Trains the 20-tree, max-depth 5 Random Forest and exports:*
- `random_forest_model.joblib` (Trained model)
- `model_data.h` (Zero-dependency C header for ESP32 with streaming FIFO & classifier)
- `model.json` (Decision tree structure for parity validation)
- `model_metadata.json` (Hyperparameters and evaluation metrics)

---

## ⚡ ESP32 Hardware Streaming Integration

Directly process continuous 50 Hz samples from IMU hardware in C / C++ using the built-in streaming FIFO:

```c
#include "model_data.h"

kneegait_pipeline_t pipeline;

void setup() {
    Serial.begin(115200);
    kneegait_pipeline_init(&pipeline);
}

void loop() {
    // 1. Read hardware sensors at 50 Hz (every 20 ms)
    float t_sec = millis() / 1000.0f;
    float knee_flexion = read_imu_knee_flexion(); // sagittal knee angle (deg)
    float accel_z = read_shank_accel_z();         // vertical impact (g)

    // 2. Feed directly into continuous streaming FIFO
    kneegait_stride_result_t result;
    if (kneegait_process_sample(&pipeline, t_sec, knee_flexion, accel_z, &result)) {
        // Complete stride detected, segmented, and classified!
        Serial.printf("Stride #%u: Class %d (%s) | Peak Flexion: %.1f deg | Cadence: %.1f spm\n",
                      result.stride_count,
                      result.class_id,
                      result.display_label,
                      result.features[FEAT_PEAK_SWING_FLEXION],
                      result.cadence_spm);
    }

    delay(20); // 50 Hz sampling interval
}
```

---

## 📁 Repository Structure

```text
kneegait-edge/
├── data.csv                             # 20,000-row 5-feature 3-class dataset (6 columns)
├── generate_data.py                     # Synthetic data generation script
├── train_model.py                       # Model training and artifact export script
├── random_forest_model.joblib           # Trained compact Random Forest model
├── model_data.h                         # ESP32 C header (float & int16 fixed-point)
├── model.json                           # JSON tree structure for browser/parity
├── model_metadata.json                  # Model metadata, metrics, and parameters
├── KneeGait_RandomForest_Training.ipynb # 23-section pre-rendered Jupyter notebook
├── requirements.txt                     # Minimal Python dependencies
├── .gitignore                           # Git ignore rules
└── README.md                            # Project documentation
```
