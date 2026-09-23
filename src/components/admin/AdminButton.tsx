import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    'admin-btn--primary bg-[var(--admin-accent)] text-[var(--admin-accent-fg)] hover:bg-[var(--admin-btn-primary-hover-bg)] hover:text-[var(--admin-btn-primary-hover-fg)] disabled:opacity-40',
  secondary:
    'admin-btn--secondary bg-[var(--admin-surface)] text-[var(--admin-fg)] border border-[var(--admin-border)] hover:bg-[var(--admin-btn-secondary-hover-bg)] hover:text-[var(--admin-btn-secondary-hover-fg)] disabled:opacity-40',
  ghost:
    'admin-btn--ghost bg-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-btn-secondary-hover-bg)] hover:text-[var(--admin-btn-secondary-hover-fg)] disabled:opacity-40',
  destructive:
    'admin-btn--destructive bg-[var(--admin-destructive)] text-white hover:opacity-90 disabled:opacity-40',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px]',
  md: 'h-8 px-3 text-[13px]',
};

export function AdminButton({
  variant = 'secondary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'admin-btn inline-flex items-center justify-center gap-1.5 rounded-[var(--admin-radius)] font-medium transition-colors duration-[var(--admin-ease)]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
