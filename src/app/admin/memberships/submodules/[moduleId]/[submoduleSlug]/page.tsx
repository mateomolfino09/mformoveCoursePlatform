'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ArrowLeftIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { MODULE_CLASS_MATERIALS } from '../../../../../../constants/moduleClassMaterials';

interface ModuleClassItem {
  _id: string;
  moduleId: string;
  submoduleSlug: string;
  name: string;
  description?: string;
  videoUrl?: string;
  videoId?: string;
  videoThumbnail?: string;
  duration?: number;
  level: number;
  order: number;
  materials?: string[];
}

export default function SubmoduleVideosPage({
  params
}: {
  params: { moduleId: string; submoduleSlug: string };
}) {
  const router = useRouter();
  const auth = useAuth();
  const moduleId = params.moduleId;
  const submoduleSlug = decodeURIComponent(params.submoduleSlug || '');

  const [moduleName, setModuleName] = useState('');
  const [submoduleName, setSubmoduleName] = useState('');
  const [videos, setVideos] = useState<ModuleClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVideoId, setFormVideoId] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formLevel, setFormLevel] = useState(1);
  const [formMaterials, setFormMaterials] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleFormMaterial = (mat: string) => {
    setFormMaterials((prev) => (prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]));
  };

  useEffect(() => {
    if (!Cookies.get('userToken')) router.push('/login');
    if (auth.user && auth.user.rol !== 'Admin') router.push('/login');
  }, [auth.user, router]);

  useEffect(() => {
    if (!moduleId || !submoduleSlug) return;
    Promise.all([
      fetch(`/api/class-modules/${moduleId}`, { cache: 'no-store' }).then((r) => r.ok ? r.json() : null),
      fetch(`/api/module-classes?moduleId=${encodeURIComponent(moduleId)}&submoduleSlug=${encodeURIComponent(submoduleSlug)}`, {
        credentials: 'include',
        cache: 'no-store'
      }).then((r) => r.ok ? r.json() : [])
    ]).then(([moduleData, list]) => {
      if (moduleData) {
        setModuleName(moduleData.name || '');
        const sub = (moduleData.submodules || []).find(
          (s: { slug?: string }) => (s.slug || '').toLowerCase() === submoduleSlug.toLowerCase()
        );
        setSubmoduleName(sub?.name || submoduleSlug);
      }
      setVideos(Array.isArray(list) ? list : []);
    }).catch(() => setVideos([])).finally(() => setLoading(false));
  }, [moduleId, submoduleSlug]);

  const fetchVideos = () => {
    fetch(`/api/module-classes?moduleId=${encodeURIComponent(moduleId)}&submoduleSlug=${encodeURIComponent(submoduleSlug)}`, {
      credentials: 'include',
      cache: 'no-store'
    })
      .then((r) => r.json())
      .then((list) => setVideos(Array.isArray(list) ? list : []));
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('El nombre es requerido');
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
          submoduleSlug,
          name: formName.trim(),
          description: '',
          videoUrl: formVideoUrl.trim(),
          videoId: formVideoId.trim() || undefined,
          videoThumbnail: formThumbnail.trim() || undefined,
          duration: Number(formDuration) || 0,
          level: Math.min(10, Math.max(1, formLevel)),
          order: videos.length,
          materials: formMaterials
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al agregar');
      toast.success('Video agregado');
      setFormName('');
      setFormVideoUrl('');
      setFormVideoId('');
      setFormThumbnail('');
      setFormDuration('');
      setFormLevel(1);
      setFormMaterials([]);
      setShowForm(false);
      fetchVideos();
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLevelChange = async (id: string, level: number) => {
    const n = Math.min(10, Math.max(1, level));
    try {
      const res = await fetch(`/api/module-classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ level: n })
      });
      if (!res.ok) throw new Error('Error');
      fetchVideos();
    } catch {
      toast.error('Error al actualizar nivel');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta clase de módulo?')) return;
    try {
      const res = await fetch(`/api/module-classes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Error');
      toast.success('Eliminada');
      fetchVideos();
    } catch {
      toast.error('Error al eliminar');
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
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/admin/memberships/submodules"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a submódulos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat mb-1">
          {moduleName} → {submoduleName}
        </h1>
        <p className="text-gray-600 text-sm font-montserrat mb-6">
          Clases de módulo (videos cortos). Nivel del 1 al 10. Solo se crean desde aquí.
        </p>

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#4F7CCF] text-white px-4 py-2 rounded-lg hover:bg-[#234C8C] font-montserrat mb-6"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar video
          </button>
        ) : (
          <form onSubmit={handleAddVideo} className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 font-montserrat">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva clase de módulo</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel (1-10) *</label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Materiales a usar en clase (opcional)</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {MODULE_CLASS_MATERIALS.map((mat) => (
                    <label key={mat} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formMaterials.includes(mat)}
                        onChange={() => toggleFormMaterial(mat)}
                        className="rounded border-gray-300 text-[#4F7CCF]"
                      />
                      <span className="text-gray-800 font-montserrat capitalize">{mat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del video</label>
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de video (ej. Vimeo)</label>
                <input
                  type="text"
                  value={formVideoId}
                  onChange={(e) => setFormVideoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL miniatura</label>
                <input
                  type="url"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (seg)</label>
                <input
                  type="number"
                  min={0}
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#4F7CCF] text-white rounded-lg hover:bg-[#234C8C] disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Agregar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {videos.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-600 font-montserrat">
            Aún no hay videos en este submódulo. Agregá uno con el botón de arriba.
          </div>
        ) : (
          <ul className="space-y-3">
            {videos.map((v) => (
              <li
                key={v._id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 font-montserrat"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{v.name}</p>
                  {(v.videoUrl || v.videoId) && (
                    <p className="text-sm text-gray-500 truncate">{v.videoUrl || v.videoId}</p>
                  )}
                  {v.materials && v.materials.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">Materiales: {v.materials.join(', ')}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    Nivel
                    <select
                      value={v.level}
                      onChange={(e) => handleLevelChange(v._id, Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDelete(v._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdmimDashboardLayout>
  );
}
