'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNav } from './admin/adminNav';
import { cn } from './admin/cn';
import { routes } from '../constants/routes';

type Props = {
  showNav: boolean;
  isMobile: boolean;
  onNavigate?: () => void;
};

const AdminDashboardSideBar = ({ showNav, onNavigate }: Props) => {
  const pathname = usePathname() || '';

  return (
    <aside
      className={cn(
        'fixed left-0 z-30 flex w-[var(--admin-sidebar)] flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)] transition-transform duration-[var(--admin-ease)]',
        'top-[var(--admin-topbar)] h-[calc(100vh-var(--admin-topbar))]',
        showNav ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {adminNav.map((group) => (
          <div key={group.id} className="mb-4">
            <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-subtle)]">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2 rounded-[var(--admin-radius)] px-2 py-1.5 text-[13px] transition-colors duration-[var(--admin-ease)]',
                        active
                          ? 'bg-[var(--admin-selected)] font-medium text-[var(--admin-fg)]'
                          : 'text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--admin-border)] px-3 py-3">
        <Link
          href={routes.navegation.membership.library}
          onClick={onNavigate}
          className="flex items-center rounded-[var(--admin-radius)] px-2 py-1.5 text-[12px] text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
        >
          Ver sitio
        </Link>
      </div>
    </aside>
  );
};

export default AdminDashboardSideBar;
