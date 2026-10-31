"""
KneeGait-Edge: Knee Osteoarthritis (KOA) Classifier Training Pipeline
Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
Lead: Rahul (Team Leader & AI Lead)

Models:
  - Random Forest Classifier (High accuracy & robustness)
  - Decision Tree (Interpretable clinical decision tree for jury)
"""

import os
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def train_koa_model(data_path="datasets/koa_features_dataset.csv", model_dir="models"):
    os.makedirs(model_dir, exist_ok=True)

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Running dataset generator first...")
        from dataset_generator import generate_dataset
        generate_dataset(output_dir="datasets")

    df = pd.read_csv(data_path)
    print(f"\n[INFO] Loaded dataset with {len(df)} samples across 3 classes:")
    print(df['clinical_diagnosis'].value_counts())

    # Feature Matrix & Labels
    feature_cols = [
        'peak_swing_flexion',
        'sagittal_rom',
        'peak_angular_velocity',
        'stance_to_swing_ratio',
        'cadence_spm'
    ]
    X = df[feature_cols]
    y = df['class_label']

    # Train / Test Split (80% / 20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"\n[TRAIN] Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # 1. Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train, y_train)

    # 2. Evaluate Model
    y_pred = rf_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n==================================================")
    print(f" [RESULT] Model Performance: Test Accuracy = {acc * 100:.2f}%")
    print(f"==================================================")

    target_names = ["0: HEALTHY", "1: MILD_RESTRICTION", "2: SEVERE_KOA_STIFF"]
    print("\n[REPORT] Detailed Classification Metrics:")
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("[MATRIX] Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    # 3. Feature Importances (Clinical Validation for Judges)
    print("\n[EXPLAINABILITY] Biomechanical Feature Importances (Why model made predictions):")
    importances = rf_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    for idx in sorted_idx:
        print(f"  - {feature_cols[idx]:25s}: {importances[idx] * 100:.2f}%")

    # 4. Save Trained Model
    model_path = os.path.join(model_dir, "koa_classifier.joblib")
    package = {
        'model': rf_model,
        'feature_names': feature_cols,
        'class_map': {
            0: "HEALTHY",
            1: "MILD_RESTRICTION",
            2: "SEVERE_KOA_STIFF_GAIT"
        },
        'accuracy': acc
    }
    joblib.dump(package, model_path)
    print(f"\n[SAVED] Trained model bundle saved to: '{model_path}'")

if __name__ == "__main__":
    train_koa_model()
