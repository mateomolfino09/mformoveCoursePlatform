'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { MODULE_CLASS_MATERIALS } from '../../../../../../constants/moduleClassMaterials';

interface ModuleClassData {
  _id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  videoId?: string;
  videoThumbnail?: string;
  duration?: number;
  level: number;
  order?: number;
  materials?: string[];
  moduleId?: string;
  submoduleSlug?: string;
  visibleInLibrary?: boolean;
}

export default function EditModuleClassPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin/memberships/bitacora/list';
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ModuleClassData | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(1);
  const [materials, setMaterials] = useState<string[]>([]);

  useEffect(() => {
    if (!Cookies.get('userToken')) {
      router.push('/login');
      return;
    }
    if (auth.user && auth.user.rol !== 'Admin') {
      router.push('/login');
      return;
    }
    const id = params.id;
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/module-classes/${id}`, { credentials: 'include', cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Clase no encontrada');
        return r.json();
      })
      .then((doc: ModuleClassData) => {
        setData(doc);
        setName(doc.name || '');
        setDescription(doc.description || '');
        setVideoUrl(doc.videoUrl || '');
        setVideoId(doc.videoId || '');
        setVideoThumbnail(doc.videoThumbnail || '');
        setDuration(Number(doc.duration) || 0);
        setLevel(Math.min(10, Math.max(1, Number(doc.level) || 1)));
        setMaterials(Array.isArray(doc.materials) ? [...doc.materials] : []);
      })
      .catch((err) => {
        toast.error(err.message || 'Error al cargar la clase');
        router.push(returnTo);
      })
      .finally(() => setLoading(false));
  }, [params.id, router, auth.user, returnTo]);

  const toggleMaterial = (mat: string) => {
    setMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/module-classes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim() || undefined,
          videoId: videoId.trim() || undefined,
          videoThumbnail: videoThumbnail.trim() || undefined,
          duration: Number(duration) || 0,
          level: Math.min(10, Math.max(1, level)),
          materials
        })
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Error al actualizar');
      toast.success('Clase actualizada');
      router.push(returnTo);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la clase');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#4F7CCF] border-t-transparent" />
        </div>
      </AdmimDashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver al camino
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat mb-2">
          Editar clase de módulo
        </h1>
        {data.visibleInLibrary === false && (
          <p className="text-sm text-amber-700 mb-6 font-montserrat">
            Clase creada desde el camino (solo visible en biblioteca al publicar la última semana).
          </p>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 font-montserrat space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del video</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID de video (Vimeo)</label>
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL miniatura</label>
            <input
              type="url"
              value={videoThumbnail}
              onChange={(e) => setVideoThumbnail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (segundos)</label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel (1-10)</label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materiales</label>
            <div className="flex flex-wrap gap-3">
              {MODULE_CLASS_MATERIALS.map((mat) => (
                <label key={mat} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={materials.includes(mat)}
                    onChange={() => toggleMaterial(mat)}
                    className="rounded border-gray-300 text-[#4F7CCF]"
                  />
                  <span className="text-gray-800 capitalize">{mat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#4F7CCF] text-white rounded-lg hover:bg-[#234C8C] disabled:opacity-50 font-montserrat"
            >
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link
              href={returnTo}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-montserrat"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}
