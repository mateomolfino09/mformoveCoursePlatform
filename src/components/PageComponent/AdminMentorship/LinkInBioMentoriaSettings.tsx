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
  imagenBioTrimestral?: string;
  imagenBioAnual?: string;
  titulo?: string;
  subtitulo?: string;
  tituloTrimestral?: string;
  subtituloTrimestral?: string;
  tituloAnual?: string;
  subtituloAnual?: string;
};

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'my_uploads');
  const upload = await fetch(requests.fetchCloudinary, { method: 'POST', body: formData }).then((r) =>
    r.json()
  );
  if (!upload.public_id) throw new Error('Error al subir imagen');
  return upload.public_id as string;
}

export default function LinkInBioMentoriaSettings() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activoEnBio, setActivoEnBio] = useState(true);
  const [titulo, setTitulo] = useState('Mentoría 1:1');
  const [subtitulo, setSubtitulo] = useState('Acompañamiento personalizado');
  const [tituloTrimestral, setTituloTrimestral] = useState('');
  const [subtituloTrimestral, setSubtituloTrimestral] = useState('');
  const [tituloAnual, setTituloAnual] = useState('');
  const [subtituloAnual, setSubtituloAnual] = useState('');
  const [existingImagenTri, setExistingImagenTri] = useState('');
  const [existingImagenAnual, setExistingImagenAnual] = useState('');
  const [legacyImagenBio, setLegacyImagenBio] = useState('');
  const [triImageFile, setTriImageFile] = useState<File | null>(null);
  const [anualImageFile, setAnualImageFile] = useState<File | null>(null);

  const dropTri = useDropzone({
    onDrop: (acceptedFiles) => setTriImageFile(acceptedFiles[0] ?? null),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false,
  });

  const dropAnual = useDropzone({
    onDrop: (acceptedFiles) => setAnualImageFile(acceptedFiles[0] ?? null),
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
        setTituloTrimestral(mentoria.tituloTrimestral || '');
        setSubtituloTrimestral(mentoria.subtituloTrimestral || '');
        setTituloAnual(mentoria.tituloAnual || '');
        setSubtituloAnual(mentoria.subtituloAnual || '');
        setLegacyImagenBio(mentoria.imagenBio || '');
        setExistingImagenTri(
          mentoria.imagenBioTrimestral || (!mentoria.imagenBioAnual ? mentoria.imagenBio || '' : '')
        );
        setExistingImagenAnual(mentoria.imagenBioAnual || '');
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

    const willHaveTri = Boolean(triImageFile || existingImagenTri);
    const willHaveAnual = Boolean(anualImageFile || existingImagenAnual);
    if (activoEnBio && (!willHaveTri || !willHaveAnual)) {
      toast.error('Subí una imagen para el plan trimestral y otra para el anual');
      return;
    }

    setSaving(true);
    try {
      let imagenBioTrimestral = existingImagenTri;
      let imagenBioAnual = existingImagenAnual;

      if (triImageFile) {
        imagenBioTrimestral = await uploadToCloudinary(triImageFile);
      }
      if (anualImageFile) {
        imagenBioAnual = await uploadToCloudinary(anualImageFile);
      }

      const res = await fetch('/api/link-in-bio/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: auth.user.email,
          mentoria: {
            activoEnBio,
            imagenBioTrimestral,
            imagenBioAnual,
            // Dejamos de depender de la imagen única legacy
            imagenBio: '',
            titulo,
            subtitulo,
            tituloTrimestral,
            subtituloTrimestral,
            tituloAnual,
            subtituloAnual,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setExistingImagenTri(imagenBioTrimestral);
      setExistingImagenAnual(imagenBioAnual);
      setLegacyImagenBio('');
      setTriImageFile(null);
      setAnualImageFile(null);
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
    <form
      onSubmit={handleSave}
      className="mt-10 max-w-2xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 pb-8 shadow-sm"
    >
      <div>
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Carrusel de /bio — Mentoría</h2>
        <p className="mt-1 text-sm text-gray-600">
          Dos cards en la bio: una para el plan trimestral y otra para el anual (beneficios distintos).
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
          <span className="text-sm font-medium text-gray-700">Título base</span>
          <input
            className="input border-gray-300"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Mentoría 1:1"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Subtítulo base (legacy)</span>
          <input
            className="input border-gray-300"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <h3 className="font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-gray-700">
          Plan trimestral
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Título (opcional)</span>
            <input
              className="input border-gray-300"
              value={tituloTrimestral}
              onChange={(e) => setTituloTrimestral(e.target.value)}
              placeholder={`${titulo || 'Mentoría 1:1'} · Trimestral`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Subtítulo (opcional)</span>
            <input
              className="input border-gray-300"
              value={subtituloTrimestral}
              onChange={(e) => setSubtituloTrimestral(e.target.value)}
              placeholder="Ciclo de 3 meses · seguimiento personalizado"
            />
          </label>
        </div>
        <LinkInBioImageUpload
          label="Imagen bio · Trimestral"
          required={activoEnBio}
          existingPublicId={existingImagenTri || undefined}
          file={triImageFile}
          onFileChange={setTriImageFile}
          getRootProps={dropTri.getRootProps}
          getInputProps={dropTri.getInputProps}
          isDragActive={dropTri.isDragActive}
          accent="blue"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <h3 className="font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-gray-700">
          Plan anual
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Título (opcional)</span>
            <input
              className="input border-gray-300"
              value={tituloAnual}
              onChange={(e) => setTituloAnual(e.target.value)}
              placeholder={`${titulo || 'Mentoría 1:1'} · Anual`}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Subtítulo (opcional)</span>
            <input
              className="input border-gray-300"
              value={subtituloAnual}
              onChange={(e) => setSubtituloAnual(e.target.value)}
              placeholder="12 meses · beneficios y bonos exclusivos"
            />
          </label>
        </div>
        <LinkInBioImageUpload
          label="Imagen bio · Anual"
          required={activoEnBio}
          existingPublicId={existingImagenAnual || undefined}
          file={anualImageFile}
          onFileChange={setAnualImageFile}
          getRootProps={dropAnual.getRootProps}
          getInputProps={dropAnual.getInputProps}
          isDragActive={dropAnual.isDragActive}
          accent="blue"
        />
      </div>

      {legacyImagenBio && !existingImagenAnual ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Todavía hay una imagen única vieja. Al guardar con las dos nuevas, se deja de usar.
        </p>
      ) : null}

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
