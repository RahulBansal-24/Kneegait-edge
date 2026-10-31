import { THRESHOLDS } from './thresholds';

export type GaitMode = 'healthy' | 'stiff';
export type Phase = 'stance' | 'swing';

// Same shape the BLE parser should produce, so swapping in real hardware is one line.
export interface GaitSample {
  t: number;      // seconds since start
  thigh: number;  // thigh IMU angle, degrees
  shank: number;  // shank IMU angle, degrees
  knee: number;   // knee flexion, degrees
  phase: Phase;
}

const PEAK: Record<GaitMode, number> = { healthy: 58, stiff: 39 };
const STRIDE_SEC = 1.15; // about 104 steps/min
const STANCE_FRACTION = 0.6;
const BASE = 3;

const bump = (p: number, c: number, w: number) => Math.exp(-((p - c) ** 2) / (2 * w * w));
const noise = (a: number) => (Math.random() - 0.5) * 2 * a;

// p = position in the gait cycle, 0 (heel strike) to 1 (next heel strike)
function kneeAt(p: number, peak: number) {
  return BASE + 13 * bump(p, 0.14, 0.06) + (peak - BASE) * bump(p, 0.73, 0.09);
}

export function createMockGaitStream(getMode: () => GaitMode, onSample: (s: GaitSample) => void) {
  const dtMs = 1000 / THRESHOLDS.sampleRateHz;
  let t = 0;
  let p = 0;
  let peak = PEAK[getMode()];

  const id = setInterval(() => {
    p += dtMs / 1000 / STRIDE_SEC;
    if (p >= 1) {
      p -= 1;
      peak = PEAK[getMode()] + noise(1.5); // pick up mode changes at each new stride
    }
    t += dtMs / 1000;
    const knee = Math.max(0, kneeAt(p, peak) + noise(0.4));
    const thigh = 7.5 + 17.5 * Math.cos(2 * Math.PI * p);
    onSample({ t, thigh, shank: thigh - knee, knee, phase: p < STANCE_FRACTION ? 'stance' : 'swing' });
  }, dtMs);

  return () => clearInterval(id);
}
