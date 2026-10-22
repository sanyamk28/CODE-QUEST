/**
 * PWA Installation Manager
 * Handles desktop installation lifecycle, prompt triggering, and standalone detection.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Global listener for beforeinstallprompt
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((callback) => callback(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((callback) => callback(false));
  });
}

/**
 * Trigger native laptop installation prompt
 */
export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach((callback) => callback(false));
    return choice.outcome === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Subscribe to installability changes
 */
export function onInstallableChange(callback: (canInstall: boolean) => void): () => void {
  listeners.add(callback);
  // Initial check
  callback(deferredPrompt !== null);
  return () => {
    listeners.delete(callback);
  };
}
