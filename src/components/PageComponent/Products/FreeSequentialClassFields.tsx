'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CourseClassDocument } from '../../../types/courseClass';
import { COURSE_CLASS_MATERIALS } from '../../../types/courseClass';
import { getClassMaterialLabel } from '../../icons/ClassMaterialIcon';
import { toast } from '../../../hooks/useToast';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const labelClass = 'text-xs font-medium uppercase tracking-wide text-gray-500';

type Props = {
  productId: string;
  /** Slug público: se usa para armar los links /clases-gratis/[slug]/clase/[id] del mail. */
  slug?: string;
};

type Draft = Partial<CourseClassDocument> & {
  name: string;
  level: number;
  materials: CourseClassDocument['materials'];
};

function emptyDraft(nextOrder: number): Draft {
  return {
    name: '',
    description: '',
    descripcionGeneral: '',
    descripcionCorta: '',
    descripcionCompleta: '',
    videoUrl: '',
    videoId: '',
    videoThumbnail: '',
    pdfUrl: '',
    duration: 0,
    level: 1,
    order: nextOrder,
    materials: [],
    visibleInLibrary: true,
  };
}

export default function FreeSequentialClassFields({ productId, slug }: Props) {
  const [clases, setClases] = useState<CourseClassDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newClase, setNewClase] = useState<Draft>(() => emptyDraft(10));
  const [adding, setAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const publicSlug = (slug || '').trim().toLowerCase();

  const classPublicUrl = (classId: string) => {
    const path = `/clases-gratis/${publicSlug}/clase/${classId}`;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const copyClassLink = async (classId: string) => {
    if (!publicSlug) {
      toast.error('Definí y guardá el slug del producto para generar los links');
      return;
    }
    const url = classPublicUrl(classId);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(classId);
      toast.success('Link copiado');
      setTimeout(() => setCopiedId((id) => (id === classId ? null : id)), 2000);
    } catch {
      toast.error('No se pudo copiar el link');
    }
  };

  const fetchClases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/course-classes?productId=${productId}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];
      setClases(sorted);
      const maxOrder = sorted.reduce((max, c) => Math.max(max, c.order ?? 0), 0);
      setNewClase(emptyDraft(maxOrder + 10));
    } catch {
      toast.error('No se pudieron cargar las clases del producto');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchClases();
  }, [fetchClases]);

  const updateLocal = (id: string, partial: Partial<CourseClassDocument>) => {
    setClases((prev) => prev.map((c) => (c._id === id ? { ...c, ...partial } : c)));
  };

  const saveClase = async (clase: CourseClassDocument) => {
    if (!clase.name.trim()) {
      toast.error('El nombre de la clase es obligatorio');
      return;
    }
    setSaving(clase._id);
    try {
      const res = await fetch(`/api/course-classes/${clase._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clase.name,
          description: clase.description,
          descripcionGeneral: clase.descripcionGeneral,
          descripcionCorta: clase.descripcionCorta,
          descripcionCompleta: clase.descripcionCompleta,
          videoUrl: clase.videoUrl,
          videoId: clase.videoId,
          videoThumbnail: clase.videoThumbnail,
          pdfUrl: clase.pdfUrl,
          duration: clase.duration,
          level: clase.level,
          materials: clase.materials,
          visibleInLibrary: clase.visibleInLibrary,
        }),
      });
      if (!res.ok) throw new Error('No se pudo guardar la clase');
      toast.success('Clase guardada');
    } catch {
      toast.error('No se pudo guardar la clase');
    } finally {
      setSaving(null);
    }
  };

  const deleteClase = async (id: string) => {
    if (!window.confirm('¿Eliminar esta clase? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/course-classes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar la clase');
      setClases((prev) => prev.filter((c) => c._id !== id));
      toast.success('Clase eliminada');
    } catch {
      toast.error('No se pudo eliminar la clase');
    }
  };

  const swapOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clases.length) return;
    const a = clases[index];
    const b = clases[targetIndex];
    const [orderA, orderB] = [a.order, b.order];
    try {
      await Promise.all([
        fetch(`/api/course-classes/${a._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderB }),
        }),
        fetch(`/api/course-classes/${b._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderA }),
        }),
      ]);
      await fetchClases();
    } catch {
      toast.error('No se pudo reordenar');
    }
  };

  const addClase = async () => {
    if (!newClase.name.trim()) {
      toast.error('El nombre de la clase es obligatorio');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/course-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          timelineIndex: 0,
          ...newClase,
        }),
      });
      if (!res.ok) throw new Error('No se pudo crear la clase');
      toast.success('Clase agregada');
      await fetchClases();
    } catch {
      toast.error('No se pudo crear la clase');
    } finally {
      setAdding(false);
    }
  };

  const toggleMaterial = (
    materials: CourseClassDocument['materials'],
    mat: string
  ): CourseClassDocument['materials'] =>
    materials.includes(mat as (typeof materials)[number])
      ? materials.filter((m) => m !== mat)
      : [...materials, mat as (typeof materials)[number]];

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando clases…</p>;
  }

  return (
    <div className="space-y-6">
      {publicSlug && clases.length > 0 ? (
        <div className="rounded-lg border border-palette-sage/40 bg-palette-sage/10 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Links para el mail</p>
            <p className="mt-1 text-xs text-gray-600">
              Copiá el link de cada clase para el email. Al abrirlo (y habiendo visto la anterior),
              el usuario desbloquea esa clase.
            </p>
          </div>
          <ul className="space-y-2">
            {clases.map((clase, index) => {
              const url = classPublicUrl(clase._id);
              return (
                <li
                  key={clase._id}
                  className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800">
                      Clase {index + 1}
                      {clase.name ? ` — ${clase.name}` : ''}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-gray-500" title={url}>
                      {url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyClassLink(clase._id)}
                    className="shrink-0 rounded-lg border border-gray-900 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-900 hover:text-white"
                  >
                    {copiedId === clase._id ? 'Copiado' : 'Copiar link'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        {clases.map((clase, index) => {
          const durationMinutes = clase.duration > 0 ? Math.round(clase.duration / 60) : '';
          return (
            <div key={clase._id} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">
                  Clase (orden {clase.order}) {clase.name ? `— ${clase.name}` : ''}
                </p>
                <div className="flex items-center gap-2">
                  {publicSlug ? (
                    <button
                      type="button"
                      onClick={() => copyClassLink(clase._id)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      title="Copiar link para el mail"
                    >
                      {copiedId === clase._id ? 'Link copiado' : 'Copiar link'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => swapOrder(index, 'up')}
                    disabled={index === 0}
                    className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => swapOrder(index, 'down')}
                    disabled={index === clases.length - 1}
                    className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              </div>
              {publicSlug ? (
                <div>
                  <label className={labelClass}>Link para el mail</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      readOnly
                      className={`${inputClass} font-mono text-xs`}
                      value={classPublicUrl(clase._id)}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <button
                      type="button"
                      onClick={() => copyClassLink(clase._id)}
                      className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input
                    className={inputClass}
                    value={clase.name}
                    onChange={(e) => updateLocal(clase._id, { name: e.target.value })}
                    placeholder="Nombre de la clase"
                  />
                </div>
                <div>
                  <label className={labelClass}>Nivel (1–10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className={inputClass}
                    value={clase.level}
                    onChange={(e) =>
                      updateLocal(clase._id, { level: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Descripción general</label>
                  <textarea
                    className={`${inputClass} min-h-[72px]`}
                    value={clase.descripcionGeneral ?? ''}
                    onChange={(e) =>
                      updateLocal(clase._id, { descripcionGeneral: e.target.value })
                    }
                    placeholder="¿Qué aprende el alumno en esta clase?"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Descripción corta</label>
                  <textarea
                    className={`${inputClass} min-h-[72px]`}
                    value={clase.descripcionCorta ?? ''}
                    onChange={(e) => updateLocal(clase._id, { descripcionCorta: e.target.value })}
                    placeholder="¿Por qué debería importarme esta clase?"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Descripción completa</label>
                  <textarea
                    className={`${inputClass} min-h-[92px]`}
                    value={clase.descripcionCompleta ?? ''}
                    onChange={(e) =>
                      updateLocal(clase._id, { descripcionCompleta: e.target.value })
                    }
                    placeholder="Narrativa y contexto de la clase"
                  />
                </div>
                <div>
                  <label className={labelClass}>URL Vimeo</label>
                  <input
                    className={inputClass}
                    value={clase.videoUrl}
                    onChange={(e) => updateLocal(clase._id, { videoUrl: e.target.value })}
                    placeholder="https://vimeo.com/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Vimeo video ID</label>
                  <input
                    className={inputClass}
                    value={clase.videoId}
                    onChange={(e) => updateLocal(clase._id, { videoId: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className={labelClass}>Duración (minutos)</label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={durationMinutes}
                    onChange={(e) => {
                      const min = e.target.value === '' ? 0 : Number(e.target.value);
                      updateLocal(clase._id, { duration: min > 0 ? Math.round(min * 60) : 0 });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Thumbnail (URL)</label>
                  <input
                    className={inputClass}
                    value={clase.videoThumbnail}
                    onChange={(e) => updateLocal(clase._id, { videoThumbnail: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>PDF de la clase (URL)</label>
                  <input
                    className={inputClass}
                    value={clase.pdfUrl ?? ''}
                    onChange={(e) => updateLocal(clase._id, { pdfUrl: e.target.value })}
                    placeholder="https://…/material.pdf (opcional)"
                  />
                </div>
              </div>
              <div>
                <p className={labelClass}>Materiales necesarios</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COURSE_CLASS_MATERIALS.map((mat) => {
                    const active = clase.materials.includes(mat);
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() =>
                          updateLocal(clase._id, {
                            materials: toggleMaterial(clase.materials, mat),
                          })
                        }
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          active
                            ? 'border-palette-sage bg-palette-sage/15 text-gray-900'
                            : 'border-gray-300 text-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {getClassMaterialLabel(mat)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={clase.visibleInLibrary}
                    onChange={(e) =>
                      updateLocal(clase._id, { visibleInLibrary: e.target.checked })
                    }
                  />
                  Visible
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => saveClase(clase)}
                    disabled={saving === clase._id}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {saving === clase._id ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteClase(clase._id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Quitar clase
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {clases.length === 0 && (
          <p className="text-sm text-gray-500">Todavía no hay clases agregadas.</p>
        )}
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Agregar clase nueva</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              className={inputClass}
              value={newClase.name}
              onChange={(e) => setNewClase((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre de la clase"
            />
          </div>
          <div>
            <label className={labelClass}>Orden</label>
            <input
              type="number"
              className={inputClass}
              value={newClase.order}
              onChange={(e) =>
                setNewClase((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>URL Vimeo</label>
            <input
              className={inputClass}
              value={newClase.videoUrl}
              onChange={(e) => setNewClase((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://vimeo.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>Vimeo video ID</label>
            <input
              className={inputClass}
              value={newClase.videoId}
              onChange={(e) => setNewClase((prev) => ({ ...prev, videoId: e.target.value }))}
              placeholder="123456789"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addClase}
          disabled={adding}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {adding ? 'Agregando…' : 'Agregar clase'}
        </button>
      </div>
    </div>
  );
}
