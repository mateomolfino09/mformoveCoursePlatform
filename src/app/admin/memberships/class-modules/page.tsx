'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ClassModule } from '../../../../typings';
import { ArrowLeftIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function ClassModulesAdminPage() {
  const router = useRouter();
  const auth = useAuth();
  const [modules, setModules] = useState<ClassModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies = Cookies.get('userToken');
    if (!cookies) {
      router.push('/login');
      return;
    }
    if (!auth.user) auth.fetchUser();
    else if (auth.user.rol !== 'Admin') router.push('/login');
  }, [auth.user, router]);

  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await fetch('/api/class-modules?all=1', { credentials: 'include', cache: 'no-store' });
        const data = await res.json();
        setModules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchModules();
  }, []);

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/admin/memberships"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver al Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat">Módulos de clase</h1>
          <Link
            href="/admin/memberships/class-modules/create"
            className="inline-flex items-center gap-2 bg-[#4F7CCF] text-white px-4 py-2 rounded-lg hover:bg-[#234C8C] font-montserrat"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo módulo
          </Link>
        </div>
        <p className="text-gray-600 mb-6 font-montserrat">
          Los módulos son el filtro principal de la biblioteca (ej. Movimiento, Movilidad, Handbalance). Ordenables para rutas de progresión.
        </p>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F7CCF]" />
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-600 font-montserrat">
            No hay módulos. Creá el primero para usarlo como filtro principal en la biblioteca.
          </div>
        ) : (
          <ul className="space-y-4">
            {modules.map((m) => (
              <li
                key={m._id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-900 font-montserrat">{m.name}</p>
                  <p className="text-sm text-gray-500 font-montserrat">slug: {m.slug}</p>
                  {m.shortDescription && (
                    <p className="text-sm text-gray-600 mt-1 font-montserrat">{m.shortDescription}</p>
                  )}
                </div>
                <Link
                  href={`/admin/memberships/class-modules/${m._id}/edit`}
                  className="inline-flex items-center gap-1 text-[#4F7CCF] hover:underline font-montserrat"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdmimDashboardLayout>
  );
}
