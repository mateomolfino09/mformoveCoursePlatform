'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ClassModule } from '../../../../../../typings';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { MODULE_CLASS_MATERIALS } from '../../../../../constants/moduleClassMaterials';
import { NO_SUBMODULE_SLUG } from '../../../../../constants/moduleClassConstants';

export default function CreateModuleClassPage() {
  const router = useRouter();
  const auth = useAuth();
  const [modules, setModules] = useState<ClassModule[]>([]);
  const [moduleId, setModuleId] = useState('');
  const [submoduleSlug, setSubmoduleSlug] = useState('');
  const [name, setName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState(1);
  const [materials, setMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const toggleMaterial = (mat: string) => {
    setMaterials((prev) => (prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]));
  };

  useEffect(() => {
    if (!Cookies.get('userToken')) router.push('/login');
    if (auth.user && auth.user.rol !== 'Admin') router.push('/login');
  }, [auth.user, router]);

  useEffect(() => {
    fetch('/api/class-modules?all=1', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setModules(Array.isArray(data) ? data : []))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedModule = modules.find((m) => m._id === moduleId);
  const submodules = (selectedModule?.submodules || []) as { name?: string; slug?: string }[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!moduleId) {
      toast.error('Seleccioná un módulo');
      return;
    }
    const slug = submodules.length > 0
      ? (submoduleSlug || (submodules[0]?.slug || (submodules[0]?.name || '').toLowerCase().replace(/\s+/g, '-')))
      : NO_SUBMODULE_SLUG;
    if (submodules.length > 0 && !slug) {
      toast.error('Seleccioná un submódulo');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/module-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleId,
          submoduleSlug: slug,
          name: name.trim(),
          description: '',
          videoUrl: videoUrl.trim(),
          videoId: videoId.trim() || undefined,
          videoThumbnail: videoThumbnail.trim() || undefined,
          duration: Number(duration) || 0,
          level: Math.min(10, Math.max(1, level)),
          order: 0,
          materials
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      toast.success('Clase de módulo creada');
      router.push(`/admin/memberships/submodules/${moduleId}/${encodeURIComponent(slug)}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F7CCF]" />
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-xl mx-auto px-4 py-8">
        <Link href="/admin/memberships/submodules" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">Crear clase de módulo</h1>
        <form onSubmit={handleSubmit} className="space-y-4 font-montserrat">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Módulo *</label>
            <select
              value={moduleId}
              onChange={(e) => { setModuleId(e.target.value); setSubmoduleSlug(''); }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="">Seleccionar módulo</option>
              {modules.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          {submodules.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Submódulo *</label>
              <select
                value={submoduleSlug}
                onChange={(e) => setSubmoduleSlug(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="">Seleccionar submódulo</option>
                {submodules.map((s, i) => (
                  <option key={i} value={s.slug || (s.name || '').toLowerCase().replace(/\s+/g, '-')}>
                    {s.name || s.slug}
                  </option>
                ))}
              </select>
            </div>
          ) : selectedModule && (
            <p className="text-sm text-gray-700">Este módulo no tiene submódulos: la clase se agregará a la única agrupación del módulo.</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel (1-10) *</label>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materiales a usar en clase (opcional)</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {MODULE_CLASS_MATERIALS.map((mat) => (
                <label key={mat} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materials.includes(mat)}
                    onChange={() => toggleMaterial(mat)}
                    className="rounded border-gray-300 text-[#4F7CCF]"
                  />
                  <span className="text-gray-800 font-montserrat capitalize">{mat}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del video</label>
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID de video / miniatura / duración (opc.)</label>
            <input type="text" value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="Video ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 mb-2" />
            <input type="url" value={videoThumbnail} onChange={(e) => setVideoThumbnail(e.target.value)} placeholder="URL miniatura" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 mb-2" />
            <input type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duración (seg)" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-[#4F7CCF] text-white py-2 rounded-lg hover:bg-[#234C8C] disabled:opacity-50 font-montserrat">
            {submitting ? 'Creando...' : 'Crear clase de módulo'}
          </button>
        </form>
        {selectedModule && submodules.length === 0 && (
          <p className="mt-4 text-sm text-gray-700 font-montserrat">
            Podés crear la clase igual: se asignará a la agrupación única del módulo.
          </p>
        )}
      </div>
    </AdmimDashboardLayout>
  );
}
