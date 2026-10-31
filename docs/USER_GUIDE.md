# KneeGait-Edge: User & Clinical Operation Manual

**Hackathon:** ZINNOVATIO 4.0 (Chandigarh University 2026)  
**Project:** KneeGait-Edge (Smart Wearable Knee Sleeve & Clinical Gait Dashboard)  
**Target Audience:** Patients, Orthopedic Clinicians, and Physiotherapists  

---

## 1. Product Overview

**KneeGait-Edge** is a decentralized, edge-AI biomechanical knee monitoring system designed to detect antalgic "joint-stiffening" compensatory gait in patients with **Knee Osteoarthritis (KOA)**. 

The system transitions clinical kinematic gait analysis from expensive, laboratory-bound optical motion-capture rooms ($50,000+) into a lightweight, soft, sub-$20 smart knee sleeve for continuous remote monitoring.

---

## 2. Hardware Setup & Placement

### How to Wear the Sleeve (Donning)
1. **Slide on the Sleeve:** Pull the elastic compression knee sleeve over the foot and up the leg until the **Patella Ring (Kneecap Indicator)** sits comfortably centered directly over the kneecap.
2. **Sensor Alignment:** When properly seated, the internal sensor capsule is automatically positioned flat against the **anteromedial tibia (flat shin bone)**, midway between the knee joint and ankle.
   > **Clinical Rationale:** The anteromedial tibia has minimal subcutaneous fat and thin soft tissue, eliminating over 60% of soft-tissue wobble and quad-muscle oscillation artifacts (*Song & Baxter 2025*).
3. **Comfort Fit:** The sleeve is low-profile and breathable; it fits invisibly under standard trousers or jeans.

---

## 3. First-Time Setup (Done Once: ~10 Seconds)

1. **Open the Web Dashboard (Current Product):** Open the **KneeGait Clinical Web Dashboard** directly in any modern browser (Google Chrome / Edge) on your phone, tablet, or laptop. *(No app installation required)*.
2. **Turn On Bluetooth:** Ensure Bluetooth is active on your device.
3. **One-Click Web Pairing:**
   - Slide on the smart sleeve (which auto-powers via integrated stretch switch).
   - On the web dashboard, click **"Connect KneeGait Sleeve"** (powered by Web Bluetooth API).
   - Select **`KneeGait-Edge`** from the browser popup.
   - The sleeve immediately pairs with the web dashboard. **Setup is complete.**

*(Note: A dedicated standalone mobile app for iOS/Android is planned for the commercial production phase).*

---

## 4. Daily Workflow (100% Automated)

Once paired, the user never needs to manually connect or configure the device:

1. **Auto-Wake & Reconnect:** 
   - Slipping the sleeve onto the leg turns it on.
   - The device advertises via BLE (`4fafc201-1fb5-459e-8fcc-c5c9c331914b`) and **auto-reconnects to the user's phone in < 1 second** in the background.
2. **Auto-Zero Calibration:**
   - Standing still for just 2 seconds zeroes out the gyroscope bias automatically.
3. **Walk Naturally:**
   - The user goes about normal daily activities (walking, climbing stairs, 2-minute clinical walk).
   - No phone interaction is needed during the walk. The device operates autonomously.
4. **Edge Processing (ESP32):**
   - Telemetry sampled at **50 Hz** (20ms interval).
   - Onboard **Complementary Filter (alpha = 0.96)** computes real-time sagittal pitch angle without drift.
   - Real-time stride segmentation identifies stance vs. swing phases.
   - Decision logic flags antalgic joint-stiffening when peak swing flexion drops below **45 deg** (Healthy: ~60 deg).

---

## 5. What the User & Doctor See (Actionable Outputs)

### For the Patient & Clinic (Web Dashboard View - Current)
* **Daily Mobility Score (0 - 100):** A simple, clear index summarizing walking fluidness and freedom of knee movement displayed directly on the browser screen.
* **Smart Haptic & Web Nudge:** If prolonged stiff-legged limping or antalgic avoidance is detected during a walk, the dashboard displays a clear, supportive alert banner:
  > *"Stiff knee gait detected. Take a short rest or practice your prescribed knee flexion stretches."*
* **Progress Tracker:** Visualizes rehabilitation milestones over weeks (e.g., *"Your knee swing flexion improved from 39 deg to 48 deg following this week's physical therapy!"*).
* **Progressive Web App (PWA):** Users can tap "Add to Home Screen" in Chrome on Android to use the web dashboard just like an installed mobile app without needing any app store.

### For the Orthopedic Doctor / Physiotherapist (Clinical Web Dashboard)
* **Objective Kinematic Profile:** Eliminates reliance on subjective recall (*"Doctor, my knee feels a bit stiff"*).
* **Quantitative Biomarkers:**
  - **Peak Swing Flexion Angle:** Flagged if < 45 deg.
  - **Sagittal Range of Motion (ROM):** Dynamic degrees of excursion.
  - **Stance-to-Swing Ratio:** Quantitative indicator of antalgic offloading.
  - **Cadence / Stride Frequency:** Steps per minute.
* **KOA Severity Classification:** Stratified into **Healthy**, **Moderate OA**, or **Severe OA** risk.
* **Treatment Efficacy Validation:** Tracks whether hyaluronic acid injections, NSAIDs, or exercise regimens are measurably restoring joint kinematics.

---

## 6. How the System Updates (Firmware & Software)

To ensure the device stays accurate and improves over time, updates are completely friction-free:

### A. Over-The-Air (OTA) Firmware Updates (ESP32)
1. **Background Delivery:** When an updated biomechanical model or edge algorithm is released, the web dashboard (and future mobile companion app) loads the latest verified binary.
2. **BLE OTA Flash:** Next time the sleeve is connected to the web dashboard, the user can trigger a wireless firmware flash to the ESP32 over BLE in ~45 seconds.
3. **Rollback Protection:** The ESP32 utilizes a dual-OTA partition scheme (`ota_0` and `ota_1`). If an update fails mid-transfer, it automatically rolls back to the previous stable firmware.

### B. Machine Learning Model Retraining & Personalization
1. **Transfer Learning / Patient Baseline:** As walking sessions are logged, anonymized kinematic parameters can fine-tune the classifier to the patient's individual limb length and walking cadence.
2. **Web / App Updates:** The web dashboard updates instantly upon page reload with zero download overhead. Future native mobile apps will be published to the Google Play Store / Apple App Store for background OS-level telemetry.

---

## 7. Product Evolution (Prototype vs. Commercial)

| Feature | Current Hackathon Prototype | Final Commercial Product |
| :--- | :--- | :--- |
| **Form Factor** | Anteromedial tibia elastic strap + breadboard casing | Seamless elastic knitted smart knee sleeve |
| **Leg Configuration** | Unilateral (Single knee prototype) | Bilateral (Both knees for symmetry index) |
| **Power Source** | Phone USB-OTG (demo data logging) | Integrated LiPo / coin cell (~14-day battery life) |
| **Connectivity** | Web Dashboard via Web Bluetooth API (No install) | Dedicated iOS/Android Native Mobile App + Web Portal |
| **Diagnostic Scope** | Sagittal Plane (Flexion/Extension) | Multi-plane (Sagittal Flexion + Frontal Varus Thrust) |
