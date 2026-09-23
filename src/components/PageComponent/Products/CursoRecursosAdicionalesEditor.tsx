'use client';

import { useState } from 'react';
import {
  createDefaultRecursoAdicional,
  type CursoRecursoAdicional,
} from '../../../types/cursoLanding';
import CloudinaryFileField from './CloudinaryFileField';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const labelClass = 'text-xs font-medium uppercase tracking-wide text-gray-500';

type Props = {
  recursos: CursoRecursoAdicional[];
  onChange: (next: CursoRecursoAdicional[]) => void;
};

function freshId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `recurso-${Date.now()}`;
}

function withOrder(items: CursoRecursoAdicional[]) {
  return items.map((item, index) => ({ ...item, orden: index }));
}

function resourceLabel(recurso: CursoRecursoAdicional, index: number) {
  const title = recurso.titulo.trim();
  return title || `Recurso ${index + 1}`;
}

function resourceDetail(recurso: CursoRecursoAdicional) {
  if (recurso.tipo === 'clase') {
    return recurso.videoId.trim() || recurso.videoUrl.trim() || 'Sin video';
  }
  return recurso.archivoNombre.trim() || (recurso.archivoUrl.trim() ? 'Archivo cargado' : 'Sin archivo');
}

export default function CursoRecursosAdicionalesEditor({ recursos, onChange }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(recursos.length ? 0 : null);

  const update = (index: number, partial: Partial<CursoRecursoAdicional>) => {
    onChange(recursos.map((item, i) => (i === index ? { ...item, ...partial } : item)));
  };

  const remove = (index: number) => {
    onChange(withOrder(recursos.filter((_, i) => i !== index)));
    setOpenIndex((current) => {
      if (current == null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const duplicate = (index: number) => {
    const source = recursos[index];
    if (!source) return;
    const copy: CursoRecursoAdicional = {
      ...source,
      recursoId: freshId(),
      titulo: source.titulo.trim() ? `${source.titulo.trim()} (copia)` : '',
      orden: index + 1,
    };
    const next = [...recursos];
    next.splice(index + 1, 0, copy);
    onChange(withOrder(next));
    setOpenIndex(index + 1);
  };

  const create = () => {
    onChange(withOrder([...recursos, createDefaultRecursoAdicional(recursos.length)]));
    setOpenIndex(recursos.length);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Aparecen en la biblioteca del curso, en «Recursos para tu práctica». Pueden ser una clase
        con video o un archivo para descargar.
      </p>

      {recursos.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay recursos. Creá el primero desde cero.</p>
      ) : (
        <ul className="space-y-2">
          {recursos.map((recurso, index) => {
            const open = openIndex === index;
            const minutes = recurso.duration > 0 ? Math.round(recurso.duration / 60) : '';
            return (
              <li
                key={`${recurso.recursoId || 'recurso'}-${index}`}
                className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover)]"
              >
                <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    <span className="block truncate text-sm font-medium text-gray-900">
                      {resourceLabel(recurso, index)}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {recurso.tipo === 'clase' ? 'Clase' : 'Archivo'} · {resourceDetail(recurso)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-[var(--admin-fg)] hover:underline"
                    onClick={() => duplicate(index)}
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    Eliminar
                  </button>
                </div>
                {open ? (
                  <div className="space-y-3 border-t border-[var(--admin-border)] px-3 py-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Tipo</label>
                        <select
                          className={inputClass}
                          value={recurso.tipo}
                          onChange={(e) =>
                            update(index, {
                              tipo: e.target.value === 'clase' ? 'clase' : 'archivo',
                            })
                          }
                        >
                          <option value="archivo">Archivo</option>
                          <option value="clase">Clase</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Título</label>
                        <input
                          className={inputClass}
                          value={recurso.titulo}
                          onChange={(e) => update(index, { titulo: e.target.value })}
                          placeholder="Nombre del recurso"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Descripción</label>
                        <textarea
                          className={`${inputClass} min-h-[72px]`}
                          value={recurso.descripcion}
                          onChange={(e) => update(index, { descripcion: e.target.value })}
                          placeholder="Opcional"
                        />
                      </div>
                      {recurso.tipo === 'clase' ? (
                        <>
                          <div>
                            <label className={labelClass}>URL Vimeo</label>
                            <input
                              className={inputClass}
                              value={recurso.videoUrl}
                              onChange={(e) => update(index, { videoUrl: e.target.value })}
                              placeholder="https://vimeo.com/..."
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Vimeo video ID</label>
                            <input
                              className={inputClass}
                              value={recurso.videoId}
                              onChange={(e) => update(index, { videoId: e.target.value })}
                              placeholder="123456789"
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Duración (minutos)</label>
                            <input
                              type="number"
                              min={0}
                              className={inputClass}
                              value={minutes}
                              onChange={(e) => {
                                const min = e.target.value === '' ? 0 : Number(e.target.value);
                                update(index, { duration: min > 0 ? Math.round(min * 60) : 0 });
                              }}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Thumbnail (URL)</label>
                            <input
                              className={inputClass}
                              value={recurso.videoThumbnail}
                              onChange={(e) => update(index, { videoThumbnail: e.target.value })}
                              placeholder="Opcional"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-2">
                          <CloudinaryFileField
                            label="Archivo"
                            url={recurso.archivoUrl}
                            filename={recurso.archivoNombre}
                            accept="application/pdf,.pdf,image/*,.zip,.doc,.docx"
                            onUploaded={(file) =>
                              update(index, {
                                archivoUrl: file.url,
                                archivoNombre: file.filename,
                                archivoPublicId: file.publicId,
                                archivoResourceType: file.resourceType,
                              })
                            }
                            onUrlChange={(archivoUrl) => update(index, { archivoUrl })}
                            onClear={() =>
                              update(index, {
                                archivoUrl: '',
                                archivoNombre: '',
                                archivoPublicId: '',
                                archivoResourceType: '',
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        onClick={create}
      >
        Crear recurso
      </button>
    </div>
  );
}
