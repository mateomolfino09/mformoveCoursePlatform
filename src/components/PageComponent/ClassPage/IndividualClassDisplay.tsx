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
import { useAnimation } from 'framer-motion';
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
import HeaderHome from '../../HeaderHome';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import ClassData from './ClassData';
import ClassDescription from './ClassDescription';
import Footer from '../../Footer';
import VimeoPlayer from './VimeoPlayer';
import { routes } from '../../../constants/routes';

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

    window.innerWidth > 768 ? (state.classHeaders = 'Recursos') : null;

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
    
    if (!cookies && !clase?.isFree) {
      router.push('/login');
    }

    if(!auth.user && !clase?.isFree || (!auth?.user?.subscription?.active && auth?.user?.rol != 'Admin' && !auth?.user?.isVip && !clase?.isFree)) {
      router.push('/mentorship')
    }

    if(!auth.user) {
      auth.fetchUser()
      state.loginForm = true
    }
    else {
      state.loginForm = false
    }
    

    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }

  }, [router, auth.user, snap.loginForm]);

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
    <MainSideBar where={'index'}>
        <div className='relative h-full bg-dark overflow-x-clip md:pt-12 pt-0'>
        <main
            className={`relative flex flex-col bg-dark md:pl-11 md:top-16 lg:top-0 ${
            showNav ? '' : ''
            }`}
        >
            <div className='w-full h-full flex flex-row'> 
            {hasWindow && (
                <>
                <div className='w-full h-full lg:w-2/3'>
                    {/* <VideoPlayer
                    url={clase.link}
                    clase={clase}
                    img={clase.image_url}
                    courseUser={courseUser}
                    setPlayerRef={(val: any) => setPlayerRef(val)}
                    play={play}
                    /> */}
                    <VimeoPlayer
                    videoId={clase.link}
                  />
                </div>
                </>
            )}
            </div>
            {windowWidth > 1024 && (
            <div className='w-1/3 absolute right-0 hidden lg:block md:mt-12'>
                <ClassQuestions user={auth.user} clase={clase} questionsDB={questions ? questions : []} />
            </div>
            )}
            <ClassData
            clase={clase}
            setForward={setForward}
            setTime={setTime}
            playerRef={playerRef}
            />
            <ClassThumbnail clase={clase} />
            <ClassOptions clase={clase} />
            <div className='w-full h-full hidden'>
            {snap.classHeaders === 'Recursos' && (
                <>
                <ClassResources clase={clase} />
                </>
            )}
            {snap.classHeaders === 'Preguntas' && (
                <>
                <ClassQuestions
                    user={auth.user}
                    clase={clase}
                    questionsDB={questions ? questions : []}
                />
                </>
            )}
            </div>
            
        </main>
        {resumeModal && (
            <MuiModal
            open={resumeModal}
            onClose={handleClose}
            className='fixed z-50 m-auto w-full max-w-md md:max-w-xl max-h-48 overflow-hidden overflow-y-scroll rounded-md scrollbar-hide bg-[#181818]/90 shadow-2xl'
            >
            <>
                <button
                onClick={handleClose}
                className='modalButton absolute right-0 top-2 !z-40 h-9 w-9 border-none'
                >
                <XCircleIcon className='h-6 w-6' />
                </button>
                <div className='flex w-full h-full justify-center items-center p-12 relative bottom-6'>
                <h3 className='text-lg md:text-xl flex text-center'>
                    Esta clase ya fue empezada, desea continuar viendo desde el
                    minuto
                </h3>
                </div>
                <button
                className='modalButton absolute left-12 top-32 !z-40 h-8 w-24 md:w-32 bg-gray-200 text-black hover:scale-105 transition duration-300 shadow-2xl'
                >
                <h3 className='text-sm md:text-sm'>Continuar</h3>
                </button>
                <button
                onClick={handleClose}
                className='modalButton absolute right-12 top-32 !z-40 h-8 w-24 md:w-32 shadow-2xl
                    bg-black hover:scale-105 transition duration-300'
                >
                <h3 className='text-sm md:text-sm'>Descartar</h3>
                </button>
            </>
            </MuiModal>
        )}
        <Footer />
        </div>
    </MainSideBar>

  );
}

export default IndividualClassDisplay;