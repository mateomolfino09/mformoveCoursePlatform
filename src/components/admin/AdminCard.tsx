import type { ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md';
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
};

export function AdminCard({ children, className, padding = 'md' }: Props) {
  return (
    <div
      className={cn(
        'rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
