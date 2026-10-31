import { MutableRefObject, useEffect, useRef } from 'react';
import type { BleGaitSample } from '../lib/bleService';
import { THRESHOLDS } from '../lib/thresholds';

const Y_MAX = 80;

export default function WaveformChart({ buffer }: { buffer: MutableRefObject<BleGaitSample[]> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const maxLen = THRESHOLDS.strideWindowSec * THRESHOLDS.sampleRateHz;
    let raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const d = window.devicePixelRatio || 1;
      canvas.width = r.width * d;
      canvas.height = r.height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const padL = 36;
      const y = (deg: number) => h - 6 - (deg / Y_MAX) * (h - 14);
      ctx.clearRect(0, 0, w, h);
      ctx.font = '11px "IBM Plex Sans", sans-serif';

      // healthy swing band
      ctx.fillStyle = 'rgba(15,157,138,0.14)';
      ctx.fillRect(padL, y(THRESHOLDS.normalTo), w - padL, y(THRESHOLDS.normalFrom) - y(THRESHOLDS.normalTo));
      ctx.fillStyle = '#0F9D8A';
      ctx.fillText(`Healthy swing ${THRESHOLDS.normalFrom}°–${THRESHOLDS.normalTo}°`, padL + 8, y(THRESHOLDS.normalTo) + 14);

      // grid
      ctx.strokeStyle = '#DCE4E8';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#5E707B';
      for (let d = 0; d <= Y_MAX; d += 20) {
        ctx.beginPath(); ctx.moveTo(padL, y(d)); ctx.lineTo(w, y(d)); ctx.stroke();
        ctx.fillText(`${d}°`, 6, y(d) + 4);
      }

      // 45° risk line
      ctx.strokeStyle = '#D64545';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(padL, y(THRESHOLDS.highRiskBelow)); ctx.lineTo(w, y(THRESHOLDS.highRiskBelow)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#D64545';
      ctx.fillText('45° risk limit', w - 82, y(THRESHOLDS.highRiskBelow) + 15);

      // knee trace, right-aligned so it scrolls in from the right
      const buf = buffer.current;
      if (buf.length > 1) {
        ctx.strokeStyle = '#14213D';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        buf.forEach((s, i) => {
          const x = padL + ((maxLen - buf.length + i) / (maxLen - 1)) * (w - padL);
          if (i === 0) ctx.moveTo(x, y(s.knee)); else ctx.lineTo(x, y(s.knee));
        });
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [buffer]);

  return <canvas ref={ref} className="h-72 w-full" role="img" aria-label="Live knee flexion waveform" />;
}
