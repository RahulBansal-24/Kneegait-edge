import { useEffect, useRef, useState } from 'react';
import { createMockGaitStream, GaitMode, GaitSample, Phase } from './mockGaitStream';
import { THRESHOLDS } from './thresholds';

export interface GaitMetrics {
  knee: number;
  phase: Phase;
  lastPeak: number | null; // peak swing flexion of the last completed stride
  rom: number;             // range of motion over the visible window
  cadence: number | null;  // steps/min
}

export function useGaitStream(mode: GaitMode) {
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // The waveform reads this ref every frame; React state only updates at 10 Hz for the KPI cards.
  const buffer = useRef<GaitSample[]>([]);
  const [metrics, setMetrics] = useState<GaitMetrics>({
    knee: 0, phase: 'stance', lastPeak: null, rom: 0, cadence: null,
  });

  useEffect(() => {
    const maxLen = THRESHOLDS.strideWindowSec * THRESHOLDS.sampleRateHz;
    let swingMax = 0;
    let lastPeak: number | null = null;
    let lastStrike: number | null = null;
    let cadence: number | null = null;
    let prev: Phase = 'stance';
    let n = 0;
    buffer.current = [];

    return createMockGaitStream(
      () => modeRef.current,
      (s) => {
        const buf = buffer.current;
        buf.push(s);
        if (buf.length > maxLen) buf.shift();

        if (s.phase === 'swing') swingMax = Math.max(swingMax, s.knee);
        if (prev === 'swing' && s.phase === 'stance') {
          // heel strike: stride complete
          lastPeak = swingMax;
          swingMax = 0;
          if (lastStrike !== null) cadence = Math.round(120 / (s.t - lastStrike));
          lastStrike = s.t;
        }
        prev = s.phase;

        if (++n % 5 === 0) {
          let lo = Infinity;
          let hi = -Infinity;
          for (const x of buf) { if (x.knee < lo) lo = x.knee; if (x.knee > hi) hi = x.knee; }
          setMetrics({ knee: s.knee, phase: s.phase, lastPeak, rom: hi - lo, cadence });
        }
      },
    );
  }, []);

  return { buffer, metrics };
}
