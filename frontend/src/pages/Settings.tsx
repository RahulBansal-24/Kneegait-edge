import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Bluetooth,
  Check,
  RotateCcw,
  Save,
  Settings2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react';

type AppSettings = {
  riskThreshold: number;
  sampleRate: number;
  filterWindow: number;
  soundAlerts: boolean;
  simulationEnabled: boolean;
  angleUnit: 'degrees' | 'radians';
  autoScroll: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  riskThreshold: 45,
  sampleRate: 50,
  filterWindow: 5,
  soundAlerts: false,
  simulationEnabled: true,
  angleUnit: 'degrees',
  autoScroll: true,
};

const STORAGE_KEY = 'kneegait-edge-settings';

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // Use defaults if saved settings cannot be read.
  }

  return { ...DEFAULT_SETTINGS };
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-line py-5 last:border-b-0 sm:flex-row sm:items-center">
      <div className="max-w-xl">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-muted">{description}</p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-teal-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
    } catch {
      window.alert('Unable to save settings in this browser.');
    }
  };

  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_SETTINGS),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <Settings2 size={15} />
            Configuration
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-muted">
            Configure the KneeGait-Edge demo and planned sensor parameters.
          </p>
        </div>

        <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          FRONTEND CONFIGURATION
        </span>
      </header>

      {/* Risk configuration */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-ink">Movement thresholds</h2>
            <p className="mt-1 text-sm text-muted">
              Configure the visual reference used by the interface.
            </p>
          </div>
        </div>

        <SettingRow
          title="Knee-flexion reference threshold"
          description="Illustrative angle threshold in degrees. This setting is saved locally; it is not yet connected to the Dashboard or sensor firmware."
        >
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={90}
              step={0.5}
              value={settings.riskThreshold}
              onChange={(event) =>
                updateSetting(
                  'riskThreshold',
                  Math.max(0, Math.min(90, Number(event.target.value))),
                )
              }
              className="w-24 rounded-lg border border-line px-3 py-2 text-right text-sm font-semibold text-ink outline-none focus:border-teal-600"
            />

            <span className="text-sm text-muted">°</span>
          </div>
        </SettingRow>

        <SettingRow
          title="Angle display unit"
          description="Choose how angle values should be represented in a future integrated interface."
        >
          <select
            value={settings.angleUnit}
            onChange={(event) =>
              updateSetting(
                'angleUnit',
                event.target.value as AppSettings['angleUnit'],
              )
            }
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal-600"
          >
            <option value="degrees">Degrees (°)</option>
            <option value="radians">Radians (rad)</option>
          </select>
        </SettingRow>
      </section>

      {/* Sensor configuration */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Activity size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-ink">Sensor configuration</h2>
            <p className="mt-1 text-sm text-muted">
              Planned settings for the dual-IMU wearable.
            </p>
          </div>
        </div>

        <SettingRow
          title="Target sampling rate"
          description="Intended IMU sampling frequency. Changing this value currently changes only the saved UI setting."
        >
          <select
            value={settings.sampleRate}
            onChange={(event) =>
              updateSetting('sampleRate', Number(event.target.value))
            }
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal-600"
          >
            <option value={25}>25 Hz</option>
            <option value={50}>50 Hz (planned default)</option>
            <option value={100}>100 Hz</option>
            <option value={200}>200 Hz</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Smoothing window"
          description="Illustrative number of samples for a future smoothing filter. The current simulator is not controlled by this setting."
        >
          <select
            value={settings.filterWindow}
            onChange={(event) =>
              updateSetting('filterWindow', Number(event.target.value))
            }
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal-600"
          >
            <option value={3}>3 samples</option>
            <option value={5}>5 samples</option>
            <option value={7}>7 samples</option>
            <option value={9}>9 samples</option>
          </select>
        </SettingRow>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Bluetooth size={19} className="mt-0.5 shrink-0 text-blue-700" />

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Hardware integration pending
              </p>
              <p className="mt-1 text-sm leading-5 text-blue-800">
                These values are stored in the browser. They do not configure
                an ESP32 or MPU-6050 until a hardware communication layer is
                implemented.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts and simulation */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Bell size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-ink">Alerts and simulation</h2>
            <p className="mt-1 text-sm text-muted">
              Control local demo preferences.
            </p>
          </div>
        </div>

        <SettingRow
          title="Sound alerts preference"
          description="Save whether sound alerts should be enabled when alert functionality is integrated."
        >
          <div className="flex items-center gap-3">
            {settings.soundAlerts ? (
              <Volume2 size={18} className="text-teal-700" />
            ) : (
              <VolumeX size={18} className="text-muted" />
            )}

            <Toggle
              checked={settings.soundAlerts}
              onChange={(value) => updateSetting('soundAlerts', value)}
              label="Sound alerts preference"
            />
          </div>
        </SettingRow>

        <SettingRow
          title="Simulation preference"
          description="Save whether the browser should use simulated gait data in a future integrated global simulation control."
        >
          <Toggle
            checked={settings.simulationEnabled}
            onChange={(value) => updateSetting('simulationEnabled', value)}
            label="Simulation preference"
          />
        </SettingRow>

        <SettingRow
          title="Auto-scroll preference"
          description="Save a preference for automatically following incoming readings in future live views."
        >
          <Toggle
            checked={settings.autoScroll}
            onChange={(value) => updateSetting('autoScroll', value)}
            label="Auto-scroll preference"
          />
        </SettingRow>
      </section>

      {/* Device status */}
      <section className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Wifi size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-ink">System status</h2>
            <p className="mt-1 text-sm text-muted">
              Current prototype configuration.
            </p>
          </div>
        </div>

        <div className="grid gap-3 pt-5 sm:grid-cols-2">
          <div className="rounded-lg border border-line p-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Bluetooth size={16} />
              Transport
            </div>
            <p className="mt-2 font-semibold text-ink">BLE · Planned</p>
            <p className="mt-1 text-xs text-muted">
              No real device connected to Settings.
            </p>
          </div>

          <div className="rounded-lg border border-line p-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Waves size={16} />
              Data source
            </div>
            <p className="mt-2 font-semibold text-ink">Browser simulation</p>
            <p className="mt-1 text-xs text-muted">
              No real sensor measurements received.
            </p>
          </div>

          <div className="rounded-lg border border-line p-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Zap size={16} />
              Target sampling rate
            </div>
            <p className="mt-2 font-semibold text-ink">
              {settings.sampleRate} Hz
            </p>
            <p className="mt-1 text-xs text-muted">
              Saved frontend preference.
            </p>
          </div>

          <div className="rounded-lg border border-line p-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <SlidersHorizontal size={16} />
              Reference threshold
            </div>
            <p className="mt-2 font-semibold text-ink">
              {settings.riskThreshold.toFixed(1)}°
            </p>
            <p className="mt-1 text-xs text-muted">
              Not a validated clinical threshold.
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-ink">Save your preferences</p>
          <p className="mt-1 text-sm text-muted">
            Settings are saved in this browser using local storage.
          </p>

          {saved && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <Check size={15} />
              Settings saved successfully.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
          >
            <RotateCcw size={16} />
            Reset defaults
          </button>

          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Save size={16} />
            Save settings
          </button>
        </div>
      </section>

      <footer className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        <strong>Prototype notice:</strong> Settings currently configure this
        frontend only. Sensor sampling, filtering, sound alerts, and global
        simulation behavior require integration with the relevant application
        components and ESP32 firmware.
      </footer>
    </div>
  );
}
