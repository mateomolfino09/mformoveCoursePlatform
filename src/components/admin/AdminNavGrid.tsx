import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import { cn } from './cn';

export type AdminNavCardItem = {
  href: string;
  title: string;
  description?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
  disabled?: boolean;
};

type Props = {
  items: AdminNavCardItem[];
  columns?: 1 | 2 | 3;
  className?: string;
};

export function AdminNavGrid({ items, columns = 2, className }: Props) {
  const cols =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={cn('grid gap-2', cols, className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const inner = (
          <div
            className={cn(
              'flex items-start gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3.5 py-3 transition-colors duration-[var(--admin-ease)]',
              item.disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-[var(--admin-hover)]'
            )}
          >
            {Icon ? (
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-muted)]" aria-hidden />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-medium text-[var(--admin-fg)]">{item.title}</p>
                {item.badge ? (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--admin-muted)] bg-[var(--admin-hover)]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-0.5 text-[12px] leading-snug text-[var(--admin-muted)]">{item.description}</p>
              ) : null}
            </div>
          </div>
        );

        if (item.disabled) {
          return (
            <div key={item.title} aria-disabled>
              {inner}
            </div>
          );
        }

        return (
          <Link key={item.href + item.title} href={item.href}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
