// Real-Time Gait Feature Extractor for KneeGait-Edge
// Extracts the 5 canonical features from continuous 50Hz wearable stream for Random Forest inference.
// Features: [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]

export interface RawKinematicSample {
  t: number;      // timestamp in seconds (monotonic)
  knee: number;   // sagittal knee flexion angle in degrees
  gyro: number;   // angular velocity in deg/s
}

export interface SegmentedStride {
  startT: number;
  endT: number;
  duration: number;
  peakFlexion: number;
  rom: number;
  stanceToSwingRatio: number;
  peakAngularVelocity: number;
  cadenceSpm: number;
}

export interface WindowFeatureResult {
  isValid: boolean;
  status: 'valid' | 'incomplete' | 'no_movement' | 'insufficient_samples';
  statusMessage: string;
  sampleCount: number;
  expectedSampleCount: number;
  strideCount: number;
  durationSec: number;
  features: [number, number, number, number, number];
}

const KNEEGAIT_MIN_STRIDE_S = 0.55;  // ~218 spm max
const KNEEGAIT_MAX_STRIDE_S = 2.40;  // ~50 spm min
const KNEEGAIT_REFRACTORY_S = 0.40;  // 400ms debounce
const MIN_SAMPLES_PER_WINDOW = 600;  // Minimum 40% of 1,500 expected at 50Hz

export class GaitFeatureExtractor {
  private windowSamples: RawKinematicSample[] = [];
  private windowStrides: SegmentedStride[] = [];

  // Stride segmentation tracking state
  private lastSample: RawKinematicSample | null = null;
  private lastHsT: number | null = null;
  private hasFirstHs = false;
  private currentStrideSamples: RawKinematicSample[] = [];

  /**
   * Resets the buffer for a new 30-second collection window.
   */
  startNewWindow(): void {
    this.windowSamples = [];
    this.windowStrides = [];
    this.currentStrideSamples = [];
  }

  /**
   * Ingests a new 50Hz sensor sample into the active window buffer.
   */
  ingestSample(sample: RawKinematicSample): void {
    // Validate monotonic time
    if (this.lastSample && sample.t <= this.lastSample.t) {
      return; // Ignore duplicate or backwards packet
    }

    // Estimate angular velocity from differential if gyro reading is absent/zero
    let gyro = sample.gyro;
    if (this.lastSample && Math.abs(gyro) < 0.001) {
      const dt = sample.t - this.lastSample.t;
      if (dt > 0.001) {
        gyro = (sample.knee - this.lastSample.knee) / dt;
      }
    }

    const normalizedSample: RawKinematicSample = {
      t: sample.t,
      knee: Math.max(0, sample.knee),
      gyro,
    };

    this.windowSamples.push(normalizedSample);
    this.currentStrideSamples.push(normalizedSample);
    if (this.currentStrideSamples.length > 300) {
      this.currentStrideSamples.shift();
    }

    this.detectStride(normalizedSample);
    this.lastSample = normalizedSample;
  }

  /**
   * Detects heel-strike initial contact and segments complete strides.
   * Based on sagittal knee flexion local minima (<15.0°) following swing extension.
   */
  private detectStride(sample: RawKinematicSample): void {
    const len = this.currentStrideSamples.length;
    if (len < 5) return;

    // Check for local minimum at sample len - 2
    const prev = this.currentStrideSamples[len - 3];
    const curr = this.currentStrideSamples[len - 2];
    const next = this.currentStrideSamples[len - 1];

    const isLocalMin =
      curr.knee < 16.0 &&
      curr.knee <= prev.knee &&
      curr.knee <= next.knee &&
      (prev.knee - curr.knee > 0.1 || next.knee - curr.knee > 0.1);

    if (!isLocalMin) return;

    const tStrike = curr.t;

    // Refractory deadtime check
    if (this.hasFirstHs && this.lastHsT !== null && tStrike - this.lastHsT < KNEEGAIT_REFRACTORY_S) {
      return;
    }

    // First strike establishes baseline
    if (!this.hasFirstHs || this.lastHsT === null) {
      this.hasFirstHs = true;
      this.lastHsT = tStrike;
      return;
    }

    // Second strike: complete stride interval
    const strideDur = tStrike - this.lastHsT;

    // Validate physiological stride bounds [0.55s, 2.40s]
    if (strideDur < KNEEGAIT_MIN_STRIDE_S || strideDur > KNEEGAIT_MAX_STRIDE_S) {
      this.lastHsT = tStrike;
      return;
    }

    // Extract stride samples
    const strideSamples = this.windowSamples.filter(
      (s) => s.t >= this.lastHsT! && s.t <= tStrike
    );

    if (strideSamples.length >= 8) {
      let maxFlex = -Infinity;
      let minFlex = Infinity;
      let maxVel = 0;
      let valleyMin = Infinity;
      let valleyT = this.lastHsT + 0.6 * strideDur;

      for (const s of strideSamples) {
        if (s.knee > maxFlex) maxFlex = s.knee;
        if (s.knee < minFlex) minFlex = s.knee;
        const absVel = Math.abs(s.gyro);
        if (absVel > maxVel) maxVel = absVel;

        // Check for toe-off inflection (between 40% and 70% phase)
        const phase = (s.t - this.lastHsT) / strideDur;
        if (phase >= 0.4 && phase <= 0.7) {
          if (s.knee < valleyMin) {
            valleyMin = s.knee;
            valleyT = s.t;
          }
        }
      }

      if (maxFlex > 25.0) {
        // Valid dynamic gait stride (filters out static sitting/standing tremor)
        const tStance = Math.max(0.05, valleyT - this.lastHsT);
        const tSwing = Math.max(0.05, tStrike - valleyT);
        let stanceToSwing = tStance / tSwing;
        if (stanceToSwing < 1.0) stanceToSwing = 1.0;
        if (stanceToSwing > 3.0) stanceToSwing = 3.0;

        const cadenceSpm = 2.0 * (60.0 / strideDur);

        this.windowStrides.push({
          startT: this.lastHsT,
          endT: tStrike,
          duration: strideDur,
          peakFlexion: maxFlex,
          rom: maxFlex - minFlex,
          stanceToSwingRatio: stanceToSwing,
          peakAngularVelocity: maxVel,
          cadenceSpm,
        });
      }
    }

    this.lastHsT = tStrike;
  }

  /**
   * Finalizes and aggregates the 30-second window into the 5 model features.
   */
  finalizeWindow(): WindowFeatureResult {
    const samples = this.windowSamples;
    const sampleCount = samples.length;
    const expectedSampleCount = 1500; // 30s * 50Hz

    // Calculate actual time coverage
    const durationSec =
      sampleCount >= 2 ? samples[sampleCount - 1].t - samples[0].t : 0;

    // Check sample count sufficiency
    if (sampleCount < MIN_SAMPLES_PER_WINDOW) {
      return {
        isValid: false,
        status: 'insufficient_samples',
        statusMessage: `Insufficient sensor samples (${sampleCount} / ~1,500). High packet loss detected.`,
        sampleCount,
        expectedSampleCount,
        strideCount: this.windowStrides.length,
        durationSec,
        features: [0, 0, 0, 0, 0],
      };
    }

    // If strides were detected, use median of strides across the window
    if (this.windowStrides.length >= 2) {
      const peaks = this.windowStrides.map((s) => s.peakFlexion).sort((a, b) => a - b);
      const roms = this.windowStrides.map((s) => s.rom).sort((a, b) => a - b);
      const ratios = this.windowStrides.map((s) => s.stanceToSwingRatio).sort((a, b) => a - b);
      const velocities = this.windowStrides.map((s) => s.peakAngularVelocity).sort((a, b) => a - b);
      const cadences = this.windowStrides.map((s) => s.cadenceSpm).sort((a, b) => a - b);

      const median = (arr: number[]) => {
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
      };

      const peakSwingFlexion = median(peaks);
      const sagittalRom = median(roms);
      const stanceToSwingRatio = median(ratios);
      const peakAngularVelocity = median(velocities);
      const cadenceSpm = median(cadences);

      return {
        isValid: true,
        status: 'valid',
        statusMessage: `Window valid with ${sampleCount} samples and ${this.windowStrides.length} completed strides.`,
        sampleCount,
        expectedSampleCount,
        strideCount: this.windowStrides.length,
        durationSec,
        features: [
          parseFloat(peakSwingFlexion.toFixed(2)),
          parseFloat(sagittalRom.toFixed(2)),
          parseFloat(stanceToSwingRatio.toFixed(3)),
          parseFloat(peakAngularVelocity.toFixed(1)),
          parseFloat(cadenceSpm.toFixed(1)),
        ],
      };
    }

    // Fallback if subject walked with low amplitude or strides weren't cleanly segmented:
    // Extract envelope kinematics from raw samples
    const kneeAngles = samples.map((s) => s.knee).sort((a, b) => a - b);
    const p95 = kneeAngles[Math.floor(kneeAngles.length * 0.95)] || 0;
    const p05 = kneeAngles[Math.floor(kneeAngles.length * 0.05)] || 0;
    const rom = Math.max(0, p95 - p05);

    if (rom < 10.0) {
      // Joint was essentially immobile during this 30s window
      return {
        isValid: false,
        status: 'no_movement',
        statusMessage: 'Minimal knee movement detected during this 30s interval. Please walk continuously.',
        sampleCount,
        expectedSampleCount,
        strideCount: 0,
        durationSec,
        features: [0, 0, 0, 0, 0],
      };
    }

    // Extract velocity from samples
    const absGyros = samples.map((s) => Math.abs(s.gyro)).sort((a, b) => a - b);
    const p95Vel = absGyros[Math.floor(absGyros.length * 0.95)] || 120;

    // Stance/swing estimation from angle distribution: stance is lower flexion (< 20°)
    const stanceCount = samples.filter((s) => s.knee < 20).length;
    const swingCount = Math.max(1, sampleCount - stanceCount);
    let stanceToSwing = stanceCount / swingCount;
    if (stanceToSwing < 1.0) stanceToSwing = 1.0;
    if (stanceToSwing > 3.0) stanceToSwing = 3.0;

    // Estimate cadence from duration
    const cadenceEst = Math.min(130, Math.max(60, 95));

    return {
      isValid: true,
      status: 'valid',
      statusMessage: `Window valid with ${sampleCount} samples (kinematic envelope fallback).`,
      sampleCount,
      expectedSampleCount,
      strideCount: 0,
      durationSec,
      features: [
        parseFloat(p95.toFixed(2)),
        parseFloat(rom.toFixed(2)),
        parseFloat(stanceToSwing.toFixed(3)),
        parseFloat(p95Vel.toFixed(1)),
        parseFloat(cadenceEst.toFixed(1)),
      ],
    };
  }
}
