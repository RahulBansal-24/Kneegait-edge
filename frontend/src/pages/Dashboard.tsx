import { ArrowRight, Bluetooth, RefreshCw, Sparkles, Unplug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AngleGauge from '../components/AngleGauge';
import RiskBadge from '../components/RiskBadge';
import WaveformChart from '../components/WaveformChart';
import { useBle } from '../context/BleContext';
import { useAiSession } from '../context/AiSessionContext';

const fmt = (v: number | null, unit = '°') => (v === null ? '–' : `${v.toFixed(1)}${unit}`);

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { status, metrics, buffer, connect, disconnect, packetCount, deviceName } = useBle();
  const {
    finalResult,
    status: aiStatus,
    currentWindowIndex,
    elapsedSeconds,
    windowSecondsRemaining,
  } = useAiSession();
  const navigate = useNavigate();

  const stance = metrics.phase === 'stance';
  const isConnected = status === 'connected';

  const getAiBadgeTheme = (classId: number) => {
    switch (classId) {
      case 0:
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 1:
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 2:
      default:
        return 'border-rose-200 bg-rose-50 text-rose-800';
    }
  };

  const getAiDotTheme = (classId: number) => {
    switch (classId) {
      case 0:
        return 'bg-emerald-500';
      case 1:
        return 'bg-amber-500';
      case 2:
      default:
        return 'bg-rose-500';
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Live gait kinematics</h1>
          <p className="text-xs text-muted">Real-time dual-IMU Bluetooth telemetry stream</p>
        </div>

        {/* Real ESP32 Bluetooth Status & Direct Connect */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {deviceName} Connected · 50Hz ({packetCount} pkts)
              </span>
              <button
                onClick={disconnect}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                title="Disconnect BLE"
              >
                <Unplug size={14} />
                Disconnect
              </button>
            </div>
          ) : status === 'connecting' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              <RefreshCw size={13} className="animate-spin text-amber-600" />
              Pairing with ESP32…
            </span>
          ) : (
            <button
              onClick={connect}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 transition"
            >
              <Bluetooth size={14} />
              Connect ESP32
            </button>
          )}
        </div>
      </header>

      {/* Final AI Analysis Result Bar (Appears when completed) */}
      {finalResult && (
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm transition-all animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white shadow-sm">
                <Sparkles size={18} className="text-teal-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    AI Analysis Completed
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getAiBadgeTheme(
                      finalResult.finalClassId
                    )}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${getAiDotTheme(
                        finalResult.finalClassId
                      )}`}
                    />
                    {finalResult.finalDisplayLabel} · {finalResult.overallConfidence}% Confidence
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 line-clamp-1 sm:line-clamp-none">
                  {finalResult.finalDescription}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Based on completed 3-minute session ({finalResult.validWindowCount} of {finalResult.totalWindows} windows evaluated) · Completed at {finalResult.completedAt}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink shadow-sm hover:bg-slate-100 transition"
            >
              <span>View Detailed AI Log</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* AI Analysis Active Progress Bar (Visible while 3-minute analysis is running) */}
      {aiStatus === 'running' && (
        <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 shadow-sm transition-all">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <RefreshCw size={15} className="animate-spin" />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-900">
                  AI Analysis Running: Window {currentWindowIndex} of 6
                </p>
                <p className="text-[11px] text-teal-700">
                  Elapsed: {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')} / 03:00 · Next prediction in {windowSecondsRemaining}s
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950 underline underline-offset-2"
            >
              <span>Inspect AI Log</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </section>
      )}

      <RiskBadge peak={metrics.lastPeak} />

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <section className="rounded-lg border border-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Knee flexion waveform (50Hz)</h2>
            <span className="text-xs text-muted">
              {isConnected ? 'Live hardware stream' : 'Awaiting ESP32 connection'}
            </span>
          </div>
          <WaveformChart buffer={buffer} />
        </section>
        <aside className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-4">
            <h2 className="mb-1 text-sm font-medium text-muted">Current knee angle</h2>
            <AngleGauge angle={metrics.knee} />
          </section>
          <div
            className={`rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors duration-200 ${
              stance ? 'bg-ink text-white' : 'bg-signal text-white'
            }`}
          >
            {stance ? 'Stance phase (load bearing)' : 'Swing phase (limb advancement)'}
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
