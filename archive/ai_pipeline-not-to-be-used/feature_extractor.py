"""
KneeGait-Edge: Real-Time Biomechanical Feature Extractor & Segmenter
Hackathon: ZINNOVATIO 4.0 (Chandigarh University)
Lead: Rahul (Team Leader & AI Lead)

Ground Truth Parameter Formulation:
  - Bytyqi et al. (2014): Peak swing flexion < 45.0° triggers Medial KOA Antalgic Alert
  - Rhudy et al. (2024): 50 Hz discrete kinematics
"""

import numpy as np

class RealtimeGaitSegmenter:
    """
    Streaming 50Hz gait cycle detector and feature extractor.
    Operates on a rolling FIFO buffer of knee flexion angles and angular velocity.
    """
    def __init__(self, sample_rate=50, buffer_size=150):
        self.sample_rate = sample_rate
        self.dt = 1.0 / sample_rate
        self.buffer_size = buffer_size

        self.angle_buffer = []
        self.gyro_buffer = []
        self.time_buffer = []
        self.stride_count = 0

    def add_sample(self, timestamp_ms, knee_angle, gyro_y):
        """
        Pushes a new 50Hz sample into the streaming FIFO buffer.
        """
        self.angle_buffer.append(float(knee_angle))
        self.gyro_buffer.append(float(gyro_y))
        self.time_buffer.append(float(timestamp_ms))

        # Keep buffer within bounds
        if len(self.angle_buffer) > self.buffer_size:
            self.angle_buffer.pop(0)
            self.gyro_buffer.pop(0)
            self.time_buffer.pop(0)

    def extract_stride_features(self, stride_angles, stride_gyros, stride_times):
        """
        Extracts the 5 clinical biomarkers from a single completed stride.
        """
        angles = np.array(stride_angles)
        gyros = np.array(stride_gyros)
        
        # 1. Peak Swing Flexion Angle (θ_peak)
        peak_swing = float(np.max(angles))
        min_angle = float(np.min(angles))

        # 2. Sagittal Range of Motion (ROM)
        rom = peak_swing - min_angle

        # 3. Peak Angular Velocity (ω_max)
        omega_max = float(np.max(np.abs(gyros)))

        # 4. Cadence (steps/minute)
        duration_sec = (stride_times[-1] - stride_times[0]) / 1000.0 if len(stride_times) > 1 else 1.0
        cadence = (60.0 / duration_sec) if duration_sec > 0.3 else 100.0

        # 5. Stance-to-Swing Time Ratio (Approximated: stance where gyro is low/negative)
        stance_samples = np.sum(gyros < 40.0)
        swing_samples = len(gyros) - stance_samples
        if swing_samples == 0:
            swing_samples = 1
        stance_to_swing_ratio = float(stance_samples) / float(swing_samples)

        return {
            'peak_swing_flexion': round(peak_swing, 2),
            'sagittal_rom': round(rom, 2),
            'peak_angular_velocity': round(omega_max, 2),
            'stance_to_swing_ratio': round(stance_to_swing_ratio, 2),
            'cadence_spm': round(cadence, 1)
        }

    def process_complete_stride(self, stride_angles, stride_gyros, stride_times):
        """
        Utility for processing batch strides.
        """
        self.stride_count += 1
        features = self.extract_stride_features(stride_angles, stride_gyros, stride_times)
        return features

if __name__ == "__main__":
    # Test with dummy data
    segmenter = RealtimeGaitSegmenter()
    dummy_t = np.linspace(0, 1000, 50)
    dummy_angles = 5.0 + 50.0 * np.sin(np.linspace(0, np.pi, 50))
    dummy_gyros = np.gradient(dummy_angles, 0.02)
    
    feats = segmenter.extract_stride_features(dummy_angles, dummy_gyros, dummy_t)
    print("Test Extracted Features:")
    for k, v in feats.items():
        print(f"  {k}: {v}")
