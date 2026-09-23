'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';
import {
  PlusCircleIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { BookOpenIcon, Squares2X2Icon, CalendarDaysIcon, TicketIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';

const AdminMembershipIndex = () => {
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
      <Head>
        <title>Membresías</title>
        <meta name="description" content="Gestiona tus planes y clases" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage>
        <AdminPageHeader
          title="Membresías"
          description="Planes, clases, caminos semanales y eventos en vivo."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/membresias/crear-plan', title: 'Crear plan', description: 'Nuevo plan de membresía', icon: PlusCircleIcon },
            { href: '/admin/membresias/planes', title: 'Planes', description: 'Listado y edición', icon: TableCellsIcon },
            { href: '/admin/membresias/promociones', title: 'Promociones', description: 'Descuentos y códigos', icon: TicketIcon },
            { href: '/admin/membresias/clases', title: 'Clases', description: 'Clases exclusivas para miembros', icon: BookOpenIcon },
            { href: '/admin/membresias/modulos-clase', title: 'Módulos de clase', description: 'Módulos, submódulos y clases', icon: Squares2X2Icon },
            { href: '/admin/membresias/bitacora', title: 'Caminos semanales', description: 'Weekly Path / bitácora mensual', icon: CalendarDaysIcon },
            { href: '/admin/membresias/eventos-membresia', title: 'Eventos Cuerpo Autónomo', description: 'Clases en vivo para el camino', icon: VideoCameraIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default AdminMembershipIndex;
