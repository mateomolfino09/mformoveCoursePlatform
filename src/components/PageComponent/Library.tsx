'use client';

import {
  ClassTypes,
  IndividualClass,
  ClassModule,
} from '../../../typings';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useTypeSelector';
import {
  setFilters,
  setOpenModal
} from '../../redux/features/filterClass';
import { toggleScroll } from '../../redux/features/headerLibrarySlice';
import { useAppSelector } from '../../redux/hooks';
import state from '../../valtio';
import FilterNavWrapper from '../FilterNavWrapper';
import Footer from '../Footer';
import MainSideBar from '../MainSidebar/MainSideBar';
import { motion, useScroll, useTransform } from 'framer-motion';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import React, {
  useEffect,
  useState,
  useRef
} from 'react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { useSnapshot as useSnapshotValtio } from 'valtio';
import Image from 'next/image';
import imageLoader from '../../../imageLoader';
import { routes } from '../../constants/routes';
import WeeklyPathMenuTutorial from './Library/WeeklyPathMenuTutorial';

interface Props {
  classesDB: IndividualClass[];
  filters: ClassTypes[];
  /** Módulos de clase (Movimiento, Movilidad, etc.) para filtro principal y títulos; si hay, se usan en lugar de filters[0] */
  classModules?: ClassModule[];
}

const LIBRARY_HERO_VIDEO_ID = '1023607510';

const Library = ({ classesDB, filters, classModules = [] }: Props) => {
  const [reload, setReload] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [coherenceStreak, setCoherenceStreak] = useState<number | null>(null);
  const [hasWeeklyPathContent, setHasWeeklyPathContent] = useState<boolean>(false);
  const [showWeeklyPathTutorial, setShowWeeklyPathTutorial] = useState<boolean>(false);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoIframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoPlayerRef = useRef<{ play: () => Promise<void>; pause: () => Promise<void>; setMuted: (muted: boolean) => Promise<void>; getMuted: () => Promise<boolean> } | null>(null);
  const router = useRouter();
  const snap = useSnapshotValtio(state);
  const heroRef = useRef<HTMLElement>(null);

  /** Clases que no pertenecen a un módulo (clases individuales) */
  const individualClasses = (classesDB ?? []).filter((c) => !c.moduleId);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const dispatch = useAppDispatch();
  const filterClassSlice = useAppSelector((state) => state.filterClass.value);
  const openModal = filterClassSlice.openModal;
  const auth = useAuth();

  // Transformaciones para efectos parallax
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const handleModal = () => {
    dispatch(setOpenModal(!openModal));
  };

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!auth.user) {
      auth.fetchUser();
    }
    
    if (auth.user && (auth.user.subscription?.active || auth.user.isVip)) {
      setIsMember(true);
      fetchCoherenceTracking();
      checkWeeklyPathContent();
    }
    
    setReload(true);
    filters != null && dispatch(setFilters(filters));
  }, [reload, auth, classesDB, dispatch, filters]);

  useEffect(() => {
    if (auth.user && (auth.user.subscription?.active || auth.user.isVip)) {
      const contratoAceptado = auth.user.subscription?.onboarding?.contratoAceptado || false;
      const tutorialCompletado = auth.user.subscription?.onboarding?.tutorialBitacoraCompletado || false;
      
      if (contratoAceptado && !tutorialCompletado) {
        setTimeout(() => {
          setShowWeeklyPathTutorial(true);
        }, 1000);
      }
    }
  }, [auth.user]);


  const fetchCoherenceTracking = async () => {
    try {
      const response = await fetch('/api/coherence/tracking', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setCoherenceStreak(data.tracking?.currentStreak || 0);
      }
    } catch (err) {
      console.error('Error obteniendo tracking:', err);
    }
  };

  const checkWeeklyPathContent = async () => {
    try {
      const response = await fetch('/api/bitacora/current', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setHasWeeklyPathContent(data.logbook && data.weeklyContent && data.weeklyContent.isPublished);
      }
    } catch (err) {
      console.error('Error verificando camino:', err);
      setHasWeeklyPathContent(false);
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: LIBRARY_HERO_VIDEO_ID }),
        });
        if (res.ok) {
          const data = await res.json();
          setVideoToken(data.privateToken ?? null);
        }
      } catch (e) {
        console.error('Error obteniendo token de video Library:', e);
      }
    };
    fetchToken();
  }, []);

  // Sin background=1 para que play/pause desde la API funcionen
  const libraryVideoUrl = `https://player.vimeo.com/video/${LIBRARY_HERO_VIDEO_ID}?autoplay=1&loop=1&muted=1&preload=auto&controls=0&title=0&byline=0&portrait=0${videoToken ? `&h=${videoToken}` : ''}`;

  // Inicializar controles del video hero (play/mute) cuando el iframe está en DOM
  useEffect(() => {
    if (!libraryVideoUrl || typeof window === 'undefined') return;
    let rawPlayer: { destroy: () => Promise<void> } | null = null;
    const t = setTimeout(() => {
      import('@vimeo/player').then(({ default: VimeoPlayer }) => {
        const iframe = videoIframeRef.current;
        if (!iframe) return;
        try {
          const p = new VimeoPlayer(iframe);
          rawPlayer = p;
          vimeoPlayerRef.current = {
            play: () => p.play(),
            pause: () => p.pause(),
            setMuted: (m) => p.setMuted(m).then(() => {}),
            getMuted: () => p.getMuted() as Promise<boolean>,
          };
          p.getMuted().then((m) => setIsMuted(m)).catch(() => {});
          p.on('play', () => setIsVideoPlaying(true));
          p.on('pause', () => setIsVideoPlaying(false));
          // Estado inicial: video con autoplay suele estar playing
          p.getPaused().then((paused) => setIsVideoPlaying(!paused)).catch(() => {});
        } catch (err) {
          console.error('Vimeo player init:', err);
        }
      });
    }, 500);
    return () => {
      clearTimeout(t);
      vimeoPlayerRef.current = null;
      rawPlayer?.destroy().catch(() => {});
    };
  }, [libraryVideoUrl]);

  const handleVideoPlayPause = async () => {
    const p = vimeoPlayerRef.current;
    if (!p) return;
    try {
      if (isVideoPlaying) await p.pause();
      else await p.play();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVideoMuteToggle = async () => {
    const p = vimeoPlayerRef.current;
    if (!p) return;
    try {
      const next = !isMuted;
      await p.setMuted(next);
      setIsMuted(next);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className='relative bg-palette-cream lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden font-montserrat'
      onScroll={(e: any) => {
        if (e.target.scrollTop === 0) {
          dispatch(toggleScroll(false));
        } else {
          dispatch(toggleScroll(true));
        }
      }}
    >
      <MainSideBar where={'library'}>
        <FilterNavWrapper>
          <Head>
            <title>Move Crew - Clases</title>
            <meta name='description' content='Clases de movimiento y entrenamiento' />
            <link rel='icon' href='/favicon.ico' />
          </Head>

          {/* Hero Section - En móvil: 100vh con orden título → video → descripción. En desktop: 2 columnas */}
          <motion.section
            ref={heroRef}
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
            className='relative w-full overflow-hidden bg-palette-cream min-h-[100vh] lg:min-h-[90vh] xl:min-h-[92vh]'
          >
            <div className='relative z-10 w-full h-full flex flex-col lg:grid grid-cols-1 lg:grid-cols-[0.42fr_0.58fr] xl:grid-cols-[0.38fr_0.62fr] 2xl:grid-cols-[0.36fr_0.64fr] gap-4 lg:gap-10 xl:gap-12 2xl:gap-14 px-6 md:px-12 lg:px-16 xl:px-20 2xl:px-24 pt-28 pb-8 md:pt-32 lg:pt-44 xl:pt-48 2xl:pt-52 lg:pb-32 xl:pb-36 min-h-0 lg:min-h-0'>
              {/* Web: columna izquierda (todo el contenido). Móvil: contents para que los hijos participen en el flex y el order */}
              <div className='contents lg:flex lg:flex-col lg:justify-center lg:items-start'>
                {/* 1) Label - móvil order 1 */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className='order-1 text-base md:text-base lg:text-base font-light tracking-[0.3em] uppercase text-palette-stone mb-3 md:mb-2 lg:mb-10 text-center lg:text-left shrink-0'
                >
                  Biblioteca Move Crew
                </motion.p>

                {/* 2) Título - móvil order 2 */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className='order-2 text-5xl sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-palette-ink mb-4 md:mb-3 lg:mb-10 xl:mb-12 tracking-tight leading-[1.1] text-center lg:text-left max-w-2xl lg:max-w-2xl xl:max-w-xl shrink-0'
                >
                  Tu espacio de{' '}
                  <span className='font-semibold italic'>movimiento</span>
                </motion.h1>

                {/* 4) Descripción - móvil order 4 (después del video) */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className='order-4 text-xl sm:text-2xl md:text-xl lg:text-xl xl:text-2xl text-palette-stone font-light max-w-xl lg:max-w-lg xl:max-w-xl leading-relaxed mb-5 lg:mb-10 xl:mb-12 text-center lg:text-left shrink-0'
                >
                  Desarrolla fuerza real, domina tu movilidad y muévete con mayor libertad.
                </motion.p>

                {/* 5) Botones - móvil order 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className='order-5 flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 shrink-0'
                >
                  <Link
                    href={routes.navegation.membership.weeklyPath}
                    className='inline-flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 lg:px-6 lg:py-3 xl:px-7 xl:py-3.5 rounded-full bg-palette-sage text-palette-ink text-sm md:text-base lg:text-base xl:text-base font-medium tracking-wide hover:bg-palette-sage/90 transition-all duration-200 shrink-0'
                  >
                    Mi Camino 
                    <svg className='w-4 h-4 md:w-5 md:h-5 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' /></svg>
                  </Link>
                  <a
                    href='#modulos'
                    className='inline-flex items-center justify-center px-5 py-3 md:px-6 md:py-3.5 lg:px-6 lg:py-3 xl:px-7 xl:py-3.5 rounded-full border-2 border-palette-sage bg-palette-cream text-palette-ink text-sm md:text-base lg:text-base xl:text-base font-medium tracking-wide hover:bg-palette-sage/15 transition-all duration-200 shrink-0'
                  >
                    Ver Caminos
                  </a>
                </motion.div>
              </div>

              {/* 3) Video - móvil order 3 (entre título y descripción). Web: columna derecha, rectángulo curvado */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className='order-3 lg:order-none relative w-full max-w-2xl lg:max-w-none lg:w-full mx-auto lg:mx-0 aspect-[1.75/1] lg:aspect-[1.85/1] rounded-2xl lg:rounded-3xl overflow-hidden bg-palette-stone/10 shadow-[0_8px_40px_rgba(20,20,17,0.12)] ring-1 ring-palette-stone/10 min-h-0 flex-1 lg:flex-none lg:self-center lg:min-w-0'
              >
                <iframe
                  ref={videoIframeRef}
                  src={libraryVideoUrl}
                  title='Biblioteca Move Crew'
                  className='absolute border-0 inset-0 w-full h-full pointer-events-none'
                  style={{
                    transform: 'scale(1.35)',
                    transformOrigin: 'center center',
                  }}
                  allow='autoplay; fullscreen; picture-in-picture'
                  allowFullScreen
                />
                {/* Controles overlay: play abajo izquierda, mute abajo derecha */}
                <div className='absolute inset-0 pointer-events-none flex items-end justify-between p-3 md:p-4'>
                  <button
                    type='button'
                    aria-label={isVideoPlaying ? 'Pausar' : 'Reproducir'}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVideoPlayPause(); }}
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    className='pointer-events-auto flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors'
                  >
                    {isVideoPlaying ? (
                      <svg className='w-6 h-6 md:w-7 md:h-7' fill='currentColor' viewBox='0 0 24 24'><rect x='6' y='4' width='4' height='16' rx='1'/><rect x='14' y='4' width='4' height='16' rx='1'/></svg>
                    ) : (
                      <svg className='w-6 h-6 md:w-7 md:h-7 ml-0.5' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z'/></svg>
                    )}
                  </button>
                  <button
                    type='button'
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVideoMuteToggle(); }}
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    className='pointer-events-auto flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors'
                  >
                    {isMuted ? (
                      <svg className='w-6 h-6 md:w-7 md:h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'/></svg>
                    ) : (
                      <svg className='w-6 h-6 md:w-7 md:h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'/></svg>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Opciones: Camino (clases semanales) o elegir un módulo */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className='relative w-full bg-palette-cream px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16 md:py-20 -mt-8 md:-mt-12'
          >
            <div className='max-w-7xl mx-auto'>
              {/* Título sección módulos */}
              <h2 id='modulos' className='text-xl md:text-2xl lg:text-3xl font-medium text-palette-ink text-center lg:text-left mb-10 md:mb-12 scroll-mt-6'>
                Elegí un camino
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10'>
                {classModules.map((m, idx) => {
                  const imgUrl = m.imageGallery?.[0]?.url ?? m.videoThumbnail ?? 'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg';
                  return (
                    <Link key={m._id} href={`/library/module/${m.slug}`} className='w-full flex flex-col items-center'>
                      <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className='w-full flex flex-col items-center group cursor-pointer'
                      >
                        <div className='relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-palette-stone/10 shadow-[0_4px_24px_rgba(20,20,17,0.06)] ring-1 ring-palette-stone/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(20,20,17,0.12)] hover:ring-palette-stone/20'>
                          <Image
                            src={imgUrl}
                            alt={m.name}
                            fill
                            className='object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                            sizes='(max-width: 768px) 100vw, 33vw'
                            loader={imageLoader}
                          />
                        </div>
                        <span className='mt-4 text-sm md:text-base font-light tracking-wide text-palette-ink'>
                          {m.name}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              {/* Clases individuales - grid debajo de los módulos (últimas 10) */}
              <h2 id='clases-individuales' className='text-xl md:text-2xl lg:text-3xl font-medium text-palette-ink text-center lg:text-left mt-24 md:mt-28 mb-8 md:mb-10 scroll-mt-6'>
                Clases individuales
              </h2>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
                {individualClasses.length > 0 ? (
                  individualClasses.slice(0, 10).map((c) => {
                    const imgUrl = c.image_base_link || c.image_url || 'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg';
                    return (
                      <Link
                        key={c._id}
                        href={`/library/individual-classes/${c.id}`}
                        className='group flex flex-col rounded-2xl overflow-hidden bg-palette-cream ring-1 ring-palette-stone/10 hover:ring-palette-stone/20 hover:shadow-lg transition-all duration-200'
                      >
                        <div className='relative w-full aspect-video overflow-hidden bg-palette-stone/10'>
                          <Image
                            src={imgUrl}
                            alt={c.name}
                            fill
                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                            loader={imageLoader}
                          />
                        </div>
                        <div className='p-3 md:p-4 flex flex-col min-h-0'>
                          <span className='font-medium text-palette-ink text-sm md:text-base line-clamp-2'>
                            {c.name}
                          </span>
                          <div className='flex items-center gap-2 mt-1 text-xs text-palette-stone'>
                            <span>{c.minutes} min</span>
                            {c.type && <span>·</span>}
                            {c.type && <span className='uppercase'>{c.type}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className='col-span-full text-center text-palette-stone text-sm md:text-base py-8'>
                    No hay clases individuales por ahora.
                  </p>
                )}
              </div>
              {individualClasses.length > 10 && (
                <div className='flex justify-center lg:justify-start mt-10 md:mt-12'>
                  <Link
                    href={routes.navegation.membership.individualClasses}
                    className='inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-palette-sage bg-palette-cream text-palette-ink font-medium text-base hover:bg-palette-sage/15 transition-all duration-200'
                  >
                    Ver más clases
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' /></svg>
                  </Link>
                </div>
              )}
            </div>
          </motion.section>

          <main className='relative bg-palette-cream'>
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className='mt-16 md:mt-24'
            >
              <Footer />
            </motion.section>
          </main>

          <Toaster />
        </FilterNavWrapper>
      </MainSideBar>
      
      {/* Tutorial de Camino */}
      <WeeklyPathMenuTutorial
        isOpen={showWeeklyPathTutorial}
        onComplete={async () => {
          setShowWeeklyPathTutorial(false);
          if (auth.user) {
            await auth.fetchUser();
          }
        }}
      />
    </div>
  );
};

export default Library;
