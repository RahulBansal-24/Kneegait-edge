"""
KneeGait-Edge: Real-Time Anomaly Prediction Service
Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
Lead: Rahul (Team Leader & AI Lead)

Takes incoming biomechanical features and outputs standardized clinical JSON.
"""

import os
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "koa_classifier.joblib")

class KOAPredictor:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Run train_classifier.py first!")
        
        bundle = joblib.load(model_path)
        self.model = bundle['model']
        self.feature_names = bundle['feature_names']
        self.class_map = bundle['class_map']

    def predict_stride(self, features: dict):
        """
        Input features dictionary containing:
          - peak_swing_flexion
          - sagittal_rom
          - peak_angular_velocity
          - stance_to_swing_ratio
          - cadence_spm
        """
        # Formulate feature vector with named columns to match model
        x = pd.DataFrame([{
            'peak_swing_flexion': features['peak_swing_flexion'],
            'sagittal_rom': features['sagittal_rom'],
            'peak_angular_velocity': features['peak_angular_velocity'],
            'stance_to_swing_ratio': features['stance_to_swing_ratio'],
            'cadence_spm': features['cadence_spm']
        }])[self.feature_names]

        pred_class = int(self.model.predict(x)[0])
        probabilities = self.model.predict_proba(x)[0]
        confidence = float(probabilities[pred_class])

        # Clinical rule trigger (< 45.0° - Bytyqi et al. 2014)
        is_stiff_alert = (features['peak_swing_flexion'] < 45.0)

        diagnosis = self.class_map[pred_class]
        
        if pred_class == 2 or is_stiff_alert:
            clinical_note = (
                f"Antalgic joint-stiffening strategy detected. Peak swing flexion "
                f"({features['peak_swing_flexion']} deg) < 45.0 deg threshold (Bytyqi et al. 2014)."
            )
        elif pred_class == 1:
            clinical_note = "Mild functional swing restriction detected. Monitor range of motion."
        else:
            clinical_note = "Healthy gait kinematics. Normal fluid pendular swing."

        return {
            "prediction": {
                "class_id": pred_class,
                "diagnosis": diagnosis,
                "confidence": round(confidence, 3),
                "stiff_gait_alert": is_stiff_alert,
                "probabilities": {
                    "healthy": round(float(probabilities[0]), 3),
                    "mild_restriction": round(float(probabilities[1]), 3),
                    "severe_koa_stiff": round(float(probabilities[2]), 3)
                }
            },
            "features": features,
            "clinical_note": clinical_note
        }

if __name__ == "__main__":
    print("[TEST] Running real-time prediction self-test...\n")
    predictor = KOAPredictor()

    # Test Case 1: Healthy Stride (58.4° Peak Swing)
    healthy_test = {
        'peak_swing_flexion': 58.4,
        'sagittal_rom': 55.2,
        'peak_angular_velocity': 248.0,
        'stance_to_swing_ratio': 1.45,
        'cadence_spm': 105.0
    }
    res_1 = predictor.predict_stride(healthy_test)
    print("--- Test Case 1: Normal Volunteer ---")
    print(f"Diagnosis : {res_1['prediction']['diagnosis']} (Confidence: {res_1['prediction']['confidence'] * 100:.1f}%)")
    print(f"Alert     : {res_1['prediction']['stiff_gait_alert']}")
    print(f"Note      : {res_1['clinical_note']}\n")

    # Test Case 2: Medial KOA Stiff-Gait Stride (39.5° Peak Swing)
    koa_test = {
        'peak_swing_flexion': 39.5,
        'sagittal_rom': 34.8,
        'peak_angular_velocity': 160.0,
        'stance_to_swing_ratio': 1.88,
        'cadence_spm': 86.0
    }
    res_2 = predictor.predict_stride(koa_test)
    print("--- Test Case 2: Medial KOA Patient ---")
    print(f"Diagnosis : {res_2['prediction']['diagnosis']} (Confidence: {res_2['prediction']['confidence'] * 100:.1f}%)")
    print(f"Alert     : {res_2['prediction']['stiff_gait_alert']}")
    print(f"Note      : {res_2['clinical_note']}")
