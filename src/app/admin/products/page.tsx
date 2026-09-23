'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';
import { PlusCircleIcon, TableCellsIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
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
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/login');
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <AdminPage>
        <AdminPageHeader
          title="Productos"
          description="Cursos, eventos y filtros."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/products/createProduct', title: 'Crear producto', icon: PlusCircleIcon },
            { href: '/admin/products/createFilters', title: 'Crear filtro', icon: AdjustmentsHorizontalIcon },
            { href: '/admin/products/allProducts', title: 'Productos', icon: TableCellsIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
