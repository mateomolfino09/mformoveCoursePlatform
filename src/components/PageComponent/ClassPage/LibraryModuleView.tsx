'use client';

import React, { useEffect, useRef, useState } from 'react';
import { IndividualClass, ModuleClass } from '../../../../typings';
import OnboardingGuard from '../../OnboardingGuard';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FilterNavWrapper from '../../FilterNavWrapper';
import { useAppDispatch } from '../../../redux/hooks';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayIcon } from '@heroicons/react/24/solid';
import { routes } from '../../../constants/routes';
import Head from 'next/head';
import Footer from '../../Footer';
import CarouselClassesThumbnail from '../../CarouselClassesThumbnail';

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

function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const path = new URL(url, 'https://example.com').pathname.toLowerCase();
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(path);
  } catch {
    return false;
  }
}

export interface ModuleForLibrary {
  name: string;
  slug: string;
  description?: string | null;
  aboutDescription?: string | null;
  howToUse?: { title: string; description?: string }[];
  videoUrl?: string | null;
  videoId?: string | null;
  videoThumbnail?: string | null;
  submodules?: { name: string; slug?: string }[];
  /** Clases en video de submódulos + video principal del módulo (viene del API). */
  practicesCount?: number;
  /** Clases en video creadas en submódulos (ModuleClass). */
  moduleClasses?: ModuleClass[];
}

interface Props {
  module: ModuleForLibrary;
  classes: IndividualClass[];
  /** Llamado cuando el video del hero terminó de cargar (o no hay video). Usado para ocultar el skeleton. */
  onVideoReady?: () => void;
}

export default function LibraryModuleView({ module: mod, classes, onVideoReady }: Props) {
  const dispatch = useAppDispatch();
  const [privateToken, setPrivateToken] = useState<string | null>(null);

  const title = mod.name || mod.slug;
  const practicesCount = classes.length + (mod.practicesCount ?? 0);
  const submodulesCount = mod.submodules?.length ?? 0;
  const vimeoId = mod.videoId ? String(mod.videoId).trim() : extractVimeoId(mod.videoUrl);
  const directVideoUrl = mod.videoUrl && isDirectVideoUrl(mod.videoUrl) ? mod.videoUrl : null;
  const hasVideo = !!(vimeoId || directVideoUrl);

  const [vimeoTokenFetched, setVimeoTokenFetched] = useState(false);
  useEffect(() => {
    if (!vimeoId) {
      setVimeoTokenFetched(true);
      return;
    }
    let cancelled = false;
    fetch('/api/vimeo/getPrivateToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: vimeoId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          if (data?.privateToken) setPrivateToken(data.privateToken);
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
  const onVideoReadyRef = useRef(onVideoReady);
  onVideoReadyRef.current = onVideoReady;

  useEffect(() => {
    if (!hasVideo) {
      setVideoLoaded(true);
      onVideoReadyRef.current?.();
      return;
    }
    setVideoLoaded(false);
  }, [hasVideo]);

  useEffect(() => {
    if (!hasVideo) return;
    const done = () => {
      setVideoLoaded(true);
      onVideoReadyRef.current?.();
    };
    const t = setTimeout(done, 8000);
    return () => clearTimeout(t);
  }, [hasVideo, vimeoIframeSrc, directVideoUrl]);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    onVideoReadyRef.current?.();
  };

  const contentPadding = 'px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32';
  const contentMax = 'max-w-7xl';
  const moduleClassesList = mod.moduleClasses ?? [];

  function ModulePracticeCard({ c }: { c: ModuleClass }) {
    const thumb = c.videoThumbnail || '';
    return (
      <Link
        href={`/library/module/${mod.slug}/practice/${c._id}`}
        className="group block relative w-full aspect-video rounded-xl overflow-hidden bg-palette-ink ring-1 ring-palette-stone/20 hover:ring-palette-sage/50 transition-all duration-300"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-palette-cream/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <PlayIcon className="w-5 h-5 text-palette-ink ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 pl-4 pb-4 text-left">
          <p className="text-palette-cream text-xs font-medium line-clamp-2 drop-shadow-sm transition-all duration-300 group-hover:text-sm group-hover:text-palette-sage">{c.name}</p>
        </div>
      </Link>
    );
  }

  function ModulePracticesGrid({ items }: { items: ModuleClass[] }) {
    if (items.length === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-5 mb-8 md:mb-8"
      >
        {items.map((c) => (
          <ModulePracticeCard key={c._id} c={c} />
        ))}
      </motion.div>
    );
  }

  return (
    <OnboardingGuard>
      <FilterNavWrapper>
        <div
          className="relative bg-palette-ink min-h-screen overflow-x-hidden font-montserrat"
          onScroll={(e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            dispatch(toggleScroll(target.scrollTop > 0));
          }}
        >
          <MainSideBar where="library">
            <Head>
              <title>{title} - Biblioteca Move Crew</title>
              <meta name="description" content={mod.description || `Clases del módulo ${title}`} />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="relative pb-20">
              <section
                className={`relative flex flex-col justify-end ${hasVideo ? 'min-h-[80vh] md:min-h-[90vh] overflow-visible' : 'min-h-[55vh] md:min-h-[70vh] lg:min-h-[65vh] overflow-visible md:overflow-hidden'}`}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] min-w-full h-[80vh] md:h-[90vh] -bottom-6 md:bottom-0 z-0 bg-palette-ink overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center origin-center scale-100 md:scale-[1] lg:scale-[1] xl:scale-[1] 2xl:scale-[1]">
                    {directVideoUrl ? (
                      <video
                        src={directVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={handleVideoLoaded}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        aria-hidden
                      />
                    ) : vimeoIframeSrc ? (
                      <iframe
                        src={vimeoIframeSrc}
                        onLoad={handleVideoLoaded}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-w-[177.78vh] min-h-[80vh] md:min-h-[90vh] pointer-events-none"
                        style={{ width: '100vw', height: '56.25vw', minWidth: '177.78vh' }}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        title=""
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  {!hasVideo && mod.videoThumbnail ? (
                    <div
                      className="absolute inset-0 w-full h-full bg-cover"
                      style={{ backgroundImage: `url(${mod.videoThumbnail})`, backgroundPosition: 'center center' }}
                      aria-hidden
                    />
                  ) : null}
                  <div className="absolute inset-0 z-[5] bg-black/40" aria-hidden />
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 0%, transparent 25%, rgba(20,20,17,0.03) 35%, rgba(20,20,17,0.12) 50%, rgba(20,20,17,0.28) 65%, rgba(20,20,17,0.52) 78%, rgba(20,20,17,0.78) 88%, rgb(20,20,17) 92%, rgb(20,20,17) 100%)',
                    }}
                    aria-hidden
                  />
                  {hasVideo && !videoLoaded && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-palette-ink/80" aria-hidden>
                      <div className="w-10 h-10 border-2 border-palette-cream/30 border-t-palette-cream rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className={`relative z-20 ${contentPadding} pt-8 md:pt-12 pb-20 md:pb-24`}>
                  <div className={contentMax}>
                    <p className="text-palette-sage/95 text-base md:text-lg uppercase tracking-[0.2em] font-light mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                      {title}
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 md:mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.25)] tracking-tight">
                      Biblioteca de {title}
                    </h1>
                    <p className="text-palette-cream/95 text-lg md:text-xl font-light mb-5 max-w-2xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                      {practicesCount} prácticas · total · {submodulesCount} submódulo{submodulesCount !== 1 ? 's' : ''}
                    </p>
                    {(mod.description || mod.aboutDescription) ? (
                      <p className="text-palette-cream/85 text-base md:text-lg max-w-2xl leading-relaxed font-light drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                        {mod.aboutDescription || mod.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <div className="bg-palette-ink text-palette-cream">
                <div className={`${contentPadding} pt-16 md:pt-24 pb-16 md:pb-24`}>
                  <div className={contentMax}>
                    <section className="mb-14 md:mb-16">
                      <p className="text-palette-stone text-base md:text-lg uppercase tracking-[0.2em] mb-3 font-light">
                        Sobre esta serie
                      </p>
                      <p className="text-palette-cream/95 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                        {mod.aboutDescription ||
                          mod.description ||
                          'Explorá patrones de movimiento fluidos, trabajo en piso y secuencias dinámicas. Desarrollá la conciencia corporal y la creatividad en el movimiento.'}
                      </p>
                    </section>

                    <section className="mb-14 md:mb-16">
                      <a
                        href="#practicas"
                        className="inline-flex items-center justify-center rounded-full bg-palette-sage text-palette-ink font-medium text-sm md:text-base uppercase tracking-[0.15em] px-6 py-3 md:px-8 md:py-3.5 hover:bg-palette-sage/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
                      >
                        Comenzar práctica
                      </a>
                    </section>

                    <section className="mb-14 md:mb-16">
                      <p className="text-palette-stone text-base md:text-lg uppercase tracking-[0.2em] mb-4 font-light">
                        Cómo usar esta biblioteca
                      </p>
                      {mod.howToUse && mod.howToUse.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                          {mod.howToUse.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-palette-stone/20 bg-palette-cream/5 p-4 md:p-5 ring-1 ring-palette-stone/10"
                            >
                              <h3 className="text-palette-sage/95 text-base md:text-lg font-light tracking-tight mb-1.5">
                                {item.title}
                              </h3>
                              {item.description ? (
                                <p className="text-palette-cream/90 text-xs md:text-sm leading-relaxed font-light">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-palette-sage/90 text-base md:text-lg font-light tracking-tight">
                          Flujo, técnica y práctica de movimiento
                        </p>
                      )}
                    </section>
                  </div>
                </div>

                <div className={`${contentPadding} pt-4 md:pt-0 pb-16 md:pb-20`}>
                  <div className={contentMax}>
                    <h2 id="practicas" className="sr-only">
                      Prácticas
                    </h2>

                    {(() => {
                      const subs = mod.submodules ?? [];
                      const hasMultipleSubmodules = subs.length > 1;
                      const hasOneSubmodule = subs.length === 1;

                      if (hasMultipleSubmodules) {
                        return (
                          <div className="space-y-14 md:space-y-16">
                            <h3 className="text-palette-stone text-base md:text-lg uppercase tracking-[0.2em] font-light">
                              Módulos
                            </h3>
                            {subs.map((sub) => {
                              const subSlug = sub.slug ?? sub.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '';
                              const subModuleClasses = moduleClassesList.filter((c) => (c.submoduleSlug ?? '').toLowerCase() === subSlug.toLowerCase());
                              const subClasses = classes.filter((c) => (c.submoduleSlug ?? '').toLowerCase() === subSlug.toLowerCase());
                              const hasAny = subModuleClasses.length > 0 || subClasses.length > 0;
                              return (
                                <section key={sub.slug || sub.name}>
                                  <h4 className="text-palette-cream text-base md:text-lg font-light mb-4">
                                    {sub.name}
                                  </h4>
                                  <ModulePracticesGrid items={subModuleClasses} />
                                  {subClasses.length > 0 ? (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.4 }}
                                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                                    >
                                      {subClasses.map((c) => (
                                        <div key={c._id} className="flex flex-col w-full">
                                          <CarouselClassesThumbnail
                                            c={c}
                                            isNew={!!c.new}
                                            variant="library"
                                            linkBase="/library/individual-classes"
                                          />
                                        </div>
                                      ))}
                                    </motion.div>
                                  ) : null}
                                  {!hasAny && (
                                    <p className="text-palette-stone/80 text-sm">Sin prácticas en este submódulo.</p>
                                  )}
                                </section>
                              );
                            })}
                            {classes.filter((c) => !c.submoduleSlug?.trim()).length > 0 && (
                              <section>
                                <h4 className="text-palette-cream text-base md:text-lg font-light mb-4">
                                  Clases generales
                                </h4>
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.4 }}
                                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                                >
                                  {classes.filter((c) => !c.submoduleSlug?.trim()).map((c) => (
                                    <div key={c._id} className="flex flex-col w-full">
                                      <CarouselClassesThumbnail
                                        c={c}
                                        isNew={!!c.new}
                                        variant="library"
                                        linkBase="/library/individual-classes"
                                      />
                                    </div>
                                  ))}
                                </motion.div>
                              </section>
                            )}
                          </div>
                        );
                      }

                      if (hasOneSubmodule) {
                        const sub = subs[0];
                        const subSlug = sub.slug ?? sub.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '';
                        const subModuleClasses = moduleClassesList.filter((c) => (c.submoduleSlug ?? '').toLowerCase() === subSlug.toLowerCase());
                        const hasAny = subModuleClasses.length > 0 || classes.length > 0;
                        return (
                          <div className="space-y-8">
                            <h3 className="text-palette-cream text-base md:text-lg font-light">
                              {sub.name}
                            </h3>
                            <ModulePracticesGrid items={subModuleClasses} />
                            {classes.length > 0 ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                              >
                                {classes.map((c) => (
                                  <div key={c._id} className="flex flex-col w-full">
                                    <CarouselClassesThumbnail
                                      c={c}
                                      isNew={!!c.new}
                                      variant="library"
                                      linkBase="/library/individual-classes"
                                    />
                                  </div>
                                ))}
                              </motion.div>
                            ) : null}
                            {!hasAny && (
                              <p className="text-center text-palette-stone py-16">No hay clases en este módulo.</p>
                            )}
                          </div>
                        );
                      }

                      const mainModuleClasses = moduleClassesList.filter((c) => (c.submoduleSlug ?? '') === '__main__' || !(c.submoduleSlug ?? '').trim());
                      const hasAny = mainModuleClasses.length > 0 || classes.length > 0;
                      return (
                        <>
                          <ModulePracticesGrid items={mainModuleClasses} />
                          {classes.length > 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                            >
                              {classes.map((c) => (
                                <div key={c._id} className="flex flex-col w-full">
                                  <CarouselClassesThumbnail
                                    c={c}
                                    isNew={!!c.new}
                                    variant="library"
                                    linkBase="/library/individual-classes"
                                  />
                                </div>
                              ))}
                            </motion.div>
                          ) : null}
                          {!hasAny && (
                            <p className="text-center text-palette-stone py-16">No hay clases en este módulo.</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </main>

            <section className="mt-24 md:mt-32 w-full">
              <Footer />
            </section>
          </MainSideBar>
        </div>
      </FilterNavWrapper>
    </OnboardingGuard>
  );
}
