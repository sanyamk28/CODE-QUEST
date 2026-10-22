import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Manage Service Worker lifecycle
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In dev mode, unregister any active service worker and clear stale caches to ensure instant live updates
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  } else {
    // In production, register PWA service worker with auto-update
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update();
        })
        .catch(() => {
          // Fallback silently
        });
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
