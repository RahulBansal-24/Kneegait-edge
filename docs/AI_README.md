# KneeGait-Edge: AI Pipeline & Algorithm Specification 🧠⚡
### Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
**Lead:** Rahul (Team Leader & AI / Kinematic Analytics Lead)  
**Collaborators:** Prateek Dhar Dwivedi (Hardware), Saksham Verma (Frontend)

---

## 📌 1. Mission & Clinical Objective

The goal of this AI pipeline is to process continuous 50Hz knee kinematic telemetry and detect compensatory **antalgic "joint-stiffening" gait strategies** in patients with **Medial Compartment Knee Osteoarthritis (KOA)**.

### Clinical Ground Truth Benchmark (*Bytyqi et al. 2014 — PMC4037512*):
* **Healthy Reference Peak Swing Flexion:** **$49.4^\circ \text{ to } 65.0^\circ$** (mean $\sim 57.2^\circ$)
* **Medial KOA Impaired Mean Peak:** **$41.9^\circ$** ($p < 0.05$)
* **Critical Diagnostic Decision Boundary:** **$< 45.0^\circ$** triggers the high-risk alert badge.

---

## 📥 2. Input Specification (From ESP32 Hardware Stream)

The ESP32 microcontroller streams continuous kinematic data over BLE GATT notifications at **50 Hz** (1 sample every **20 milliseconds**, $\Delta t = 0.02\text{ s}$).

### Telemetry Channels Provided by Hardware:

| Parameter | Data Type | Units | Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`timestamp_ms`** | `uint32` | Milliseconds | $0 \dots 2^{32}-1$ | Monotonic clock since system boot |
| **`knee_angle`** | `float` | Degrees ($^\circ$) | $0.0^\circ \dots 90.0^\circ$ | Sagittal relative joint angle: $\|\theta_{\text{thigh}} - \theta_{\text{shank}}\|$ |
| **`gyro_y`** | `float` | deg/sec | $-500 \dots +500$ | Shank angular velocity (pitch rate of leg swing) |
| **`thigh_angle`** | `float` | Degrees ($^\circ$) | $-45.0^\circ \dots +90.0^\circ$ | Segment orientation of the distal lateral femur |
| **`shank_angle`** | `float` | Degrees ($^\circ$) | $-90.0^\circ \dots +45.0^\circ$ | Segment orientation of the anteromedial tibia |

### Stream Input Structure:
```json
{
  "timestamp_ms": 14220,
  "thigh_angle": 15.4,
  "shank_angle": -34.8,
  "knee_angle": 50.2,
  "gyro_y": 142.5
}
```

---

## ⚙️ 3. What the Algorithm Must Do (Core AI Tasks)

```
Raw 50Hz Stream ──> [Task A: Gait Segmentation] ──> [Task B: Feature Extraction] ──> [Task C: Classification] ──> Output JSON
                       (Heel-Strike to Swing)           (Peak, ROM, Cadence)          (Healthy vs Stiff KOA)
```

### Task A: Real-Time Gait Phase Segmentation
Segment the continuous time-series stream into discrete **gait cycles (strides)**:

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

1. **Heel-Strike ($0\%$ cycle):** Detected by local minimum in knee angle followed by rapid deceleration.
2. **Mid-Stance ($\sim 15\%\text{--}30\%$ cycle):** Small stance flexion curve ($15^\circ\text{--}20^\circ$) for body weight absorption.
3. **Toe-Off ($\sim 60\%$ cycle):** Onset of forward angular velocity ($\text{gyro\_y} > 40^\circ/\text{s}$).
4. **Mid-Swing Peak ($\sim 75\%\text{--}80\%$ cycle):** Point of maximum sagittal knee flexion ($\theta_{\text{peak}}$).
5. **Terminal Swing / Next Heel-Strike ($100\%$ cycle):** Deceleration leading into the subsequent heel contact.

---

### Task B: Biomechanical Feature Extraction (Per Stride)
For every segmented stride cycle, compute the following 5 clinical biomarkers:

1. **$\theta_{\text{peak}}$ (Peak Swing Flexion):** Maximum knee flexion angle reached during swing phase (primary KOA indicator).
2. **$\text{ROM}_{\text{sagittal}}$ (Range of Motion):** $\theta_{\text{peak}} - \theta_{\text{min}}$.
3. **$\omega_{\text{max}}$ (Peak Swing Velocity):** Maximum angular velocity during forward swing ($\text{deg/s}$).
4. **Stance-to-Swing Ratio ($R_{ss}$):** $T_{\text{stance}} / T_{\text{swing}}$ (normal is $\sim 1.5$; $> 1.8$ indicates antalgic avoidance of swing).
5. **Cadence:** Strides/steps per minute:
   $$\text{Cadence (spm)} = \frac{60}{\Delta T_{\text{stride (sec)}}}$$

---

### Task C: Pathological Classifier & Anomaly Scoring
Classify each stride into 3 clinical categories:

| Class | Category | Condition Criteria | Clinical Meaning |
| :--- | :--- | :--- | :--- |
| **0** | **Healthy / Normal** | $\theta_{\text{peak}} \ge 49.4^\circ$, fluid swing | Normal pendular gait kinematics |
| **1** | **Mild Restriction** | $45.0^\circ \le \theta_{\text{peak}} < 49.4^\circ$ | Borderline / early joint-stiffening |
| **2** | **Severe Medial KOA** | $\theta_{\text{peak}} < 45.0^\circ$ | **Antalgic Joint-Stiffening Strategy** |

#### Model Architecture Options for Rahul:
* **Option 1 (Baseline & Interpretable):** Random Forest / Decision Tree trained on the 5 extracted features (interpretable feature importances for clinical judges).
* **Option 2 (Edge-AI TinyML):** 1D-CNN or TFLite Micro model running on 50-sample raw sliding window executing in $<1.2\text{ ms}$ on the ESP32 (*Espressif Systems 2023*).
* **Option 3 (Client-Side Web AI):** ONNX Runtime Web (`onnxruntime-web`) running directly inside Saksham's Vite browser app.

---

## 📤 4. Output Specification (Payload for Saksham's Vite Frontend)

The algorithm generates this standardized JSON payload to update the live UI and clinician reports:

```json
{
  "stride_id": 24,
  "timestamp_ms": 28450,
  "current_phase": "SWING",
  "phase_progress_pct": 78.5,
  "features": {
    "peak_swing_flexion": 41.2,
    "range_of_motion": 37.5,
    "peak_angular_velocity": 178.4,
    "stance_to_swing_ratio": 1.76,
    "cadence_spm": 94.2
  },
  "classification": {
    "predicted_class": 2,
    "label": "SEVERE_STIFF_GAIT",
    "confidence": 0.942,
    "stiff_gait_alert": true,
    "clinical_note": "Antalgic joint-stiffening strategy observed (Peak: 41.2° < 45.0° - Medial KOA biomarker)"
  }
}
```

---

## 🐍 5. Python Reference Implementation (Starter Code for Rahul)

```python
"""
KneeGait-Edge: AI Feature Extractor & Gait Classifier
Author: Rahul (AI Lead & Team Leader)
"""

import numpy as np

STIFF_GAIT_THRESHOLD = 45.0  # Bytyqi et al. (2014)

def segment_and_extract_stride(time_series_knee_angle, time_series_gyro_y, sample_rate=50):
    """
    Extracts biomechanical biomarkers from a single segmented stride (heel-strike to heel-strike).
    """
    dt = 1.0 / sample_rate
    
    # 1. Peak Swing Flexion
    peak_swing_flexion = float(np.max(time_series_knee_angle))
    min_flexion = float(np.min(time_series_knee_angle))
    
    # 2. Sagittal Range of Motion (ROM)
    rom = peak_swing_flexion - min_flexion
    
    # 3. Peak Angular Velocity
    peak_velocity = float(np.max(np.abs(time_series_gyro_y)))
    
    # 4. Cadence
    stride_duration_sec = len(time_series_knee_angle) * dt
    cadence = (60.0 / stride_duration_sec) if stride_duration_sec > 0 else 0.0
    
    # 5. Stance / Swing Ratio approximation (Stance = first 60% of samples)
    split_idx = int(0.6 * len(time_series_knee_angle))
    stance_time = split_idx * dt
    swing_time = (len(time_series_knee_angle) - split_idx) * dt
    stance_swing_ratio = (stance_time / swing_time) if swing_time > 0 else 1.5

    # 6. Classification & Antalgic Decision Rule
    if peak_swing_flexion < STIFF_GAIT_THRESHOLD:
        label = "SEVERE_STIFF_GAIT"
        predicted_class = 2
        alert_trigger = True
    elif peak_swing_flexion < 49.4:
        label = "MILD_RESTRICTION"
        predicted_class = 1
        alert_trigger = False
    else:
        label = "HEALTHY_NORMAL"
        predicted_class = 0
        alert_trigger = False

    return {
        "features": {
            "peak_swing_flexion": round(peak_swing_flexion, 1),
            "rom": round(rom, 1),
            "peak_angular_velocity": round(peak_velocity, 1),
            "stance_to_swing_ratio": round(stance_swing_ratio, 2),
            "cadence_spm": round(cadence, 1)
        },
        "classification": {
            "predicted_class": predicted_class,
            "label": label,
            "alert_trigger": alert_trigger,
            "clinical_biomarker": "Bytyqi et al. (2014) Medial KOA antalgic joint-stiffening"
        }
    }
```

---

## 🤝 6. Team Hand-off Checklist for Rahul

- [ ] **Coordinate with Prateek (Hardware):** Confirm receiving `knee_angle` and `gyro_y` values at 50Hz over BLE.
- [ ] **Coordinate with Saksham (Frontend):** Provide the output JSON structure for real-time charting on the Vite companion dashboard.
- [ ] **Pitch & Presentation:** Lead the explanation of the antalgic joint-stiffening algorithm and the $<45^\circ$ clinical cutoff during the ZINNOVATIO 4.0 jury evaluation.
