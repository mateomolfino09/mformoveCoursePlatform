'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ClassModule, ModuleClass } from '../../../../../typings';
import { ArrowLeftIcon, PlusIcon, VideoCameraIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { NO_SUBMODULE_SLUG } from '../../../../constants/moduleClassConstants';

type ModuleWithClasses = ClassModule & { moduleClasses?: ModuleClass[] };

export default function ClassModulesAdminPage() {
  const router = useRouter();
  const auth = useAuth();
  const [modules, setModules] = useState<ModuleWithClasses[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/class-modules?all=1', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then(async (list: ClassModule[]) => {
        const withClasses: ModuleWithClasses[] = await Promise.all(
          list.map(async (m) => {
            const res = await fetch(`/api/module-classes?moduleId=${encodeURIComponent(m._id)}`, { credentials: 'include', cache: 'no-store' });
            const moduleClasses = res.ok ? await res.json() : [];
            return { ...m, moduleClasses: Array.isArray(moduleClasses) ? moduleClasses : [] };
          })
        );
        setModules(withClasses);
      })
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!Cookies.get('userToken')) router.push('/login');
    if (auth.user && auth.user.rol !== 'Admin') router.push('/login');
  }, [auth.user, router]);

  useEffect(() => { load(); }, []);

  const deleteModule = async (moduleId: string, name: string) => {
    if (!confirm(`¿Eliminar el módulo "${name}" y todos sus submódulos y clases de módulo?`)) return;
    try {
      const res = await fetch(`/api/class-modules/${moduleId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Módulo eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    }
  };

  const deleteSubmodule = async (moduleId: string, slug: string, name: string) => {
    if (!confirm(`¿Eliminar el submódulo "${name}" y todas sus clases de módulo?`)) return;
    try {
      const res = await fetch(`/api/class-modules/${moduleId}/submodules/${encodeURIComponent(slug)}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Submódulo eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    }
  };

  const deleteModuleClass = async (classId: string) => {
    if (!confirm('¿Eliminar esta clase de módulo?')) return;
    try {
      const res = await fetch(`/api/module-classes/${classId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Error');
      toast.success('Clase eliminada');
      load();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const slugFor = (s: { name?: string; slug?: string }) =>
    (s.slug || (s.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).toString();

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin/memberships" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver al Dashboard
        </Link>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-montserrat">Módulos de clase</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/memberships/class-modules/create"
              className="inline-flex items-center gap-2 bg-[#4F7CCF] text-white px-4 py-2 rounded-lg hover:bg-[#234C8C] font-montserrat"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo módulo
            </Link>
            <Link
              href="/admin/memberships/submodules/create-class"
              className="inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-montserrat"
            >
              <VideoCameraIcon className="w-5 h-5" />
              Crear clase de módulo
            </Link>
            <Link
              href="/admin/memberships/submodules/create"
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-montserrat"
            >
              <PlusIcon className="w-5 h-5" />
              Crear submódulo
            </Link>
          </div>
        </div>
        <p className="text-gray-600 mb-6 font-montserrat">
          Módulos, submódulos y clases de módulo. Podés editar, eliminar y crear desde aquí.
        </p>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F7CCF]" />
          </div>
        ) : modules.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-600 font-montserrat">
            No hay módulos. Creá el primero con &quot;Nuevo módulo&quot;.
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((m) => {
              const submodules = (m.submodules || []) as { name?: string; slug?: string }[];
              const classesBySub = (m.moduleClasses || []).reduce<Record<string, ModuleClass[]>>((acc, c) => {
                const slug = (c.submoduleSlug || '').toLowerCase();
                if (!acc[slug]) acc[slug] = [];
                acc[slug].push(c);
                return acc;
              }, {});
              return (
                <div key={m._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 font-montserrat">{m.name}</h2>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/memberships/class-modules/${m._id}/edit`}
                        className="inline-flex items-center gap-1 text-[#4F7CCF] hover:underline font-montserrat text-sm"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteModule(m._id, m.name)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-montserrat text-sm"
                        title="Eliminar módulo"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {submodules.length === 0 ? (
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                          <span className="font-medium text-gray-800 font-montserrat">Clases del módulo</span>
                          <Link
                            href={`/admin/memberships/submodules/${m._id}/${encodeURIComponent(NO_SUBMODULE_SLUG)}`}
                            className="inline-flex items-center gap-1 text-[#4F7CCF] hover:underline font-montserrat text-sm"
                          >
                            <VideoCameraIcon className="w-4 h-4" />
                            Gestionar
                          </Link>
                        </div>
                        {(classesBySub[NO_SUBMODULE_SLUG] || []).length > 0 ? (
                          <ul className="px-4 py-2 space-y-1">
                            {(classesBySub[NO_SUBMODULE_SLUG] || []).map((c) => (
                              <li key={c._id} className="flex items-center justify-between text-sm text-gray-700 font-montserrat">
                                <span>{c.name} <span className="text-gray-500">(nivel {c.level})</span></span>
                                <button type="button" onClick={() => deleteModuleClass(c._id)} className="text-red-500 hover:text-red-700" title="Eliminar clase">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 font-montserrat text-sm px-4 py-2">Sin clases. Agregá desde Editar o Gestionar.</p>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {submodules.map((s, idx) => {
                          const slug = slugFor(s);
                          const classes = classesBySub[slug.toLowerCase()] || [];
                          return (
                            <li key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                                <span className="font-medium text-gray-800 font-montserrat">{s.name || s.slug || '—'}</span>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/memberships/submodules/${m._id}/${encodeURIComponent(slug)}`}
                                    className="inline-flex items-center gap-1 text-[#4F7CCF] hover:underline font-montserrat text-sm"
                                  >
                                    <VideoCameraIcon className="w-4 h-4" />
                                    Gestionar
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => deleteSubmodule(m._id, slug, s.name || s.slug || '')}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Eliminar submódulo"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {classes.length > 0 && (
                                <ul className="px-4 py-2 space-y-1">
                                  {classes.map((c) => (
                                    <li key={c._id} className="flex items-center justify-between text-sm text-gray-700 font-montserrat">
                                      <span>{c.name} <span className="text-gray-500">(nivel {c.level})</span></span>
                                      <button
                                        type="button"
                                        onClick={() => deleteModuleClass(c._id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Eliminar clase"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdmimDashboardLayout>
  );
}
