import { THRESHOLDS } from '../lib/thresholds';

const CX = 100, CY = 100, R = 80;

// 0° sits at the left end of the arc, 90° at the right end.
function point(deg: number): [number, number] {
  const rad = (-180 + (deg / 90) * 180) * (Math.PI / 180);
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
}
function arc(from: number, to: number) {
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
}

export default function AngleGauge({ angle }: { angle: number }) {
  const a = Math.max(0, Math.min(90, angle));
  const rot = -90 + (a / 90) * 180;
  const { highRiskBelow: lo, normalFrom: mid, normalTo: hi } = THRESHOLDS;
  return (
    <svg viewBox="0 0 200 120" className="w-full" role="img" aria-label={`Knee angle ${a.toFixed(0)} degrees`}>
      <path d={arc(0, lo)} stroke="#D64545" strokeOpacity="0.35" strokeWidth="12" fill="none" />
      <path d={arc(lo, mid)} stroke="#B07A00" strokeOpacity="0.4" strokeWidth="12" fill="none" />
      <path d={arc(mid, hi)} stroke="#0F9D8A" strokeOpacity="0.45" strokeWidth="12" fill="none" />
      <path d={arc(hi, 90)} stroke="#DCE4E8" strokeWidth="12" fill="none" />
      <g style={{ transform: `rotate(${rot}deg)`, transformOrigin: '100px 100px', transition: 'transform 100ms linear' }}>
        <line x1={CX} y1={CY} x2={CX} y2={30} stroke="#14213D" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx={CX} cy={CY} r="6" fill="#14213D" />
      <text x="100" y="118" textAnchor="middle" fontSize="16" fontWeight="600" fill="#14213D" className="num">{a.toFixed(0)}°</text>
    </svg>
  );
}
