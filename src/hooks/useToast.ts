'use client';

const TOAST_EVENT = 'mformove-toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

function dispatch(type: ToastType, message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { type, message } })
  );
}

/** API compatible con react-toastify: toast.success(), toast.error(), etc. */
export const toast = {
  success: (message: string) => dispatch('success', message),
  error: (message: string) => dispatch('error', message),
  info: (message: string) => dispatch('info', message),
  warning: (message: string) => dispatch('warning', message),
};

export { useToastContext } from '../contexts/ToastContext';
