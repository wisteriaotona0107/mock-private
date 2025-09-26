'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import clsx from 'clsx';

interface Toast {
  id: number;
  message: string;
  tone?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  notify: (message: string, tone?: Toast['tone']) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, tone }]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 4000);
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'rounded-lg px-4 py-3 text-sm shadow-lg backdrop-blur-lg border border-white/10',
              toast.tone === 'success' && 'bg-emerald-500/20 text-emerald-200',
              toast.tone === 'error' && 'bg-red-500/20 text-red-200',
              toast.tone === 'info' && 'bg-slate-700/80 text-gray-100'
            )}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('Toast context not available');
  return ctx;
}
