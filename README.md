# KneeGait-Edge: Wearable Gait Classification Pipeline

**KneeGait-Edge** is a low-cost wearable gait analysis project designed to screen for Knee Osteoarthritis (KOA) joint-stiffening impairment. Using dual 6-DOF IMUs (MPU-6050) on the thigh and shank, it tracks sagittal knee kinematics at 50Hz and classifies strides into **Normal Gait** (`NORMAL_GAIT`) or **High KOA Risk** (`HIGH_KOA_RISK`) using an edge-optimized Random Forest classifier.

---

## 🚀 Quick Start: Viewing the Pre-Trained Pipeline

> **Note:** The Random Forest model is **already fully trained**, and the Jupyter notebook is **pre-executed with all outputs and visual plots embedded**. You do not need to retrain or rerun anything to inspect the results.

### 1. Installation

Clone this repository and install the minimal runtime dependencies:

```bash
pip install -r requirements.txt
```

### 2. View the Notebook

Open [`KneeGait_RandomForest_Training.ipynb`](KneeGait_RandomForest_Training.ipynb) in **VS Code**, **JupyterLab**, or directly on **GitHub**:

```bash
# If using Jupyter:
jupyter notebook KneeGait_RandomForest_Training.ipynb
```

The notebook displays the complete end-to-end workflow:
- **Exploratory Data Analysis:** Feature distributions and kernel density plots comparing normal vs. stiff gait across all 20,000 strides.
- **Correlation Heatmap:** Kinematic relationships among peak flexion, sagittal ROM, stance-to-swing ratio, and angular velocity.
- **Evaluation Metrics:** Pre-computed **~97.3% test accuracy** and **~96.4% balanced accuracy** across a held-out test split of 4,000 strides.
- **Visual Diagnostics:** Pre-rendered annotated **Confusion Matrix** and Gini **Feature Importance** bar charts.
- **Inference Verification:** Interactive test predictions on sample strides with class probabilities.

---

## 🛠️ Optional: Regenerating Data & Retraining

If you want to regenerate the dataset from scratch or retrain the model locally:

1. **Regenerate Synthetic Dataset (20,000 records):**
   ```bash
   python generate_data.py
   ```
   *Creates `data.csv` and `data_validation_report.txt`.*

2. **Retrain the Random Forest Classifier:**
   ```bash
   python train_model.py
   ```
   *Evaluates the model, updates `random_forest_model.joblib`, and updates `model_metadata.json`.*

---

## 📁 Repository Structure

| File | Description |
| :--- | :--- |
| [`KneeGait_RandomForest_Training.ipynb`](KneeGait_RandomForest_Training.ipynb) | Complete 16-section Jupyter notebook with saved outputs and visualizations. |
| [`data.csv`](data.csv) | Final 20,000-row validated synthetic gait dataset (4 inputs + 1 target). |
| [`random_forest_model.joblib`](random_forest_model.joblib) | Pre-trained scikit-learn Random Forest model artifact. |
| [`model_metadata.json`](model_metadata.json) | Specification sheet: feature ordering, hyperparameters, class encodings, and metrics. |
| [`generate_data.py`](generate_data.py) | Standalone synthetic data generation script enforcing biomechanical constraints. |
| [`train_model.py`](train_model.py) | Standalone model training, stratified evaluation, and serialization script. |
| [`data_validation_report.txt`](data_validation_report.txt) | Detailed verification report on dataset constraints, distributions, and bounds. |
| [`evaluation_report.txt`](evaluation_report.txt) | Full text evaluation report with per-class precision, recall, and confusion matrix. |
| [`requirements.txt`](requirements.txt) | Minimal Python package dependencies. |
| [`.gitignore`](.gitignore) | Excludes temporary build files and intermediate export artifacts. |

---

## ⚠️ Scientific & Clinical Disclaimer

The dataset and model presented here are synthetic engineering prototypes developed from biomechanical equations and illustrative clinical literature (PMC4037512). They demonstrate the feasibility of edge-AI gait screening and do not constitute clinically certified diagnostic software.
