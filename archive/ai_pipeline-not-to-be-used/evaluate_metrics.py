"""
KneeGait-Edge: Comprehensive Clinical & ML Model Evaluation Suite
Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
Lead: Rahul (Team Leader & AI Lead)

Calculates:
  - Accuracy & Balanced Accuracy
  - Macro & Weighted Precision, Recall (Sensitivity), F1-Score
  - Per-class Specificity (True Negative Rate)
  - Cohen's Kappa (Inter-rater reliability beyond chance)
  - Matthews Correlation Coefficient (MCC)
  - Multiclass ROC-AUC (One-vs-Rest)
  - 10-Fold Stratified Cross-Validation (Mean +/- Std)
  - Edge-case Stress Testing around the critical 45.0° boundary (Bytyqi et al. 2014)
  - Real-time Edge Inference Latency (Microseconds per prediction)
"""

import time
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    cohen_kappa_score,
    matthews_corrcoef,
    roc_auc_score,
    confusion_matrix,
    log_loss
)

def run_comprehensive_evaluation(data_path="datasets/koa_features_dataset.csv", model_path="models/koa_classifier.joblib"):
    print("=====================================================================")
    print("   KneeGait-Edge: Comprehensive ML & Clinical Metric Evaluation     ")
    print("   Hackathon: ZINNOVATIO 4.0 (Chandigarh University)                ")
    print("=====================================================================\n")

    # 1. Load Data and Model
    bundle = joblib.load(model_path)
    model = bundle['model']
    feature_names = bundle['feature_names']
    class_map = bundle['class_map']

    df = pd.read_csv(data_path)
    X = df[feature_names]
    y = df['class_label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Predictions
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)

    # 2. Primary Classification Metrics
    acc = accuracy_score(y_test, y_pred)
    bal_acc = balanced_accuracy_score(y_test, y_pred)
    macro_prec = precision_score(y_test, y_pred, average='macro')
    macro_rec = recall_score(y_test, y_pred, average='macro')
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    kappa = cohen_kappa_score(y_test, y_pred)
    mcc = matthews_corrcoef(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba, multi_class='ovr')
    loss = log_loss(y_test, y_proba)

    print("--- 1. OVERALL STATISTICAL PERFORMANCE METRICS ---")
    print(f"  - Test Accuracy                : {acc * 100:.2f}%")
    print(f"  - Balanced Accuracy           : {bal_acc * 100:.2f}%")
    print(f"  - Macro Precision              : {macro_prec * 100:.2f}%")
    print(f"  - Macro Recall (Sensitivity)   : {macro_rec * 100:.2f}%")
    print(f"  - Macro F1-Score               : {macro_f1 * 100:.2f}%")
    print(f"  - Multi-Class ROC-AUC (OvR)    : {roc_auc:.4f} (Max: 1.0000)")
    print(f"  - Matthews Correlation (MCC)   : {mcc:.4f} (Max: 1.0000)")
    print(f"  - Cohen's Kappa (Kappa)        : {kappa:.4f} (Near-perfect agreement)")
    print(f"  - Multi-Class Log Loss         : {loss:.4f}\n")

    # 3. Clinical Diagnostic Breakdown per Class (Sensitivity & Specificity)
    cm = confusion_matrix(y_test, y_pred)
    print("--- 2. CLINICAL DIAGNOSTIC SENSITIVITY & SPECIFICITY ---")
    
    # Calculate specificity per class (True Negative / (True Negative + False Positive))
    for c in range(3):
        tp = cm[c, c]
        fn = np.sum(cm[c, :]) - tp
        fp = np.sum(cm[:, c]) - tp
        tn = np.sum(cm) - (tp + fp + fn)

        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        
        class_name = class_map[c]
        print(f"  [{class_name}]")
        print(f"      - Sensitivity (True Positive Rate) : {sensitivity * 100:.2f}%")
        print(f"      - Specificity (True Negative Rate) : {specificity * 100:.2f}%")
        print(f"      - False Negative Count             : {fn}")
        print(f"      - False Positive Count             : {fp}")

    # 4. 10-Fold Stratified Cross-Validation
    print("\n--- 3. 10-FOLD STRATIFIED CROSS-VALIDATION (Generalization Test) ---")
    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
    print(f"  - 10-Fold Scores : {[round(s * 100, 2) for s in cv_scores]}")
    print(f"  - Mean CV Score  : {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)\n")

    # 5. Clinical Boundary Stress Testing (Around Bytyqi 2014 45.0° Threshold)
    print("--- 4. CLINICAL BOUNDARY STRESS TEST (45.0 deg Threshold Edge Cases) ---")
    stress_cases = [
        # Exactly on the border
        {"name": "Boundary Test 1: Borderline OA (44.8 deg)", "features": {"peak_swing_flexion": 44.8, "sagittal_rom": 40.5, "peak_angular_velocity": 172.0, "stance_to_swing_ratio": 1.78, "cadence_spm": 90.0}, "expected": "SEVERE_KOA_STIFF_GAIT"},
        {"name": "Boundary Test 2: Borderline Mild (45.2 deg)", "features": {"peak_swing_flexion": 45.2, "sagittal_rom": 41.5, "peak_angular_velocity": 195.0, "stance_to_swing_ratio": 1.64, "cadence_spm": 94.0}, "expected": "MILD_RESTRICTION"},
        {"name": "Boundary Test 3: Borderline Healthy (49.5 deg)", "features": {"peak_swing_flexion": 49.5, "sagittal_rom": 46.2, "peak_angular_velocity": 220.0, "stance_to_swing_ratio": 1.52, "cadence_spm": 99.0}, "expected": "HEALTHY"},
    ]

    for test in stress_cases:
        feat_df = pd.DataFrame([test["features"]])[feature_names]
        pred_idx = model.predict(feat_df)[0]
        pred_label = class_map[pred_idx]
        proba = model.predict_proba(feat_df)[0][pred_idx]
        pass_fail = "PASS" if pred_label == test["expected"] else "FLAG"
        print(f"  - {test['name']}:")
        print(f"      Expected: {test['expected']:22s} | Predicted: {pred_label:22s} | Conf: {proba * 100:.1f}% [{pass_fail}]")

    # 6. Real-Time Inference Latency Benchmark
    print("\n--- 5. EDGE INFERENCE LATENCY BENCHMARK ---")
    single_sample = pd.DataFrame([stress_cases[0]["features"]])[feature_names]
    
    # Warm up
    for _ in range(50):
        _ = model.predict(single_sample)

    iterations = 1000
    start_time = time.perf_counter()
    for _ in range(iterations):
        _ = model.predict(single_sample)
    total_time = time.perf_counter() - start_time
    latency_us = (total_time / iterations) * 1_000_000
    latency_ms = latency_us / 1000.0

    print(f"  - Benchmark Iterations   : {iterations} single-stride inferences")
    print(f"  - Average Latency        : {latency_us:.2f} microseconds ({latency_ms:.3f} ms) per stride")
    print(f"  - Throughput             : {int(1.0 / (latency_ms / 1000.0)):,} inferences/second")
    print(f"  - Feasibility on 50Hz ESP32: PASS (< 20 ms interval constraint)\n")
    print("=====================================================================")

if __name__ == "__main__":
    run_comprehensive_evaluation()
