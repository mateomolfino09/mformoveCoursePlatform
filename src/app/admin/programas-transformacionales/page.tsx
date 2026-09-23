'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import {
  AdminPage,
  AdminPageHeader,
  AdminNavGrid,
  AdminEmptyState,
  AdminBadge,
  AdminButton,
} from '../../../components/admin';
import { PlusCircleIcon, CogIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next13-progressbar';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const Index = () => {
  const router = useRouter();
  const auth = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/iniciar-sesion');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/iniciar-sesion');

    fetchTransformationalPrograms();
  }, [auth.user]);

  const fetchTransformationalPrograms = async () => {
    try {
      const response = await fetch('/api/product/getTransformationalPrograms');
      const data = await response.json();
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Error cargando programas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cohortBadge = (estado?: string) => {
    if (estado === 'abierta') return <AdminBadge variant="success">Abierta</AdminBadge>;
    if (estado === 'en_curso') return <AdminBadge>En curso</AdminBadge>;
    return <AdminBadge>{estado || 'N/A'}</AdminBadge>;
  };

  return (
    <AdmimDashboardLayout>
      <AdminPage wide>
        <AdminPageHeader
          title="Programas transformacionales"
          description="Cohortes de 8 semanas con contenido automático."
        />
        <AdminNavGrid
          columns={2}
          items={[
            {
              href: '/admin/productos/crear-producto',
              title: 'Crear programa',
              description: 'Programa de 8 semanas con automatización',
              icon: PlusCircleIcon,
            },
            {
              href: '/admin/programas-transformacionales/analitica',
              title: 'Analytics',
              description: 'Métricas y progreso de participantes',
              icon: CogIcon,
            },
            {
              href: '/admin/programas-transformacionales/participantes',
              title: 'Participantes',
              description: 'Inscripciones y progreso',
              icon: UsersIcon,
            },
            {
              href: '/admin/programas-transformacionales/automatizacion',
              title: 'Automatización',
              description: 'Emails y contenido automático',
              icon: SparklesIcon,
            },
          ]}
        />

        <section className="mt-8">
          <h2 className="mb-3 text-[13px] font-medium text-[var(--admin-fg)]">Programas activos</h2>
          {loading ? (
            <div className="space-y-2">
              <div className="h-16 animate-pulse rounded border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
              <div className="h-16 animate-pulse rounded border border-[var(--admin-border)] bg-[var(--admin-surface)]" />
            </div>
          ) : programs.length === 0 ? (
            <AdminEmptyState
              title="No hay programas creados"
              description="Creá el primero para comenzar una cohorte."
            />
          ) : (
            <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
              {programs.map((program: any) => (
                <div
                  key={program._id}
                  className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[13px] font-medium">{program.nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--admin-muted)]">
                      {cohortBadge(program.programaTransformacional?.estadoCohorte)}
                      <span>
                        Cupo: {program.programaTransformacional?.cupoDisponible || 0} disponibles
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/programas-transformacionales/ver/${program._id}`}>
                    <AdminButton size="sm">Ver / Editar</AdminButton>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Index;
