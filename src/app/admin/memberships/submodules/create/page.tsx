'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ClassModule } from '../../../../../typings';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function CreateSubmodulePage() {
  const router = useRouter();
  const auth = useAuth();
  const [modules, setModules] = useState<ClassModule[]>([]);
  const [moduleId, setModuleId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const slugFromName = (n: string) =>
    n
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del submódulo es requerido');
      return;
    }
    if (!moduleId) {
      toast.error('Seleccioná un módulo');
      return;
    }
    const slug = slugFromName(name);
    if (!slug) {
      toast.error('El nombre debe tener al menos un carácter válido');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/class-modules/${moduleId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Módulo no encontrado');
      const moduleData = await res.json();
      const submodules = (moduleData.submodules || []).map((s: { name: string; slug?: string }) => ({
        name: s.name,
        slug: s.slug || slugFromName(s.name)
      }));
      if (submodules.some((s: { slug: string }) => s.slug === slug)) {
        toast.error('Ya existe un submódulo con ese nombre en este módulo');
        setSubmitting(false);
        return;
      }
      submodules.push({ name: name.trim(), slug });

      const updateRes = await fetch(`/api/class-modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userEmail: auth.user?.email,
          name: moduleData.name,
          slug: moduleData.slug,
          description: moduleData.description,
          shortDescription: moduleData.shortDescription,
          imageGallery: moduleData.imageGallery,
          submodules,
          videoUrl: moduleData.videoUrl,
          videoId: moduleData.videoId,
          videoThumbnail: moduleData.videoThumbnail,
          isActive: moduleData.isActive !== false
        })
      });
      const data = await updateRes.json();
      if (!updateRes.ok) throw new Error(data.error || 'Error al crear submódulo');
      toast.success('Submódulo creado');
      router.push(`/admin/memberships/submodules/${moduleId}/${encodeURIComponent(slug)}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear submódulo');
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
        <Link
          href="/admin/memberships/submodules"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat mb-6">Crear submódulo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Módulo *</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-montserrat"
            >
              <option value="">Seleccionar módulo</option>
              {modules.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">Nombre del submódulo *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Locomotions, Squat Work"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-montserrat"
            />
            {name.trim() && (
              <p className="text-xs text-gray-500 mt-1 font-montserrat">Slug: {slugFromName(name) || '—'}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#4F7CCF] text-white py-2 rounded-lg hover:bg-[#234C8C] disabled:opacity-50 font-montserrat"
          >
            {submitting ? 'Creando...' : 'Crear submódulo'}
          </button>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}
