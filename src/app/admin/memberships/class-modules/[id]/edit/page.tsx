'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ClassModule } from '../../../../../../typings';
import { ArrowLeftIcon, ArrowUpTrayIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from '../../../../../../hooks/useToast';
import { useDropzone } from 'react-dropzone';
import requests from '../../../../../../utils/requests';

export default function EditClassModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const auth = useAuth();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [galleryImages, setGalleryImages] = useState<{ url: string; publicId?: string; caption?: string }[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryInputMode, setGalleryInputMode] = useState<'upload' | 'url'>('upload');
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [submoduleName, setSubmoduleName] = useState('');
  const [submodules, setSubmodules] = useState<{ name: string; slug: string }[]>([]);

  const addImageByUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    setGalleryImages(prev => [...prev, { url }]);
    setGalleryUrlInput('');
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    onDrop: (accepted) => setGalleryFiles(prev => [...prev, ...accepted]),
    multiple: true
  });

  const removeGalleryFile = (idx: number) => setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
  const removeGalleryImage = (idx: number) => setGalleryImages(prev => prev.filter((_, i) => i !== idx));

  const addSubmodule = () => {
    const trimmed = submoduleName.trim();
    if (!trimmed) return;
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (submodules.some(s => s.slug === slug)) {
      toast.error('Ese submódulo ya existe');
      return;
    }
    setSubmodules(prev => [...prev, { name: trimmed, slug }]);
    setSubmoduleName('');
  };

  const removeSubmodule = (idx: number) => setSubmodules(prev => prev.filter((_, i) => i !== idx));

  useEffect(() => {
    if (!Cookies.get('userToken')) router.push('/login');
    if (auth.user && auth.user.rol !== 'Admin') router.push('/login');
  }, [auth.user, router]);

  useEffect(() => {
    async function fetchModule() {
      try {
        const res = await fetch(`/api/class-modules/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          router.push('/admin/memberships/class-modules');
          return;
        }
        const m: ClassModule = await res.json();
        setName(m.name);
        setSlug(m.slug);
        setDescription(m.description || '');
        setShortDescription(m.shortDescription || '');
        setVideoUrl(m.videoUrl || '');
        setVideoId(m.videoId || '');
        setVideoThumbnail(m.videoThumbnail || '');
        setIsActive(m.isActive !== false);
        setGalleryImages((m.imageGallery || []).map(img => ({ url: img.url, publicId: img.publicId, caption: img.caption })));
        setSubmodules((m.submodules || []).map((s: { name: string; slug?: string }) => ({
          name: s.name,
          slug: s.slug || s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })));
      } catch (err) {
        console.error(err);
        router.push('/admin/memberships/class-modules');
      } finally {
        setFetching(false);
      }
    }
    if (id) fetchModule();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageGallery: { url: string; publicId?: string; caption?: string }[] = [...galleryImages];
      for (const file of galleryFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'my_uploads');
        const res = await fetch(requests.fetchCloudinary, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) {
          imageGallery.push({ url: data.secure_url, publicId: data.public_id });
        }
      }

      const userEmail = auth.user?.email;
      if (!userEmail) {
        toast.error('Sesión inválida');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/class-modules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userEmail,
          name,
          slug,
          description: description || undefined,
          shortDescription: shortDescription || undefined,
          imageGallery,
          submodules,
          videoUrl: videoUrl || undefined,
          videoId: videoId || undefined,
          videoThumbnail: videoThumbnail || undefined,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');
      toast.success('Módulo actualizado');
      router.push('/admin/memberships/class-modules');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Link href="/admin/memberships/class-modules" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-montserrat">Editar módulo</h1>
        <form onSubmit={handleSubmit} className="space-y-4 font-montserrat">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
            <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Galería de fotos</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setGalleryInputMode('upload')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${galleryInputMode === 'upload' ? 'bg-[#4F7CCF] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => setGalleryInputMode('url')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${galleryInputMode === 'url' ? 'bg-[#4F7CCF] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                URL de Cloudinary
              </button>
            </div>
            {galleryInputMode === 'upload' && (
              <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#4F7CCF] hover:bg-gray-50 transition-colors">
                <input {...getInputProps()} />
                <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Arrastrá fotos aquí o hacé click para agregar más</p>
              </div>
            )}
            {galleryInputMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageByUrl())}
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
                <button type="button" onClick={addImageByUrl} className="px-4 py-2 bg-[#4F7CCF] text-white rounded-lg hover:bg-[#234C8C] whitespace-nowrap">
                  Agregar imagen
                </button>
              </div>
            )}
            {(galleryImages.length > 0 || galleryFiles.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-3">
                {galleryImages.map((img, idx) => (
                  <div key={`saved-${idx}`} className="relative">
                    <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {galleryFiles.map((file, idx) => (
                  <div key={`file-${idx}`} className="relative">
                    <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeGalleryFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Submódulos (ej. Locomotions, Squat Work, Floor Work)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={submoduleName}
                onChange={(e) => setSubmoduleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubmodule())}
                placeholder="Nombre del submódulo"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
              <button type="button" onClick={addSubmodule} className="px-4 py-2 bg-[#4F7CCF] text-white rounded-lg hover:bg-[#234C8C] flex items-center gap-1">
                <PlusIcon className="w-5 h-5" />
                Agregar
              </button>
            </div>
            {submodules.length > 0 && (
              <ul className="space-y-1">
                {submodules.map((s, idx) => (
                  <li key={s.slug} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-900">{s.name}</span>
                    <button type="button" onClick={() => removeSubmodule(idx)} className="text-red-500 hover:text-red-700">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL / ID / Thumbnail</label>
            <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 bg-white text-gray-900" />
            <input type="text" value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="Video ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 bg-white text-gray-900" />
            <input type="text" value={videoThumbnail} onChange={(e) => setVideoThumbnail(e.target.value)} placeholder="URL miniatura" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <label htmlFor="isActive">Activo</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#4F7CCF] text-white py-3 rounded-lg hover:bg-[#234C8C] disabled:opacity-50 font-montserrat">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}
