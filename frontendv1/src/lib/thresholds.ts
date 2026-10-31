// Single source of truth for clinical limits (Bytyqi et al., 2014).
export const THRESHOLDS = {
  highRiskBelow: 45.0,   // peak swing flexion under this = stiff gait
  normalFrom: 49.4,      // healthy swing range start
  normalTo: 65.0,        // healthy swing range end
  oaMean: 41.9,          // mean peak swing flexion in medial OA
  sampleRateHz: 50,
  strideWindowSec: 8,    // visible waveform window
  filterAlpha: 0.96,     // complementary filter constant at 50 Hz (Rhudy et al., 2024)
} as const;

export type RiskLevel = 'high' | 'borderline' | 'normal';

export function classifyPeak(peak: number): RiskLevel {
  if (peak < THRESHOLDS.highRiskBelow) return 'high';
  if (peak < THRESHOLDS.normalFrom) return 'borderline';
  return 'normal';
}
