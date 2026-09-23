'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';
import { PlusCircleIcon, BookOpenIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
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
    } else if (auth.user.rol != 'Admin') router.push('/iniciar-sesion');
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Clases</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage>
        <AdminPageHeader
          title="Clases"
          description="Clases virtuales grabadas."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/clases/crear-clase', title: 'Crear clase', icon: PlusCircleIcon },
            { href: '/admin/clases/crear-tipo-clase', title: 'Crear filtro', icon: AdjustmentsHorizontalIcon },
            { href: '/admin/clases/todas-las-clases', title: 'Ver todas', icon: BookOpenIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
