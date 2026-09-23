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
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/login');
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
            { href: '/admin/classes/createClass', title: 'Crear clase', icon: PlusCircleIcon },
            { href: '/admin/classes/createClassType', title: 'Crear filtro', icon: AdjustmentsHorizontalIcon },
            { href: '/admin/classes/allClasses', title: 'Ver todas', icon: BookOpenIcon },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
