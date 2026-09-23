'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import MainSideBar from '../../MainSidebar/MainSideBar';
import MoveCrewVideoPlayer, { type MoveCrewVideoPlayerHandle } from '../ClassPage/MoveCrewVideoPlayer';
import { landingEyebrowDark } from '../../../constants/landingSectionDesign';
import Footer from '../../Footer';
import { cloudinaryAttachmentUrl } from '../../../lib/cloudinaryFiles';
import { cursoBibliotecaPath, cursoClasePath, cursoContenidoPath, cursoRecursoPath } from '../../../lib/cursoPaths';
import { extractVimeoId, resolveCloudinaryOrHttpUrl } from '../../../lib/resolveMediaImageUrl';
import type { CursoRecursoAdicional } from '../../../types/cursoLanding';

type Modulo = {
  timelineIndex: number;
  titulo: string;
  esencia?: string;
  descripcion?: string;
  imagenPublicId?: string;
  clases?: Array<{ _id?: string; name?: string; videoThumbnail?: string }>;
};

type BibliotecaData = {
  slug: string;
  nombre: string;
  modulos: Modulo[];
  recursosAdicionales: CursoRecursoAdicional[];
  hub: {
    heroTagline?: string;
    heroHeadline?: string;
    aboutDescription?: string;
    heroThumbnailPublicId?: string;
  };
};

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg';

const ease = [0.22, 1, 0.36, 1] as const;

const btnPrimaryClass =
  'inline-flex items-center justify-center rounded-full bg-palette-ink text-palette-cream border-2 border-palette-ink font-montserrat font-semibold text-xs uppercase tracking-[0.1em] px-4 py-2 md:text-base md:tracking-[0.14em] md:px-8 md:py-3.5 hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg';

const btnSecondaryClass =
  'inline-flex items-center justify-center rounded-full bg-palette-cream text-palette-ink border-2 border-palette-ink/25 font-montserrat font-semibold text-xs uppercase tracking-[0.1em] px-4 py-2 md:text-base md:tracking-[0.14em] md:px-8 md:py-3.5 hover:bg-palette-sage hover:border-palette-sage hover:scale-[1.02] active:scale-[0.98] transition-all duration-200';

function CoverImage({ src, alt }: { src: string; alt: string }) {
  const value = src.trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return <img src={value} alt={alt} className="h-full w-full object-cover" />;
  }
  return (
    <CldImage
      src={value}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
}

function nearestItems<T>(items: T[], index: number, size = 10): T[] {
  if (index < 0 || items.length <= size) return items;
  const half = Math.floor((size - 1) / 2);
  let start = index - half;
  if (start < 0) start = 0;
  if (start + size > items.length) start = Math.max(0, items.length - size);
  return items.slice(start, start + size);
}

function LightBone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-palette-stone/15 ${className}`} />;
}

function CourseLibrarySkeleton() {
  return (
    <div className="min-h-screen bg-white font-montserrat text-palette-ink">
      <MainSideBar where="library">
        <div className="bg-white px-6 md:px-12 lg:px-16 pt-32 pb-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <LightBone className="h-4 w-40 rounded-full" />
              <LightBone className="h-16 w-4/5" />
              <LightBone className="h-6 w-3/5" />
              <div className="flex gap-3 pt-4">
                <LightBone className="h-12 w-36 rounded-full" />
                <LightBone className="h-12 w-36 rounded-full" />
              </div>
            </div>
            <LightBone className="aspect-[1.7/1] w-full" />
          </div>
        </div>
        <div className="bg-white px-6 md:px-12 lg:px-16 pb-20">
          <div className="mx-auto max-w-7xl">
            <LightBone className="mb-8 h-8 w-56" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <LightBone key={i} className="aspect-square w-full" />
              ))}
            </div>
            <LightBone className="mb-8 mt-20 h-8 w-72" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <LightBone key={i} className="aspect-video w-full" />
              ))}
            </div>
          </div>
        </div>
      </MainSideBar>
    </div>
  );
}

function visibleRecurso(recurso: CursoRecursoAdicional) {
  if (recurso.tipo === 'archivo') return Boolean(recurso.archivoUrl || recurso.archivoPublicId);
  return Boolean(recurso.titulo || recurso.videoId || recurso.videoUrl);
}

const resourceCardMotion = {
  rest: { y: 0 },
  hover: { y: -6 },
};

const resourceMediaMotion = {
  rest: { scale: 1 },
  hover: { scale: 1.07 },
};

const resourceVeilMotion = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

const resourcePlayMotion = {
  rest: { opacity: 0, scale: 0.88 },
  hover: { opacity: 1, scale: 1 },
};

function resourceEnter(index: number) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-24px' },
    transition: { duration: 0.5, delay: Math.min(index * 0.045, 0.36), ease },
  } as const;
}

export default function CourseLibrary({ slug }: { slug: string }) {
  const [data, setData] = useState<BibliotecaData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedModulo, setSelectedModulo] = useState<number | null>(null);
  const [selectedRecurso, setSelectedRecurso] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/curso/${encodeURIComponent(slug)}/contenido`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.error || 'No se pudo abrir la biblioteca');
          setData(null);
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError('No se pudo abrir la biblioteca');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <CourseLibrarySkeleton />;

  if (!data) {
    return (
      <div className="min-h-screen bg-white font-montserrat text-palette-ink">
        <MainSideBar where="library">
          <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-6 pt-28 text-center">
            <p className="text-lg text-palette-stone">{error || 'Biblioteca no disponible'}</p>
            <Link href="/iniciar-sesion" className={btnPrimaryClass}>
              Iniciar sesión
            </Link>
          </div>
        </MainSideBar>
      </div>
    );
  }

  const modulos = data.modulos || [];
  const recursos = (data.recursosAdicionales || []).filter(visibleRecurso);
  const firstClass = modulos.flatMap((mod) =>
    (mod.clases || [])
      .filter((clase) => clase._id)
      .map((clase) => ({ id: clase._id as string, modulo: mod.timelineIndex }))
  )[0];
  const heroImage = data.hub?.heroThumbnailPublicId
    ? resolveCloudinaryOrHttpUrl(data.hub.heroThumbnailPublicId)
    : '';
  const lead =
    data.hub?.heroTagline ||
    data.hub?.aboutDescription ||
    'Prácticas del programa y recursos para seguir por tu cuenta.';

  return (
    <div className="min-h-screen bg-palette-cream font-montserrat text-palette-ink">
      <MainSideBar where="library">
        <section className="bg-palette-cream px-6 pb-10 pt-28 md:px-12 md:pt-32 lg:px-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <p className="mb-4 text-sm font-light uppercase tracking-[0.28em] text-palette-stone">
                Biblioteca {data.nombre}
              </p>
              <h1 className="mb-5 text-5xl font-light leading-[1.05] tracking-tight md:text-6xl">
                Tu espacio de <span className="font-semibold italic">práctica</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg font-light leading-relaxed text-palette-stone md:text-xl">
                {lead}
              </p>
              <div className="flex flex-wrap gap-3">
                {firstClass ? (
                  <Link href={cursoClasePath(slug, firstClass.id, firstClass.modulo)} className={btnPrimaryClass}>
                    Comenzar
                  </Link>
                ) : (
                  <Link href={cursoContenidoPath(slug)} className={btnPrimaryClass}>
                    Ver contenido
                  </Link>
                )}
                <a href="#modulos" className={btnSecondaryClass}>
                  Ver módulos
                </a>
              </div>
            </motion.div>
            {heroImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease }}
                className="relative aspect-[1.75/1] overflow-hidden rounded-3xl bg-palette-stone/10 ring-1 ring-palette-stone/10"
              >
                <img src={heroImage} alt="" className="h-full w-full object-cover" />
              </motion.div>
            ) : null}
          </div>
        </section>

        <section className="bg-palette-cream px-6 py-12 md:px-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <motion.h2
              id="modulos"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
              className="mb-10 scroll-mt-24 text-2xl font-medium md:text-3xl"
            >
              Elegí un camino
            </motion.h2>
            {modulos.length === 0 ? (
              <p className="text-palette-stone">Este curso todavía no tiene módulos publicados.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                {modulos.map((mod, index) => {
                  const first = mod.clases?.find((clase) => clase._id);
                  const href = first?._id
                    ? cursoClasePath(slug, first._id, mod.timelineIndex)
                    : cursoContenidoPath(slug);
                  const image = mod.imagenPublicId || FALLBACK_IMAGE;
                  const selected = selectedModulo === mod.timelineIndex;
                  const titulo = mod.titulo || `Módulo ${mod.timelineIndex + 1}`;
                  return (
                    <motion.div
                      key={mod.timelineIndex}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.55, delay: index * 0.08, ease }}
                    >
                      <Link
                        href={href}
                        onMouseEnter={() => setSelectedModulo(mod.timelineIndex)}
                        onFocus={() => setSelectedModulo(mod.timelineIndex)}
                        onClick={() => setSelectedModulo(mod.timelineIndex)}
                        className="group flex flex-col"
                      >
                        <motion.div
                          whileHover={{ y: -6 }}
                          whileTap={{ scale: 0.985 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                          className={`relative aspect-[4/5] overflow-hidden rounded-3xl bg-palette-stone/10 ring-1 ring-palette-stone/15 ${
                            selected ? 'ring-2 ring-palette-sage shadow-[0_16px_40px_rgba(20,20,17,0.16)]' : ''
                          }`}
                        >
                          <motion.div
                            className="absolute inset-0"
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 0.6, ease }}
                          >
                            <CoverImage src={image} alt={titulo} />
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-palette-ink/75 via-palette-ink/10 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-5 text-palette-cream">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-palette-cream/70">
                              Módulo {String(index + 1).padStart(2, '0')}
                            </p>
                            <p className="mt-1 text-2xl font-medium tracking-tight">{titulo}</p>
                            {mod.esencia ? (
                              <p className="mt-2 line-clamp-2 text-sm font-light text-palette-cream/80">{mod.esencia}</p>
                            ) : null}
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <motion.h2
              id="recursos"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
              className="mb-8 mt-24 scroll-mt-24 text-2xl font-medium md:text-3xl"
            >
              Recursos para tu práctica
            </motion.h2>
            {recursos.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-palette-stone"
              >
                Todavía no hay recursos adicionales.
              </motion.p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                {recursos.map((recurso, index) => {
                  const selected = selectedRecurso === recurso.recursoId;
                  const cardClass = `flex flex-col overflow-hidden rounded-2xl bg-palette-cream ring-1 ${
                    selected ? 'ring-2 ring-palette-sage shadow-lg' : 'ring-palette-stone/10'
                  }`;

                  if (recurso.tipo === 'archivo') {
                    const href = cloudinaryAttachmentUrl({
                      url: recurso.archivoUrl,
                      publicId: recurso.archivoPublicId,
                      resourceType: recurso.archivoResourceType,
                      filename: recurso.archivoNombre || recurso.titulo || 'archivo',
                    });
                    return (
                      <motion.div key={recurso.recursoId} {...resourceEnter(index)}>
                        <motion.a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseEnter={() => setSelectedRecurso(recurso.recursoId)}
                          onFocus={() => setSelectedRecurso(recurso.recursoId)}
                          initial="rest"
                          animate="rest"
                          whileHover="hover"
                          whileTap={{ scale: 0.98 }}
                          variants={resourceCardMotion}
                          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                          className={cardClass}
                        >
                          <div className="relative aspect-video overflow-hidden bg-palette-stone/10 text-palette-ink">
                            <motion.div
                              className="flex h-full w-full items-center justify-center"
                              variants={resourceMediaMotion}
                              transition={{ duration: 0.55, ease }}
                            >
                              <DocumentArrowDownIcon className="h-8 w-8" />
                            </motion.div>
                          </div>
                          <div className="p-3 md:p-4">
                            <span className="line-clamp-2 text-sm font-medium md:text-base">
                              {recurso.titulo || recurso.archivoNombre || 'Archivo'}
                            </span>
                            <span className="mt-1 block text-xs uppercase tracking-wide text-palette-stone">
                              Archivo
                            </span>
                          </div>
                        </motion.a>
                      </motion.div>
                    );
                  }

                  const thumb = recurso.videoThumbnail
                    ? resolveCloudinaryOrHttpUrl(recurso.videoThumbnail)
                    : '';
                  const minutes = recurso.duration > 0 ? Math.round(recurso.duration / 60) : 0;
                  return (
                    <motion.div key={recurso.recursoId} {...resourceEnter(index)}>
                      <motion.div
                        initial="rest"
                        animate={selected ? 'hover' : 'rest'}
                        whileHover="hover"
                        whileTap={{ scale: 0.985 }}
                        variants={resourceCardMotion}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                      >
                        <Link
                          href={cursoRecursoPath(slug, recurso.recursoId)}
                          onMouseEnter={() => setSelectedRecurso(recurso.recursoId)}
                          onFocus={() => setSelectedRecurso(recurso.recursoId)}
                          onClick={() => setSelectedRecurso(recurso.recursoId)}
                          className={cardClass}
                        >
                          <div className="relative aspect-video overflow-hidden bg-palette-stone/10">
                            <motion.div
                              className="absolute inset-0"
                              variants={resourceMediaMotion}
                              transition={{ duration: 0.6, ease }}
                            >
                              {thumb ? (
                                <img src={thumb} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-palette-stone">
                                  <PlayIcon className="h-8 w-8" />
                                </div>
                              )}
                            </motion.div>
                            <motion.div
                              variants={resourceVeilMotion}
                              className="absolute inset-0 bg-palette-ink/25"
                            />
                            <motion.div
                              variants={resourcePlayMotion}
                              transition={{ duration: 0.22, ease }}
                              className="pointer-events-none absolute inset-0 flex items-center justify-center"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-palette-cream/95 shadow-lg">
                                <PlayIcon className="ml-0.5 h-4 w-4 text-palette-ink" />
                              </span>
                            </motion.div>
                          </div>
                          <div className="p-3 md:p-4">
                            <span className="line-clamp-2 text-sm font-medium md:text-base">
                              {recurso.titulo || 'Clase'}
                            </span>
                            <span className="mt-1 block text-xs text-palette-stone">
                              {minutes > 0 ? `${minutes} min · ` : ''}Clase
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </MainSideBar>
    </div>
  );
}

export function CourseResourceView({ slug, recursoId }: { slug: string; recursoId: string }) {
  const [clases, setClases] = useState<CursoRecursoAdicional[]>([]);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoAreaHover, setVideoAreaHover] = useState(false);
  const desktopPlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const mobilePlayerRef = useRef<MoveCrewVideoPlayerHandle>(null);
  const handlePlayingChangeDesktop = useCallback((playing: boolean) => {
    if (playing) {
      setSidebarOpen(false);
      mobilePlayerRef.current?.pause();
    } else {
      setSidebarOpen(true);
    }
  }, []);
  const handlePlayingChangeMobile = useCallback((playing: boolean) => {
    if (playing) {
      setSidebarOpen(false);
      desktopPlayerRef.current?.pause();
    } else {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/curso/${encodeURIComponent(slug)}/contenido`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.error || 'No se pudo abrir el recurso');
          return;
        }
        const list = ((json.recursosAdicionales || []) as CursoRecursoAdicional[])
          .filter((item) => item.tipo === 'clase')
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        setNombre(json.nombre || '');
        setClases(list);
        if (!list.some((item) => item.recursoId === recursoId)) {
          setError('Esa clase no está en este curso');
        }
      } catch {
        if (!cancelled) setError('No se pudo abrir el recurso');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, recursoId]);

  if (loading) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="min-h-screen bg-palette-ink flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-cream/30 border-t-palette-cream" />
        </div>
      </MainSideBar>
    );
  }

  const currentIndex = clases.findIndex((item) => item.recursoId === recursoId);
  const recurso = currentIndex >= 0 ? clases[currentIndex] : null;
  const previousClass = currentIndex > 0 ? clases[currentIndex - 1] : null;
  const nextClass = currentIndex >= 0 && currentIndex < clases.length - 1 ? clases[currentIndex + 1] : null;
  const cercanas = nearestItems(clases, currentIndex, 10);
  const vimeoId = recurso ? extractVimeoId(recurso.videoId || recurso.videoUrl) : null;
  const directVideoUrl =
    recurso?.videoUrl && !vimeoId && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(recurso.videoUrl)
      ? recurso.videoUrl
      : '';

  const navPrevClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/45 bg-transparent px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:border-palette-cream hover:bg-palette-cream/10';
  const navNextClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/80 bg-palette-cream px-4 py-2.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-white hover:bg-white';

  const classList = (
    <ul className="space-y-0.5 border-t border-white/10">
      {cercanas.map((item) => {
        const active = item.recursoId === recursoId;
        const order = clases.findIndex((clase) => clase.recursoId === item.recursoId) + 1;
        return (
          <li key={item.recursoId} className="border-b border-white/10">
            <Link
              href={cursoRecursoPath(slug, item.recursoId)}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-2 py-3 text-[13px] leading-snug transition-colors ${
                active
                  ? 'text-palette-cream font-semibold'
                  : 'text-palette-cream/70 font-normal hover:text-palette-cream'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-montserrat text-[11px] font-semibold tabular-nums ${
                  active
                    ? 'border-palette-sage/70 bg-palette-ink text-palette-cream shadow-[0_0_0_3px_rgba(223,224,195,0.1)]'
                    : 'border-palette-cream/25 text-palette-cream/50 group-hover:border-palette-cream/45 group-hover:text-palette-cream/80'
                }`}
              >
                {String(order).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate tracking-tight">{item.titulo || 'Clase'}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (!recurso) {
    return (
      <MainSideBar where="membership" className="bg-palette-ink">
        <div className="min-h-screen bg-palette-ink text-palette-cream flex flex-col items-center justify-center gap-4 px-6">
          <p>{error || 'No se encontró la clase.'}</p>
          <Link href={cursoBibliotecaPath(slug)} className="text-palette-sage hover:underline inline-flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Biblioteca
          </Link>
        </div>
      </MainSideBar>
    );
  }

  const minutes = recurso.duration > 0 ? Math.round(recurso.duration / 60) : 0;

  return (
    <MainSideBar where="membership" sidebarOpen={sidebarOpen} className="bg-palette-ink">
      <div className="flex flex-col min-h-screen bg-palette-ink text-palette-cream font-montserrat overflow-x-clip max-w-[100vw] min-w-0 w-full">
        <section className="relative w-full max-w-full md:h-screen md:min-h-[100vh] bg-palette-ink overflow-hidden shrink-0">
          <div className="block md:hidden w-full aspect-video bg-palette-ink">
            {vimeoId ? (
              <MoveCrewVideoPlayer
                key={`mobile-${recurso.recursoId}`}
                ref={mobilePlayerRef}
                videoId={vimeoId}
                className="w-full h-full !ring-0 !shadow-none"
                userStartsPlayback
                onPlayingChange={handlePlayingChangeMobile}
              />
            ) : directVideoUrl ? (
              <video src={directVideoUrl} controls playsInline className="w-full h-full object-contain bg-palette-ink" poster={recurso.videoThumbnail || undefined} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-palette-sage gap-4">
                <PlayIcon className="w-16 h-16 opacity-50" />
                <p>No hay video disponible.</p>
              </div>
            )}
          </div>
          <div
            className={`hidden md:block absolute top-0 bottom-0 right-0 h-full overflow-hidden bg-palette-ink transition-[left] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              sidebarOpen ? 'left-96' : 'left-0'
            }`}
            onMouseEnter={() => setVideoAreaHover(true)}
            onMouseLeave={() => setVideoAreaHover(false)}
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-palette-ink">
              {vimeoId ? (
                <MoveCrewVideoPlayer
                  key={`desktop-${recurso.recursoId}`}
                  ref={desktopPlayerRef}
                  videoId={vimeoId}
                  className="!aspect-auto absolute inset-0 w-full h-full min-w-full min-h-full !ring-0 !shadow-none"
                  userStartsPlayback
                  showControlsFromParent={videoAreaHover}
                  onPlayingChange={handlePlayingChangeDesktop}
                />
              ) : directVideoUrl ? (
                <video src={directVideoUrl} controls playsInline className="absolute inset-0 w-full h-full object-cover" poster={recurso.videoThumbnail || undefined} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-palette-sage gap-4">
                  <PlayIcon className="w-16 h-16 opacity-50" />
                  <p>No hay video disponible.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 h-14 w-10 items-center justify-center rounded-r-xl bg-palette-ink/95 text-palette-cream shadow-lg border border-l-0 border-white/15 hover:bg-palette-ink hover:w-12 transition-all duration-500 ${
            sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
          }`}
          aria-label="Abrir menú de clases"
        >
          <ChevronRightIcon className="w-6 h-6 shrink-0" />
        </button>

        <div
          className={`hidden md:flex fixed inset-y-0 left-0 z-40 w-96 max-w-[90vw] flex-col bg-palette-ink border-r border-white/10 shadow-xl overflow-hidden pt-20 font-montserrat transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-palette-cream/30 text-palette-cream transition-colors hover:border-palette-cream/60 hover:bg-palette-cream/10"
              aria-label="Cerrar menú"
            >
              <ChevronLeftIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            </button>
            <Link
              href={cursoBibliotecaPath(slug)}
              className={`${landingEyebrowDark} !text-palette-cream/70 hover:!text-palette-cream transition-colors truncate`}
            >
              Biblioteca
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-7">
            <section>
              {nombre ? <p className={`${landingEyebrowDark} mb-2`}>{nombre}</p> : null}
              <h1 className="font-montserrat text-[1.35rem] font-bold leading-[1.15] tracking-tight text-palette-cream">
                {recurso.titulo || 'Clase'}
              </h1>
              {minutes > 0 ? <p className="mt-2 text-[13px] text-palette-cream/55">{minutes} min</p> : null}
              {recurso.descripcion ? (
                <p className="mt-2 text-[13px] leading-relaxed text-palette-cream/80 line-clamp-4">{recurso.descripcion}</p>
              ) : null}
            </section>
            <section>
              <h2 className={`${landingEyebrowDark} mb-4`}>Otras clases</h2>
              {classList}
            </section>
            {previousClass ? (
              <section className="mt-auto pt-5 border-t border-white/10">
                <Link href={cursoRecursoPath(slug, previousClass.recursoId)} onClick={() => setSidebarOpen(false)} className={navPrevClass}>
                  <ChevronLeftIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate normal-case tracking-normal font-medium">Anterior: {previousClass.titulo}</span>
                </Link>
              </section>
            ) : null}
            {nextClass ? (
              <section className={previousClass ? 'pt-2.5' : 'mt-auto pt-5 border-t border-white/10'}>
                <Link href={cursoRecursoPath(slug, nextClass.recursoId)} onClick={() => setSidebarOpen(false)} className={navNextClass}>
                  <span className="truncate normal-case tracking-normal font-medium">Siguiente: {nextClass.titulo}</span>
                  <ChevronRightIcon className="w-4 h-4 shrink-0" />
                </Link>
              </section>
            ) : null}
          </div>
        </div>

        <div className="md:hidden w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-7 font-montserrat">
          <Link
            href={cursoBibliotecaPath(slug)}
            className={`${landingEyebrowDark} !text-palette-cream/70 hover:!text-palette-cream inline-flex items-center gap-1.5 w-fit transition-colors`}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Biblioteca
          </Link>
          <section>
            {nombre ? <p className={`${landingEyebrowDark} mb-2`}>{nombre}</p> : null}
            <h1 className="font-montserrat text-[1.45rem] font-bold leading-[1.15] tracking-tight text-palette-cream">
              {recurso.titulo || 'Clase'}
            </h1>
            {minutes > 0 ? <p className="mt-2 text-[13px] text-palette-cream/55">{minutes} min</p> : null}
          </section>
          <section>
            <h2 className={`${landingEyebrowDark} mb-4`}>Otras clases</h2>
            {classList}
          </section>
          {previousClass ? (
            <Link href={cursoRecursoPath(slug, previousClass.recursoId)} className={navPrevClass}>
              <ChevronLeftIcon className="w-4 h-4 shrink-0" />
              <span className="truncate normal-case tracking-normal font-medium">Anterior: {previousClass.titulo}</span>
            </Link>
          ) : null}
          {nextClass ? (
            <Link href={cursoRecursoPath(slug, nextClass.recursoId)} className={navNextClass}>
              <span className="truncate normal-case tracking-normal font-medium">Siguiente: {nextClass.titulo}</span>
              <ChevronRightIcon className="w-4 h-4 shrink-0" />
            </Link>
          ) : null}
        </div>
      </div>
    </MainSideBar>
  );
}
