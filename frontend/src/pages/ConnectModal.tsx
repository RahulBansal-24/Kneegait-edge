import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  BatteryFull,
  Bluetooth,
  CheckCircle2,
  CircleDot,
  Cpu,
  Gauge,
  Radio,
  RefreshCw,
  Signal,
  Unplug,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

type Telemetry = {
  angle: number;
  thighGyro: number;
  shankGyro: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  packets: number;
};

const initialTelemetry: Telemetry = {
  angle: 58.4,
  thighGyro: 12.6,
  shankGyro: -8.3,
  accelX: 0.12,
  accelY: -0.04,
  accelZ: 9.78,
  packets: 0,
};

function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        active ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    />
  );
}

function SensorCard({
  name,
  location,
  connected,
  gyro,
  accel,
  address,
}: {
  name: string;
  location: string;
  connected: boolean;
  gyro: number;
  accel: number;
  address: string;
}) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
            <Activity size={21} />
          </div>
          <div>
            <h3 className="font-semibold text-ink">{name}</h3>
            <p className="text-xs text-muted">{location}</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            connected
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <StatusDot active={connected} />
          {connected ? 'Operational' : 'Standby'}
        </span>
      </div>

      <div className="my-4 h-px bg-line" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted">Angular velocity</p>
          <p className="mt-1 text-xl font-semibold num text-ink">
            {connected ? gyro.toFixed(1) : '--'}
            <span className="ml-1 text-xs font-normal text-muted">°/s</span>
          </p>
        </div>

        <div>
          <p className="text-xs text-muted">Acceleration</p>
          <p className="mt-1 text-xl font-semibold num text-ink">
            {connected ? accel.toFixed(2) : '--'}
            <span className="ml-1 text-xs font-normal text-muted">m/s²</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-xs">
        <span className="text-muted">I²C address</span>
        <code className="font-semibold text-ink">{address}</code>
      </div>
    </Panel>
  );
}

export default function ConnectModal() {
  const [connection, setConnection] = useState<ConnectionState>('disconnected');
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [signalStrength, setSignalStrength] = useState(92);
  const [battery, setBattery] = useState(98);
  const [logs, setLogs] = useState<string[]>([
    'Demo environment initialized.',
    'Waiting for simulated device connection.',
  ]);

  const packetCount = useRef(0);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((previous) => [`${time}  ${message}`, ...previous].slice(0, 7));
  };

  const connectDevice = () => {
    if (connection !== 'disconnected') return;

    setConnection('connecting');
    addLog('Starting simulated connection handshake.');

    window.setTimeout(() => {
      setConnection((current) => {
        if (current !== 'connecting') return current;
        return 'connected';
      });
      addLog('Simulated KneeGait-ESP32 connection established.');
    }, 1200);
  };

  const disconnectDevice = () => {
    setConnection('disconnected');
    setTelemetry((previous) => ({ ...previous, packets: 0 }));
    packetCount.current = 0;
    addLog('Simulated device disconnected.');
  };

  useEffect(() => {
    if (connection !== 'connected') return;

    const timer = window.setInterval(() => {
      packetCount.current += 1;

      setTelemetry({
        angle: Math.max(15, Math.min(80, 55 + Math.sin(Date.now() / 700) * 12 + Math.random() * 3)),
        thighGyro: Math.sin(Date.now() / 500) * 45 + Math.random() * 5,
        shankGyro: Math.cos(Date.now() / 450) * 70 + Math.random() * 5,
        accelX: Math.sin(Date.now() / 600) * 1.2,
        accelY: Math.cos(Date.now() / 800) * 0.8,
        accelZ: 9.5 + Math.random() * 0.5,
        packets: packetCount.current,
      });

      setSignalStrength(85 + Math.floor(Math.random() * 15));
      setBattery((previous) => Math.max(80, previous - (Math.random() < 0.03 ? 1 : 0)));
    }, 200);

    return () => window.clearInterval(timer);
  }, [connection]);

  const isConnected = connection === 'connected';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <Bluetooth size={15} />
            Hardware interface
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Connect Device
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Manage your wearable sensor node and monitor the two IMUs used for
            knee-flexion estimation.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <CircleDot size={14} />
          DEMO MODE · SIMULATED DATA
        </span>
      </header>

      {/* Device connection */}
      <Panel className="overflow-hidden">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-2xl p-4 ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-teal-50 text-teal-700'
              }`}
            >
              <Cpu size={30} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-ink">KneeGait-ESP32</h2>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-muted">
                  ESP32 DevKit
                </span>
              </div>

              <p className="mt-1 text-sm text-muted">
                Dual-IMU wearable gait monitoring node
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <StatusDot active={isConnected} />
                <span className={isConnected ? 'font-medium text-emerald-700' : 'text-muted'}>
                  {connection === 'connected'
                    ? 'Connected · Demo session active'
                    : connection === 'connecting'
                      ? 'Connecting to simulated device…'
                      : 'Device disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isConnected ? (
              <button
                onClick={disconnectDevice}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <Unplug size={16} />
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectDevice}
                disabled={connection === 'connecting'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
              >
                {connection === 'connecting' ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Bluetooth size={16} />
                )}
                {connection === 'connecting' ? 'Connecting…' : 'Simulate Connect'}
              </button>
            )}
          </div>
        </div>

        {connection === 'connecting' && (
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-teal-500" />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 md:grid-cols-4">
          <div>
            <p className="text-xs text-muted">Transport</p>
            <p className="mt-1 text-sm font-semibold text-ink">BLE · Planned</p>
          </div>
          <div>
            <p className="text-xs text-muted">Signal strength</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Signal size={15} className="text-teal-700" />
              {isConnected ? `${signalStrength}%` : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Device battery</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <BatteryFull size={16} className="text-teal-700" />
              {isConnected ? `${battery}%` : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Data stream</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Waves size={16} className={isConnected ? 'text-emerald-600' : 'text-slate-400'} />
              {isConnected ? 'Active · 5 Hz demo' : 'Inactive'}
            </p>
          </div>
        </div>
      </Panel>

      {/* Sensor cards */}
      <div>
        <SectionTitle
          title="Sensor health"
          subtitle="Two MPU-6050 IMUs planned for relative thigh-to-shank motion tracking."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SensorCard
            name="Thigh IMU"
            location="Upper leg · Reference orientation"
            connected={isConnected}
            gyro={telemetry.thighGyro}
            accel={telemetry.accelZ}
            address="0x68"
          />
          <SensorCard
            name="Shank IMU"
            location="Lower leg · Relative orientation"
            connected={isConnected}
            gyro={telemetry.shankGyro}
            accel={telemetry.accelX}
            address="0x69"
          />
        </div>
      </div>

      {/* Telemetry */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionTitle
            title="Live telemetry"
            subtitle="Illustrative readings generated locally in the browser."
          />

          <div className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Estimated knee flexion</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-ink num">
                  {isConnected ? telemetry.angle.toFixed(1) : '--'}
                  <span className="ml-1 text-lg font-medium text-muted">°</span>
                </p>
              </div>
              <div className="rounded-xl bg-white p-3 text-teal-700 shadow-sm">
                <Gauge size={27} />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-200"
                style={{ width: `${isConnected ? (telemetry.angle / 90) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>0°</span>
              <span>90°</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Thigh gyro', value: telemetry.thighGyro, unit: '°/s' },
              { label: 'Shank gyro', value: telemetry.shankGyro, unit: '°/s' },
              { label: 'Accel X', value: telemetry.accelX, unit: 'm/s²' },
              { label: 'Accel Y', value: telemetry.accelY, unit: 'm/s²' },
              { label: 'Accel Z', value: telemetry.accelZ, unit: 'm/s²' },
              { label: 'Packets received', value: telemetry.packets, unit: '' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line p-3">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-2 font-semibold text-ink num">
                  {isConnected
                    ? typeof item.value === 'number'
                      ? item.label === 'Packets received'
                        ? item.value
                        : item.value.toFixed(1)
                      : item.value
                    : '--'}
                  <span className="ml-1 text-xs font-normal text-muted">{item.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Diagnostics */}
        <Panel>
          <SectionTitle
            title="Connection diagnostics"
            subtitle="Simulated device and telemetry checks."
          />

          <div className="space-y-4">
            {[
              {
                label: 'ESP32 device',
                detail: isConnected ? 'Demo connection established' : 'Waiting for connection',
                ok: isConnected,
                icon: Cpu,
              },
              {
                label: 'Thigh IMU',
                detail: isConnected ? 'Demo readings available' : 'No active data',
                ok: isConnected,
                icon: Activity,
              },
              {
                label: 'Shank IMU',
                detail: isConnected ? 'Demo readings available' : 'No active data',
                ok: isConnected,
                icon: Activity,
              },
              {
                label: 'Telemetry stream',
                detail: isConnected ? 'Updating every 200 ms' : 'Stream stopped',
                ok: isConnected,
                icon: Radio,
              },
            ].map(({ label, detail, ok, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="rounded-lg bg-paper p-2 text-muted">
                  <Icon size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-xs text-muted">{detail}</p>
                </div>
                {ok ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <CircleDot size={18} className="text-slate-300" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <Zap size={16} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Hardware integration pending</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  These checks are simulated. Actual sensor health, battery,
                  BLE signal strength, and packet timing require ESP32 firmware.
                </p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Event log */}
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink">Device event log</h2>
            <p className="mt-1 text-sm text-muted">
              Recent events from this browser simulation.
            </p>
          </div>
          <button
            onClick={() => {
              setLogs([]);
            }}
            className="text-xs font-medium text-muted transition hover:text-ink"
          >
            Clear log
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-slate-950 p-4">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400">No events to display.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <p
                  key={`${log}-${index}`}
                  className="break-words font-mono text-xs leading-5 text-emerald-300"
                >
                  <span className="mr-2 text-slate-500">&gt;</span>
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <footer className="flex flex-col justify-between gap-2 border-t border-line pt-4 text-xs text-muted sm:flex-row">
        <span>KneeGait-Edge · Democratizing Gait Intelligence</span>
        <span className="flex items-center gap-1.5">
          <Wifi size={13} />
          Frontend prototype · No hardware connected
        </span>
      </footer>
    </div>
  );
}
