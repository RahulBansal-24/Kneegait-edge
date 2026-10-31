import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bluetooth,
  Clock3,
  Download,
  Footprints,
  Gauge,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBle } from '../context/BleContext';
import type { BleGaitSample } from '../lib/bleService';
import AiAnalysisLogSection from '../components/AiAnalysisLogSection';

type ChartPoint = {
  time: number;
  knee: number;
  thigh: number;
  shank: number;
  phase: string;
};

const MAX_POINTS = 120;

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-ink">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  unit: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <Icon size={18} className="text-teal-700" />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="num text-3xl font-semibold tracking-tight text-ink">
          {value}
        </span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      <p className="mt-2 text-xs text-muted">{description}</p>
    </div>
  );
}

export default function Analytics() {
  const { status, buffer, connect, deviceName, packetCount } = useBle();
  const isConnected = status === 'connected';

  const [samples, setSamples] = useState<BleGaitSample[]>([]);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Sync with live BLE buffer
  useEffect(() => {
    const interval = setInterval(() => {
      if (buffer.current.length > 0) {
        setSamples([...buffer.current].slice(-MAX_POINTS));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [buffer]);

  useEffect(() => {
    if (!isConnected) return;

    const timer = window.setInterval(() => {
      setSessionSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isConnected]);

  const chartData = useMemo<ChartPoint[]>(
    () =>
      samples.map((sample) => ({
        time: Number(sample.t.toFixed(1)),
        knee: Number(sample.knee.toFixed(1)),
        thigh: Number(sample.thigh.toFixed(1)),
        shank: Number(sample.shank.toFixed(1)),
        phase: sample.phase,
      })),
    [samples],
  );

  const stats = useMemo(() => {
    if (samples.length === 0) {
      return {
        average: 0,
        minimum: 0,
        maximum: 0,
        stance: 60,
        swing: 40,
      };
    }

    const knees = samples.map((sample) => sample.knee);
    const average = knees.reduce((sum, value) => sum + value, 0) / knees.length;
    const stanceCount = samples.filter(
      (sample) => sample.phase === 'stance',
    ).length;

    return {
      average,
      minimum: Math.min(...knees),
      maximum: Math.max(...knees),
      stance: (stanceCount / samples.length) * 100,
      swing: 100 - (stanceCount / samples.length) * 100,
    };
  }, [samples]);

  const resetSession = () => {
    setSamples([]);
    setSessionSeconds(0);
  };

  const exportCSV = () => {
    const header = 'time_seconds,knee_flexion_deg,thigh_angle_deg,shank_angle_deg,gait_phase';
    const rows = samples.map((sample) =>
      [
        sample.t.toFixed(3),
        sample.knee.toFixed(2),
        sample.thigh.toFixed(2),
        sample.shank.toFixed(2),
        sample.phase,
      ].join(','),
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `kneegait-session-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <TrendingUp size={15} />
            Movement insights
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Kinematic Analytics
          </h1>

          <p className="mt-1 text-sm text-muted">
            Explore live knee motion, segment angles, and gait-phase distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              isConnected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {isConnected ? 'ESP32 LIVE TELEMETRY' : 'ESP32 DISCONNECTED'}
          </span>

          <button
            onClick={exportCSV}
            disabled={samples.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      {/* Session controls */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Activity size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-ink">Gait telemetry session</h2>
            <p className="text-sm text-muted">
              {isConnected
                ? `Receiving live 50Hz data from ${deviceName} (${packetCount} packets)`
                : 'Connect ESP32 wearable to start recording kinematic session'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isConnected && (
            <button
              onClick={connect}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
            >
              <Bluetooth size={16} />
              Connect ESP32
            </button>
          )}

          <button
            onClick={resetSession}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-muted hover:bg-paper hover:text-ink"
          >
            <RefreshCw size={15} />
            Reset
          </button>
        </div>
      </section>

      {/* AI Analysis Log: 3-Minute Assessment and Random Forest Inference */}
      <AiAnalysisLogSection />

      {/* Metrics overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average flexion"
          value={stats.average.toFixed(1)}
          unit="°"
          description="Mean knee angle across the visible window."
          icon={Gauge}
        />

        <MetricCard
          label="Peak swing angle"
          value={stats.maximum.toFixed(1)}
          unit="°"
          description="Maximum knee flexion reached during swing."
          icon={TrendingUp}
        />

        <MetricCard
          label="Stance proportion"
          value={stats.stance.toFixed(0)}
          unit="%"
          description="Percentage of samples in stance phase."
          icon={Footprints}
        />

        <MetricCard
          label="Session duration"
          value={formatDuration(sessionSeconds)}
          unit="mm:ss"
          description="Active streaming time."
          icon={Clock3}
        />
      </section>

      {/* Knee flexion angle chart */}
      <Panel
        title="Knee flexion trajectory"
        subtitle="Continuous 50Hz sagittal-plane knee motion recorded from wearable IMUs."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
              Knee flexion
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-0.5 w-3 bg-emerald-500" />
              Healthy swing reference (49.4°–65.0°)
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="h-0.5 w-3 border-b-2 border-dashed border-red-500" />
              High KOA risk threshold (&lt;45.0°)
            </span>
          </div>

          <span className="rounded-full bg-paper px-3 py-1.5 text-muted">
            {chartData.length} plotted samples
          </span>
        </div>

        <div className="h-72 w-full">
          {chartData.length < 2 ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-paper text-sm text-muted">
              Waiting for live ESP32 samples…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="kneeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

                <XAxis
                  dataKey="time"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: 'Elapsed time (seconds)',
                    position: 'insideBottom',
                    offset: -5,
                    fontSize: 11,
                    fill: '#64748b',
                  }}
                />

                <YAxis
                  domain={[0, 90]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}°`, 'Knee Flexion']}
                  labelFormatter={(label) => `Time: ${label} s`}
                />

                <ReferenceLine
                  y={45}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '45° risk limit',
                    position: 'insideTopRight',
                    fill: '#ef4444',
                    fontSize: 11,
                  }}
                />

                <ReferenceLine
                  y={49.4}
                  stroke="#10b981"
                  strokeOpacity={0.4}
                />

                <ReferenceLine
                  y={65}
                  stroke="#10b981"
                  strokeOpacity={0.4}
                  label={{
                    value: 'Normal swing range',
                    position: 'insideTopLeft',
                    fill: '#059669',
                    fontSize: 11,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="knee"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#kneeFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      {/* Segment angles */}
      <Panel
        title="Shank motion"
        subtitle="Shank segment-angle signal over time."
      >
        <div className="h-72 w-full">
          {chartData.length < 2 ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-paper text-sm text-muted">
              Waiting for live ESP32 samples…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}°`]}
                  labelFormatter={(label) => `Time: ${label} s`}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="shank"
                  name="Shank angle"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      {/* Gait phase distribution */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Gait-phase distribution"
          subtitle="Share of retained samples classified into stance and swing phases."
        >
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-ink">Stance phase</span>
                <span className="num text-muted">{stats.stance.toFixed(1)}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all"
                  style={{ width: `${stats.stance}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-ink">Swing phase</span>
                <span className="num text-muted">{stats.swing.toFixed(1)}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${stats.swing}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-paper p-3 text-sm text-muted">
              <div className="flex items-start gap-2">
                <Footprints size={17} className="mt-0.5 shrink-0 text-teal-700" />
                <p>
                  Typical healthy gait exhibits ~60% stance phase and ~40% swing phase.
                  Joint stiffening reduces swing duration and peak flexion.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Session overview"
          subtitle="Current hardware telemetry status."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm text-muted">Session status</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isConnected ? 'Live Telemetry' : 'Standby'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm text-muted">Device name</span>
              <span className="text-sm font-semibold text-ink">
                {deviceName}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm text-muted">Retained samples</span>
              <span className="num text-sm font-semibold text-ink">
                {samples.length} / {MAX_POINTS}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Data source</span>
              <span className="text-sm font-semibold text-teal-700">
                {isConnected ? 'ESP32 BLE GATT 50Hz' : 'Awaiting Connection'}
              </span>
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
