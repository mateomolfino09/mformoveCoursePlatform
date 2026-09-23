'use client';

import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid, AdminPageSkeleton } from '../../../../components/admin';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { PlusCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const BitacoraAdminPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/login');
      return;
    }

    if (!auth.user) {
      auth.fetchUser();
      return;
    }

    if (auth.user.rol !== 'Admin') {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [auth.user, router]);

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <AdminPageSkeleton />
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Caminos semanales</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage>
        <Link
          href="/admin/memberships"
          className="mb-4 inline-block text-[12px] text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
        >
          ← Membresías
        </Link>
        <AdminPageHeader
          title="Caminos semanales"
          description="Caminos mensuales del Camino."
        />
        <AdminNavGrid
          columns={2}
          items={[
            {
              href: '/admin/memberships/bitacora/create',
              title: 'Crear camino mensual',
              description: '4 semanas de contenido',
              icon: PlusCircleIcon,
            },
            {
              href: '/admin/memberships/bitacora/list',
              title: 'Ver caminos',
              description: 'Lista y edición',
              icon: BookOpenIcon,
            },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default BitacoraAdminPage;
