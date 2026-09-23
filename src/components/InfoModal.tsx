'use client';

import { useEffect } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        className={`relative ${maxWidth} w-full max-h-[90vh] overflow-hidden rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-float)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="info-modal-title"
              className="text-[15px] font-medium tracking-tight text-[var(--admin-fg)]"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-[13px] text-[var(--admin-muted)]">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--admin-radius)] p-1 text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
            aria-label="Cerrar diálogo"
          >
            <span className="block text-[18px] leading-none">×</span>
          </button>
        </div>

        <div className="admin-info-modal max-h-[calc(90vh-4.5rem)] overflow-y-auto px-5 py-4 text-[var(--admin-fg)]">
          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
