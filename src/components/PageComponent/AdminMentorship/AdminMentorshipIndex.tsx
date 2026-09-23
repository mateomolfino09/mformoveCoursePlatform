'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';
import { PlusCircleIcon, TableCellsIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import LinkInBioMentoriaSettings from './LinkInBioMentoriaSettings';
import { GLOBAL_SITE_DESCRIPTION } from '../../../lib/siteMetadata';

const AdminMentorshipIndex = () => {
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
        <title>Admin Mentoría</title>
        <meta name="description" content={GLOBAL_SITE_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage>
        <AdminPageHeader
          title="Mentoría"
          description="Planes, solicitudes y analítica."
        />
        <AdminNavGrid
          columns={2}
          items={[
            { href: '/admin/mentorias/crear-plan', title: 'Crear plan', description: 'Nuevo plan de mentoría', icon: PlusCircleIcon },
            { href: '/admin/mentorias/planes', title: 'Planes', description: 'Listado y edición', icon: TableCellsIcon },
            { href: '/admin/mentorias/analitica', title: 'Analytics', description: 'Métricas de mentoría', icon: ClipboardDocumentListIcon },
            { href: '/admin/mentorias/solicitudes', title: 'Solicitudes', description: 'Pedidos de mentoría', icon: ClipboardDocumentListIcon },
          ]}
        />
        <div className="mt-8">
          <LinkInBioMentoriaSettings />
        </div>
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default AdminMentorshipIndex;
