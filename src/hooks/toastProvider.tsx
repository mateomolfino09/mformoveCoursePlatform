'use client';

import { ToastProvider } from '../contexts/ToastContext';

interface ToastProviderProps {
  children: React.ReactNode;
}

export default function ToasterProvider({ children }: ToastProviderProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
