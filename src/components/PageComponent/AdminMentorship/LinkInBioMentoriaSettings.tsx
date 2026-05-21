'use client';

import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import requests from '../../../utils/requests';
import LinkInBioImageUpload from '../Products/LinkInBioImageUpload';

type MentoriaConfig = {
  activoEnBio?: boolean;
  imagenBio?: string;
  titulo?: string;
  subtitulo?: string;
};

export default function LinkInBioMentoriaSettings() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activoEnBio, setActivoEnBio] = useState(true);
  const [titulo, setTitulo] = useState('Mentoría 1:1');
  const [subtitulo, setSubtitulo] = useState('Acompañamiento personalizado');
  const [existingImagenBio, setExistingImagenBio] = useState('');
  const [bioImageFile, setBioImageFile] = useState<File | null>(null);

  const {
    getRootProps: getRootPropsBioImage,
    getInputProps: getInputPropsBioImage,
    isDragActive: isDragActiveBioImage,
  } = useDropzone({
    onDrop: (acceptedFiles) => setBioImageFile(acceptedFiles[0] ?? null),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/link-in-bio/config');
        if (!res.ok) throw new Error('No se pudo cargar la configuración');
        const data = await res.json();
        const mentoria = (data.mentoria || {}) as MentoriaConfig;
        setActivoEnBio(mentoria.activoEnBio !== false);
        setTitulo(mentoria.titulo || 'Mentoría 1:1');
        setSubtitulo(mentoria.subtitulo || 'Acompañamiento personalizado');
        setExistingImagenBio(mentoria.imagenBio || '');
      } catch {
        toast.error('No se pudo cargar la configuración de bio');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user?.email) {
      toast.error('Sesión no válida');
      return;
    }
    if (activoEnBio && !bioImageFile && !existingImagenBio) {
      toast.error('Subí una imagen para mostrar mentoría en la bio');
      return;
    }

    setSaving(true);
    try {
      let imagenBio = existingImagenBio;
      if (bioImageFile) {
        const formData = new FormData();
        formData.append('file', bioImageFile);
        formData.append('upload_preset', 'my_uploads');
        const upload = await fetch(requests.fetchCloudinary, { method: 'POST', body: formData }).then((r) =>
          r.json()
        );
        if (!upload.public_id) throw new Error('Error al subir imagen');
        imagenBio = upload.public_id;
      }

      const res = await fetch('/api/link-in-bio/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: auth.user.email,
          mentoria: {
            activoEnBio,
            imagenBio,
            titulo,
            subtitulo,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setExistingImagenBio(imagenBio);
      setBioImageFile(null);
      toast.success(data.message || 'Configuración guardada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando configuración de bio…</p>;
  }

  return (
    <form onSubmit={handleSave} className="mt-10 max-w-2xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 pb-8 shadow-sm">
      <div>
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Carrusel de /bio — Mentoría</h2>
        <p className="mt-1 text-sm text-gray-600">
          Imagen y textos de la card de mentoría en la página bio.
        </p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={activoEnBio}
          onChange={(e) => setActivoEnBio(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#4F7CCF] focus:ring-[#4F7CCF]"
        />
        <span className="text-sm text-gray-700">Mostrar mentoría en el carrusel de bio</span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Título en la card</span>
          <input
            className="input border-gray-300"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Subtítulo</span>
          <input
            className="input border-gray-300"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
        </label>
      </div>

      <LinkInBioImageUpload
        label="Imagen para página bio"
        required={activoEnBio}
        existingPublicId={existingImagenBio || undefined}
        file={bioImageFile}
        onFileChange={setBioImageFile}
        getRootProps={getRootPropsBioImage}
        getInputProps={getInputPropsBioImage}
        isDragActive={isDragActiveBioImage}
        accent="blue"
      />

      <button
        type="submit"
        disabled={saving}
        className="sticky bottom-4 z-10 w-full rounded-lg bg-[#234C8C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#1a3a6b] disabled:opacity-60 md:static md:shadow-none"
      >
        {saving ? 'Guardando…' : 'Guardar configuración bio'}
      </button>
    </form>
  );
}
