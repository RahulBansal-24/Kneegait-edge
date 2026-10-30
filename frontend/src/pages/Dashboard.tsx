import { useState } from 'react';
import AngleGauge from '../components/AngleGauge';
import RiskBadge from '../components/RiskBadge';
import WaveformChart from '../components/WaveformChart';
import type { GaitMode } from '../lib/mockGaitStream';
import { useGaitStream } from '../lib/useGaitStream';

const fmt = (v: number | null, unit = '°') => (v === null ? '–' : `${v.toFixed(1)}${unit}`);

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [mode, setMode] = useState<GaitMode>('healthy');
  const { buffer, metrics } = useGaitStream(mode);
  const stance = metrics.phase === 'stance';

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Live gait</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Simulated patient</span>
          <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
            {(['healthy', 'stiff'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  mode === m ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {m === 'healthy' ? 'Healthy gait' : 'Stiff gait'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <RiskBadge peak={metrics.lastPeak} />

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <section className="rounded-lg border border-line bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-muted">Knee flexion, last {8} seconds</h2>
          <WaveformChart buffer={buffer} />
        </section>
        <aside className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="mb-1 text-sm font-medium text-muted">Current angle</h2>
            <AngleGauge angle={metrics.knee} />
          </section>
          <div
            className={`rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors duration-200 ${
              stance ? 'bg-ink text-white' : 'bg-signal text-white'
            }`}
          >
            {stance ? 'Stance phase (60%)' : 'Swing phase (40%)'}
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Current flexion" value={fmt(metrics.knee)} />
        <Kpi label="Last peak swing" value={fmt(metrics.lastPeak)} />
        <Kpi label="Range of motion" value={fmt(metrics.rom)} />
        <Kpi label="Cadence" value={metrics.cadence === null ? '–' : `${metrics.cadence} steps/min`} />
      </div>
    </div>
  );
}
