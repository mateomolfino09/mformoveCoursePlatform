'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const TOAST_EVENT = 'mformove-toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 4500;

const typeStyles: Record<ToastType, string> = {
  success: 'bg-palette-cream border-l-4 border-l-palette-sage text-palette-ink shadow-[0_2px_12px_rgba(20,20,17,0.08)]',
  error: 'bg-palette-cream border-l-4 border-l-soft-error text-palette-ink shadow-[0_2px_12px_rgba(20,20,17,0.08)]',
  info: 'bg-palette-cream border-l-4 border-l-palette-stone text-palette-ink shadow-[0_2px_12px_rgba(20,20,17,0.08)]',
  warning: 'bg-palette-cream border-l-4 border-l-palette-sage text-palette-ink shadow-[0_2px_12px_rgba(20,20,17,0.08)]',
};

const typeIconBg: Record<ToastType, string> = {
  success: 'bg-palette-sage/15 text-palette-sage',
  error: 'bg-soft-error/15 text-soft-error',
  info: 'bg-palette-stone/20 text-palette-stone',
  warning: 'bg-palette-sage/25 text-palette-ink',
};

const typeIcon: Record<ToastType, string> = {
  success: '✓',
  error: '×',
  info: 'i',
  warning: '!',
};

function ToastItemComponent({ id, type, message, onRemove }: ToastItem & { onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), DURATION_MS);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-2.5 rounded-lg border border-palette-stone/20 px-3 py-2.5 font-montserrat text-sm sm:max-w-sm ${typeStyles[type]}`}
    >
      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${typeIconBg[type]}`}>
        {typeIcon[type]}
      </span>
      <p className="min-w-0 flex-1 text-palette-ink text-xs leading-snug sm:text-sm">{message}</p>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="flex-shrink-0 rounded p-0.5 text-palette-stone hover:bg-palette-stone/10 hover:text-palette-ink transition text-lg leading-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}

/** Demo fijo para ver el diseño del toast (borrar cuando ya no lo necesites) */


export function ToastViewport() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, removeToast } = ctx;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ isolation: 'isolate' }}
      aria-live="polite"
    >
      <div
        className="pointer-events-auto absolute left-0 px-12 right-4 top-4 flex w-full max-w-full flex-col gap-1.5 font-montserrat sm:left-auto sm:right-6 sm:w-auto sm:max-w-md"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        {toasts.map((t) => (
          <ToastItemComponent key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ type: ToastType; message: string }>;
      if (ev.detail?.type && ev.detail?.message) addToast(ev.detail.type, ev.detail.message);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [mounted, addToast]);

  const value: ToastContextValue = { toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        typeof document !== 'undefined' &&
        document.body &&
        createPortal(<ToastViewport />, document.body)}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
