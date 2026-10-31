import { Bluetooth, RefreshCw, Unplug } from 'lucide-react';
import AngleGauge from '../components/AngleGauge';
import RiskBadge from '../components/RiskBadge';
import WaveformChart from '../components/WaveformChart';
import { useBle } from '../context/BleContext';

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
  const stance = metrics.phase === 'stance';
  const isConnected = status === 'connected';

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
