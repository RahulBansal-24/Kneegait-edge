"""
KneeGait-Edge: Clinical Biomechanical Dataset Generator
Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
Lead: Rahul (Team Leader & AI Lead)

Ground Truth Parameter Distributions Extracted from Literature:
  - Bytyqi et al. (2014), International Orthopaedics / PMC4037512:
      * Healthy reference peak swing flexion: 49.4° to 65.0° (mean 57.2°, std 3.6°)
      * Moderate-to-severe medial KOA peak swing: mean 41.9° (std 2.8°)
      * Decision boundary threshold: < 45.0° indicates severe antalgic stiff-gait
  - Rhudy et al. (2024), MDPI Sensors:
      * 50 Hz discrete sampling (dt = 0.02s)
"""

import numpy as np
import pandas as pd
import os

def generate_stride_time_series(peak_swing, stance_flex, stride_duration=1.1, sample_rate=50):
    """
    Synthesizes a realistic 50Hz continuous sagittal knee flexion waveform for 1 stride.
    Features standard physiological double-bell curve:
      - 0%: Heel Strike
      - 15%: Stance flexion (weight shock absorption)
      - 60%: Toe-off transition
      - 75%: Mid-swing peak flexion
      - 100%: Terminal swing & next heel strike
    """
    num_samples = int(stride_duration * sample_rate)
    t = np.linspace(0, 1, num_samples)

    # Double-bell wave formulation
    stance_wave = stance_flex * np.exp(-((t - 0.15) ** 2) / (2 * (0.07 ** 2)))
    swing_wave = peak_swing * np.exp(-((t - 0.75) ** 2) / (2 * (0.08 ** 2)))
    baseline_standing = 3.0 # ~3° natural standing extension

    noise = np.random.normal(0, 0.35, num_samples)
    knee_angle = np.clip(baseline_standing + stance_wave + swing_wave + noise, 0, 85)

    # Calculate angular velocity (deg/s) using central difference
    gyro_y = np.gradient(knee_angle, 1.0 / sample_rate)
    
    # 0 = Stance (0% - 60%), 1 = Swing (60% - 100%)
    gait_phase = np.where(t < 0.60, 0, 1)

    return pd.DataFrame({
        'stride_normalized_time': t,
        'knee_angle': np.round(knee_angle, 2),
        'gyro_y': np.round(gyro_y, 2),
        'gait_phase': gait_phase
    })

def generate_dataset(num_samples_per_class=1000, output_dir="datasets"):
    """
    Generates tabular training dataset containing 3 clinical categories:
      Class 0: Healthy Control (Peak Swing: 49.4° - 65.0°)
      Class 1: Mild Functional Restriction (Peak Swing: 45.0° - 49.3°)
      Class 2: Severe Medial KOA Antalgic Stiffening (Peak Swing: < 45.0°)
    """
    os.makedirs(output_dir, exist_ok=True)
    np.random.seed(42)

    data = []

    for _ in range(num_samples_per_class):
        # 1. CLASS 0: HEALTHY CONTROLS (Bytyqi 2014)
        peak_0 = np.random.normal(57.2, 3.4)
        peak_0 = np.clip(peak_0, 49.5, 68.0)
        min_0 = np.random.normal(3.2, 0.8)
        rom_0 = peak_0 - min_0
        omega_max_0 = np.random.normal(245.0, 18.0)
        stance_swing_ratio_0 = np.random.normal(1.48, 0.08) # ~60:40 ratio
        cadence_0 = np.random.normal(104.0, 6.0)
        data.append([peak_0, rom_0, omega_max_0, stance_swing_ratio_0, cadence_0, 0, "HEALTHY"])

        # 2. CLASS 1: MILD FUNCTIONAL RESTRICTION
        peak_1 = np.random.normal(47.2, 1.1)
        peak_1 = np.clip(peak_1, 45.0, 49.3)
        min_1 = np.random.normal(3.8, 0.9)
        rom_1 = peak_1 - min_1
        omega_max_1 = np.random.normal(205.0, 16.0)
        stance_swing_ratio_1 = np.random.normal(1.62, 0.09)
        cadence_1 = np.random.normal(97.0, 5.5)
        data.append([peak_1, rom_1, omega_max_1, stance_swing_ratio_1, cadence_1, 1, "MILD_RESTRICTION"])

        # 3. CLASS 2: SEVERE MEDIAL KOA (Bytyqi 2014 Antalgic Joint-Stiffening)
        peak_2 = np.random.normal(41.9, 2.2)
        peak_2 = np.clip(peak_2, 32.0, 44.9) # Stiff knee < 45.0°
        min_2 = np.random.normal(4.5, 1.1)
        rom_2 = peak_2 - min_2
        omega_max_2 = np.random.normal(165.0, 15.0) # Slower swing due to co-contraction
        stance_swing_ratio_2 = np.random.normal(1.88, 0.12) # Prolonged stance to avoid painful swing
        cadence_2 = np.random.normal(88.0, 6.5) # Slower walking speed
        data.append([peak_2, rom_2, omega_max_2, stance_swing_ratio_2, cadence_2, 2, "SEVERE_KOA_STIFF_GAIT"])

    columns = [
        'peak_swing_flexion',
        'sagittal_rom',
        'peak_angular_velocity',
        'stance_to_swing_ratio',
        'cadence_spm',
        'class_label',
        'clinical_diagnosis'
    ]

    df = pd.DataFrame(data, columns=columns)
    # Shuffle
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    csv_file = os.path.join(output_dir, "koa_features_dataset.csv")
    df.to_csv(csv_file, index=False)
    print(f"Generated {len(df)} total strides saved to '{csv_file}'")

    # Also save a sample 50Hz continuous time series for the real-time test
    ts_healthy = generate_stride_time_series(peak_swing=58.0, stance_flex=18.0)
    ts_healthy['stride_type'] = 'HEALTHY'
    ts_koa = generate_stride_time_series(peak_swing=41.5, stance_flex=11.0)
    ts_koa['stride_type'] = 'SEVERE_KOA'
    sample_ts = pd.concat([ts_healthy, ts_koa], ignore_index=True)
    ts_file = os.path.join(output_dir, "sample_time_series_50hz.csv")
    sample_ts.to_csv(ts_file, index=False)
    print(f"Generated sample 50Hz time-series saved to '{ts_file}'")

if __name__ == "__main__":
    generate_dataset()
