'use client';

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

export default function CursoRecursosAdicionalesEditor({ recursos, onChange }: Props) {
  const update = (index: number, partial: Partial<CursoRecursoAdicional>) => {
    onChange(recursos.map((item, i) => (i === index ? { ...item, ...partial } : item)));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Aparecen en la biblioteca del curso, en «Recursos para tu práctica». Pueden ser una clase
        con video o un archivo para descargar.
      </p>
      {recursos.map((recurso, index) => {
        const minutes = recurso.duration > 0 ? Math.round(recurso.duration / 60) : '';
        return (
          <div
            key={recurso.recursoId || index}
            className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">Recurso {index + 1}</p>
              <button
                type="button"
                className="text-sm font-medium text-red-600 hover:text-red-700"
                onClick={() => onChange(recursos.filter((_, i) => i !== index))}
              >
                Quitar
              </button>
            </div>
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
        );
      })}
      <button
        type="button"
        className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        onClick={() => onChange([...recursos, createDefaultRecursoAdicional(recursos.length)])}
      >
        Agregar recurso
      </button>
    </div>
  );
}
