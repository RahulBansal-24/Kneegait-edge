"""
generate_data.py — KneeGait-Edge 5-Feature 3-Class Synthetic Data Generator

Generates exactly 20,000 synthetic gait-stride records under physiological and
mathematical constraints, strictly implementing the 3-class KneeGait-Edge labeling policy:

- Class 0 (NORMAL_GAIT): Peak_Swing_Flexion >= 49.4°
- Class 1 (MILD_FUNCTIONAL_RESTRICTION): 45.0° <= Peak_Swing_Flexion < 49.4°
- Class 2 (SEVERE_ANTALGIC_STIFF_GAIT): Peak_Swing_Flexion < 45.0°

Canonical 6-Column Output Schema (5 Input Features + 1 Classification Target):
1. peak_swing_flexion     (deg)       : Maximum knee flexion during sagittal swing
2. sagittal_rom           (deg)       : Sagittal knee Range of Motion across stride
3. stance_to_swing_ratio  (ratio)     : Stance duration / Swing duration
4. peak_angular_velocity  (deg/s)     : Peak sagittal knee angular speed
5. cadence_spm            (steps/min) : Walking cadence in steps per minute
6. target                 (string)    : Gait impairment classification label
"""

import os
import sys
import numpy as np
import pandas as pd

# Canonical feature list
FEATURE_NAMES = [
    "peak_swing_flexion",
    "sagittal_rom",
    "stance_to_swing_ratio",
    "peak_angular_velocity",
    "cadence_spm"
]

OUTPUT_COLUMNS = FEATURE_NAMES + ["target"]

# Class definitions
CLASS_NORMAL = 0
CLASS_MILD = 1
CLASS_SEVERE = 2

CLASS_NAMES = {
    CLASS_NORMAL: "NORMAL_GAIT",
    CLASS_MILD: "MILD_FUNCTIONAL_RESTRICTION",
    CLASS_SEVERE: "SEVERE_ANTALGIC_STIFF_GAIT"
}

# Threshold boundaries
FLEXION_BOUNDARY_NORMAL_MILD = 49.4
FLEXION_BOUNDARY_MILD_SEVERE = 45.0
MIN_RESIDUAL_STANCE_FLEXION = 0.5


def assign_flexion_class(peak_swing_flexion: float) -> int:
    """Assigns 3-class gait impairment category based on peak swing flexion angle in degrees."""
    val = float(peak_swing_flexion)
    if val >= FLEXION_BOUNDARY_NORMAL_MILD:
        return CLASS_NORMAL
    elif val >= FLEXION_BOUNDARY_MILD_SEVERE:
        return CLASS_MILD
    return CLASS_SEVERE


def build_covariance_matrix(stds: list, corr_matrix: np.ndarray) -> np.ndarray:
    """Constructs a valid covariance matrix from standard deviations and a correlation matrix."""
    D = np.diag(stds)
    return D @ corr_matrix @ D


def sample_class_stratum(
    class_id: int,
    n_samples: int,
    mean_vec: list,
    stds_vec: list,
    corr_matrix: np.ndarray,
    rng: np.random.Generator
) -> np.ndarray:
    """Samples class-conditioned strides under strict physiological constraints and boundary rules."""
    cov_matrix = build_covariance_matrix(stds_vec, corr_matrix)
    valid_samples = []
    max_batches = 30
    batch_num = 0

    while len(valid_samples) < n_samples and batch_num < max_batches:
        batch_num += 1
        needed = n_samples - len(valid_samples)
        batch_size = max(int(needed * 1.5), 150)
        raw = rng.multivariate_normal(mean_vec, cov_matrix, size=batch_size)

        peak_flex = np.round(raw[:, 0], 2)
        min_flex = np.round(raw[:, 1], 2)
        ratio = np.round(raw[:, 2], 3)
        ang_vel = np.round(raw[:, 3], 2)
        cadence = np.round(raw[:, 4], 1)
        rom = np.round(peak_flex - min_flex, 2)

        # Class boundary mask
        if class_id == CLASS_NORMAL:
            class_mask = (peak_flex >= FLEXION_BOUNDARY_NORMAL_MILD) & (peak_flex <= 80.0)
        elif class_id == CLASS_MILD:
            class_mask = (peak_flex >= FLEXION_BOUNDARY_MILD_SEVERE) & (peak_flex < FLEXION_BOUNDARY_NORMAL_MILD)
        else: # CLASS_SEVERE
            class_mask = (peak_flex >= 12.0) & (peak_flex < FLEXION_BOUNDARY_MILD_SEVERE)

        # Physical and physiological constraints
        phys_mask = (
            (min_flex >= MIN_RESIDUAL_STANCE_FLEXION) & (min_flex <= 18.0) &
            (rom >= 5.0) & (rom < peak_flex) &
            (ratio >= 0.8) & (ratio <= 3.5) &
            (ang_vel >= 30.0) & (ang_vel <= 400.0) &
            (cadence >= 50.0) & (cadence <= 150.0)
        )

        valid_mask = class_mask & phys_mask
        candidates = np.column_stack([
            peak_flex[valid_mask],
            rom[valid_mask],
            ratio[valid_mask],
            ang_vel[valid_mask],
            cadence[valid_mask]
        ])

        valid_samples.extend(candidates.tolist())

    if len(valid_samples) < n_samples:
        raise RuntimeError(f"Could not generate {n_samples} valid rows for class {class_id}.")

    return np.array(valid_samples[:n_samples])


def generate_synthetic_dataset(
    total_rows: int = 20000,
    random_seed: int = 42
) -> pd.DataFrame:
    """Generates 20,000 synthetic records with exact class allocations and 6 canonical columns."""
    rng = np.random.default_rng(random_seed)

    # Correlation template among [peak_flex, min_flex, ratio, peak_ang_vel, cadence]
    corr_template = np.array([
        [ 1.00,  0.20, -0.62,  0.72,  0.55],
        [ 0.20,  1.00, -0.12,  0.10,  0.05],
        [-0.62, -0.12,  1.00, -0.58, -0.50],
        [ 0.72,  0.10, -0.58,  1.00,  0.48],
        [ 0.55,  0.05, -0.50,  0.48,  1.00],
    ])

    # Class row allocation (proportions: ~16.265% Normal, ~9.640% Mild, ~74.095% Severe)
    n_normal = int(round(total_rows * 0.16265))
    n_mild = int(round(total_rows * 0.09640))
    n_severe = total_rows - n_normal - n_mild
    assert n_normal + n_mild + n_severe == total_rows

    # Stratum parameters
    mean_normal = [58.0, 2.5, 1.45, 205.0, 105.0]
    stds_normal = [4.0, 0.8, 0.11, 22.0, 8.0]

    mean_mild = [47.2, 4.2, 1.65, 170.0, 95.0]
    stds_mild = [1.2, 0.9, 0.12, 18.0, 8.0]

    mean_severe = [32.0, 5.5, 1.88, 105.0, 86.0]
    stds_severe = [5.5, 1.4, 0.16, 25.0, 8.0]

    data_normal = sample_class_stratum(CLASS_NORMAL, n_normal, mean_normal, stds_normal, corr_template, rng)
    data_mild = sample_class_stratum(CLASS_MILD, n_mild, mean_mild, stds_mild, corr_template, rng)
    data_severe = sample_class_stratum(CLASS_SEVERE, n_severe, mean_severe, stds_severe, corr_template, rng)

    df_normal = pd.DataFrame(data_normal, columns=FEATURE_NAMES)
    df_normal["target"] = CLASS_NAMES[CLASS_NORMAL]

    df_mild = pd.DataFrame(data_mild, columns=FEATURE_NAMES)
    df_mild["target"] = CLASS_NAMES[CLASS_MILD]

    df_severe = pd.DataFrame(data_severe, columns=FEATURE_NAMES)
    df_severe["target"] = CLASS_NAMES[CLASS_SEVERE]

    df_combined = pd.concat([df_normal, df_mild, df_severe], ignore_index=True)
    df_shuffled = df_combined.sample(frac=1.0, random_state=random_seed).reset_index(drop=True)

    # Verification against assigning rule
    rule_classes = [assign_flexion_class(f) for f in df_shuffled["peak_swing_flexion"]]
    target_classes = [
        CLASS_NORMAL if t == CLASS_NAMES[CLASS_NORMAL]
        else CLASS_MILD if t == CLASS_NAMES[CLASS_MILD]
        else CLASS_SEVERE
        for t in df_shuffled["target"]
    ]
    assert (np.array(rule_classes) == np.array(target_classes)).all(), "Rule verification failed!"

    return df_shuffled[OUTPUT_COLUMNS]


def main():
    print("[1/3] Generating 20,000 synthetic records with 5 features and 1 target...")
    df = generate_synthetic_dataset(total_rows=20000, random_seed=42)

    output_path = "data.csv"
    print(f"[2/3] Saving dataset to '{output_path}'...")
    df.to_csv(output_path, index=False)
    print(f"      Saved {len(df):,} rows with {df.shape[1]} columns: {df.columns.tolist()}")

    print("[3/3] Class Distribution Summary:")
    counts = df["target"].value_counts()
    pcts = df["target"].value_counts(normalize=True) * 100
    for name in [CLASS_NAMES[CLASS_NORMAL], CLASS_NAMES[CLASS_MILD], CLASS_NAMES[CLASS_SEVERE]]:
        cnt = counts.get(name, 0)
        pct = pcts.get(name, 0.0)
        print(f"      {name:<30}: {cnt:>6,} ({pct:>6.2f}%)")

    print("\nGeneration COMPLETE: Exactly 20,000 rows and 6 columns in data.csv.")


if __name__ == "__main__":
    main()
