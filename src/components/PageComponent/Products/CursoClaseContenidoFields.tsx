'use client';

import type { CursoClaseContenido } from '../../../types/cursoLanding';
import { COURSE_CLASS_MATERIALS } from '../../../types/courseClass';

const MATERIAL_LABELS: Record<string, string> = {
  pelota: 'Pelota',
  baston: 'Bastón',
  'banda elastica': 'Banda elástica',
  banco: 'Banco',
  bloque: 'Bloque',
  libreta: 'Libreta',
  lapicera: 'Lapicera',
};

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const labelClass = 'text-xs font-medium uppercase tracking-wide text-gray-500';

type Props = {
  clase: CursoClaseContenido;
  onChange: (partial: Partial<CursoClaseContenido>) => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  claseIndex: number;
};

export default function CursoClaseContenidoFields({
  clase,
  onChange,
  onDuplicate,
  onRemove,
  claseIndex,
}: Props) {
  const toggleMaterial = (mat: string) => {
    const next = clase.materials.includes(mat as (typeof clase.materials)[number])
      ? clase.materials.filter((m) => m !== mat)
      : [...clase.materials, mat as (typeof clase.materials)[number]];
    onChange({ materials: next });
  };

  const durationMinutes =
    clase.duration > 0 ? Math.round(clase.duration / 60) : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-700">Clase {claseIndex + 1}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            className={inputClass}
            value={clase.name}
            onChange={(e) => onChange({ name: e.target.value })}
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
            onChange={(e) => onChange({ level: Number(e.target.value) || 1 })}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Descripción general</label>
          <textarea
            className={`${inputClass} min-h-[72px]`}
            value={clase.descripcionGeneral ?? ''}
            onChange={(e) => onChange({ descripcionGeneral: e.target.value })}
            placeholder="¿Qué aprende el alumno? (concepto y función dentro del módulo)"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Descripción corta</label>
          <textarea
            className={`${inputClass} min-h-[72px]`}
            value={clase.descripcionCorta ?? ''}
            onChange={(e) => onChange({ descripcionCorta: e.target.value })}
            placeholder="¿Por qué debería importarme esta clase?"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Descripción completa</label>
          <textarea
            className={`${inputClass} min-h-[92px]`}
            value={clase.descripcionCompleta ?? ''}
            onChange={(e) => onChange({ descripcionCompleta: e.target.value })}
            placeholder="¿Por qué esto es relevante para mí y qué voy a descubrir? (narrativa y contexto)"
          />
        </div>
        <div>
          <label className={labelClass}>URL Vimeo</label>
          <input
            className={inputClass}
            value={clase.videoUrl}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="https://vimeo.com/..."
          />
        </div>
        <div>
          <label className={labelClass}>Vimeo video ID</label>
          <input
            className={inputClass}
            value={clase.videoId}
            onChange={(e) => onChange({ videoId: e.target.value })}
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
              onChange({ duration: min > 0 ? Math.round(min * 60) : 0 });
            }}
          />
        </div>
        <div>
          <label className={labelClass}>Thumbnail (URL)</label>
          <input
            className={inputClass}
            value={clase.videoThumbnail}
            onChange={(e) => onChange({ videoThumbnail: e.target.value })}
            placeholder="Opcional"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>PDF de la clase (URL)</label>
          <input
            className={inputClass}
            value={clase.pdfUrl ?? ''}
            onChange={(e) => onChange({ pdfUrl: e.target.value })}
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
                onClick={() => toggleMaterial(mat)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-palette-sage bg-palette-sage/15 text-gray-900'
                    : 'border-gray-300 text-gray-600 hover:border-gray-500'
                }`}
              >
                {MATERIAL_LABELS[mat] ?? mat}
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={clase.visibleInLibrary}
          onChange={(e) => onChange({ visibleInLibrary: e.target.checked })}
        />
        Visible en biblioteca del curso
      </label>
      {onDuplicate || onRemove ? (
        <div className="flex flex-wrap gap-4">
          {onDuplicate ? (
            <button
              type="button"
              onClick={onDuplicate}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Duplicar clase
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Quitar clase
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
