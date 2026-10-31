import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bluetooth,
  Download,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BleProvider } from './context/BleContext';
import Analytics from './pages/Analytics';
import ClinicianReport from './pages/ClinicianReport';
import ConnectModal from './pages/ConnectModal';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/connect', label: 'Connect', icon: Bluetooth },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/report', label: 'Report', icon: FileText },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function App() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <BleProvider>
      <div className="min-h-screen lg:flex">
        <nav className="flex flex-col justify-between border-b border-line bg-white p-3 lg:w-56 lg:border-b-0 lg:border-r lg:p-4">
          <div className="space-y-1">
            <div className="mb-0 hidden px-3 py-2 lg:mb-4 lg:block">
              <p className="text-lg font-bold text-ink">KneeGait-Edge</p>
              <p className="text-xs text-muted">Clinical Companion</p>
            </div>

            <div className="flex items-center justify-between gap-1 overflow-x-auto lg:flex-col lg:items-stretch lg:overflow-visible">
              <div className="flex gap-1 lg:flex-col">
                {NAV.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-ink text-white shadow-sm'
                          : 'text-muted hover:bg-paper hover:text-ink'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </div>

              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 lg:hidden"
                  title="Install Progressive Web App"
                >
                  <Download size={14} />
                  Install App
                </button>
              )}
            </div>
          </div>

          {/* Desktop PWA Install Button */}
          {!isInstalled && (
            <div className="mt-4 hidden border-t border-line pt-3 lg:block">
              <button
                onClick={handleInstallClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 border border-teal-200 shadow-sm"
              >
                <Download size={15} />
                Install App (PWA)
              </button>
            </div>
          )}
        </nav>

        <main className="flex-1 p-5 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/connect" element={<ConnectModal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/report" element={<ClinicianReport />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BleProvider>
  );
}
