import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { cn } from './cn';
import type { AdminTheme } from './useAdminTheme';

type Props = {
  theme: AdminTheme;
  onChange: (theme: AdminTheme) => void;
};

export function AdminThemeToggle({ theme, onChange }: Props) {
  return (
    <div
      className="flex items-center rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-0.5"
      role="group"
      aria-label="Tema"
    >
      <button
        type="button"
        aria-pressed={theme === 'light'}
        aria-label="Tema claro"
        onClick={() => onChange('light')}
        className={cn(
          'inline-flex h-6 items-center gap-1 rounded-[calc(var(--admin-radius)-2px)] px-1.5 text-[11px] font-medium transition-colors duration-[var(--admin-ease)]',
          theme === 'light'
            ? 'bg-[var(--admin-accent)] text-[var(--admin-accent-fg)]'
            : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
        )}
      >
        <SunIcon className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Claro</span>
      </button>
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        aria-label="Tema oscuro"
        onClick={() => onChange('dark')}
        className={cn(
          'inline-flex h-6 items-center gap-1 rounded-[calc(var(--admin-radius)-2px)] px-1.5 text-[11px] font-medium transition-colors duration-[var(--admin-ease)]',
          theme === 'dark'
            ? 'bg-[var(--admin-accent)] text-[var(--admin-accent-fg)]'
            : 'text-[var(--admin-muted)] hover:text-[var(--admin-fg)]'
        )}
      >
        <MoonIcon className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Oscuro</span>
      </button>
    </div>
  );
}
