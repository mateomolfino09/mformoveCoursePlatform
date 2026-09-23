import type { ReactNode } from 'react';
import { cn } from './cn';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({ title, description, actions, className }: Props) {
  return (
    <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-[20px] font-medium tracking-tight text-[var(--admin-fg)]">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] text-[var(--admin-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
