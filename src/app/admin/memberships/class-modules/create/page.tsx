'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ArrowLeftIcon, ArrowUpTrayIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from '../../../../../hooks/useToast';
import { MODULE_CLASS_MATERIALS } from '../../../../../constants/moduleClassMaterials';
import { useDropzone } from 'react-dropzone';
import requests from '../../../../../utils/requests';

export default function CreateClassModulePage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
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
  const [aboutDescription, setAboutDescription] = useState('');
  const [howToUse, setHowToUse] = useState<{ title: string; description: string }[]>([]);
  const [submoduleName, setSubmoduleName] = useState('');
  const [submodules, setSubmodules] = useState<{ name: string; slug: string; initialClasses: { name: string; videoUrl: string; level: number; materials: string[] }[] }[]>([]);

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
    setSubmodules(prev => [...prev, { name: trimmed, slug, initialClasses: [] }]);
    setSubmoduleName('');
  };

  const removeSubmodule = (idx: number) => setSubmodules(prev => prev.filter((_, i) => i !== idx));

  const addInitialClass = (subIdx: number) => {
    setSubmodules(prev => prev.map((s, i) => i === subIdx ? { ...s, initialClasses: [...s.initialClasses, { name: '', videoUrl: '', level: 1, materials: [] }] } : s));
  };
  const updateInitialClass = (subIdx: number, classIdx: number, field: 'name' | 'videoUrl' | 'level' | 'materials', value: string | number | string[]) => {
    setSubmodules(prev => prev.map((s, i) => {
      if (i !== subIdx) return s;
      const next = [...s.initialClasses];
      next[classIdx] = { ...next[classIdx], [field]: value };
      return { ...s, initialClasses: next };
    }));
  };
  const toggleInitialClassMaterial = (subIdx: number, classIdx: number, mat: string) => {
    setSubmodules(prev => prev.map((s, i) => {
      if (i !== subIdx) return s;
      const next = [...s.initialClasses];
      const current = next[classIdx].materials || [];
      next[classIdx] = { ...next[classIdx], materials: current.includes(mat) ? current.filter(m => m !== mat) : [...current, mat] };
      return { ...s, initialClasses: next };
    }));
  };
  const removeInitialClass = (subIdx: number, classIdx: number) => {
    setSubmodules(prev => prev.map((s, i) => i === subIdx ? { ...s, initialClasses: s.initialClasses.filter((_, j) => j !== classIdx) } : s));
  };

  if (typeof window !== 'undefined' && !Cookies.get('userToken')) router.push('/login');
  if (auth.user && auth.user.rol !== 'Admin') router.push('/login');

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

      const res = await fetch('/api/class-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userEmail,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: description || undefined,
          shortDescription: shortDescription || undefined,
          aboutDescription: aboutDescription || undefined,
          howToUse: howToUse.filter(h => h.title.trim()),
          imageGallery,
          submodules: submodules.map(({ name: n, slug: sl }) => ({ name: n, slug: sl })),
          videoUrl: videoUrl || undefined,
          videoId: videoId || undefined,
          videoThumbnail: videoThumbnail || undefined,
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      const newModuleId = data._id;
      if (newModuleId && Array.isArray(submodules)) {
        for (const sub of submodules) {
          for (let i = 0; i < (sub.initialClasses || []).length; i++) {
            const c = sub.initialClasses[i];
            if (!c.name?.trim()) continue;
            await fetch('/api/module-classes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                moduleId: newModuleId,
                submoduleSlug: sub.slug,
                name: c.name.trim(),
                videoUrl: c.videoUrl?.trim() || '',
                level: Math.min(10, Math.max(1, c.level || 1)),
                order: i,
                materials: Array.isArray(c.materials) ? c.materials : []
              })
            });
          }
        }
      }
      toast.success('Módulo creado');
      router.push('/admin/memberships/class-modules');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el módulo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Link href="/admin/memberships/class-modules" className="inline-flex items-center gap-2 text-gray-900 hover:text-[#4F7CCF] mb-6 font-montserrat">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-montserrat">Nuevo módulo de clase</h1>
        <form onSubmit={handleSubmit} className="space-y-5 font-montserrat">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Slug (URL, único)</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="movimiento" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Descripción corta</label>
            <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción “Sobre esta serie” (aboutDescription)</label>
            <textarea value={aboutDescription} onChange={(e) => setAboutDescription(e.target.value)} rows={3} placeholder="Texto para la sección Sobre esta serie en la página del módulo" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Cómo usar esta biblioteca (título + descripción por bloque)</label>
            <button type="button" onClick={addHowToUse} className="mb-2 px-4 py-2 bg-[#4F7CCF] text-white rounded-lg hover:bg-[#234C8C] flex items-center gap-1">
              <PlusIcon className="w-5 h-5" />
              Agregar bloque
            </button>
            {howToUse.map((item, idx) => (
              <div key={idx} className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bloque {idx + 1}</span>
                  <button type="button" onClick={() => removeHowToUse(idx)} className="text-red-500 hover:text-red-700">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <input type="text" value={item.title} onChange={(e) => updateHowToUse(idx, 'title', e.target.value)} placeholder="Título" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
                <textarea value={item.description} onChange={(e) => updateHowToUse(idx, 'description', e.target.value)} placeholder="Descripción" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Galería de fotos</label>
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
                <p className="text-sm text-gray-900">Arrastrá fotos aquí o hacé click para seleccionar</p>
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
            <label className="block text-sm font-medium text-gray-900 mb-2">Submódulos (ej. Locomotions, Squat Work, Floor Work)</label>
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
              <ul className="space-y-3">
                {submodules.map((s, idx) => (
                  <li key={s.slug} className="rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <button type="button" onClick={() => removeSubmodule(idx)} className="text-red-600 hover:text-red-800" title="Quitar submódulo">
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Clases de módulo (opcional): se crean al guardar el módulo. Cada una tiene nombre, nivel 1–10 y materiales opcionales.</p>
                    {(s.initialClasses || []).map((c, cIdx) => (
                      <div key={cIdx} className="mb-2 pl-2 border-l-2 border-[#4F7CCF]/30">
                        <div className="flex flex-wrap gap-2 items-center">
                          <input type="text" value={c.name} onChange={(e) => updateInitialClass(idx, cIdx, 'name', e.target.value)} placeholder="Nombre" className="w-32 px-2 py-1 border border-gray-300 rounded text-sm" />
                          <input type="url" value={c.videoUrl} onChange={(e) => updateInitialClass(idx, cIdx, 'videoUrl', e.target.value)} placeholder="URL video" className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm" />
                          <select value={c.level} onChange={(e) => updateInitialClass(idx, cIdx, 'level', Number(e.target.value))} className="w-14 px-2 py-1 border border-gray-300 rounded text-sm">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <button type="button" onClick={() => removeInitialClass(idx, cIdx)} className="text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 ml-0">
                          {MODULE_CLASS_MATERIALS.map((mat) => (
                            <label key={mat} className="inline-flex items-center gap-1 cursor-pointer text-xs">
                              <input type="checkbox" checked={(c.materials || []).includes(mat)} onChange={() => toggleInitialClassMaterial(idx, cIdx, mat)} className="rounded border-gray-300 text-[#4F7CCF]" />
                              <span className="capitalize">{mat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addInitialClass(idx)} className="text-sm text-[#4F7CCF] hover:underline mt-1">
                      + Agregar clase de módulo
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Video del módulo (URL, ID, miniatura)</label>
            <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 bg-white text-gray-900 placeholder:text-gray-500" />
            <input type="text" value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="Video ID (ej. Vimeo)" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 bg-white text-gray-900 placeholder:text-gray-500" />
            <input type="text" value={videoThumbnail} onChange={(e) => setVideoThumbnail(e.target.value)} placeholder="URL miniatura" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-gray-400 text-[#4F7CCF]" />
            <label htmlFor="isActive" className="text-gray-900 font-medium">Módulo activo (visible en biblioteca)</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#4F7CCF] text-white py-3 rounded-lg hover:bg-[#234C8C] disabled:opacity-50 font-montserrat">
            {loading ? 'Creando...' : 'Crear módulo'}
          </button>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}
