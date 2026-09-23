'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import Head from 'next/head';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import { useAppDispatch } from '../../../redux/hooks';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { cursoBibliotecaPath, cursoClasePath } from '../../../lib/cursoPaths';
import {
  resolveCloudinaryOrHttpUrl,
  resolveCourseClassThumbnailUrl,
  vimeoThumbnailUrl,
} from '../../../lib/resolveMediaImageUrl';
import { splitAboutDescriptionText } from '../../../lib/cursoAboutDescription';
import CourseContentHubCommunity, {
  type CourseHubComunidad,
} from './CourseContentHubCommunity';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  hubBodyMuted,
  hubBodyMutedOnLight,
  hubBlockTitleOnLight,
  hubEyebrow,
  hubEyebrowOnLight,
  hubHeroTitle,
  hubMetaOnLight,
  hubMicroLabelOnLight,
  hubSectionTitleOnLight,
} from './courseHubTypography';

function extractVimeoId(link: string | null | undefined): string | null {
  if (!link || typeof link !== 'string') return null;
  const trimmed = link.trim();
  const patterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /^(\d+)$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export type CourseHubClass = {
  _id: string;
  name: string;
  description?: string;
  videoThumbnail?: string;
  videoId?: string;
  videoUrl?: string;
  duration?: number;
  level?: number;
  materials?: string[];
  order?: number;
};

export type CourseHubModulo = {
  timelineIndex: number;
  titulo: string;
  esencia?: string;
  descripcion?: string;
  imagenPublicId?: string;
  clases: CourseHubClass[];
};

export type CourseContentHubData = {
  slug: string;
  nombre: string;
  invitacionGrupoWhatsapp: string | null;
  comunidad: CourseHubComunidad;
  modulos: CourseHubModulo[];
  hub: {
    heroVideoId: string;
    heroHeadline: string;
    heroEyebrow: string;
    heroTagline: string;
    aboutDescription: string;
    heroThumbnailPublicId: string;
    practicesCount: number;
    modulosCount: number;
  };
};

type Props = {
  data: CourseContentHubData;
};

const contentPadding = 'px-5 md:px-8';
const contentMax = 'max-w-5xl mx-auto';

/** Mismos CTAs que secciones oscuras de la landing (CourseCTA, CoursePlans). */
const btnPrimaryDarkClass =
  'inline-flex items-center justify-center rounded-full bg-palette-cream text-palette-ink border-2 border-palette-cream/80 font-montserrat font-semibold text-xs uppercase tracking-[0.1em] px-4 py-2 md:text-base md:tracking-[0.14em] md:px-8 md:py-3.5 hover:bg-palette-sage hover:border-palette-sage hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg';

export default function CourseContentHubView({ data }: Props) {
  const dispatch = useAppDispatch();
  const [privateToken, setPrivateToken] = useState<string | null>(null);

  const { slug, nombre, modulos, hub, comunidad } = data;
  const vimeoId = extractVimeoId(hub.heroVideoId);
  const hasVideo = !!vimeoId;
  const heroThumbnail = hub.heroThumbnailPublicId
    ? resolveCloudinaryOrHttpUrl(hub.heroThumbnailPublicId)
    : vimeoThumbnailUrl(vimeoId, 1280);

  useEffect(() => {
    const syncScroll = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      dispatch(toggleScroll(y > 0));
    };
    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', syncScroll);
      dispatch(toggleScroll(false));
    };
  }, [dispatch]);

  const [vimeoTokenFetched, setVimeoTokenFetched] = useState(!vimeoId);
  useEffect(() => {
    if (!vimeoId) return;
    let cancelled = false;
    fetch('/api/vimeo/getPrivateToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: vimeoId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((tokenData) => {
        if (!cancelled) {
          if (tokenData?.privateToken) setPrivateToken(tokenData.privateToken);
          setVimeoTokenFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) setVimeoTokenFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [vimeoId]);

  const vimeoIframeSrc =
    vimeoId && vimeoTokenFetched
      ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&background=1&muted=1&preload=auto${privateToken ? `&h=${privateToken}` : ''}`
      : '';

  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setVideoLoaded(false);
  }, [vimeoIframeSrc]);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  const firstClass = modulos.flatMap((m) =>
    m.clases.map((c) => ({ clase: c, moduloIndex: m.timelineIndex }))
  )[0];

  const beginPracticeHref = firstClass
    ? cursoClasePath(slug, firstClass.clase._id, firstClass.moduloIndex)
    : '#modulos';

  const aboutLines = splitAboutDescriptionText(hub.aboutDescription);
  const showAboutSection = Boolean(hub.heroHeadline?.trim() || aboutLines.length);

  function CoursePracticeCard({
    clase,
    moduloIndex,
  }: {
    clase: CourseHubClass;
    moduloIndex: number;
  }) {
    const thumb = resolveCourseClassThumbnailUrl({
      videoThumbnail: clase.videoThumbnail,
      videoId: clase.videoId,
      videoUrl: clase.videoUrl,
    });
    return (
      <Link
        href={cursoClasePath(slug, clase._id, moduloIndex)}
        className="group block relative w-full aspect-video overflow-hidden rounded-md bg-palette-ink border border-palette-stone/20 transition-colors hover:border-palette-stone/45"
      >
        <div className="absolute inset-0 overflow-hidden">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            />
          ) : (
            <div className="absolute inset-0 bg-palette-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-palette-cream/95">
            <PlayIcon className="ml-0.5 h-4 w-4 text-palette-ink" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
          <p className="line-clamp-2 text-[12px] font-medium leading-snug text-palette-cream">
            {clase.name}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-palette-ink font-montserrat">
      <MainSideBar where="membership" flowLayout>
        <Head>
          <title>Contenido — {nombre}</title>
          <meta name="description" content={hub.aboutDescription || `Contenido del curso ${nombre}`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="relative">
          <section className="relative flex min-h-[78vh] flex-col justify-end overflow-hidden md:min-h-[85vh]">
            <div className="absolute inset-0 z-0 overflow-hidden bg-palette-ink">
              <div className="absolute inset-0 flex items-center justify-center">
                {vimeoIframeSrc ? (
                  <iframe
                    src={vimeoIframeSrc}
                    onLoad={handleVideoLoaded}
                    className="pointer-events-none absolute left-1/2 top-1/2 min-h-[100vh] min-w-[177.78vh] h-[56.25vw] w-[100vw] -translate-x-1/2 -translate-y-1/2"
                    style={{ width: '100vw', height: '56.25vw', minWidth: '177.78vh' }}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    title=""
                    aria-hidden
                  />
                ) : null}
              </div>
              {!hasVideo && heroThumbnail ? (
                <div
                  className="absolute inset-0 h-full w-full bg-cover"
                  style={{ backgroundImage: `url(${heroThumbnail})`, backgroundPosition: 'center center' }}
                  aria-hidden
                />
              ) : null}
              <div className="absolute inset-0 z-[5] bg-black/40" aria-hidden />
              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, transparent 28%, rgba(20,20,17,0.25) 52%, rgba(20,20,17,0.75) 78%, rgb(20,20,17) 100%)',
                }}
                aria-hidden
              />
              {hasVideo && !videoLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-palette-ink/80" aria-hidden>
                  <div className="h-8 w-8 animate-spin rounded-full border border-palette-cream/25 border-t-palette-cream" />
                </div>
              )}
            </div>

            <div className={`relative z-20 ${contentPadding} pb-10 pt-28 md:pb-14 md:pt-32`}>
              <div className={contentMax}>
                <p className={`${hubEyebrow} mb-3`}>{hub.heroEyebrow || nombre}</p>

                <h1 className={`${hubHeroTitle} mb-4 max-w-2xl`}>{hub.heroTagline}</h1>

                {showAboutSection && hub.heroHeadline?.trim() ? (
                  <p className={`${hubBodyMuted} mb-5 max-w-xl`}>{hub.heroHeadline}</p>
                ) : null}

                <div className="mb-5 flex flex-wrap items-center gap-3 md:mb-6 md:gap-4">
                  <Link href={beginPracticeHref} className={btnPrimaryDarkClass}>
                    Comenzar práctica
                  </Link>
                  <Link href={cursoBibliotecaPath(slug)} className={btnPrimaryDarkClass}>
                    Biblioteca
                  </Link>
                </div>

                <p className={hubBodyMuted}>
                  {hub.practicesCount} práctica{hub.practicesCount !== 1 ? 's' : ''} ·{' '}
                  {hub.modulosCount} módulo{hub.modulosCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </section>

          <section className="relative border-t border-palette-ink/5 bg-palette-cream py-12 text-palette-ink md:py-16">
            <div className={contentPadding}>
              <div className={contentMax}>
                <div className="mb-8 max-w-xl md:mb-10">
                  <p className={`${hubEyebrowOnLight} mb-2`}>Recorrido</p>
                  <h2 id="modulos" className={hubSectionTitleOnLight}>
                    Módulos y prácticas
                  </h2>
                  <p className={`mt-2 ${hubBodyMutedOnLight}`}>
                    Avanzá en orden o volvé al módulo que tu cuerpo necesita hoy.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-5">
                  {modulos.map((modulo, index) => {
                    const sortedClases = [...modulo.clases].sort(
                      (a, b) => (a.order ?? 0) - (b.order ?? 0)
                    );
                    const pieceNumber = String(index + 1).padStart(2, '0');

                    return (
                      <motion.section
                        key={modulo.timelineIndex}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
                      >
                        <article className="rounded-lg border border-palette-stone/20 bg-white/60">
                          <div className="border-b border-palette-stone/15 px-4 py-4 md:px-5 md:py-5">
                            <div className="flex items-start gap-3">
                              {modulo.imagenPublicId ? (
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-palette-stone/10 md:h-20 md:w-20">
                                  <CldImage
                                    src={modulo.imagenPublicId}
                                    alt={modulo.titulo || 'Módulo'}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                </div>
                              ) : null}
                              <span className={`${hubMicroLabelOnLight} mt-0.5`}>{pieceNumber}</span>
                              <div className="min-w-0 flex-1">
                                <h3 className={hubBlockTitleOnLight}>
                                  {modulo.titulo || `Módulo ${modulo.timelineIndex + 1}`}
                                </h3>
                                {modulo.esencia?.trim() ? (
                                  <p className={`mt-1.5 ${hubBodyMutedOnLight}`}>{modulo.esencia}</p>
                                ) : modulo.descripcion ? (
                                  <p className={`mt-1.5 ${hubBodyMutedOnLight}`}>{modulo.descripcion}</p>
                                ) : null}
                                <p className={`mt-2 ${hubMetaOnLight}`}>
                                  {sortedClases.length} clase
                                  {sortedClases.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>

                          {sortedClases.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:gap-4 md:p-5 lg:grid-cols-3">
                              {sortedClases.map((clase) => (
                                <CoursePracticeCard
                                  key={clase._id}
                                  clase={clase}
                                  moduloIndex={modulo.timelineIndex}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className={`px-4 py-5 ${hubBodyMutedOnLight} md:px-5`}>
                              Todavía no hay clases en este módulo.
                            </p>
                          )}
                        </article>
                      </motion.section>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {comunidad ? (
            <section className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-12 text-palette-cream md:py-16">
              <CourseDarkSectionBackground />
              <div className={`relative z-20 ${contentPadding}`}>
                <div className={contentMax}>
                  <CourseContentHubCommunity comunidad={comunidad} />
                </div>
              </div>
            </section>
          ) : null}
        </main>

        <section className="w-full">
          <Footer />
        </section>
      </MainSideBar>
    </div>
  );
}
