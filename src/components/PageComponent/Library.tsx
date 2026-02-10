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
  const router = useRouter();
  const snap = useSnapshotValtio(state);
  const heroRef = useRef<HTMLElement>(null);
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

  const libraryVideoUrl = `https://player.vimeo.com/video/${LIBRARY_HERO_VIDEO_ID}?autoplay=1&loop=1&muted=1&background=1&preload=auto${videoToken ? `&h=${videoToken}` : ''}`;

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

          {/* Hero Section - Mitad izquierda: contenido; mitad derecha: video */}
          <motion.section
            ref={heroRef}
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
            className='relative w-full overflow-hidden bg-palette-cream min-h-[70vh] lg:min-h-[85vh]'
          >
            <div className='relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 pt-24 md:pt-32 pb-16 md:pb-24'>
              {/* Columna izquierda: texto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className='max-w-2xl mx-auto lg:mx-0 text-center lg:text-left'
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className='text-xs md:text-sm font-light tracking-[0.3em] uppercase text-palette-stone mb-6 md:mb-8'
                >
                  Biblioteca Move Crew
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className='text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-palette-ink mb-6 md:mb-8 tracking-tight leading-[1.1]'
                >
                  Tu espacio de{' '}
                  <span className='font-semibold italic'>movimiento</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className='text-lg md:text-xl text-palette-stone font-light max-w-xl leading-relaxed mb-8'
                >
                  Desarrolla fuerza real, domina tu movilidad y muévete con mayor libertad.
                </motion.p>

                {/* Botones finos, chicos y redondeados */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className='flex flex-col sm:flex-row flex-wrap items-start gap-3'
                >
                  <Link
                    href={routes.navegation.membership.weeklyPath}
                    className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-palette-teal text-palette-white text-sm font-light tracking-wide hover:bg-palette-deep-teal transition-all duration-200'
                  >
                    Empezar a Practicar
                    <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' /></svg>
                  </Link>
                  <a
                    href='#modulos'
                    className='inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-palette-sage bg-palette-cream text-palette-ink text-sm font-light tracking-wide hover:bg-palette-sage/15 transition-all duration-200'
                  >
                    Ver Módulos
                  </a>
                </motion.div>
              </motion.div>

              {/* Columna derecha: video - rectángulo horizontal (menos altura) */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className='relative w-full max-w-2xl mx-auto lg:mx-0 aspect-[2/1] lg:aspect-[2.2/1] rounded-2xl overflow-hidden bg-palette-stone/10 shadow-[0_8px_40px_rgba(20,20,17,0.12)] ring-1 ring-palette-stone/10'
              >
                <iframe
                  src={libraryVideoUrl}
                  title='Biblioteca Move Crew'
                  className='absolute border-0 inset-0 w-full h-full'
                  style={{
                    transform: 'scale(1.35)',
                    transformOrigin: 'center center',
                  }}
                  allow='autoplay; fullscreen; picture-in-picture'
                  allowFullScreen
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Opciones: Camino (clases semanales) o elegir un módulo */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className='relative w-full bg-palette-cream px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12 md:py-16 -mt-8 md:-mt-12'
          >
            <div className='max-w-7xl mx-auto'>
              {/* Título sección módulos */}
              <h2 id='modulos' className='text-xl md:text-2xl font-light text-palette-ink text-center mb-8 md:mb-10 scroll-mt-6'>
                O elegí un módulo
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
