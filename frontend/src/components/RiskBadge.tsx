import { classifyPeak, RiskLevel, THRESHOLDS } from '../lib/thresholds';

const STYLE: Record<RiskLevel, { box: string; dot: string; title: string }> = {
  high: { box: 'border-alert bg-alert/10 text-alert', dot: 'bg-alert', title: 'High risk: stiff gait detected' },
  borderline: { box: 'border-warn bg-warn/10 text-warn', dot: 'bg-warn', title: 'Borderline: mild restriction' },
  normal: { box: 'border-signal bg-signal/10 text-signal', dot: 'bg-signal', title: 'Normal kinematics' },
};

function detail(level: RiskLevel, peak: number) {
  const p = peak.toFixed(1);
  if (level === 'high') return `Antalgic joint-stiffening strategy observed (peak ${p}° < ${THRESHOLDS.highRiskBelow.toFixed(1)}°, medial KOA biomarker)`;
  if (level === 'borderline') return `Swing peak ${p}° is below the healthy range of ${THRESHOLDS.normalFrom}°–${THRESHOLDS.normalTo}°`;
  return `Healthy mid-swing range of motion (peak ${p}°)`;
}

export default function RiskBadge({ peak }: { peak: number | null }) {
  if (peak === null) {
    return (
      <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-muted">
        Waiting for the first full stride…
      </div>
    );
  }
  const level = classifyPeak(peak);
  const s = STYLE[level];
  return (
    <div role="status" className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${s.box}`}>
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
      <div>
        <p className="font-semibold">{s.title}</p>
        <p className="text-sm opacity-90">{detail(level, peak)}</p>
      </div>
    </div>
  );
}
