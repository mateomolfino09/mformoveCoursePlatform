'use client';

import AdmimDashboardLayout from '../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../components/admin';
import { adminHomeDirectory } from '../../components/admin/adminNav';
import { User } from '../../../typings';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { GLOBAL_SITE_DESCRIPTION } from '../../lib/siteMetadata';
import { routes } from '../../constants/routes';

interface Props {
  user: User;
}

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
  }, [auth, router]);

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Admin</title>
        <meta name="description" content={GLOBAL_SITE_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage>
        <AdminPageHeader
          title="Overview"
          description="Gestioná usuarios, contenido y accesos de la plataforma."
        />
        <AdminNavGrid
          columns={2}
          items={adminHomeDirectory.map((item) => ({
            href: item.href,
            title: item.label,
            description: item.description,
            icon: item.icon,
          }))}
        />
        <div className="mt-8 border-t border-[var(--admin-border)] pt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-subtle)]">
            Sitio
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--admin-muted)]">
            <Link href={routes.navegation.membership.weeklyPath} className="hover:text-[var(--admin-fg)]">
              Camino
            </Link>
            <Link href={routes.navegation.membership.library} className="hover:text-[var(--admin-fg)]">
              Biblioteca
            </Link>
            <Link href={routes.navegation.eventos} className="hover:text-[var(--admin-fg)]">
              Eventos
            </Link>
            <Link href={routes.navegation.products} className="hover:text-[var(--admin-fg)]">
              Cursos
            </Link>
          </div>
        </div>
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
