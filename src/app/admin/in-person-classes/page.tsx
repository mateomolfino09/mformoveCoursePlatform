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
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') {
      router.push('/login');
    }
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Horarios</title>
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
            { href: '/admin/in-person-classes/create', title: 'Crear clase', icon: PlusCircleIcon },
            { href: '/admin/in-person-classes/all', title: 'Ver todas', icon: TableCellsIcon },
            { href: '/classes-schedule', title: 'Vista pública', icon: CalendarDaysIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
