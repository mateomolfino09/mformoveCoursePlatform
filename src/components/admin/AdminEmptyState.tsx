import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminEmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-start rounded-[var(--admin-radius)] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-8">
      <p className="text-[13px] font-medium text-[var(--admin-fg)]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-[12px] text-[var(--admin-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
