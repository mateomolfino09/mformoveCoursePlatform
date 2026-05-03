'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
  success: 'border-palette-sage/50',
  error: 'border-soft-error/50',
  info: 'border-palette-stone/40',
  warning: 'border-[#FAF8F4]',
};

const typeIconBg: Record<ToastType, string> = {
  success: 'bg-palette-sage/25 text-palette-cream',
  error: 'bg-soft-error/25 text-palette-cream',
  info: 'bg-white/15 text-palette-cream',
  warning: 'bg-palette-sage/30 text-palette-cream',
};

const typeAccent: Record<ToastType, string> = {
  success: 'from-palette-sage/90 to-palette-sage/40',
  error: 'from-soft-error/90 to-soft-error/40',
  info: 'from-palette-stone/80 to-palette-stone/35',
  warning: 'from-palette-sage/85 to-palette-sage/40',
};

const typeLabel: Record<ToastType, string> = {
  success: 'Listo',
  error: 'Algo falló',
  info: 'Sistema',
  warning: 'Atención',
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
    <div className="relative">
      <div
        role="alert"
        className={[
          'relative overflow-visible',
          'rounded-2xl border bg-palette-ink/95 backdrop-blur-md',
          'px-4 py-3.5 font-montserrat',
          'shadow-[0_22px_70px_rgba(20,20,17,0.35)]',
          'text-palette-cream',
          'transition-transform duration-200 will-change-transform',
          typeStyles[type],
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none absolute left-4 top-0 z-[60]',
            '-translate-y-1/2',
            'flex h-9 w-9 items-center justify-center rounded-full',
            'text-[12px] font-semibold',
            'ring-1 ring-white/20 shadow-[0_10px_30px_rgba(20,20,17,0.35)]',
            typeIconBg[type],
          ].join(' ')}
          aria-hidden="true"
        >
          {typeIcon[type]}
        </span>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent opacity-80" />
          <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${typeAccent[type]}`} />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-palette-sage/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-start gap-3 pt-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-palette-cream/60">{typeLabel[type]}</p>
            <p className="mt-1 min-w-0 text-palette-cream/95 text-sm leading-snug">{message}</p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(id)}
            className="flex-none rounded-full p-1 text-palette-cream/50 hover:bg-white/10 hover:text-palette-cream transition text-lg leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

/** Vista de notificaciones (solo toasts disparados por la app) */

export function ToastViewport() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, removeToast } = ctx;

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[9999] left-4 pointer-events-none sm:left-6"
      style={{ isolation: 'isolate', top: 'max(1rem, env(safe-area-inset-top))' }}
      aria-live="polite"
    >
      <div className="pointer-events-auto flex flex-col gap-2 w-[min(420px,calc(100vw-2rem))]">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -12, scale: 0.98, filter: 'blur(2px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -12, scale: 0.98, filter: 'blur(2px)' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <ToastItemComponent {...t} onRemove={removeToast} />
            </motion.div>
          ))}
        </AnimatePresence>
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
