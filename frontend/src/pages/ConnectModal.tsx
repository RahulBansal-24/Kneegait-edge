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
import { useBle } from '../context/BleContext';

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
  const { status, errorMessage, deviceName, telemetry, packetCount, connect, disconnect, logs } = useBle();
  const isConnected = status === 'connected';

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
            Manage your wearable sensor node and monitor the dual IMUs used for
            knee-flexion estimation over Bluetooth Low Energy.
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
            isConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          <CircleDot size={14} className={isConnected ? 'text-emerald-600' : 'text-slate-400'} />
          {isConnected ? 'HARDWARE ACTIVE · BLE 50HZ' : 'HARDWARE READY · WEB BLUETOOTH'}
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
                <h2 className="text-xl font-semibold text-ink">{deviceName}</h2>
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
                  {status === 'connected'
                    ? 'Connected · Live 50Hz session active'
                    : status === 'connecting'
                      ? 'Pairing with ESP32 over Bluetooth…'
                      : status === 'error'
                        ? `Error: ${errorMessage || 'Connection failed'}`
                        : 'Device disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isConnected ? (
              <button
                onClick={disconnect}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <Unplug size={16} />
                Disconnect
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={status === 'connecting'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
              >
                {status === 'connecting' ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Bluetooth size={16} />
                )}
                {status === 'connecting' ? 'Connecting…' : 'Connect ESP32'}
              </button>
            )}
          </div>
        </div>

        {status === 'connecting' && (
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-teal-500" />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 md:grid-cols-4">
          <div>
            <p className="text-xs text-muted">Transport</p>
            <p className="mt-1 text-sm font-semibold text-ink">BLE GATT · 50Hz</p>
          </div>
          <div>
            <p className="text-xs text-muted">Signal status</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Signal size={15} className="text-teal-700" />
              {isConnected ? 'Stable connection' : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Packets received</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <BatteryFull size={16} className="text-teal-700" />
              {isConnected ? packetCount : '--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Data stream</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Waves size={16} className={isConnected ? 'text-emerald-600' : 'text-slate-400'} />
              {isConnected ? 'Active · 50 Hz Live' : 'Inactive'}
            </p>
          </div>
        </div>
      </Panel>

      {/* Sensor cards */}
      <div>
        <SectionTitle
          title="Sensor health"
          subtitle="Dual MPU-6050 IMUs relative thigh-to-shank motion tracking."
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
            subtitle="Kinematic readings received directly from the ESP32 wearable."
          />

          <div className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Measured knee flexion</p>
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
                style={{ width: `${isConnected ? Math.min(100, (telemetry.angle / 90) * 100) : 0}%` }}
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
            subtitle="Device and telemetry stream status."
          />

          <div className="space-y-4">
            {[
              {
                label: 'ESP32 device',
                detail: isConnected ? 'Hardware connection active' : 'Waiting for connection',
                ok: isConnected,
                icon: Cpu,
              },
              {
                label: 'Thigh IMU (0x68)',
                detail: isConnected ? 'Active stream' : 'Awaiting device',
                ok: isConnected,
                icon: Activity,
              },
              {
                label: 'Shank IMU (0x69)',
                detail: isConnected ? 'Active stream' : 'Awaiting device',
                ok: isConnected,
                icon: Activity,
              },
              {
                label: 'Telemetry stream',
                detail: isConnected ? 'Streaming at 50 Hz' : 'Stream idle',
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

          <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-3">
            <div className="flex items-start gap-2">
              <Zap size={16} className="mt-0.5 shrink-0 text-teal-700" />
              <div>
                <p className="text-sm font-semibold text-teal-900">Direct Web Bluetooth Enabled</p>
                <p className="mt-1 text-xs leading-5 text-teal-800">
                  Data is streamed directly from your ESP32 over Web Bluetooth notifications.
                  Make sure your ESP32 is powered on and advertising.
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
              Real-time events and Bluetooth handshake messages.
            </p>
          </div>
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
          {isConnected ? 'ESP32 Connected via BLE' : 'Ready to pair'}
        </span>
      </footer>
    </div>
  );
}
