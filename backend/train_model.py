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

/* =========================================================================
 * CONTINUOUS STREAMING FIFO BUFFER & ON-DEVICE STRIDE PROCESSOR
 * ========================================================================= */

#define KNEEGAIT_FIFO_CAPACITY         150    // ~3.0s buffer at 50Hz (fits 0.55s - 2.4s strides)
#define KNEEGAIT_MIN_STRIDE_S          0.55f  // Min duration (cadence <= 218 spm)
#define KNEEGAIT_MAX_STRIDE_S          2.40f  // Max duration (cadence >= 50 spm)
#define KNEEGAIT_REFRACTORY_S          0.40f  // Refractory deadtime after foot strike (prevents bounce)
#define KNEEGAIT_IMPACT_THRESHOLD_G    1.45f  // Shank deceleration impact threshold for heel strike
#define KNEEGAIT_STALE_TIMEOUT_S       2.00f  // Gap threshold to auto-reset FIFO buffer

/**
 * @brief Raw timestamped IMU sample from hardware.
 */
typedef struct {
    float t;            // Timestamp in seconds
    float flexion;      // Knee joint sagittal flexion angle (degrees)
    float ang_vel;      // Angular velocity (deg/s)
    float accel_z;      // Shank vertical acceleration (g)
} kneegait_sample_t;

/**
 * @brief Segmented stride classification event output.
 */
typedef struct {
    int has_stride;                         // 1 if a stride was completed and classified, 0 otherwise
    int class_id;                           // 0: NORMAL, 1: MILD, 2: SEVERE
    const char* class_name;                 // "NORMAL_GAIT", etc.
    const char* display_label;              // "Normal / Healthy", etc.
    float features[KNEEGAIT_NUM_FEATURES];  // Canonical 5 features
    float stride_duration_s;                // Duration of completed stride in seconds
    float cadence_spm;                      // Step cadence in steps/min
    uint32_t stride_count;                  // Total valid strides detected
} kneegait_stride_result_t;

/**
 * @brief Continuous streaming FIFO pipeline state.
 */
typedef struct {
    kneegait_sample_t buffer[KNEEGAIT_FIFO_CAPACITY];
    int head;                               // Circular buffer write index
    int count;                              // Current number of samples in FIFO
    float last_sample_t;                    // Timestamp of previous sample
    float last_hs_t;                        // Timestamp of last detected heel-strike
    int has_first_hs;                       // Flag indicating initial heel-strike established
    uint32_t total_strides;                 // Running counter of segmented strides
} kneegait_pipeline_t;

/**
 * @brief Initializes or resets the continuous streaming FIFO pipeline.
 */
static inline void kneegait_pipeline_init(kneegait_pipeline_t* pipe) {
    if (!pipe) return;
    pipe->head = 0;
    pipe->count = 0;
    pipe->last_sample_t = -1.0f;
    pipe->last_hs_t = -1.0f;
    pipe->has_first_hs = 0;
    pipe->total_strides = 0;
}

/**
 * @brief Processes a single continuous hardware sample at 50Hz.
 * 
 * Ingests raw hardware readings into the internal FIFO ring buffer, tracks
 * gait cycle events (heel-strike impact / terminal extension), segments valid
 * complete strides, computes the 5 canonical features, and executes inference.
 * 
 * @param pipe Pointer to active pipeline state.
 * @param t_sec Sample timestamp in seconds.
 * @param knee_flexion Sagittal knee flexion in degrees.
 * @param accel_z Shank vertical acceleration in g (pass 0.0f if uninstrumented).
 * @param out_result Output struct populated when a full stride cycle completes.
 * @return 1 if a stride was completed and classified, 0 if still buffering.
 */
static inline int kneegait_process_sample(
    kneegait_pipeline_t* pipe,
    float t_sec,
    float knee_flexion,
    float accel_z,
    kneegait_stride_result_t* out_result
) {
    if (!pipe || !out_result) return 0;
    out_result->has_stride = 0;

    // Check for timestamps going backward or duplicate
    if (pipe->last_sample_t >= 0.0f) {
        float dt = t_sec - pipe->last_sample_t;
        if (dt <= 0.0f) {
            return 0; // Ignore duplicate or out-of-order sample
        }
        // If data stream was interrupted (> 2s), reset buffer
        if (dt > KNEEGAIT_STALE_TIMEOUT_S) {
            kneegait_pipeline_init(pipe);
        }
    }

    // Estimate angular velocity from previous sample in FIFO if available
    float ang_vel = 0.0f;
    if (pipe->count > 0) {
        int prev_idx = (pipe->head - 1 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        float dt = t_sec - pipe->buffer[prev_idx].t;
        if (dt > 0.0001f) {
            ang_vel = (knee_flexion - pipe->buffer[prev_idx].flexion) / dt;
        }
    }

    // Push new sample into circular FIFO
    pipe->buffer[pipe->head].t = t_sec;
    pipe->buffer[pipe->head].flexion = knee_flexion;
    pipe->buffer[pipe->head].ang_vel = ang_vel;
    pipe->buffer[pipe->head].accel_z = accel_z;

    pipe->head = (pipe->head + 1) % KNEEGAIT_FIFO_CAPACITY;
    if (pipe->count < KNEEGAIT_FIFO_CAPACITY) {
        pipe->count++;
    }
    pipe->last_sample_t = t_sec;

    // Detect Heel-Strike (Initial Contact):
    // 1. Primary: Shank deceleration impact spike (accel_z >= 1.45g)
    // 2. Fallback (if accel_z unmeasured): Local minimum of flexion (< 15.0 deg) after swing
    int is_heel_strike = 0;
    if (accel_z >= KNEEGAIT_IMPACT_THRESHOLD_G) {
        is_heel_strike = 1;
    } else if (accel_z <= 0.0f && pipe->count >= 3) {
        int i1 = (pipe->head - 1 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        int i2 = (pipe->head - 2 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        int i3 = (pipe->head - 3 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        if (pipe->buffer[i2].flexion < 15.0f &&
            pipe->buffer[i2].flexion <= pipe->buffer[i3].flexion &&
            pipe->buffer[i2].flexion <= pipe->buffer[i1].flexion) {
            is_heel_strike = 1;
        }
    }

    if (!is_heel_strike) {
        return 0;
    }

    // Apply refractory period (prevent bounce double-triggering)
    if (pipe->has_first_hs && (t_sec - pipe->last_hs_t) < KNEEGAIT_REFRACTORY_S) {
        return 0;
    }

    // If first heel-strike, establish baseline and wait for second heel-strike
    if (!pipe->has_first_hs) {
        pipe->has_first_hs = 1;
        pipe->last_hs_t = t_sec;
        return 0;
    }

    // Second heel-strike detected: complete stride candidate
    float stride_dur = t_sec - pipe->last_hs_t;

    // Check physiological duration bounds [0.55s, 2.40s]
    if (stride_dur < KNEEGAIT_MIN_STRIDE_S || stride_dur > KNEEGAIT_MAX_STRIDE_S) {
        // Invalid duration: reset baseline to current foot strike
        pipe->last_hs_t = t_sec;
        return 0;
    }

    // Extract 5 canonical features across the stride interval [last_hs_t, t_sec]
    float max_flex = -999.0f;
    float min_flex = 999.0f;
    float max_ang_vel = 0.0f;
    float toe_off_t = pipe->last_hs_t + (0.60f * stride_dur); // Default ~60% stance phase

    int n_stride_samples = 0;
    float valley_min = 999.0f;
    float valley_t = toe_off_t;

    // Iterate through FIFO to inspect stride samples
    for (int i = 0; i < pipe->count; ++i) {
        int idx = (pipe->head - 1 - i + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        float st = pipe->buffer[idx].t;
        if (st < pipe->last_hs_t) break;
        if (st > t_sec) continue;

        float flex = pipe->buffer[idx].flexion;
        float vel = fabsf(pipe->buffer[idx].ang_vel);

        if (flex > max_flex) max_flex = flex;
        if (flex < min_flex) min_flex = flex;
        if (vel > max_ang_vel) max_ang_vel = vel;

        // Track inflection for toe-off (local minimum between 40% and 70% phase)
        float phase = (st - pipe->last_hs_t) / stride_dur;
        if (phase >= 0.40f && phase <= 0.70f) {
            if (flex < valley_min) {
                valley_min = flex;
                valley_t = st;
            }
        }
        n_stride_samples++;
    }

    if (n_stride_samples < 5) {
        pipe->last_hs_t = t_sec;
        return 0;
    }

    if (valley_min < 990.0f) {
        toe_off_t = valley_t;
    }

    float t_stance = toe_off_t - pipe->last_hs_t;
    float t_swing = t_sec - toe_off_t;
    if (t_stance <= 0.05f) t_stance = 0.60f * stride_dur;
    if (t_swing <= 0.05f) t_swing = 0.40f * stride_dur;

    float stance_to_swing = t_stance / t_swing;
    if (stance_to_swing < 1.0f) stance_to_swing = 1.0f;
    if (stance_to_swing > 3.0f) stance_to_swing = 3.0f;

    float cadence_spm = 2.0f * (60.0f / stride_dur);

    // Populate Canonical Features
    out_result->features[FEAT_PEAK_SWING_FLEXION]    = max_flex;
    out_result->features[FEAT_SAGITTAL_ROM]          = max_flex - min_flex;
    out_result->features[FEAT_STANCE_TO_SWING_RATIO] = stance_to_swing;
    out_result->features[FEAT_PEAK_ANGULAR_VELOCITY] = max_ang_vel;
    out_result->features[FEAT_CADENCE_SPM]           = cadence_spm;

    // Run On-Device Random Forest Classifier Directly
    int pred_class = kneegait_predict(out_result->features);
    out_result->has_stride = 1;
    out_result->class_id = pred_class;
    out_result->class_name = kneegait_get_class_name(pred_class);
    out_result->display_label = kneegait_get_display_label(pred_class);
    out_result->stride_duration_s = stride_dur;
    out_result->cadence_spm = cadence_spm;

    pipe->total_strides++;
    out_result->stride_count = pipe->total_strides;

    // Advance stride window: current heel-strike becomes start of next stride
    pipe->last_hs_t = t_sec;

    return 1;
}

/**
 * @brief Millisecond timestamp convenience wrapper for Arduino / ESP32.
 */
static inline int kneegait_process_sample_ms(
    kneegait_pipeline_t* pipe,
    uint32_t t_ms,
    float knee_flexion,
    float accel_z,
    kneegait_stride_result_t* out_result
) {
    return kneegait_process_sample(pipe, (float)t_ms / 1000.0f, knee_flexion, accel_z, out_result);
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
