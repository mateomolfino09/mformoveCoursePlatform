'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FilterNavWrapper from '../../FilterNavWrapper';
import Footer from '../../Footer';
import { useAppDispatch } from '../../../redux/hooks';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { cursoClasePath } from '../../../lib/cursoPaths';
import {
  resolveCloudinaryOrHttpUrl,
  resolveCourseClassThumbnailUrl,
} from '../../../lib/resolveMediaImageUrl';
import { splitAboutDescriptionText } from '../../../lib/cursoAboutDescription';
import CourseContentHubCommunity, {
  type CourseHubComunidad,
} from './CourseContentHubCommunity';
import {
  hubAccentBorderOnLight,
  hubAccentIconOnLight,
  hubAccentLineOnLight,
  hubBlockTitleOnLight,
  hubBodyMuted,
  hubBodyMutedOnLight,
  hubBodyOnLight,
  hubEyebrow,
  hubEyebrowOnLight,
  hubHeroTitle,
  hubMetaOnLight,
  hubMicroLabelOnLight,
  hubPieceNumberOnLight,
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
  onVideoReady?: () => void;
};

const contentPadding = 'px-6';
const contentMax = 'max-w-6xl mx-auto';

/** Mismos CTAs que secciones oscuras de la landing (CourseCTA, CoursePlans). */
const btnPrimaryDarkClass =
  'inline-flex items-center justify-center rounded-full bg-palette-cream text-palette-ink border-2 border-palette-cream/80 font-montserrat font-semibold text-sm md:text-base uppercase tracking-[0.14em] px-6 py-3 md:px-8 md:py-3.5 hover:bg-palette-sage hover:border-palette-sage transition-all duration-200 shadow-lg';
const btnOutlineDarkClass =
  'inline-flex items-center justify-center rounded-full border-2 border-palette-cream/55 text-palette-cream font-montserrat font-medium text-sm md:text-base uppercase tracking-[0.12em] px-5 py-2.5 md:px-6 md:py-3 hover:bg-palette-cream/10 transition-all duration-200';

const PUZZLE_SHAPES = [
  'rounded-tl-[2rem] rounded-br-[2rem]',
  'rounded-tr-[2rem] rounded-bl-[2rem]',
  'rounded-tl-[2.5rem] rounded-tr-[1rem] rounded-bl-[1rem] rounded-br-[2.5rem]',
  'rounded-tr-[2.5rem] rounded-tl-[1rem] rounded-br-[1rem] rounded-bl-[2.5rem]',
];

/** Eje compartido línea + rombo del timeline de módulos. */
const timelineAxisClass = 'left-6 md:left-8';

export default function CourseContentHubView({ data, onVideoReady }: Props) {
  const dispatch = useAppDispatch();
  const [privateToken, setPrivateToken] = useState<string | null>(null);

  const { slug, nombre, modulos, hub, invitacionGrupoWhatsapp, comunidad } = data;
  const vimeoId = extractVimeoId(hub.heroVideoId);
  const hasVideo = !!vimeoId;
  const heroThumbnail = hub.heroThumbnailPublicId
    ? resolveCloudinaryOrHttpUrl(hub.heroThumbnailPublicId)
    : vimeoId
      ? `https://vumbnail.com/${vimeoId}.jpg`
      : '';

  useEffect(() => {
    const onWindowScroll = () => dispatch(toggleScroll(window.scrollY > 0));
    onWindowScroll();
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', onWindowScroll);
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

  const [videoLoaded, setVideoLoaded] = useState(!hasVideo);
  const onVideoReadyRef = useRef(onVideoReady);
  onVideoReadyRef.current = onVideoReady;

  useEffect(() => {
    if (!hasVideo) {
      onVideoReadyRef.current?.();
      return;
    }
    setVideoLoaded(false);
    const t = setTimeout(() => {
      setVideoLoaded(true);
      onVideoReadyRef.current?.();
    }, 8000);
    return () => clearTimeout(t);
  }, [hasVideo, vimeoIframeSrc]);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    onVideoReadyRef.current?.();
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
        className="group block relative w-full aspect-video rounded-xl overflow-hidden bg-palette-ink ring-1 ring-palette-stone/25 hover:ring-palette-stone/50 transition-all duration-300"
      >
        <div className="absolute inset-0 overflow-hidden">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-palette-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-palette-cream/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <PlayIcon className="w-6 h-6 text-palette-ink ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 text-left">
          <p className="text-palette-cream text-xs md:text-sm font-light line-clamp-2 drop-shadow-sm group-hover:text-palette-stone transition-colors">
            {clase.name}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <FilterNavWrapper>
      <div className="relative isolate min-h-screen overflow-x-hidden bg-palette-ink font-montserrat">
        <MainSideBar where="membership">
          <Head>
            <title>Contenido — {nombre}</title>
            <meta name="description" content={hub.aboutDescription || `Contenido del curso ${nombre}`} />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className="relative">
            {/* Hero 100vh — video de presentación del curso (hero.videoPresentacionVimeoId) */}
            <section className="relative flex min-h-[100vh] flex-col justify-end overflow-visible">
              <div className="absolute inset-0 z-0 bg-palette-ink overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {vimeoIframeSrc ? (
                    <iframe
                      src={vimeoIframeSrc}
                      onLoad={handleVideoLoaded}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-w-[177.78vh] min-h-[100vh] pointer-events-none"
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
                    className="absolute inset-0 w-full h-full bg-cover"
                    style={{ backgroundImage: `url(${heroThumbnail})`, backgroundPosition: 'center center' }}
                    aria-hidden
                  />
                ) : null}
                <div className="absolute inset-0 z-[5] bg-black/45" aria-hidden />
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(20,20,17,0.08) 40%, rgba(20,20,17,0.35) 58%, rgba(20,20,17,0.62) 72%, rgba(20,20,17,0.88) 88%, rgb(20,20,17) 96%, rgb(20,20,17) 100%)',
                  }}
                  aria-hidden
                />
                {hasVideo && !videoLoaded && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-palette-ink/80" aria-hidden>
                    <div className="w-10 h-10 border-2 border-palette-cream/30 border-t-palette-cream rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className={`relative z-20 ${contentPadding} pt-28 md:pt-32 pb-12 md:pb-16`}>
                <div className={contentMax}>
      

                  <p className={`${hubEyebrow} mb-3 md:mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]`}>
                    {hub.heroEyebrow || nombre}
                  </p>

                  <h1 className={`${hubHeroTitle} mb-5 md:mb-6 max-w-4xl`}>
                    {hub.heroTagline}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-5 md:mb-6">
                    <Link
                      href={beginPracticeHref}
                      className={`${btnPrimaryDarkClass} hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      Comenzar práctica
                    </Link>
                    {invitacionGrupoWhatsapp ? (
                      <a
                        href={invitacionGrupoWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btnOutlineDarkClass}
                      >
                        Grupo WhatsApp
                      </a>
                    ) : null}
                  </div>

                  <p className={`${hubBodyMuted} max-w-3xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]`}>
                    {hub.practicesCount} práctica{hub.practicesCount !== 1 ? 's' : ''} ·{' '}
                    {hub.modulosCount} pieza{hub.modulosCount !== 1 ? 's' : ''} del recorrido
                  </p>
                </div>
              </div>
            </section>



            <section className="relative bg-palette-cream text-palette-ink py-14 md:py-20 lg:py-24">
              <div className={`${contentPadding}`}>
                <div className={contentMax}>
                  <div className="mb-12 md:mb-16">
                    <p className={`${hubEyebrowOnLight} mb-2`}>
                      El recorrido completo
                    </p>
                    <h2 id="modulos" className={`${hubSectionTitleOnLight} max-w-3xl`}>
                      Cada módulo es una pieza del mismo rompecabezas
                    </h2>
                    <p className={`mt-3 ${hubBodyMutedOnLight} max-w-2xl`}>
                      No son bloques sueltos: se complementan. Avanzá en orden o volvé a la pieza que tu cuerpo necesita hoy.
                    </p>
                  </div>

                  <div className="relative space-y-10 md:space-y-14">
                    <div
                      className={`pointer-events-none absolute ${timelineAxisClass} top-0 bottom-0 w-px ${hubAccentLineOnLight}`}
                      aria-hidden
                    />

                    {modulos.map((modulo, index) => {
                      const sortedClases = [...modulo.clases].sort(
                        (a, b) => (a.order ?? 0) - (b.order ?? 0)
                      );
                      const pieceNumber = String(index + 1).padStart(2, '0');
                      const shapeClass = PUZZLE_SHAPES[index % PUZZLE_SHAPES.length];

                      return (
                        <motion.section
                          key={modulo.timelineIndex}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ duration: 0.45, delay: index * 0.06 }}
                          className="relative pl-12 md:pl-16"
                        >
                          <div
                            className={`absolute ${timelineAxisClass} top-8 md:top-9 z-10 h-4 w-4 -translate-x-1/2 rotate-45 border-2 ${hubAccentBorderOnLight} bg-palette-cream shadow-[0_0_0_4px_rgba(250,248,244,1)]`}
                            aria-hidden
                          />

                          <article
                            className={`relative overflow-hidden border border-palette-stone/30 bg-light-cream ${shapeClass} shadow-[0_18px_48px_-22px_rgba(20,20,17,0.1)] ring-1 ring-palette-stone/15`}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 opacity-[0.06] pointer-events-none">
                              <svg viewBox="0 0 100 100" className={`w-full h-full ${hubAccentIconOnLight}`} aria-hidden>
                                <path
                                  fill="currentColor"
                                  d="M20 10 h35 a8 8 0 0 1 8 8 v12 a8 8 0 0 0 8 8 h12 a8 8 0 0 1 8 8 v35 a8 8 0 0 1-8 8 h-35 a8 8 0 0 1-8-8 v-12 a8 8 0 0 0-8-8 h-12 a8 8 0 0 1-8-8 v-35 a8 8 0 0 1 8-8z"
                                />
                              </svg>
                            </div>

                            <div className="p-5 md:p-7 lg:p-8">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                                <span className={hubPieceNumberOnLight}>
                                  {pieceNumber}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p className={`${hubMicroLabelOnLight} mb-1.5`}>
                                    Pieza {index + 1} de {modulos.length}
                                  </p>
                                  <h3 className={`${hubBlockTitleOnLight} mb-2`}>
                                    {modulo.titulo || `Módulo ${modulo.timelineIndex + 1}`}
                                  </h3>
                                  {modulo.esencia?.trim() ? (
                                    <p className={`${hubBodyMutedOnLight} max-w-2xl`}>
                                      {modulo.esencia}
                                    </p>
                                  ) : modulo.descripcion ? (
                                    <p className={`${hubBodyMutedOnLight} max-w-2xl`}>
                                      {modulo.descripcion}
                                    </p>
                                  ) : null}
                                  <p className={`mt-3 ${hubMetaOnLight}`}>
                                    {sortedClases.length} clase{sortedClases.length !== 1 ? 's' : ''} en esta pieza
                                  </p>
                                </div>
                              </div>

                              {sortedClases.length > 0 ? (
                                <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                                  {sortedClases.map((clase) => (
                                    <CoursePracticeCard
                                      key={clase._id}
                                      clase={clase}
                                      moduloIndex={modulo.timelineIndex}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <p className={`mt-6 ${hubBodyMutedOnLight}`}>
                                  Todavía no hay clases en este módulo.
                                </p>
                              )}
                            </div>
                          </article>
                        </motion.section>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {comunidad ? (
              <section className="relative bg-palette-ink text-palette-cream py-14 md:py-20 lg:py-24">
                <div className={`${contentPadding}`}>
                  <div className={contentMax}>
                    <CourseContentHubCommunity comunidad={comunidad} />
                  </div>
                </div>
              </section>
            ) : null}

            {showAboutSection ? (
              <section className="relative border-t border-palette-steel/20 bg-palette-cream text-palette-ink py-14 md:py-20 lg:py-24">
                <div className={contentPadding}>
                  <div className={contentMax}>
                    <div className="max-w-4xl">
                      <p className={`${hubEyebrowOnLight} mb-3 md:mb-4`}>
                        Sobre este curso
                      </p>
                      {hub.heroHeadline?.trim() ? (
                        <h2 className={`${hubSectionTitleOnLight} mb-8 md:mb-10 max-w-4xl`}>
                          {hub.heroHeadline}
                        </h2>
                      ) : null}
                      {aboutLines.length ? (
                        <div className="space-y-6 md:space-y-8">
                          {aboutLines.map((line, index) => (
                            <p key={`about-${index}`} className={hubBodyOnLight}>
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
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
    </FilterNavWrapper>
  );
}
