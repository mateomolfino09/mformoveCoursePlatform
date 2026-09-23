'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';
import { PlusCircleIcon, TableCellsIcon, GiftIcon, AdjustmentsHorizontalIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next13-progressbar';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const Index = () => {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/iniciar-sesion');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/iniciar-sesion');
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <AdminPage>
        <AdminPageHeader
          title="Productos"
          description="Cursos, eventos, filtros, clases gratuitas y asignación de accesos."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/productos/crear-producto', title: 'Crear producto', description: 'Curso, evento u otro producto', icon: PlusCircleIcon },
            { href: '/admin/productos/crear-filtros', title: 'Crear filtro', description: 'Filtros de catálogo', icon: AdjustmentsHorizontalIcon },
            { href: '/admin/productos/todos-productos', title: 'Productos', description: 'Listado completo', icon: TableCellsIcon },
            { href: '/admin/productos/clases-gratis', title: 'Clases gratuitas', description: 'Secuencias evergreen', icon: GiftIcon },
            { href: '/admin/accesos', title: 'Asignar acceso', description: 'Otorgar un curso o producto a un email', icon: LockClosedIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
