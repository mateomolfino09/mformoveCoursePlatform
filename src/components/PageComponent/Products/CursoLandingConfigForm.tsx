'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CursoClaseContenidoFields from './CursoClaseContenidoFields';
import {
  CursoClaseContenido,
  CursoFaqItem,
  CursoHighlight,
  CursoLandingConfig,
  CursoModuloContenido,
  CursoModuloLanding,
  CursoOfferBlock,
  CursoOutcome,
  CursoPrecioPreventa,
  CursoTestimonioEscrito,
  CursoTestimonioGrabado,
  createDefaultClaseContenido,
  normalizeClaseContenido,
  createDefaultPrecioPreventa,
  createDefaultTestimonioEscrito,
  normalizeCloudinaryAssetId,
  normalizeCursoLandingConfig,
  syncContenidoModulosFromHighlights,
} from '../../../types/cursoLanding';
import {
  fromDatetimeLocalValue,
  isCursoEnPreventa,
  toDatetimeLocalValue,
} from '../../../lib/cursoLandingPublication';

type Props = {
  value: CursoLandingConfig;
  onChange: (next: CursoLandingConfig) => void;
  productName?: string;
};

const inputClass =
  'input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors w-full';
const textareaClass =
  'input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors w-full min-h-[88px]';
const labelClass = 'text-sm font-medium text-gray-700';
const sectionClass = 'border border-gray-200 rounded-xl p-5 space-y-4 bg-white/70';
const addButtonClass =
  'rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50';
const dangerButtonClass = 'text-sm font-medium text-red-600 hover:text-red-700';

const MIN_BETWEEN_HERO_PARRAFOS = 3;
const MIN_PLAN_VALUE_PARRAFOS = 3;

const paragraphSlots = (items: string[], min: number) =>
  Array.from({ length: Math.max(min, items.length) }, (_, index) => items[index] ?? '');

const trimParagraphs = (items: string[]) => {
  const next = [...items];
  while (next.length > 0 && !next[next.length - 1]?.trim()) {
    next.pop();
  }
  return next;
};

function Section({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className={sectionClass} open={defaultOpen}>
      <summary className="cursor-pointer list-none">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </summary>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

const cloudinaryHelp =
  'Public ID de Cloudinary (ej. my_uploads/fondos/DSC01642_rioxq5) o URL completa del asset.';

export function createInitialCursoLandingConfig(productName?: string) {
  return normalizeCursoLandingConfig(undefined, productName || 'Cuerpo autónomo');
}

export default function CursoLandingConfigForm({ value, onChange, productName }: Props) {
  const patch = (partial: Partial<CursoLandingConfig>) => onChange({ ...value, ...partial });

  const patchNested = <K extends keyof CursoLandingConfig>(
    key: K,
    partial: Partial<NonNullable<CursoLandingConfig[K]>>
  ) => {
    onChange({
      ...value,
      [key]: {
        ...(value[key] as object),
        ...partial,
      },
    });
  };

  const updateWritten = (index: number, partial: Partial<CursoTestimonioEscrito>) => {
    const next = value.testimoniosEscritos.map((item, i) =>
      i === index ? { ...item, ...partial } : item
    );
    patch({ testimoniosEscritos: next });
  };

  const updateRecorded = (index: number, partial: Partial<CursoTestimonioGrabado>) => {
    const next = value.testimoniosGrabados.map((item, i) =>
      i === index ? { ...item, ...partial } : item
    );
    patch({ testimoniosGrabados: next });
  };

  const updateFaq = (index: number, partial: Partial<CursoFaqItem>) => {
    const next = value.faq.items.map((item, i) => (i === index ? { ...item, ...partial } : item));
    patchNested('faq', { items: next });
  };

  const updateOutcome = (index: number, partial: Partial<CursoOutcome>) => {
    const next = value.outcomes.items.map((item, i) => (i === index ? { ...item, ...partial } : item));
    patchNested('outcomes', { items: next });
  };

  const syncModulosContenido = (highlightItems: CursoHighlight[]) => {
    patch({
      contenidoModulos: syncContenidoModulosFromHighlights(
        highlightItems,
        value.contenidoModulos
      ),
    });
  };

  const updateHighlight = (index: number, partial: Partial<CursoHighlight>) => {
    const next = value.highlights.items.map((item, i) => (i === index ? { ...item, ...partial } : item));
    patchNested('highlights', { items: next });
    syncModulosContenido(next);
  };

  const updatePrecioPreventa = (index: number, partial: Partial<CursoPrecioPreventa>) => {
    const next = value.preciosPreventa.map((item, i) =>
      i === index ? { ...item, ...partial } : item
    );
    patch({ preciosPreventa: next });
  };

  const updateModuloContenido = (index: number, partial: Partial<CursoModuloContenido>) => {
    const next = value.contenidoModulos.map((item, i) =>
      i === index ? { ...item, ...partial } : item
    );
    patch({ contenidoModulos: next });
  };

  const updateClaseContenido = (
    moduloIndex: number,
    claseIndex: number,
    partial: Partial<CursoClaseContenido>
  ) => {
    const mod = value.contenidoModulos[moduloIndex];
    if (!mod) return;
    const clases = mod.clases.map((c, i) => (i === claseIndex ? { ...c, ...partial } : c));
    updateModuloContenido(moduloIndex, { clases });
  };

  /** Clon de clase sin courseClassId → nuevo CourseClass al guardar. */
  const cloneClaseContenidoSinId = (clase: CursoClaseContenido, order: number): CursoClaseContenido => {
    const n = normalizeClaseContenido(clase, order);
    return {
      name: n.name,
      description: n.description,
      videoUrl: n.videoUrl,
      videoId: n.videoId,
      videoThumbnail: n.videoThumbnail,
      duration: n.duration,
      level: n.level,
      order,
      materials: [...n.materials],
      visibleInLibrary: n.visibleInLibrary,
    };
  };

  const duplicateClasesInModulo = (moduloIndex: number) => {
    const mod = value.contenidoModulos[moduloIndex];
    if (!mod?.clases?.length) return;

    const copias = mod.clases.map((clase, i) =>
      cloneClaseContenidoSinId(clase, mod.clases.length + i)
    );
    const nextModulos = value.contenidoModulos.map((item, i) =>
      i === moduloIndex ? { ...item, clases: [...item.clases, ...copias] } : item
    );
    patch({ contenidoModulos: nextModulos });
  };

  const duplicateClaseInModulo = (moduloIndex: number, claseIndex: number) => {
    const mod = value.contenidoModulos[moduloIndex];
    const clase = mod?.clases[claseIndex];
    if (!clase) return;

    const copia = cloneClaseContenidoSinId(clase, claseIndex + 1);
    const clases = [...mod.clases];
    clases.splice(claseIndex + 1, 0, copia);
    const clasesOrdenadas = clases.map((c, i) => ({ ...c, order: i }));
    updateModuloContenido(moduloIndex, { clases: clasesOrdenadas });
  };

  /** Copia clases al módulo siguiente (sin courseClassId → nuevos CourseClass al guardar). */
  const copyClasesToNextModulo = (moduloIndex: number) => {
    const source = value.contenidoModulos[moduloIndex];
    const nextIndex = moduloIndex + 1;
    const target = value.contenidoModulos[nextIndex];
    if (!source?.clases?.length || !target) return;

    const copias = source.clases.map((clase, i) =>
      cloneClaseContenidoSinId(clase, target.clases.length + i)
    );

    const nextModulos = value.contenidoModulos.map((item, i) =>
      i === nextIndex
        ? {
            ...item,
            bundleTipo: 'videos' as const,
            clases: [...item.clases, ...copias],
          }
        : item
    );
    patch({ contenidoModulos: nextModulos });
  };

  const enPreventa = isCursoEnPreventa({
    publicado: value.publicado,
    fechaPublicacion: value.fechaPublicacion,
  });

  const updateOffer = (index: number, partial: Partial<CursoOfferBlock>) => {
    const next = value.queIncluye.offerBlocks.map((item, i) =>
      i === index ? { ...item, ...partial } : item
    );
    patchNested('queIncluye', { offerBlocks: next });
  };

  const updateModule = (index: number, partial: Partial<CursoModuloLanding>) => {
    const next = value.queIncluye.modulos.map((item, i) => {
      if (i !== index) return item;
      const merged = { ...item, ...partial };
      if (partial.imagenPublicId !== undefined) {
        merged.imagenPublicId = normalizeCloudinaryAssetId(partial.imagenPublicId);
      }
      return merged;
    });
    patchNested('queIncluye', { modulos: next });
  };

  return (
    <motion.div className="space-y-6">
      <Section
        title="Publicación y ruta"
        description="Definí cuándo se publica la landing y cómo se accede desde /curso/slug."
        defaultOpen
      >
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Slug de la landing (URL)">
            <input
              className={inputClass}
              value={value.slug}
              onChange={(e) => patch({ slug: e.target.value.trim().toLowerCase() })}
              placeholder="cuerpo-autonomo"
            />
          </Field>
          <Field label="Galería Vimeo del curso (ID o link)">
            <input
              className={inputClass}
              value={value.vimeoGaleriaId}
              onChange={(e) => patch({ vimeoGaleriaId: e.target.value })}
              placeholder="ID o URL de showcase"
            />
          </Field>
          <Field label="Fecha y hora de publicación programada">
            <input
              type="datetime-local"
              className={`${inputClass} ${value.publicado ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
              value={toDatetimeLocalValue(value.fechaPublicacion)}
              onChange={(e) => patch({ fechaPublicacion: fromDatetimeLocalValue(e.target.value) })}
              disabled={value.publicado}
            />
            <p className="mt-2 text-xs text-gray-500">
              {value.publicado
                ? 'La landing ya está publicada manualmente; la fecha programada no aplica.'
                : 'Opcional. Si la landing no está publicada manualmente, un cron diario la activará al llegar esta fecha y hora. La ruta pública también se habilita en el momento si alguien entra antes de que corra el cron.'}
            </p>
          </Field>
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={value.publicado}
                onChange={(e) => patch({ publicado: e.target.checked })}
              />
              <span className={labelClass}>Landing publicada</span>
            </span>
            <span className="text-xs text-gray-500">
              Publicación inmediata. Si está desmarcada y hay fecha programada, la landing queda en preventa hasta ese momento.
              Ruta pública: <code>/curso/{value.slug || 'slug'}</code>.
            </span>
          </label>
        </motion.div>
      </Section>

      <Section
        title="Precios de preventa"
        description={
          enPreventa
            ? 'Solo aplica mientras la fecha de lanzamiento sea futura. Se usa el tier con fecha fin más próxima que tenga cupo.'
            : 'Programá una fecha de lanzamiento futura para habilitar tiers de preventa.'
        }
      >
        {!enPreventa ? (
          <p className="text-sm text-gray-500">
            La preventa se activa cuando la landing no está publicada manualmente y la fecha de
            lanzamiento programada es posterior a hoy.
          </p>
        ) : (
          <motion.div className="space-y-4">
            {value.preciosPreventa.map((tier, index) => (
              <motion.div
                key={`preventa-${index}`}
                className="space-y-3 rounded-lg border border-amber-200/80 bg-amber-50/40 p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Etiqueta del tier">
                    <input
                      className={inputClass}
                      value={tier.etiqueta}
                      onChange={(e) => updatePrecioPreventa(index, { etiqueta: e.target.value })}
                    />
                  </Field>
                  <Field label="Monto (USD o moneda)">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={inputClass}
                      value={tier.monto || ''}
                      onChange={(e) =>
                        updatePrecioPreventa(index, { monto: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Moneda">
                    <input
                      className={inputClass}
                      value={tier.moneda}
                      onChange={(e) => updatePrecioPreventa(index, { moneda: e.target.value })}
                    />
                  </Field>
                  <Field label="Fecha fin del tier">
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={toDatetimeLocalValue(tier.fechaFin)}
                      onChange={(e) =>
                        updatePrecioPreventa(index, {
                          fechaFin: fromDatetimeLocalValue(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Cupos límite">
                    <input
                      type="number"
                      min={1}
                      className={inputClass}
                      value={tier.cuposLimite}
                      onChange={(e) =>
                        updatePrecioPreventa(index, {
                          cuposLimite: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </Field>
                  <Field label="Cupos usados (solo lectura en creación)">
                    <input
                      type="number"
                      min={0}
                      className={`${inputClass} bg-gray-100`}
                      value={tier.cuposUsados}
                      readOnly
                    />
                  </Field>
                </div>
                <Field label="Descripción">
                  <textarea
                    className={textareaClass}
                    value={tier.descripcion}
                    onChange={(e) => updatePrecioPreventa(index, { descripcion: e.target.value })}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={tier.activo}
                    onChange={(e) => updatePrecioPreventa(index, { activo: e.target.checked })}
                  />
                  Tier activo
                </label>
                {tier.opcionesPago.length > 0 ? (
                  <motion.div className="rounded-md border border-gray-200 bg-white p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">Links (se generan al crear el producto)</p>
                    {tier.opcionesPago.map((plan) => (
                      <p key={`${index}-${plan.proveedor}`} className="text-xs text-gray-600 break-all">
                        {plan.etiqueta}: {plan.paymentLink || '—'}
                      </p>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Al guardar el producto se generan links Stripe/dLocal para este monto.
                  </p>
                )}
                <button
                  type="button"
                  className={dangerButtonClass}
                  onClick={() =>
                    patch({
                      preciosPreventa: value.preciosPreventa.filter((_, i) => i !== index),
                    })
                  }
                >
                  Eliminar tier de preventa
                </button>
              </motion.div>
            ))}
            <button
              type="button"
              className={addButtonClass}
              onClick={() =>
                patch({
                  preciosPreventa: [
                    ...value.preciosPreventa,
                    createDefaultPrecioPreventa(value.preciosPreventa.length),
                  ],
                })
              }
            >
              Agregar tier de preventa
            </button>
          </motion.div>
        )}
      </Section>

      <Section title="Hero" description="Video principal, CTA y navegación hacia planes.">
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Video de presentación (Vimeo ID)">
            <input
              className={inputClass}
              value={value.hero.videoPresentacionVimeoId}
              onChange={(e) => patchNested('hero', { videoPresentacionVimeoId: e.target.value })}
            />
          </Field>
          <Field label="Tagline del hero">
            <input
              className={inputClass}
              value={value.hero.tagline}
              onChange={(e) => patchNested('hero', { tagline: e.target.value })}
            />
          </Field>
          <Field label="Texto del botón principal">
            <input
              className={inputClass}
              value={value.hero.ctaTexto}
              onChange={(e) => patchNested('hero', { ctaTexto: e.target.value })}
            />
          </Field>
          <Field label="Subcopy bajo el botón">
            <textarea
              className={textareaClass}
              value={value.hero.ctaSubcopy}
              onChange={(e) => patchNested('hero', { ctaSubcopy: e.target.value })}
            />
          </Field>
          <Field label="Ruta si el usuario ya está suscripto">
            <input
              className={inputClass}
              value={value.hero.rutaUsuarioSuscriptor}
              onChange={(e) => patchNested('hero', { rutaUsuarioSuscriptor: e.target.value })}
            />
          </Field>
          <Field label="Ancla de planes (id HTML)">
            <input
              className={inputClass}
              value={value.hero.anclaPlanesId}
              onChange={(e) => patchNested('hero', { anclaPlanesId: e.target.value })}
            />
          </Field>
        </motion.div>
      </Section>

      <Section title="Navegación móvil" description="CTA de la barra inferior en móvil.">
        <Field label="Texto del botón principal">
          <input
            className={inputClass}
            value={value.navegacion.ctaBarraMovil}
            onChange={(e) => patchNested('navegacion', { ctaBarraMovil: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="Testimonios escritos" description="Tarjetas con foto, nombre y copy de alumnos.">
        <motion.div className="space-y-4">
          {value.testimoniosEscritos.map((item, index) => (
            <motion.div key={`written-${index}`} className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nombre">
                  <input className={inputClass} value={item.nombre} onChange={(e) => updateWritten(index, { nombre: e.target.value })} />
                </Field>
                <Field label="Etiqueta de plan">
                  <input className={inputClass} value={item.planEtiqueta} onChange={(e) => updateWritten(index, { planEtiqueta: e.target.value })} />
                </Field>
                <Field label="Imagen (public ID Cloudinary)">
                  <input className={inputClass} value={item.imagenUrl} onChange={(e) => updateWritten(index, { imagenUrl: e.target.value })} />
                </Field>
              </div>
              <Field label="Texto del testimonio">
                <textarea className={textareaClass} value={item.texto} onChange={(e) => updateWritten(index, { texto: e.target.value })} />
              </Field>
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() =>
                  patch({ testimoniosEscritos: value.testimoniosEscritos.filter((_, i) => i !== index) })
                }
              >
                Eliminar testimonio
              </button>
            </motion.div>
          ))}
          <button
            type="button"
            className={addButtonClass}
            onClick={() =>
              patch({
                testimoniosEscritos: [
                  ...value.testimoniosEscritos,
                  createDefaultTestimonioEscrito(
                    value.testimoniosEscritos.length,
                    productName || 'Curso'
                  ),
                ],
              })
            }
          >
            Agregar testimonio escrito
          </button>
        </motion.div>
      </Section>

      <Section title="Testimonios grabados" description="Videos de Vimeo con poster opcional.">
        <motion.div className="space-y-4">
          {value.testimoniosGrabados.map((item, index) => (
            <motion.div key={`recorded-${index}`} className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Vimeo ID">
                  <input className={inputClass} value={item.videoVimeoId} onChange={(e) => updateRecorded(index, { videoVimeoId: e.target.value })} />
                </Field>
                <Field label="Título (opcional)">
                  <input className={inputClass} value={item.titulo || ''} onChange={(e) => updateRecorded(index, { titulo: e.target.value })} />
                </Field>
                <Field label="Poster (URL opcional)">
                  <input className={inputClass} value={item.posterUrl || ''} onChange={(e) => updateRecorded(index, { posterUrl: e.target.value })} />
                </Field>
              </div>
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() =>
                  patch({ testimoniosGrabados: value.testimoniosGrabados.filter((_, i) => i !== index) })
                }
              >
                Eliminar video
              </button>
            </motion.div>
          ))}
          <button
            type="button"
            className={addButtonClass}
            onClick={() =>
              patch({
                testimoniosGrabados: [
                  ...value.testimoniosGrabados,
                  { videoVimeoId: '', titulo: '', posterUrl: '', orden: value.testimoniosGrabados.length },
                ],
              })
            }
          >
            Agregar testimonio en video
          </button>
        </motion.div>
      </Section>

      <Section title="Presentación de testimonios" description="Títulos, anclas y placeholder de la grilla de videos.">
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Título sección videos">
            <input
              className={inputClass}
              value={value.presentacionTestimonios.tituloVideos}
              onChange={(e) => patchNested('presentacionTestimonios', { tituloVideos: e.target.value })}
            />
          </Field>
          <Field label="Título sección escritos">
            <input
              className={inputClass}
              value={value.presentacionTestimonios.tituloEscritos}
              onChange={(e) => patchNested('presentacionTestimonios', { tituloEscritos: e.target.value })}
            />
          </Field>
          <Field label="Eyebrow sección escritos">
            <input
              className={inputClass}
              value={value.presentacionTestimonios.eyebrowEscritos}
              onChange={(e) => patchNested('presentacionTestimonios', { eyebrowEscritos: e.target.value })}
            />
          </Field>
          <Field label="Ancla videos (id HTML)">
            <input
              className={inputClass}
              value={value.presentacionTestimonios.anclaVideos}
              onChange={(e) => patchNested('presentacionTestimonios', { anclaVideos: e.target.value })}
            />
          </Field>
          <Field label="Ancla escritos (id HTML)">
            <input
              className={inputClass}
              value={value.presentacionTestimonios.anclaEscritos}
              onChange={(e) => patchNested('presentacionTestimonios', { anclaEscritos: e.target.value })}
            />
          </Field>
        </motion.div>
        <Field label="Placeholder sin video">
          <textarea
            className={textareaClass}
            value={value.presentacionTestimonios.textoPlaceholderVideo}
            onChange={(e) => patchNested('presentacionTestimonios', { textoPlaceholderVideo: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="Bloque intermedio y banner" description="Copy entre el hero y el resto de la landing.">
        <motion.div className="grid gap-4">
          <Field label="Eyebrow">
            <input className={inputClass} value={value.betweenHero.eyebrow} onChange={(e) => patchNested('betweenHero', { eyebrow: e.target.value })} />
          </Field>
          <Field label="Título del bloque">
            <input className={inputClass} value={value.betweenHero.titulo} onChange={(e) => patchNested('betweenHero', { titulo: e.target.value })} />
          </Field>
          <div className="flex flex-col gap-3">
            <span className={labelClass}>Párrafos del bloque</span>
            <p className="text-sm text-gray-500">
              Cada campo es un párrafo independiente en la landing (por defecto, tres bloques).
            </p>
            {paragraphSlots(value.betweenHero.parrafos, MIN_BETWEEN_HERO_PARRAFOS).map((paragraph, index) => (
              <label key={`between-hero-paragraph-${index}`} className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-600">Párrafo {index + 1}</span>
                <textarea
                  className={textareaClass}
                  value={paragraph}
                  onChange={(e) => {
                    const next = paragraphSlots(value.betweenHero.parrafos, MIN_BETWEEN_HERO_PARRAFOS);
                    next[index] = e.target.value;
                    patchNested('betweenHero', { parrafos: trimParagraphs(next) });
                  }}
                />
              </label>
            ))}
          </div>
          <Field label="Banner ancho completo">
            <textarea className={textareaClass} value={value.bannerAncho.cuerpo} onChange={(e) => patchNested('bannerAncho', { cuerpo: e.target.value })} />
          </Field>
        </motion.div>
      </Section>

      <Section title="Intro, resultados y timeline" description="Sección explicativa, outcomes y pasos del método.">
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Intro — título">
            <input className={inputClass} value={value.introHighlights.titulo} onChange={(e) => patchNested('introHighlights', { titulo: e.target.value })} />
          </Field>
          <Field label="Intro — subtítulo">
            <input className={inputClass} value={value.introHighlights.subtitulo} onChange={(e) => patchNested('introHighlights', { subtitulo: e.target.value })} />
          </Field>
          <Field label="Intro — imagen móvil (Cloudinary)">
            <input className={inputClass} value={value.introHighlights.imagenMobilePublicId} onChange={(e) => patchNested('introHighlights', { imagenMobilePublicId: e.target.value })} />
          </Field>
          <Field label="Intro — imagen desktop (Cloudinary)">
            <input className={inputClass} value={value.introHighlights.imagenDesktopPublicId} onChange={(e) => patchNested('introHighlights', { imagenDesktopPublicId: e.target.value })} />
          </Field>
          <Field label="Intro — texto alternativo de imagen">
            <input className={inputClass} value={value.introHighlights.imagenAlt} onChange={(e) => patchNested('introHighlights', { imagenAlt: e.target.value })} />
          </Field>
          <Field label="Outcomes — imagen (Cloudinary)">
            <input className={inputClass} value={value.outcomes.imagenPublicId} onChange={(e) => patchNested('outcomes', { imagenPublicId: e.target.value })} />
          </Field>
          <Field label="Outcomes — texto alternativo de imagen">
            <input className={inputClass} value={value.outcomes.imagenAlt} onChange={(e) => patchNested('outcomes', { imagenAlt: e.target.value })} />
          </Field>
          <Field label="Outcomes — título de sección">
            <input className={inputClass} value={value.outcomes.titulo} onChange={(e) => patchNested('outcomes', { titulo: e.target.value })} />
          </Field>
        </motion.div>
        <Field label="Intro — cuerpo">
          <textarea className={textareaClass} value={value.introHighlights.cuerpo} onChange={(e) => patchNested('introHighlights', { cuerpo: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <p className={labelClass}>Resultados esperados</p>
          {value.outcomes.items.map((item, index) => (
            <motion.div key={`outcome-${index}`} className="grid gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-2">
              <input className={inputClass} placeholder="Título" value={item.titulo} onChange={(e) => updateOutcome(index, { titulo: e.target.value })} />
              <input className={inputClass} placeholder="Descripción" value={item.cuerpo} onChange={(e) => updateOutcome(index, { cuerpo: e.target.value })} />
              <button type="button" className={`${dangerButtonClass} md:col-span-2`} onClick={() => patchNested('outcomes', { items: value.outcomes.items.filter((_, i) => i !== index) })}>
                Eliminar resultado
              </button>
            </motion.div>
          ))}
          <button type="button" className={addButtonClass} onClick={() => patchNested('outcomes', { items: [...value.outcomes.items, { titulo: '', cuerpo: '' }] })}>
            Agregar resultado
          </button>
        </div>
        <div className="space-y-3">
          <p className={labelClass}>Timeline / highlights</p>
          <motion.div className="grid gap-4 md:grid-cols-2">
            <Field label="Timeline — título 1">
              <input
                className={inputClass}
                value={value.highlights.titulos[0] || ''}
                onChange={(e) => {
                  const titulos = [...value.highlights.titulos];
                  titulos[0] = e.target.value;
                  patchNested('highlights', { titulos });
                }}
              />
            </Field>
            <Field label="Timeline — título 2">
              <input
                className={inputClass}
                value={value.highlights.titulos[1] || ''}
                onChange={(e) => {
                  const titulos = [...value.highlights.titulos];
                  titulos[1] = e.target.value;
                  patchNested('highlights', { titulos });
                }}
              />
            </Field>
            <Field label="Timeline — puente">
              <input
                className={inputClass}
                value={value.highlights.puente}
                onChange={(e) => patchNested('highlights', { puente: e.target.value })}
              />
            </Field>
            <Field label="CTA timeline — eyebrow">
              <input
                className={inputClass}
                value={value.highlights.ctaEyebrow}
                onChange={(e) => patchNested('highlights', { ctaEyebrow: e.target.value })}
              />
            </Field>
            <Field label="CTA timeline — título">
              <input
                className={inputClass}
                value={value.highlights.ctaTitulo}
                onChange={(e) => patchNested('highlights', { ctaTitulo: e.target.value })}
              />
            </Field>
            <Field label="CTA timeline — botón">
              <input
                className={inputClass}
                value={value.highlights.ctaBoton}
                onChange={(e) => patchNested('highlights', { ctaBoton: e.target.value })}
              />
            </Field>
            <Field label="CTA timeline — imagen (Cloudinary)">
              <input
                className={inputClass}
                value={value.highlights.ctaImagenPublicId}
                onChange={(e) => patchNested('highlights', { ctaImagenPublicId: e.target.value })}
              />
            </Field>
          </motion.div>
          <Field label="CTA timeline — descripción">
            <textarea
              className={textareaClass}
              value={value.highlights.ctaDescripcion}
              onChange={(e) => patchNested('highlights', { ctaDescripcion: e.target.value })}
            />
          </Field>
          {value.highlights.items.map((item, index) => (
            <motion.div key={`highlight-${index}`} className="space-y-2 rounded-lg border border-gray-200 p-3">
              <input className={inputClass} placeholder="Título" value={item.titulo} onChange={(e) => updateHighlight(index, { titulo: e.target.value })} />
              <input className={inputClass} placeholder="Resumen" value={item.resumen} onChange={(e) => updateHighlight(index, { resumen: e.target.value })} />
              <textarea className={textareaClass} placeholder="Detalle" value={item.detalle} onChange={(e) => updateHighlight(index, { detalle: e.target.value })} />
              <input
                className={inputClass}
                placeholder="Cloudinary public ID — imagen del ítem (opcional)"
                value={item.imagenPublicId ?? ''}
                onChange={(e) => updateHighlight(index, { imagenPublicId: e.target.value })}
              />
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() => {
                  const items = value.highlights.items.filter((_, i) => i !== index);
                  patchNested('highlights', { items });
                  syncModulosContenido(items);
                }}
              >
                Eliminar ítem
              </button>
            </motion.div>
          ))}
          <button
            type="button"
            className={addButtonClass}
            onClick={() => {
              const items = [
                ...value.highlights.items,
                { titulo: '', resumen: '', detalle: '', imagenPublicId: '' },
              ];
              patchNested('highlights', { items });
              syncModulosContenido(items);
            }}
          >
            Agregar highlight
          </button>
        </div>
      </Section>

      <Section
        title="Módulos de contenido"
        description="Se sincronizan con el timeline (por defecto los 5 módulos de Cuerpo autónomo). Debajo de cada módulo agregá clases con el mismo formato que las clases de módulo de biblioteca: video, nivel, materiales, etc."
      >
        {value.contenidoModulos.length === 0 ? (
          <p className="text-sm text-gray-500">
            Agregá ítems en el timeline para configurar los bundles de clases.
          </p>
        ) : (
          <motion.div className="space-y-6">
            {value.contenidoModulos.map((modulo, moduloIndex) => (
              <motion.div
                key={`contenido-mod-${modulo.timelineIndex}`}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Módulo {moduloIndex + 1}: {modulo.titulo || 'Sin título'}
                </p>
                <motion.div className="grid gap-4 md:grid-cols-2">
                  <Field label="Tipo de bundle">
                    <select
                      className={inputClass}
                      value={modulo.bundleTipo}
                      onChange={(e) =>
                        updateModuloContenido(moduloIndex, {
                          bundleTipo: e.target.value as 'vimeo_playlist' | 'videos',
                        })
                      }
                    >
                      <option value="videos">Videos individuales (Vimeo ID por clase)</option>
                      <option value="vimeo_playlist">Playlist / showcase Vimeo</option>
                    </select>
                  </Field>
                  {modulo.bundleTipo === 'vimeo_playlist' ? (
                    <Field label="ID playlist / showcase Vimeo">
                      <input
                        className={inputClass}
                        value={modulo.vimeoPlaylistId}
                        onChange={(e) =>
                          updateModuloContenido(moduloIndex, { vimeoPlaylistId: e.target.value })
                        }
                        placeholder="Ej. 12345678 o URL del showcase"
                      />
                    </Field>
                  ) : null}
                </motion.div>
                {modulo.bundleTipo === 'videos' ? (
                  <motion.div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={labelClass}>Clases del módulo (CourseClass)</p>
                      {modulo.clases.length > 0 ? (
                        <motion.div className="flex flex-wrap gap-x-4 gap-y-1">
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
                            onClick={() => duplicateClasesInModulo(moduloIndex)}
                            title={`Duplica ${modulo.clases.length} clase(s) al final de este módulo`}
                          >
                            Duplicar {modulo.clases.length} clase{modulo.clases.length === 1 ? '' : 's'} en
                            este módulo
                          </button>
                          {moduloIndex < value.contenidoModulos.length - 1 ? (
                            <button
                              type="button"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
                              onClick={() => copyClasesToNextModulo(moduloIndex)}
                              title={`Duplica ${modulo.clases.length} clase(s) al final del módulo ${moduloIndex + 2}`}
                            >
                              Copiar {modulo.clases.length} clase{modulo.clases.length === 1 ? '' : 's'} al
                              módulo {moduloIndex + 2}
                            </button>
                          ) : null}
                        </motion.div>
                      ) : null}
                    </div>
                    {modulo.clases.map((clase, claseIndex) => (
                      <CursoClaseContenidoFields
                        key={`clase-${moduloIndex}-${claseIndex}-${clase.courseClassId || claseIndex}`}
                        clase={normalizeClaseContenido(clase, claseIndex)}
                        claseIndex={claseIndex}
                        onChange={(partial) => updateClaseContenido(moduloIndex, claseIndex, partial)}
                        onDuplicate={() => duplicateClaseInModulo(moduloIndex, claseIndex)}
                        onRemove={() => {
                          const clases = modulo.clases.filter((_, i) => i !== claseIndex);
                          updateModuloContenido(moduloIndex, { clases });
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      className={addButtonClass}
                      onClick={() => {
                        updateModuloContenido(moduloIndex, {
                          clases: [
                            ...modulo.clases,
                            createDefaultClaseContenido(modulo.clases.length),
                          ],
                        });
                      }}
                    >
                      Agregar clase
                    </button>
                  </motion.div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Con playlist Vimeo el alumno verá el showcase configurado; no hace falta listar
                    cada video.
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </Section>

      <Section title="Qué incluye" description="Bloques de valor y módulos del método con imágenes de Cloudinary.">
        <Field label="Título de sección">
          <input className={inputClass} value={value.queIncluye.titulo} onChange={(e) => patchNested('queIncluye', { titulo: e.target.value })} />
        </Field>
        <Field label="Ancla de sección (id HTML)">
          <input className={inputClass} value={value.queIncluye.anclaId} onChange={(e) => patchNested('queIncluye', { anclaId: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <p className={labelClass}>Bloques de oferta</p>
          <p className="text-sm text-gray-500">Cada bloque usa iconKey: book, video, live o community.</p>
          {value.queIncluye.offerBlocks.map((block, index) => (
            <motion.div key={`offer-${index}`} className="space-y-2 rounded-lg border border-gray-200 p-3">
              <input className={inputClass} placeholder="Líneas (separadas por |)" value={block.lineas.join(' | ')} onChange={(e) => updateOffer(index, { lineas: e.target.value.split('|').map((s) => s.trim()).filter(Boolean) })} />
              <input className={inputClass} placeholder="Hint" value={block.hint} onChange={(e) => updateOffer(index, { hint: e.target.value })} />
              <input className={inputClass} placeholder="iconKey (book, video, live, community)" value={block.iconKey} onChange={(e) => updateOffer(index, { iconKey: e.target.value })} />
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="Índice de línea destacada (opcional)"
                value={block.lineaDestacadaIndice ?? ''}
                onChange={(e) =>
                  updateOffer(index, {
                    lineaDestacadaIndice: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              />
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() =>
                  patchNested('queIncluye', {
                    offerBlocks: value.queIncluye.offerBlocks.filter((_, i) => i !== index),
                  })
                }
              >
                Eliminar bloque
              </button>
            </motion.div>
          ))}
          <button
            type="button"
            className={addButtonClass}
            onClick={() =>
              patchNested('queIncluye', {
                offerBlocks: [
                  ...value.queIncluye.offerBlocks,
                  { lineas: [''], hint: '', iconKey: 'book' },
                ],
              })
            }
          >
            Agregar bloque de oferta
          </button>
        </div>
        <div className="space-y-3">
          <p className={labelClass}>Módulos del método</p>
          <p className="text-sm text-gray-500">{cloudinaryHelp}</p>
          {value.queIncluye.modulos.map((mod, index) => (
            <motion.div key={`module-${index}`} className="space-y-2 rounded-lg border border-gray-200 p-3">
              <Field label="Título del módulo">
                <input className={inputClass} value={mod.titulo} onChange={(e) => updateModule(index, { titulo: e.target.value })} />
              </Field>
              <Field label="Descripción">
                <textarea className={textareaClass} value={mod.descripcion} onChange={(e) => updateModule(index, { descripcion: e.target.value })} />
              </Field>
              <Field label="Imagen Cloudinary">
                <input className={inputClass} value={mod.imagenPublicId} onChange={(e) => updateModule(index, { imagenPublicId: e.target.value })} />
              </Field>
              <button type="button" className={dangerButtonClass} onClick={() => patchNested('queIncluye', { modulos: value.queIncluye.modulos.filter((_, i) => i !== index) })}>
                Eliminar módulo
              </button>
            </motion.div>
          ))}
          <button type="button" className={addButtonClass} onClick={() => patchNested('queIncluye', { modulos: [...value.queIncluye.modulos, { titulo: '', descripcion: '', imagenPublicId: '' }] })}>
            Agregar módulo
          </button>
        </div>
      </Section>

      <Section title="Planes y pagos" description="Copy de valor, medios de pago y mensajes de urgencia.">
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Título sección planes">
            <input className={inputClass} value={value.planes.titulo} onChange={(e) => patchNested('planes', { titulo: e.target.value })} />
          </Field>
          <Field label="Ancla de planes (id HTML)">
            <input className={inputClass} value={value.planes.anclaId} onChange={(e) => patchNested('planes', { anclaId: e.target.value })} />
          </Field>
          <Field label="Días de urgencia (countdown)">
            <input type="number" min={1} className={inputClass} value={value.planes.diasUrgencia} onChange={(e) => patchNested('planes', { diasUrgencia: Number(e.target.value) || 7 })} />
          </Field>
          <Field label="Etiqueta formas de pago">
            <input className={inputClass} value={value.planes.etiquetaFormasPago} onChange={(e) => patchNested('planes', { etiquetaFormasPago: e.target.value })} />
          </Field>
          <Field label="Imagen medios de pago (URL)">
            <input className={inputClass} value={value.planes.imagenPagosUrl} onChange={(e) => patchNested('planes', { imagenPagosUrl: e.target.value })} />
          </Field>
          <Field label="Imagen medios de pago (alt)">
            <input className={inputClass} value={value.planes.imagenPagosAlt} onChange={(e) => patchNested('planes', { imagenPagosAlt: e.target.value })} />
          </Field>
          <Field label="Email sin planes">
            <input className={inputClass} value={value.planes.emailSinPlanes} onChange={(e) => patchNested('planes', { emailSinPlanes: e.target.value })} />
          </Field>
          <Field label="CTA sin planes">
            <input className={inputClass} value={value.planes.ctaSinPlanes} onChange={(e) => patchNested('planes', { ctaSinPlanes: e.target.value })} />
          </Field>
        </motion.div>
        <Field label="Copy Uruguay y Latinoamérica">
          <textarea className={textareaClass} value={value.planes.copyUruguayLatam} onChange={(e) => patchNested('planes', { copyUruguayLatam: e.target.value })} />
        </Field>
        <Field label="Copy resto del mundo">
          <textarea className={textareaClass} value={value.planes.copyRestoMundo} onChange={(e) => patchNested('planes', { copyRestoMundo: e.target.value })} />
        </Field>
        <Field label="Copy cuotas con tarjeta">
          <textarea className={textareaClass} value={value.planes.copyCuotasTarjeta} onChange={(e) => patchNested('planes', { copyCuotasTarjeta: e.target.value })} />
        </Field>
        <Field label="Mensaje sin planes activos">
          <textarea className={textareaClass} value={value.planes.mensajeSinPlanes} onChange={(e) => patchNested('planes', { mensajeSinPlanes: e.target.value })} />
        </Field>
        <motion.div className="flex flex-col gap-3">
          <span className={labelClass}>Párrafos de valor (planes)</span>
          <p className="text-sm text-gray-500">Cada campo es un párrafo independiente sobre el valor del programa.</p>
          {paragraphSlots(value.planes.parrafosValor, MIN_PLAN_VALUE_PARRAFOS).map((paragraph, index) => (
            <label key={`plan-value-paragraph-${index}`} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-600">Párrafo {index + 1}</span>
              <textarea
                className={textareaClass}
                value={paragraph}
                onChange={(e) => {
                  const next = paragraphSlots(value.planes.parrafosValor, MIN_PLAN_VALUE_PARRAFOS);
                  next[index] = e.target.value;
                  patchNested('planes', { parrafosValor: trimParagraphs(next) });
                }}
              />
            </label>
          ))}
        </motion.div>
        {value.planes.opcionesPago.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <p className={labelClass}>Links de pago del curso</p>
            <p className="text-sm text-gray-500">
              Se generan al crear el producto. La landing usa estos planes en lugar de getPlans.
            </p>
            {value.planes.opcionesPago.map((plan) => (
              <motion.div key={plan.proveedor} className="rounded-md border border-gray-200 bg-white p-3 space-y-1">
                <p className="text-sm font-medium text-gray-900">{plan.etiqueta}</p>
                <p className="text-xs text-gray-600 break-all">{plan.paymentLink}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Al crear el curso se genera automáticamente el link de pago único con Stripe.
          </p>
        )}
      </Section>

      <Section
        title="WhatsApp — contacto"
        description="Enlace fijo del banner (hablar con Mateo). No es la invitación al grupo del curso."
      >
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Título">
            <input className={inputClass} value={value.whatsapp.titulo} onChange={(e) => patchNested('whatsapp', { titulo: e.target.value })} />
          </Field>
          <Field label="Texto del botón">
            <input className={inputClass} value={value.whatsapp.ctaTexto} onChange={(e) => patchNested('whatsapp', { ctaTexto: e.target.value })} />
          </Field>
          <Field label="Imagen móvil (Cloudinary)">
            <input className={inputClass} value={value.whatsapp.imagenMobilePublicId} onChange={(e) => patchNested('whatsapp', { imagenMobilePublicId: e.target.value })} />
          </Field>
          <Field label="Imagen desktop (Cloudinary)">
            <input className={inputClass} value={value.whatsapp.imagenDesktopPublicId} onChange={(e) => patchNested('whatsapp', { imagenDesktopPublicId: e.target.value })} />
          </Field>
          <Field label="Texto alternativo de imagen">
            <input className={inputClass} value={value.whatsapp.imagenAlt} onChange={(e) => patchNested('whatsapp', { imagenAlt: e.target.value })} />
          </Field>
        </motion.div>
        <Field label="Enlace WhatsApp completo (contacto con Mateo)">
          <textarea className={textareaClass} value={value.whatsapp.enlace} onChange={(e) => patchNested('whatsapp', { enlace: e.target.value })} />
        </Field>
      </Section>

      <Section
        title="Invitación al grupo del curso"
        description="Link de invitación (chat.whatsapp.com/…) del grupo de este curso. Cambia por cada curso."
      >
        <Field label="Invitación al grupo de WhatsApp">
          <input
            className={inputClass}
            type="url"
            placeholder="https://chat.whatsapp.com/..."
            value={value.whatsapp.invitacionGrupoWhatsapp}
            onChange={(e) => patchNested('whatsapp', { invitacionGrupoWhatsapp: e.target.value })}
          />
        </Field>
      </Section>

      <Section title="FAQ" description="Preguntas frecuentes y ancla de la sección.">
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Título">
            <input className={inputClass} value={value.faq.titulo} onChange={(e) => patchNested('faq', { titulo: e.target.value })} />
          </Field>
          <Field label="Ancla FAQ (id HTML)">
            <input className={inputClass} value={value.faq.anclaId} onChange={(e) => patchNested('faq', { anclaId: e.target.value })} />
          </Field>
        </motion.div>
        <Field label="Intro FAQ">
          <textarea className={textareaClass} value={value.faq.intro} onChange={(e) => patchNested('faq', { intro: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <p className={labelClass}>Preguntas frecuentes</p>
          {value.faq.items.map((item, index) => (
            <motion.div key={`faq-${index}`} className="space-y-2 rounded-lg border border-gray-200 p-3">
              <Field label={`Pregunta ${index + 1}`}>
                <input className={inputClass} value={item.pregunta} onChange={(e) => updateFaq(index, { pregunta: e.target.value })} />
              </Field>
              <Field label="Respuesta">
                <textarea className={textareaClass} value={item.respuesta} onChange={(e) => updateFaq(index, { respuesta: e.target.value })} />
              </Field>
              <button type="button" className={dangerButtonClass} onClick={() => patchNested('faq', { items: value.faq.items.filter((_, i) => i !== index) })}>
                Eliminar pregunta
              </button>
            </motion.div>
          ))}
          <button type="button" className={addButtonClass} onClick={() => patchNested('faq', { items: [...value.faq.items, { pregunta: '', respuesta: '', orden: value.faq.items.length }] })}>
            Agregar pregunta
          </button>
        </div>
      </Section>

      <Section title="CTA final" description="Cierre de la landing antes del footer.">
        <motion.div className="grid gap-4 md:grid-cols-2">
          <Field label="Botón">
            <input className={inputClass} value={value.ctaFinal.boton} onChange={(e) => patchNested('ctaFinal', { boton: e.target.value })} />
          </Field>
          <Field label="Ancla destino (id HTML)">
            <input className={inputClass} value={value.ctaFinal.anclaId} onChange={(e) => patchNested('ctaFinal', { anclaId: e.target.value })} />
          </Field>
        </motion.div>
        <Field label="Título">
          <textarea className={textareaClass} value={value.ctaFinal.titulo} onChange={(e) => patchNested('ctaFinal', { titulo: e.target.value })} />
        </Field>
        <Field label="Cuerpo">
          <textarea className={textareaClass} value={value.ctaFinal.cuerpo} onChange={(e) => patchNested('ctaFinal', { cuerpo: e.target.value })} />
        </Field>
      </Section>
    </motion.div>
  );
}
