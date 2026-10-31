"""
KneeGait-Edge: Live Real-World Noise & Regularized Cross-Validation Runner
Hackathon: ZINNOVATIO 4.0
Lead: Rahul (AI Lead) & Prateek (Hardware)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_score,
    recall_score, f1_score, cohen_kappa_score, matthews_corrcoef,
    roc_auc_score, confusion_matrix, log_loss
)

def run_actual_regularized_computation():
    print(">>> 1. Synthesizing Real-World Noisy Gait Data (N=3,000)...")
    np.random.seed(42)
    n_per_class = 1000

    # Inject significant realistic variance & overlap between classes
    # Healthy: mu=56.5, sigma=5.2 (some healthy drop to 47-48)
    peak_0 = np.random.normal(56.5, 5.2, n_per_class)
    rom_0 = peak_0 - np.random.normal(4.0, 1.5, n_per_class)
    omega_0 = np.random.normal(235.0, 25.0, n_per_class)
    ratio_0 = np.random.normal(1.50, 0.15, n_per_class)
    cadence_0 = np.random.normal(102.0, 8.0, n_per_class)

    # Mild Restriction: mu=46.5, sigma=3.8 (overlaps with both healthy and severe)
    peak_1 = np.random.normal(46.5, 3.8, n_per_class)
    rom_1 = peak_1 - np.random.normal(4.5, 1.5, n_per_class)
    omega_1 = np.random.normal(200.0, 22.0, n_per_class)
    ratio_1 = np.random.normal(1.65, 0.16, n_per_class)
    cadence_1 = np.random.normal(95.0, 7.5, n_per_class)

    # Severe Medial KOA Stiff-Gait: mu=41.5, sigma=4.5 (antalgic joint-stiffening)
    peak_2 = np.random.normal(41.5, 4.5, n_per_class)
    rom_2 = peak_2 - np.random.normal(5.0, 1.8, n_per_class)
    omega_2 = np.random.normal(165.0, 24.0, n_per_class)
    ratio_2 = np.random.normal(1.85, 0.20, n_per_class)
    cadence_2 = np.random.normal(87.0, 8.5, n_per_class)

    # Add random sensor glitch noise (+/- 2.5 deg)
    noise_0 = np.random.normal(0, 2.5, n_per_class)
    noise_1 = np.random.normal(0, 2.5, n_per_class)
    noise_2 = np.random.normal(0, 2.5, n_per_class)

    peak_0 += noise_0
    peak_1 += noise_1
    peak_2 += noise_2

    X_0 = np.column_stack([peak_0, rom_0, omega_0, ratio_0, cadence_0])
    X_1 = np.column_stack([peak_1, rom_1, omega_1, ratio_1, cadence_1])
    X_2 = np.column_stack([peak_2, rom_2, omega_2, ratio_2, cadence_2])

    X = np.vstack([X_0, X_1, X_2])
    y = np.array([0]*n_per_class + [1]*n_per_class + [2]*n_per_class)

    feature_cols = ['peak_swing_flexion', 'sagittal_rom', 'peak_angular_velocity', 'stance_to_swing_ratio', 'cadence_spm']
    df_X = pd.DataFrame(X, columns=feature_cols)

    # 2. Heavily Regularized Random Forest Model
    print(">>> 2. Configuring Heavily Regularized Random Forest Classifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=4,              # Shallow depth to prevent memorization
        min_samples_split=10,     # Needs at least 10 strides to branch
        min_samples_leaf=5,       # Minimum 5 strides per leaf
        max_features='sqrt',      # Feature subspace randomization
        random_state=42
    )

    # 3. Perform 10-Fold Stratified Cross-Validation Live
    print(">>> 3. Computing 10-Fold Stratified Cross-Validation live across 3,000 strides...")
    cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
    scores = cross_val_score(clf, df_X, y, cv=cv, scoring='accuracy')

    # 4. Train/Test Evaluation for Precision, Recall, Specificity, ROC-AUC
    X_train, X_test, y_train, y_test = train_test_split(df_X, y, test_size=0.20, random_state=42, stratify=y)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    bal_acc = balanced_accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')
    kappa = cohen_kappa_score(y_test, y_pred)
    mcc = matthews_corrcoef(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba, multi_class='ovr')
    loss = log_loss(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)

    print("\n=====================================================================")
    print("            ACTUAL LIVE PYTHON COMPUTED RESULTS                      ")
    print("=====================================================================")
    print(f"1. 10-Fold CV Accuracy Scores : {[round(float(s)*100, 2) for s in scores]}")
    print(f"   Mean 10-Fold CV Accuracy   : {scores.mean() * 100:.2f}% (+/- {scores.std() * 100:.2f}%)")
    print("---------------------------------------------------------------------")
    print(f"2. Test Set Accuracy          : {acc * 100:.2f}%")
    print(f"   Balanced Accuracy          : {bal_acc * 100:.2f}%")
    print(f"   Macro Precision            : {prec * 100:.2f}%")
    print(f"   Macro Recall (Sensitivity) : {rec * 100:.2f}%")
    print(f"   Macro F1-Score             : {f1 * 100:.2f}%")
    print(f"   Multi-Class ROC-AUC (OvR)  : {roc_auc:.4f}")
    print(f"   Matthews Correlation (MCC) : {mcc:.4f}")
    print(f"   Cohen's Kappa              : {kappa:.4f}")
    print(f"   Log Loss                   : {loss:.4f}")
    print("---------------------------------------------------------------------")
    print("3. Confusion Matrix (600 Test Strides with Noise):")
    print("                 Pred_0(Health)  Pred_1(Mild)  Pred_2(SevereOA)")
    print(f"  Actual_0(Health)     {cm[0,0]:<12}    {cm[0,1]:<12}  {cm[0,2]:<12}")
    print(f"  Actual_1(Mild)       {cm[1,0]:<12}    {cm[1,1]:<12}  {cm[1,2]:<12}")
    print(f"  Actual_2(SevereOA)   {cm[2,0]:<12}    {cm[2,1]:<12}  {cm[2,2]:<12}")
    print("---------------------------------------------------------------------")

    for i, name in enumerate(["Healthy", "Mild_Restriction", "Severe_KOA"]):
        tp = cm[i, i]
        fn = np.sum(cm[i, :]) - tp
        fp = np.sum(cm[:, i]) - tp
        tn = np.sum(cm) - (tp + fp + fn)
        sens = tp / (tp + fn) * 100
        spec = tn / (tn + fp) * 100
        print(f"  [{name:16s}] Sensitivity: {sens:.1f}% | Specificity: {spec:.1f}%")
    print("=====================================================================")

if __name__ == "__main__":
    run_actual_regularized_computation()
