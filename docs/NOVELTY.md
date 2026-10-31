# KneeGait-Edge: Scientific Novelty, Prior Art & Competitive Differentiation

**Hackathon:** ZINNOVATIO 4.0 (Chandigarh University 2026)  
**Track:** Healthcare & Edge-AI Wearables  
**Project:** KneeGait-Edge  
**Hardware & Firmware Lead:** Prateek Dhar Dwivedi  

---

## 1. Executive Summary: What Makes KneeGait-Edge Novel?

While individual aspects of gait kinematics have been explored in academic literature (e.g., Bytyqi et al. 2014, Rhudy et al. 2024, Song & Baxter 2025), **no end-to-end, ultra-low-cost (< $20), edge-AI smart knee sleeve exists that detects antalgic joint-stiffening in real time.**

Prior research remains confined to $50,000+ laboratory motion-capture rooms or offline MATLAB pipelines processed hours after clinical visits. KneeGait-Edge closes the "Lab-to-Clinic-to-Home" gap by translating clinical sagittal biomechanics into a self-contained, real-time edge wearable.

---

## 2. Competitive Benchmarking Matrix

| Dimension | Gold-Standard Lab (Vicon / Qualisys) | Academic Research IMU Systems | Commercial Braces (Breg, DonJoy, OPUM) | KneeGait-Edge (Our System) |
| :--- | :--- | :--- | :--- | :--- |
| **System Cost** | **$50,000 - $150,000** | $2,000 - $8,000 (Xsens/Delsys) | $800 - $2,500 | **< $20 (Bill of Materials)** |
| **Deployment Setting** | Dedicated optical gait laboratory | Controlled indoor biomechanics labs | Post-operative clinical monitoring | **Everyday living / Home rehabilitation** |
| **Form Factor** | 16+ retro-reflective skin markers | Bulky straps, trailing wires | Rigid metal/plastic hinged exoskeletons | **Soft, breathable knitted elastic sleeve** |
| **Processing Paradigm** | Offline workstation computation | Post-hoc offline PC scripts (MATLAB/Python) | Embedded angle thresholding | **Real-Time On-Device Edge-AI (ESP32)** |
| **Soft-Tissue Wobble** | Camera marker skin-glide artifacts | Massive quad-muscle oscillation on thigh | Rigid frame pinches soft tissue | **Mounted on flat anteromedial tibia (bone-rigid)** |
| **Latency / Telemetry** | Hours of post-processing | Batch-processed after capture | Real-time display / Bluetooth | **Zero latency: 50Hz live edge filtering** |
| **Cloud Dependency** | Dedicated local server | Local file storage | Proprietary cloud subscriptions | **Zero Cloud Cost: 100% Edge-First / HIPAA safe** |

---

## 3. The Four Pillars of Innovation

### Pillar 1: Translating Academic Science into a Low-Cost Wearable
* **Prior Art:** Research demonstrates that peak swing flexion drops below **$45^\circ$** in severe Knee Osteoarthritis (KOA) compared to $\sim 60^\circ$ in healthy adults due to antalgic avoidance (*Bytyqi et al. 2014*). However, measuring this required gait laboratories.
* **Our Novelty:** We embedded this clinical rule-set and machine learning classification onto an ultra-low-cost ESP32 microcontroller, democratizing access for resource-constrained clinics and remote patients.

### Pillar 2: Rigid Tibial Coupling (Eliminating Soft-Tissue Artifacts)
* **Prior Art:** Standard gait setups place IMUs on both the thigh and shank. The thigh sensor rests over the quadriceps muscle, which oscillates heavily during heel-strike, causing **over 60% noise from flesh oscillation artifacts** (*Song & Baxter 2025*).
* **Our Novelty:** We intentionally designed a single-capsule mount resting specifically on the **flat anteromedial tibia (shin bone)**. The tibia has virtually zero subcutaneous fat, ensuring rigid mechanical coupling to the skeleton without complex multi-sensor calibration drift.

### Pillar 3: On-Device Edge Computing vs. Cloud Streaming
* **Prior Art:** Most consumer health wearables stream continuous raw IMU telemetry to cloud servers (AWS/Azure), causing high battery drain, latency, connectivity drops, and monthly subscription paywalls.
* **Our Novelty:**
  1. Onboard **Complementary Filter ($\alpha = 0.96$)** running at 50Hz (20ms cycles) on the ESP32.
  2. Continuous on-device stride segmentation (heel-strike to toe-off).
  3. Pre-trained lightweight edge classifier categorizing strides into Healthy, Moderate KOA, and Severe KOA.
  4. Local processing preserves patient data privacy (HIPAA compliant by design).

### Pillar 4: Soft Knitted Sleeve Integration (No Mechanical Hinges)
* **Prior Art:** Commercial electronic orthopedic products (like post-op ACL braces) use heavy metal sidebars and mechanical dials that restrict natural movement and cannot be worn under normal clothing.
* **Our Novelty:** KneeGait-Edge integrates into a non-intrusive compression sleeve. When pulled up to align the patella ring with the kneecap, the sensor automatically seats into the clinically optimal anatomical location.

---

## 4. Academic & Patent Differentiation

### Academic Distinction
Unlike prior studies that gather data purely for observational publications, KneeGait-Edge provides a **closed-loop feedback system**:
- Real-time kinematic biomarker calculation (Peak Flexion, Sagittal ROM, Stance/Swing Ratio, Cadence).
- Instantaneous haptic/app feedback to actively correct antalgic joint-stiffening during daily physical therapy.

### Commercial & IP Defense
1. **Utility:** Autonomous, self-calibrating edge sensor architecture tailored to anteromedial tibial placement.
2. **Economic Disruption:** Reduces diagnostic hardware barrier from thousands of dollars to an accessible consumer price point.
3. **Clinical Adoption:** Enables longitudinal, objective monitoring outside of clinical consultation rooms.
