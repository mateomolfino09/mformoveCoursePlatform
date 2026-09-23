import { cn } from './cn';

export function AdminSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--admin-radius)] bg-[var(--admin-hover)]', className)}
      aria-hidden
    />
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="py-6" aria-busy="true" aria-label="Cargando">
      <AdminSkeleton className="h-4 w-40" />
      <AdminSkeleton className="mt-2 h-3 w-64" />
      <AdminSkeleton className="mt-6 h-24 w-full border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
    </div>
  );
}
