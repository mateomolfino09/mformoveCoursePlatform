'use client';

import React, { useEffect, useState } from 'react';
import { IndividualClass } from '../../../../typings';
import OnboardingGuard from '../../OnboardingGuard';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FilterNavWrapper from '../../FilterNavWrapper';
import { useAppDispatch } from '../../../redux/hooks';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
}

interface Props {
  module: ModuleForLibrary;
  classes: IndividualClass[];
}

export default function LibraryModuleView({ module: mod, classes }: Props) {
  const dispatch = useAppDispatch();
  const [privateToken, setPrivateToken] = useState<string | null>(null);

  const title = mod.name || mod.slug;
  const practicesCount = classes.length;
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
  useEffect(() => {
    if (!hasVideo) setVideoLoaded(true);
    else setVideoLoaded(false);
  }, [hasVideo, vimeoIframeSrc, directVideoUrl]);

  const handleVideoLoaded = () => setVideoLoaded(true);

  const contentPadding = 'px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32';
  const contentMax = 'max-w-7xl';

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
              <section className="relative min-h-[55vh] md:min-h-[70vh] lg:min-h-[65vh] flex flex-col justify-end overflow-hidden">
                <div className="absolute inset-0 z-0 bg-palette-ink">
                  {directVideoUrl ? (
                    <video
                      src={directVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onLoadedData={handleVideoLoaded}
                      className="absolute inset-0 w-full h-full object-cover -translate-y-[40%]"
                      style={{ objectPosition: 'center center' }}
                      aria-hidden
                    />
                  ) : vimeoIframeSrc ? (
                    <iframe
                      src={vimeoIframeSrc}
                      onLoad={handleVideoLoaded}
                      className="absolute top-[50%] left-1/2 w-[100vw] min-w-[177.78vh] h-[56.25vw] min-h-[100vh] pointer-events-none -translate-x-1/2 -translate-y-[40%]"
                      style={{ width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.78vh' }}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      title=""
                      aria-hidden
                    />
                  ) : null}
                  {!hasVideo && mod.videoThumbnail ? (
                    <div
                      className="absolute inset-0 w-full h-full bg-cover"
                      style={{ backgroundImage: `url(${mod.videoThumbnail})`, backgroundPosition: 'center center' }}
                      aria-hidden
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(20,20,17,0.2) 0%, rgba(20,20,17,0.4) 30%, rgba(20,20,17,0.7) 55%, rgba(20,20,17,0.9) 75%, rgb(20,20,17) 88%, rgb(20,20,17) 100%)',
                    }}
                    aria-hidden
                  />
                  {hasVideo && !videoLoaded && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-palette-ink/80" aria-hidden>
                      <div className="w-10 h-10 border-2 border-palette-cream/30 border-t-palette-cream rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className={`relative z-20 ${contentPadding} pt-32 md:pt-36 lg:pt-40 pb-12 md:pb-14`}>
                  <div className={contentMax}>
                    <p className="text-palette-cream/90 text-sm md:text-base uppercase tracking-wider mb-1.5">
                      {title}
                    </p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-white mb-4 md:mb-5">
                      Biblioteca de {title}
                    </h1>
                    <p className="text-palette-cream/95 text-base md:text-lg mb-5 max-w-2xl">
                      {practicesCount} prácticas · total · {submodulesCount} submódulo{submodulesCount !== 1 ? 's' : ''}
                    </p>
                    {(mod.description || mod.aboutDescription) ? (
                      <p className="text-palette-cream/90 text-sm md:text-base max-w-2xl leading-relaxed">
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
                      <p className="text-palette-stone text-[11px] md:text-xs uppercase tracking-[0.2em] mb-3 font-light">
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
                      <p className="text-palette-stone text-[11px] md:text-xs uppercase tracking-[0.2em] mb-4 font-light">
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

                <div className={`${contentPadding} pb-14 md:pb-20`}>
                  <div className={contentMax}>
                    <nav className="flex items-center gap-2 text-xs md:text-sm text-palette-stone mb-8">
                      <Link href={routes.navegation.membership.library} className="hover:text-palette-cream transition-colors">
                        Biblioteca
                      </Link>
                      <span aria-hidden className="text-palette-stone/60">/</span>
                      <span className="text-palette-cream font-light">{title}</span>
                    </nav>

                    <h2 id="practicas" className="sr-only">
                      Prácticas
                    </h2>

                    {(() => {
                      const subs = mod.submodules ?? [];
                      const hasMultipleSubmodules = subs.length > 1;
                      const hasOneSubmodule = subs.length === 1;

                      if (hasMultipleSubmodules) {
                        return (
                          <div className="space-y-12 md:space-y-16">
                            <h3 className="text-palette-stone text-[11px] md:text-xs uppercase tracking-[0.2em] font-light">
                              Módulos
                            </h3>
                            {subs.map((sub) => {
                              const subSlug = sub.slug ?? sub.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ?? '';
                              const subClasses = classes.filter((c) => (c.submoduleSlug ?? '').toLowerCase() === subSlug.toLowerCase());
                              return (
                                <section key={sub.slug || sub.name}>
                                  <h4 className="text-palette-cream text-base md:text-lg font-light mb-4">
                                    {sub.name}
                                  </h4>
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
                                  ) : (
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
                        return (
                          <div className="space-y-8">
                            <h3 className="text-palette-cream text-base md:text-lg font-light">
                              {sub.name}
                            </h3>
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
                            ) : (
                              <p className="text-center text-palette-stone py-16">
                                No hay clases en este módulo.
                              </p>
                            )}
                          </div>
                        );
                      }

                      return classes.length > 0 ? (
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
                      ) : (
                        <p className="text-center text-palette-stone py-16">
                          No hay clases en este módulo.
                        </p>
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
