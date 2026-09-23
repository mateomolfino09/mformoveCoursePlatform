'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';
import { PlusCircleIcon, TableCellsIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';

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
    } else if (auth.user.rol != 'Admin') {
      router.push('/iniciar-sesion');
    }
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Horarios</title>
        <meta name="description" content="Administración de Horarios" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage>
        <AdminPageHeader
          title="Horarios"
          description="Clases presenciales y virtuales."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/clases-presenciales/crear', title: 'Crear clase', description: 'Nueva clase en el calendario', icon: PlusCircleIcon },
            { href: '/admin/clases-presenciales/todas', title: 'Ver todas', description: 'Listado de horarios', icon: TableCellsIcon },
            { href: '/horario-clases', title: 'Vista pública', description: 'Calendario visible en el sitio', icon: CalendarDaysIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
