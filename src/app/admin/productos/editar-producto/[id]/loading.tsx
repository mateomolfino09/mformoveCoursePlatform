import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { AdminSkeleton } from '../../../../../components/admin/AdminSkeleton';

export default function Loading() {
  return (
    <AdmimDashboardLayout>
      <div className="w-full py-6" aria-busy="true" aria-label="Cargando producto">
        <AdminSkeleton className="h-5 w-48" />
        <AdminSkeleton className="mt-2 h-3 w-72" />
        <div className="mt-8 space-y-4 rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
          <AdminSkeleton className="h-4 w-40" />
          <AdminSkeleton className="h-10 w-full" />
          <AdminSkeleton className="h-24 w-full" />
          <AdminSkeleton className="h-10 w-full" />
          <AdminSkeleton className="h-10 w-2/3" />
        </div>
      </div>
    </AdmimDashboardLayout>
  );
}
