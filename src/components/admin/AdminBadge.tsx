import type { ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'default' | 'success' | 'warning' | 'destructive';

const styles: Record<Variant, string> = {
  default: 'bg-[var(--admin-hover)] text-[var(--admin-muted)]',
  success: 'bg-[var(--admin-success-bg)] text-[var(--admin-success)]',
  warning: 'bg-[var(--admin-warning-bg)] text-[var(--admin-warning)]',
  destructive: 'bg-[var(--admin-destructive-bg)] text-[var(--admin-destructive)]',
};

export function AdminBadge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
