import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';

// Chrome/Edge/Android fire this when the app is installable. Not part of lib.dom.d.ts.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const UPDATE_CHECK_MS = 60 * 60 * 1000; // look for a new version once an hour

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => {
        if (navigator.onLine) registration.update().catch(() => {});
      }, UPDATE_CHECK_MS);
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
    },
  });

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep the event so we can show our own button
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null); // the event can only be used once
  };

  const showInstall = installEvent !== null && !installDismissed && !isStandalone();

  if (online && !needRefresh && !showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2" role="status" aria-live="polite">
      {!online && (
        <div className="flex items-start gap-2 rounded-md border border-line bg-white p-3 text-sm shadow-lg">
          <WifiOff size={16} className="mt-0.5 shrink-0 text-warn" />
          <p>
            <span className="font-medium">You are offline.</span> The app is running from its saved
            copy. Bluetooth sensor data does not need the internet.
          </p>
        </div>
      )}

      {needRefresh && (
        <div className="flex items-start gap-2 rounded-md border border-line bg-white p-3 text-sm shadow-lg">
          <RefreshCw size={16} className="mt-0.5 shrink-0 text-signal" />
          <div className="flex-1">
            <p className="font-medium">A new version is available.</p>
            <p className="text-muted">Reloading will disconnect an active sensor session.</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateServiceWorker(true)}
                className="rounded-md bg-ink px-3 py-1 text-white"
              >
                Reload
              </button>
              <button onClick={() => setNeedRefresh(false)} className="rounded-md px-3 py-1 text-muted hover:bg-paper">
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstall && (
        <div className="flex items-start gap-2 rounded-md border border-line bg-white p-3 text-sm shadow-lg">
          <Download size={16} className="mt-0.5 shrink-0 text-signal" />
          <div className="flex-1">
            <p className="font-medium">Install KneeGait-Edge</p>
            <p className="text-muted">Add it to your device for quick, full-screen access.</p>
            <button onClick={install} className="mt-2 rounded-md bg-ink px-3 py-1 text-white">
              Install
            </button>
          </div>
          <button aria-label="Dismiss" onClick={() => setInstallDismissed(true)} className="text-muted hover:text-ink">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
