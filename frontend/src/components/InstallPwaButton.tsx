import React, { useState, useEffect } from 'react';
import { Download, Laptop, CheckCircle2 } from 'lucide-react';
import { promptPwaInstall, onInstallableChange, isAppInstalled } from '../services/pwaInstaller';
import { showToast } from './Toast';

export const InstallPwaButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isAppInstalled());
    const unsubscribe = onInstallableChange((installable) => {
      setCanInstall(installable);
    });
    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    if (installed) {
      showToast('Code Quest is already installed and running as a standalone app.', 'info');
      return;
    }

    const accepted = await promptPwaInstall();
    if (accepted) {
      setInstalled(true);
      showToast('Code Quest successfully installed! Check your desktop and start menu.', 'success');
    } else {
      // If native deferredPrompt was not available, guide the user
      showToast('To install: click the Install icon (computer with down arrow) in your browser address bar.', 'info');
    }
  };

  if (installed) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 text-xs font-semibold ${className}`}>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Install Code Quest to your Laptop (Runs in its own window anytime)"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 border border-indigo-500/30 transition active:scale-95 animate-in fade-in duration-300 ${className}`}
    >
      <Laptop className="h-3.5 w-3.5 text-sky-200" />
      <span>Install App</span>
    </button>
  );
};
