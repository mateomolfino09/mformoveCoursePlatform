import Link from 'next/link';
import { cn } from './cn';

type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function AdminLogo({ href = '/admin', onClick, className }: Props) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex h-[var(--admin-topbar)] shrink-0 items-center pr-2 font-montserrat text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-fg)] hover:opacity-80',
        className
      )}
      aria-label="MMOVE Admin"
    >
      MMOVE
    </Link>
  );
}
