"""
train_model.py — Compact 3-Class Random Forest Training and ESP32 C Header Export

Loads 'data.csv' (6 columns: 5 input features + 1 target), trains an edge-optimized
RandomForestClassifier (20 trees, max depth 5), evaluates performance on an 80/20
stratified held-out test split, and exports:
1. random_forest_model.joblib : Serialized Python model artifact.
2. model_data.h               : Standalone C/C++ header for ESP32 Core 1 deployment
                                (supports both floating-point and int16 fixed-point).
3. model_metadata.json        : Complete metadata specification and lineage sheet.
"""

import os
import sys
import time
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# Canonical 5 features
FEATURE_NAMES = [
    "peak_swing_flexion",
    "sagittal_rom",
    "stance_to_swing_ratio",
    "peak_angular_velocity",
    "cadence_spm"
]

CLASS_NAMES = [
    "NORMAL_GAIT",
    "MILD_FUNCTIONAL_RESTRICTION",
    "SEVERE_ANTALGIC_STIFF_GAIT"
]

CLASS_TO_ID = {name: i for i, name in enumerate(CLASS_NAMES)}
ID_TO_CLASS = {i: name for i, name in enumerate(CLASS_NAMES)}

CLASS_DISPLAY_LABELS = {
    0: "Normal / Healthy",
    1: "Mild Functional Restriction",
    2: "Severe Antalgic / Stiff Gait"
}

# Fixed-point quantization scaling factors (Q-format for int16)
FIXED_POINT_SCALES = {
    "peak_swing_flexion": 100.0,
    "sagittal_rom": 100.0,
    "stance_to_swing_ratio": 1000.0,
    "peak_angular_velocity": 10.0,
    "cadence_spm": 10.0
}


def generate_c_header(clf, output_path: str = "model_data.h"):
    """Generates zero-dependency portable C header for ESP32."""
    n_trees = len(clf.estimators_)
    lines = []
    lines.append("/*")
    lines.append(" * model_data.h — KneeGait-Edge Compact Random Forest for ESP32")
    lines.append(" * Canonical 5 Features: [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]")
    lines.append(" * Classes: 0: NORMAL_GAIT, 1: MILD_FUNCTIONAL_RESTRICTION, 2: SEVERE_ANTALGIC_STIFF_GAIT")
    lines.append(" */")
    lines.append("#ifndef KNEEGAIT_MODEL_DATA_H")
    lines.append("#define KNEEGAIT_MODEL_DATA_H")
    lines.append("")
    lines.append("#include <stdint.h>")
    lines.append("#include <math.h>")
    lines.append("")
    lines.append("#define KNEEGAIT_NUM_FEATURES 5")
    lines.append("#define KNEEGAIT_NUM_CLASSES  3")
    lines.append(f"#define KNEEGAIT_NUM_TREES    {n_trees}")
    lines.append("")
    lines.append("// Canonical Feature Indices")
    lines.append("#define FEAT_PEAK_SWING_FLEXION    0")
    lines.append("#define FEAT_SAGITTAL_ROM          1")
    lines.append("#define FEAT_STANCE_TO_SWING_RATIO 2")
    lines.append("#define FEAT_PEAK_ANGULAR_VELOCITY 3")
    lines.append("#define FEAT_CADENCE_SPM           4")
    lines.append("")
    lines.append("// Fixed-Point Scale Multipliers (Q-format)")
    for feat, scale in FIXED_POINT_SCALES.items():
        lines.append(f"#define SCALE_{feat.upper():<30} {int(scale)}")
    lines.append("")
    lines.append("// Floating-Point Decision Trees")

    for t_idx, est in enumerate(clf.estimators_):
        tree_ = est.tree_
        lines.append(f"static inline int _tree_{t_idx}_predict(const float* f) {{")

        def recurse_tree(node_id: int, indent: str):
            is_leaf = tree_.children_left[node_id] == -1 and tree_.children_right[node_id] == -1
            if is_leaf:
                pred_c = int(np.argmax(tree_.value[node_id][0]))
                return [f"{indent}return {pred_c};"]
            feat_idx = tree_.feature[node_id]
            thresh = tree_.threshold[node_id]
            left_id = tree_.children_left[node_id]
            right_id = tree_.children_right[node_id]

            c_lines = [f"{indent}if (f[{feat_idx}] <= {thresh:.6f}f) {{"]
            c_lines.extend(recurse_tree(left_id, indent + "    "))
            c_lines.append(f"{indent}}} else {{")
            c_lines.extend(recurse_tree(right_id, indent + "    "))
            c_lines.append(f"{indent}}}")
            return c_lines

        lines.extend(recurse_tree(0, "    "))
        lines.append("}")
        lines.append("")

    lines.append("// Fixed-Point (int16_t) Decision Trees")
    for t_idx, est in enumerate(clf.estimators_):
        tree_ = est.tree_
        lines.append(f"static inline int _tree_{t_idx}_predict_fixed(const int16_t* q) {{")

        def recurse_fixed(node_id: int, indent: str):
            is_leaf = tree_.children_left[node_id] == -1 and tree_.children_right[node_id] == -1
            if is_leaf:
                pred_c = int(np.argmax(tree_.value[node_id][0]))
                return [f"{indent}return {pred_c};"]
            feat_idx = tree_.feature[node_id]
            feat_name = FEATURE_NAMES[feat_idx]
            scale = FIXED_POINT_SCALES[feat_name]
            thresh_fixed = int(round(tree_.threshold[node_id] * scale))
            left_id = tree_.children_left[node_id]
            right_id = tree_.children_right[node_id]

            c_lines = [f"{indent}if (q[{feat_idx}] <= {thresh_fixed}) {{"]
            c_lines.extend(recurse_fixed(left_id, indent + "    "))
            c_lines.append(f"{indent}}} else {{")
            c_lines.extend(recurse_fixed(right_id, indent + "    "))
            c_lines.append(f"{indent}}}")
            return c_lines

        lines.extend(recurse_fixed(0, "    "))
        lines.append("}")
        lines.append("")

    lines.append("""
/**
 * @brief Predicts 3-class gait impairment using majority ensemble vote.
 * @param features Array of 5 floats in canonical order:
 *                 [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]
 * @return Class ID: 0 (NORMAL_GAIT), 1 (MILD_FUNCTIONAL_RESTRICTION), 2 (SEVERE_ANTALGIC_STIFF_GAIT).
 */
static inline int kneegait_predict(const float* features) {
    if (features == 0) return -1;
    for (int i = 0; i < KNEEGAIT_NUM_FEATURES; ++i) {
        if (isnan(features[i]) || isinf(features[i])) return -1;
    }
    int votes[KNEEGAIT_NUM_CLASSES] = {0, 0, 0};
""")
    for t_idx in range(n_trees):
        lines.append(f"    votes[_tree_{t_idx}_predict(features)]++;")

    lines.append("""
    int best_class = 0;
    int max_votes = votes[0];
    for (int c = 1; c < KNEEGAIT_NUM_CLASSES; ++c) {
        if (votes[c] >= max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return best_class;
}

/**
 * @brief Fixed-point int16 inference API for memory-constrained ESP32 operation.
 */
static inline int kneegait_predict_fixed(const int16_t* features_q) {
    if (features_q == 0) return -1;
    int votes[KNEEGAIT_NUM_CLASSES] = {0, 0, 0};
""")
    for t_idx in range(n_trees):
        lines.append(f"    votes[_tree_{t_idx}_predict_fixed(features_q)]++;")

    lines.append("""
    int best_class = 0;
    int max_votes = votes[0];
    for (int c = 1; c < KNEEGAIT_NUM_CLASSES; ++c) {
        if (votes[c] >= max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return best_class;
}

static inline const char* kneegait_get_class_name(int class_id) {
    switch(class_id) {
        case 0: return "NORMAL_GAIT";
        case 1: return "MILD_FUNCTIONAL_RESTRICTION";
        case 2: return "SEVERE_ANTALGIC_STIFF_GAIT";
        default: return "UNKNOWN";
    }
}

static inline const char* kneegait_get_display_label(int class_id) {
    switch(class_id) {
        case 0: return "Normal / Healthy";
        case 1: return "Mild Functional Restriction";
        case 2: return "Severe Antalgic / Stiff Gait";
        default: return "Invalid";
    }
}

#endif // KNEEGAIT_MODEL_DATA_H
""")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    data_path = "data.csv"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Please run 'python generate_data.py' first.")
        sys.exit(1)

    print(f"[1/5] Loading '{data_path}'...")
    df = pd.read_csv(data_path)
    print(f"      Loaded {len(df):,} records with columns: {df.columns.tolist()}")

    X = df[FEATURE_NAMES]
    y = df["target"].map(CLASS_TO_ID)

    print("[2/5] Partitioning 80/20 stratified train/test split...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"      Train samples: {len(X_train):,}, Test samples: {len(X_test):,}")

    print("[3/5] Fitting compact RandomForestClassifier (20 trees, max depth 5)...")
    clf = RandomForestClassifier(
        n_estimators=20,
        max_depth=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=1
    )
    t0 = time.perf_counter()
    clf.fit(X_train, y_train)
    train_duration_ms = (time.perf_counter() - t0) * 1000
    print(f"      Trained in {train_duration_ms:.2f} ms")

    print("[4/5] Evaluating on held-out test split...")
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    bal_acc = balanced_accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro")

    print(f"      Test Accuracy:     {acc*100:.2f}%")
    print(f"      Balanced Accuracy: {bal_acc*100:.2f}%")
    print(f"      Macro F1-Score:    {macro_f1:.4f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES, digits=4))

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2])
    print("Confusion Matrix:")
    print(cm)

    print("\n[5/5] Exporting artifacts to root directory...")
    # 1. Joblib model
    joblib_path = "random_forest_model.joblib"
    joblib.dump(clf, joblib_path)
    joblib_kb = os.path.getsize(joblib_path) / 1024
    print(f"      Saved model: {joblib_path} ({joblib_kb:.1f} KB)")

    # 2. C Header
    header_path = "model_data.h"
    generate_c_header(clf, header_path)
    header_kb = os.path.getsize(header_path) / 1024
    print(f"      Saved C header: {header_path} ({header_kb:.1f} KB)")

    # 3. JSON Model for Browser / JS Parity Testing
    json_path = "model.json"
    trees_json = []
    for estimator in clf.estimators_:
        tree = estimator.tree_
        nodes = []
        for i in range(tree.node_count):
            is_leaf = tree.children_left[i] == tree.children_right[i]
            if is_leaf:
                pred_class = int(np.argmax(tree.value[i][0]))
                nodes.append({
                    "is_leaf": True,
                    "class": pred_class,
                    "probabilities": (tree.value[i][0] / np.sum(tree.value[i][0])).tolist()
                })
            else:
                nodes.append({
                    "is_leaf": False,
                    "feature": int(tree.feature[i]),
                    "threshold": float(tree.threshold[i]),
                    "left": int(tree.children_left[i]),
                    "right": int(tree.children_right[i])
                })
        trees_json.append(nodes)

    model_dict = {
        "model_type": "RandomForestClassifier",
        "n_estimators": len(clf.estimators_),
        "max_depth": clf.max_depth,
        "features": FEATURE_NAMES,
        "classes": CLASS_NAMES,
        "trees": trees_json
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(model_dict, f, indent=2)
    print(f"      Saved JSON model: {json_path} ({os.path.getsize(json_path)/1024:.1f} KB)")

    # 3. Model Metadata JSON
    metadata = {
        "model_type": "sklearn.ensemble.RandomForestClassifier",
        "feature_names": FEATURE_NAMES,
        "feature_order": FEATURE_NAMES,
        "num_features": len(FEATURE_NAMES),
        "target_column": "target",
        "class_names": CLASS_NAMES,
        "class_id_mapping": {str(i): name for i, name in enumerate(CLASS_NAMES)},
        "display_labels": {str(i): label for i, label in CLASS_DISPLAY_LABELS.items()},
        "hyperparameters": {
            "n_estimators": 20,
            "max_depth": 5,
            "class_weight": "balanced",
            "random_state": 42
        },
        "evaluation_metrics": {
            "test_accuracy": float(acc),
            "balanced_accuracy": float(bal_acc),
            "macro_f1": float(macro_f1)
        },
        "disclaimer": (
            "Gait pattern classification prototype trained on synthetic data under specified "
            "threshold rules (Normal >= 49.4°, Mild 45.0°-49.4°, Severe < 45.0°). High accuracy reflects "
            "consistent learning of these biomechanical rules across the 5 features."
        )
    }
    with open("model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print("      Saved metadata: model_metadata.json")

    print("\nTraining and export COMPLETE.")


if __name__ == "__main__":
    main()
