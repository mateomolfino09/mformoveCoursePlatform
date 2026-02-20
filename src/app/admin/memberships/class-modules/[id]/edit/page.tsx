'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { ClassModule } from '../../../../../../typings';
import { ArrowLeftIcon, ArrowUpTrayIcon, XMarkIcon, PlusIcon, TrashIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import type { ModuleClass } from '../../../../../../typings';
import { toast } from '../../../../../../hooks/useToast';
import { MODULE_CLASS_MATERIALS } from '../../../../../../constants/moduleClassMaterials';
import { NO_SUBMODULE_SLUG } from '../../../../../../constants/moduleClassConstants';
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
  const [aboutDescription, setAboutDescription] = useState('');
  const [howToUse, setHowToUse] = useState<{ title: string; description: string }[]>([]);
  const [submoduleName, setSubmoduleName] = useState('');
  const [submodules, setSubmodules] = useState<{ name: string; slug: string }[]>([]);
  const [moduleClassesBySub, setModuleClassesBySub] = useState<Record<string, ModuleClass[]>>({});
  const [addingClassForSlug, setAddingClassForSlug] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassVideoUrl, setNewClassVideoUrl] = useState('');
  const [newClassLevel, setNewClassLevel] = useState(1);
  const [newClassMaterials, setNewClassMaterials] = useState<string[]>([]);
  const [submittingClass, setSubmittingClass] = useState(false);

  const toggleNewClassMaterial = (mat: string) => {
    setNewClassMaterials((prev) => (prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]));
  };

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

  const addHowToUse = () => setHowToUse(prev => [...prev, { title: '', description: '' }]);
  const updateHowToUse = (idx: number, field: 'title' | 'description', value: string) => {
    setHowToUse(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };
  const removeHowToUse = (idx: number) => setHowToUse(prev => prev.filter((_, i) => i !== idx));

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
        setAboutDescription((m as { aboutDescription?: string }).aboutDescription || '');
        setHowToUse(Array.isArray((m as { howToUse?: { title: string; description: string }[] }).howToUse)
          ? (m as { howToUse: { title: string; description: string }[] }).howToUse.map(h => ({ title: h.title || '', description: h.description || '' }))
          : []);
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

  useEffect(() => {
    if (!id) {
      setModuleClassesBySub({});
      return;
    }
    const load = async () => {
      const out: Record<string, ModuleClass[]> = {};
      if (submodules.length === 0) {
        const res = await fetch(
          `/api/module-classes?moduleId=${encodeURIComponent(id)}&submoduleSlug=${encodeURIComponent(NO_SUBMODULE_SLUG)}`,
          { credentials: 'include', cache: 'no-store' }
        );
        const list = res.ok ? await res.json() : [];
        out[NO_SUBMODULE_SLUG] = Array.isArray(list) ? list : [];
      } else {
        await Promise.all(
          submodules.map(async (s) => {
            const res = await fetch(
              `/api/module-classes?moduleId=${encodeURIComponent(id)}&submoduleSlug=${encodeURIComponent(s.slug)}`,
              { credentials: 'include', cache: 'no-store' }
            );
            const list = res.ok ? await res.json() : [];
            out[s.slug] = Array.isArray(list) ? list : [];
          })
        );
      }
      setModuleClassesBySub(out);
    };
    load();
  }, [id, submodules]);

  const refreshModuleClasses = (subSlug: string) => {
    fetch(`/api/module-classes?moduleId=${encodeURIComponent(id)}&submoduleSlug=${encodeURIComponent(subSlug)}`, {
      credentials: 'include',
      cache: 'no-store'
    })
      .then((r) => r.json())
      .then((list) => {
        setModuleClassesBySub((prev) => ({ ...prev, [subSlug]: Array.isArray(list) ? list : [] }));
      });
  };

  const addModuleClass = async (subSlug: string) => {
    if (!newClassName.trim()) {
      toast.error('Nombre requerido');
      return;
    }
    setSubmittingClass(true);
    try {
      const res = await fetch('/api/module-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleId: id,
          submoduleSlug: subSlug,
          name: newClassName.trim(),
          videoUrl: newClassVideoUrl.trim(),
          level: Math.min(10, Math.max(1, newClassLevel)),
          order: (moduleClassesBySub[subSlug]?.length ?? 0),
          materials: newClassMaterials
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Clase de módulo agregada');
      setNewClassName('');
      setNewClassVideoUrl('');
      setNewClassLevel(1);
      setNewClassMaterials([]);
      setAddingClassForSlug(null);
      refreshModuleClasses(subSlug);
    } catch (e: any) {
      toast.error(e.message || 'Error');
    } finally {
      setSubmittingClass(false);
    }
  };

  const deleteModuleClass = async (classId: string, subSlug: string) => {
    if (!confirm('¿Eliminar esta clase de módulo?')) return;
    try {
      const res = await fetch(`/api/module-classes/${classId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Error');
      toast.success('Eliminada');
      refreshModuleClasses(subSlug);
    } catch {
      toast.error('Error al eliminar');
    }
  };

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
          aboutDescription: aboutDescription || undefined,
          howToUse: howToUse.filter(h => h.title.trim()),
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
        <Link href="/admin/memberships/class-modules" className="inline-flex items-center gap-2 text-gray-900 hover:text-[#4F7CCF] mb-6 font-montserrat">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-montserrat">Editar módulo</h1>
        <form onSubmit={handleSubmit} className="space-y-5 font-montserrat">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Slug *</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
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
            <label className="block text-sm font-medium text-gray-900 mb-1">Descripción “Sobre esta serie” (aboutDescription)</label>
            <textarea value={aboutDescription} onChange={(e) => setAboutDescription(e.target.value)} rows={3} placeholder="Texto para la sección Sobre esta serie" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Cómo usar esta biblioteca (bloques título + descripción)</label>
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
                <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-900">Arrastrá fotos aquí o hacé click para agregar más</p>
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

          {submodules.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-900 mb-1">Clases del módulo</label>
              <p className="text-sm text-gray-700 mb-4">Este módulo no tiene submódulos: las clases forman una única agrupación. Agregá clases acá.</p>
              {(() => {
                const s = { slug: NO_SUBMODULE_SLUG, name: 'Clases del módulo' };
                return (
                <div key={s.slug} className="p-4 rounded-lg border border-gray-200 bg-gray-50/80">
                  <div className="flex items-center gap-2 mb-3">
                    <VideoCameraIcon className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900 font-montserrat">{s.name}</span>
                  </div>
                  {(moduleClassesBySub[s.slug] || []).length > 0 && (
                    <ul className="mb-3 space-y-1.5">
                      {(moduleClassesBySub[s.slug] || []).map((c) => (
                        <li key={c._id} className="flex items-center justify-between text-sm text-gray-900 font-montserrat py-1.5 px-2 rounded bg-white border border-gray-100">
                          <span>{c.name} <span className="text-gray-600">(nivel {c.level})</span>{c.materials?.length ? <span className="text-gray-600 text-xs ml-1"> · {c.materials.join(', ')}</span> : null}</span>
                          <button type="button" onClick={() => deleteModuleClass(c._id, s.slug)} className="text-red-600 hover:text-red-800" title="Eliminar clase">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {addingClassForSlug === s.slug ? (
                    <div className="rounded-lg border border-[#4F7CCF]/30 bg-white p-4 space-y-4">
                      <p className="text-sm font-medium text-gray-900">Nueva clase de módulo</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Nombre de la clase *</label>
                          <input type="text" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Ej: Calentamiento básico" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Nivel (1–10)</label>
                          <select value={newClassLevel} onChange={(e) => setNewClassLevel(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>Nivel {n}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">URL del video</label>
                        <input type="url" value={newClassVideoUrl} onChange={(e) => setNewClassVideoUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-2">Materiales a usar en clase (opcional)</label>
                        <div className="flex flex-wrap gap-3">
                          {MODULE_CLASS_MATERIALS.map((mat) => (
                            <label key={mat} className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-900">
                              <input type="checkbox" checked={newClassMaterials.includes(mat)} onChange={() => toggleNewClassMaterial(mat)} className="rounded border-gray-400 text-[#4F7CCF]" />
                              <span className="capitalize">{mat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => addModuleClass(s.slug)} disabled={submittingClass} className="px-4 py-2 bg-[#4F7CCF] text-white rounded-lg text-sm font-medium hover:bg-[#234C8C] disabled:opacity-50">
                          {submittingClass ? 'Agregando...' : 'Agregar clase'}
                        </button>
                        <button type="button" onClick={() => { setAddingClassForSlug(null); setNewClassName(''); setNewClassVideoUrl(''); setNewClassMaterials([]); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 hover:bg-gray-50">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setAddingClassForSlug(s.slug)} className="text-sm font-medium text-[#4F7CCF] hover:underline font-montserrat">
                      + Agregar clase de módulo
                    </button>
                  )}
                </div>
                );
              })()}
            </div>
          )}

          {submodules.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-900 mb-1">Clases de módulo por submódulo</label>
              <p className="text-sm text-gray-700 mb-4">Videos cortos con nivel 1–10 y materiales opcionales. Podés crearlos acá o ir a Gestionar para ver el submódulo completo.</p>
              {submodules.map((s) => (
                <div key={s.slug} className="mb-4 last:mb-0 p-4 rounded-lg border border-gray-200 bg-gray-50/80">
                  <div className="flex items-center gap-2 mb-3">
                    <VideoCameraIcon className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900 font-montserrat">{s.name}</span>
                    <Link
                      href={`/admin/memberships/submodules/${id}/${encodeURIComponent(s.slug)}`}
                      className="ml-2 text-sm text-[#4F7CCF] hover:underline font-montserrat font-medium"
                    >
                      Gestionar
                    </Link>
                  </div>
                  {(moduleClassesBySub[s.slug] || []).length > 0 && (
                    <ul className="mb-3 space-y-1.5">
                      {(moduleClassesBySub[s.slug] || []).map((c) => (
                        <li key={c._id} className="flex items-center justify-between text-sm text-gray-900 font-montserrat py-1.5 px-2 rounded bg-white border border-gray-100">
                          <span>{c.name} <span className="text-gray-600">(nivel {c.level})</span>{c.materials?.length ? <span className="text-gray-600 text-xs ml-1"> · {c.materials.join(', ')}</span> : null}</span>
                          <button type="button" onClick={() => deleteModuleClass(c._id, s.slug)} className="text-red-600 hover:text-red-800" title="Eliminar clase">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {addingClassForSlug === s.slug ? (
                    <div className="rounded-lg border border-[#4F7CCF]/30 bg-white p-4 space-y-4">
                      <p className="text-sm font-medium text-gray-900">Nueva clase de módulo</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Nombre de la clase *</label>
                          <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Ej: Calentamiento básico"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900 mb-1">Nivel (1–10)</label>
                          <select
                            value={newClassLevel}
                            onChange={(e) => setNewClassLevel(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>Nivel {n}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-1">URL del video</label>
                        <input
                          type="url"
                          value={newClassVideoUrl}
                          onChange={(e) => setNewClassVideoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-900 mb-2">Materiales a usar en clase (opcional)</label>
                        <div className="flex flex-wrap gap-3">
                          {MODULE_CLASS_MATERIALS.map((mat) => (
                            <label key={mat} className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-900">
                              <input
                                type="checkbox"
                                checked={newClassMaterials.includes(mat)}
                                onChange={() => toggleNewClassMaterial(mat)}
                                className="rounded border-gray-400 text-[#4F7CCF]"
                              />
                              <span className="capitalize">{mat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => addModuleClass(s.slug)}
                          disabled={submittingClass}
                          className="px-4 py-2 bg-[#4F7CCF] text-white rounded-lg text-sm font-medium hover:bg-[#234C8C] disabled:opacity-50"
                        >
                          {submittingClass ? 'Agregando...' : 'Agregar clase'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAddingClassForSlug(null); setNewClassName(''); setNewClassVideoUrl(''); setNewClassMaterials([]); }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingClassForSlug(s.slug)}
                      className="text-sm font-medium text-[#4F7CCF] hover:underline font-montserrat"
                    >
                      + Agregar clase de módulo
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

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
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}
