'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { PlusCircleIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../../components/admin';
import { useAuth } from '../../../../hooks/useAuth';

export default function Page() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    const cookie = Cookies.get('userToken');
    if (!cookie) {
      router.push('/iniciar-sesion');
      return;
    }
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol !== 'Admin') {
      router.push('/iniciar-sesion');
    }
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <AdminPage>
        <AdminPageHeader
          title="Clases gratuitas"
          description="Productos evergreen de clases gratuitas secuenciales — sin fechas, desbloqueo por consumo del usuario."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/productos/clases-gratis/crear', title: 'Crear producto', icon: PlusCircleIcon },
            { href: '/admin/productos/clases-gratis/todas', title: 'Ver listado', icon: TableCellsIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
}
