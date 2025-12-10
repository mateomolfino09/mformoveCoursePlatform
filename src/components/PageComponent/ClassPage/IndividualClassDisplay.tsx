'use client'
import ClassOptions from './ClassOptions';
import ClassQuestions from './ClassQuestions';
import ClassResources from './ClassResources';
import ClassThumbnail from './ClassThumbnail';
import VideoPlayer from './VideoPlayer';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import {
  ClassesDB,
  IndividualClass,
  Question,
  User
} from '../../../../typings';
import state from '../../../valtio';
import { Transition } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, FlagIcon } from '@heroicons/react/24/solid';
import MuiModal from '@mui/material/Modal';
import axios from 'axios';
import { useAnimation, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, {
  Fragment,
  RefObject,
  useEffect,
  useState
} from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import ReactPlayer from 'react-player';
import { useSnapshot } from 'valtio';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { error } from 'console';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import ClassData from './ClassData';
import ClassDescription from './ClassDescription';
import Footer from '../../Footer';
import VimeoPlayer from './VimeoPlayer';
import { routes } from '../../../constants/routes';
import MoveCrewLoading from '../MoveCrew/MoveCrewLoading';
import RecommendedClasses from './RecommendedClasses';

interface Props {
  clase: IndividualClass;
  questions: Question[] | undefined ;
}

function IndividualClassDisplay ({ clase, questions }: Props) {
  const [forward, setForward] = useState<boolean>(false);
  const [showNav, setShowNav] = useState(false);
  const [time, setTime] = useState<number | null | undefined>(null);
  const [play, setPlay] = useState<boolean>(false);
  const [resumeModal, setResumeModal] = useState<boolean>(false);
  const [hasWindow, setHasWindow] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [playerRef, setPlayerRef] = useState<RefObject<ReactPlayer> | null>(
    null
  );
  const dispatch = useAppDispatch()
  const snap = useSnapshot(state);

  const cookies = parseCookies();
  const router = useRouter();
  const MINUTE_MS = process.env.NEXT_PUBLIC_TIME_COURSE_SAVE
    ? +process.env.NEXT_PUBLIC_TIME_COURSE_SAVE
    : 0;
  const animation = useAnimation();

  const auth = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
      setWindowWidth(window.innerWidth);
      
      // Finalizar loading inicial después de un pequeño delay
      setTimeout(() => {
        setInitialLoading(false);
      }, 500);
    }
  }, []);

  const handleClose = () => {
    playerRef?.current && playerRef.current.seekTo(0);
    setResumeModal(false);
    // setPlay(true);
  };
  const handleLoad = (currentTime: number, totalTime: number) => {
    if (currentTime > 60) {
      setResumeModal(true);
    }
  };

  const handleRouteChange = async (route: string) => {
    setTime(playerRef?.current && playerRef.current.getCurrentTime());
    // await exitingFunction(
    //   playerRef?.current ? playerRef.current.getCurrentTime() : 0
    // );
    router.push(route);
  };

  useEffect(() => {
    
    const interval = setInterval(() => {
    //   exitingFunction(
    //     playerRef?.current ? playerRef.current.getCurrentTime() : 0
    //   );
    }, MINUTE_MS);

    // Asegurar que 'Preguntas' sea el valor por defecto al cargar la página
    if (!state.classHeaders || state.classHeaders === 'Temario') {
      state.classHeaders = 'Preguntas';
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNav) {
      animation.start({
        opacity: 100,
        transition: {
          delay: 0,
          ease: 'linear',
          duration: 1,
          stiffness: 0
        }
      });
    } else {
      animation.start({
        opacity: 100,
        transition: {
          delay: 0,
          ease: 'linear',
          duration: 0,
          stiffness: 0
        }
      });
    }
  }, [showNav]);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    // Si no hay cookies y la clase no es gratuita, redirigir a Move Crew
    if (!cookies && !clase?.isFree) {
      router.push('/move-crew');
      return;
    }

    // Si no hay usuario autenticado o no tiene suscripción activa (y no es Admin/VIP) y la clase no es gratuita
    if((!auth.user || (!auth?.user?.subscription?.active && auth?.user?.rol !== 'Admin' && !auth?.user?.isVip)) && !clase?.isFree) {
      router.push('/move-crew');
      return;
    }

    // Si no hay usuario, intentar obtenerlo pero sin abrir modal
    if(!auth.user) {
      auth.fetchUser();
    }

    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }

  }, [router, auth.user, clase?.isFree]);

  useEffect(() => {
    // Function to handle scroll event
    const handleScroll = () => {
      // Your code to handle scroll
      if(window.scrollY === 0) {
        dispatch(toggleScroll(false))
      }
      else {
        dispatch(toggleScroll(true))
      }
    };

    // Add scroll event listener when component mounts
    window.addEventListener('scroll', handleScroll);

    // Remove scroll event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <MoveCrewLoading show={initialLoading} />
      <MainSideBar where={'index'}>
        <div className='relative min-h-screen bg-black overflow-x-hidden font-montserrat'>
        <main className='relative flex flex-col bg-black'>
          {/* Sección del Video */}
          <section className='relative w-full bg-black pt-20 md:pt-16'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
              {hasWindow && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className='relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-black border border-gray-800/50 shadow-[0_15px_45px_rgba(0,0,0,0.6)]'
                >
                  <VimeoPlayer videoId={clase.link} />
                </motion.div>
              )}
            </div>
          </section>

          {/* Contenido Principal */}
          <section className='relative w-full bg-black py-8 md:py-12'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
                {/* Columna Principal */}
                <div className='lg:col-span-2 space-y-8'>
                  {/* Título y Tags */}
                  <ClassData
                    clase={clase}
                    setForward={setForward}
                    setTime={setTime}
                    playerRef={playerRef}
                  />

                  {/* Descripción */}
                  <ClassThumbnail clase={clase} />

                  {/* Tabs de Navegación */}
                  <ClassOptions clase={clase} />

                  {/* Contenido según tab seleccionado */}
                  <div className='w-full min-h-[400px]'>
                    {snap.classHeaders === 'Recursos' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ClassResources clase={clase} />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ClassQuestions
                          user={auth.user}
                          clase={clase}
                          questionsDB={questions ? questions : []}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Sidebar - Preguntas en Desktop */}
                {windowWidth > 1024 && (
                  <div className='lg:col-span-1'>
                    <div className='sticky top-24'>
                      <ClassQuestions 
                        user={auth.user} 
                        clase={clase} 
                        questionsDB={questions ? questions : []} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Clases Recomendadas */}
          <RecommendedClasses 
            currentClassId={clase._id || clase.id} 
            currentClassType={clase.type}
          />
        </main>
        {resumeModal && (
          <MuiModal
            open={resumeModal}
            onClose={handleClose}
            className='fixed z-50 flex items-center justify-center p-4'
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className='relative w-full max-w-md md:max-w-xl bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-md border border-amber-300/20 rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden'
            >
              <button
                onClick={handleClose}
                className='absolute right-4 top-4 z-40 h-8 w-8 flex items-center justify-center text-white/70 hover:text-white transition-colors'
              >
                <XCircleIcon className='h-6 w-6' />
              </button>
              
              <div className='p-8 md:p-12'>
                <h3 className='text-xl md:text-2xl font-montserrat font-semibold text-white mb-8 text-center'>
                  Esta clase ya fue empezada, ¿deseas continuar viendo desde donde quedaste?
                </h3>
                
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 text-white px-8 py-3 rounded-full font-montserrat font-medium hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300'
                  >
                    Continuar
                  </motion.button>
                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='bg-black/80 border border-gray-700/50 text-white px-8 py-3 rounded-full font-montserrat font-medium hover:border-gray-600/70 hover:bg-black/90 transition-all duration-300'
                  >
                    Empezar desde el inicio
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </MuiModal>
        )}
        <Footer />
        </div>
      </MainSideBar>
    </>
  );
}

export default IndividualClassDisplay;