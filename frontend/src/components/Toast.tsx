import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastEventDetail {
  message: string;
  type?: ToastType;
}

export const showToast = (message: string, type: ToastType = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cq_toast', { detail: { message, type } }));
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  useEffect(() => {
    let nextId = 1;
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastEventDetail>;
      const id = nextId++;
      const newToast = {
        id,
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'success',
      };
      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener('cq_toast', handleToast);
    return () => window.removeEventListener('cq_toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-3 duration-200 ${
            t.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/40'
              : t.type === 'info'
              ? 'bg-sky-950/90 border-sky-500/50 text-sky-200 shadow-sky-950/40'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold leading-relaxed">
            {t.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : t.type === 'info' ? (
              <Info className="h-4 w-4 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
