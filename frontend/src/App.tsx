import { Activity, BarChart3, Bluetooth, FileText, Settings as SettingsIcon } from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';
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
  return (
    <div className="min-h-screen lg:flex">
      <nav className="flex gap-1 border-b border-line bg-white p-3 lg:w-56 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
        <p className="mb-0 hidden px-3 py-2 text-lg font-semibold lg:mb-4 lg:block">KneeGait-Edge</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
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
  );
}
