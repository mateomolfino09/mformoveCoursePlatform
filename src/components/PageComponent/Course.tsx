'use client'
import ClassBanner from '../ClassBanner';
import ClassBannerSideBar from '../ClassBannerSideBar';
import ClassOptions from '../ClassOptions';
import ClassQuestions from '../ClassQuestions';
import ClassResources from '../ClassResources';
import ClassThumbnail from '../ClassThumbnail';
import CourseData from '../CourseData';
import VideoPlayer from '../VideoPlayer';
import {
  ClassesDB,
  CourseUser,
  CoursesDB,
  Question,
  User
} from '../../../typings';
import state from '../../valtio';
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
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import { error } from 'console';

interface Props {
  clase: ClassesDB;
  user: User | null;
  courseDB: CoursesDB;
  questions: Question[];
}

function Course({ clase, user, courseDB, questions }: Props) {
  const [forward, setForward] = useState<boolean>(false);
  const [showNav, setShowNav] = useState(false);
  const [time, setTime] = useState<number | null | undefined>(null);
  const [play, setPlay] = useState<boolean>(false);
  const [resumeModal, setResumeModal] = useState<boolean>(false);
  const [courseUser, setCourseUser] = useState<CourseUser | null>(null);
  const [hasWindow, setHasWindow] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [playerRef, setPlayerRef] = useState<RefObject<ReactPlayer> | null>(
    null
  );
  const cookies = parseCookies();
  const router = useRouter();
  const MINUTE_MS = process.env.NEXT_PUBLIC_TIME_COURSE_SAVE
    ? +process.env.NEXT_PUBLIC_TIME_COURSE_SAVE
    : 0;
  const snap = useSnapshot(state);
  const animation = useAnimation();

  const auth = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);

      setWindowWidth(window.innerWidth);
    }

    
  }, []);

  const exitingFunction = async (actual = 0) => {
    const actualTime = actual == 0 ? time : actual;
    const idClass = clase.id;
    if (time != null && time != undefined) {
      const courseId = courseDB.id;
      const classId =
        idClass != undefined
          ? actual != 0
            ? +idClass
            : forward
            ? +idClass - 1
            : +idClass + 1
          : null;

      auth.saveClassTime(actualTime, courseId, classId)
    }
  };

  const handleClose = () => {
    playerRef?.current && playerRef.current.seekTo(0);
    setResumeModal(false);
    setPlay(true);
  };
  const handleLoad = (currentTime: number, totalTime: number) => {
    if (currentTime > 60) {
      setResumeModal(true);
    }
  };

  const handleMove = () => {
    playerRef?.current &&
      playerRef.current.seekTo(
        courseUser?.classes[clase.id - 1].actualTime
          ? courseUser?.classes[clase.id - 1].actualTime
          : 0
      );
    setResumeModal(false);
    setPlay(true);
  };

  const handleRouteChange = async (route: string) => {
    setTime(playerRef?.current && playerRef.current.getCurrentTime());
    await exitingFunction(
      playerRef?.current ? playerRef.current.getCurrentTime() : 0
    );
    router.push(route);
  };

  useEffect(() => {
    
    const interval = setInterval(() => {
      exitingFunction(
        playerRef?.current ? playerRef.current.getCurrentTime() : 0
      );
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
    exitingFunction();

  }, [router]);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else {
      let courseActual = auth.user.courses.find(
        (course: CourseUser) => course.course === courseDB._id
      );
      setTime(courseActual?.classes[clase.id - 1].actualTime);
      setCourseUser(courseActual ? courseActual : null);
      handleLoad(
        courseActual ? courseActual?.classes[clase.id - 1].actualTime : 0,
        playerRef?.current?.getDuration()
          ? playerRef?.current?.getDuration()
          : 0
      );
    }

    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }

  }, [router, auth.user]);

  return (
    <div className='relative h-full bg-gradient-to-b md:min-h-[100vh] bg-dark overflow-x-clip'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <header className={`bg-dark`}>
        <div onClick={() => handleRouteChange('/home')}>
          <img
            alt='Logo Video Stream'
            src='/images/logoWhite.png'
            width={80}
            height={80}
            className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-70 hover:opacity-90'
          />
        </div>
        <AiOutlineUser className='h-6 w-6 cursor-pointer' />
      </header>

      <main
        className={`relative  h-full flex flex-col bg-dark md:pl-11 md:top-16 lg:top-20 ${
          showNav ? '' : ''
        }`}
      >
        <div className='w-full h-full flex flex-row'>
          {hasWindow && (
            <>
              <div className='w-full h-full lg:w-2/3'>
                <VideoPlayer
                  url={`https://www.youtube.com/embed/${clase.class_code}?controls=1`}
                  title={clase.name ?? clase.name}
                  img={courseDB.image_url}
                  setPlayerRef={(val: any) => setPlayerRef(val)}
                  play={play}
                  isToShow={false}
                />
              </div>
            </>
          )}
        </div>
        {windowWidth > 1024 && (
          <div className='w-1/3 absolute right-0 hidden lg:block'>
            <ClassQuestions user={auth.user} clase={clase} questionsDB={questions} />
          </div>
        )}
        <CourseData
          course={courseDB}
          clase={clase}
          setForward={setForward}
          setTime={setTime}
          playerRef={playerRef}
        />
        <ClassThumbnail course={courseDB} clase={clase} />
        <ClassOptions course={courseDB} clase={clase} />
        <div className='w-full h-full'>
          {snap.classHeaders === 'Temario' && (
            <div className='md:hidden'>
              {courseDB.classes.map((clas: ClassesDB) => (
                <ClassBanner clase={clas} course={courseDB} key={clas.id}/>
              ))}
            </div>
          )}
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
                questionsDB={questions}
              />
            </>
          )}
          {/* <ClassDescription clase={clase} youtubeURL={youtubeURL} courseDB={courseDB}/> */}
        </div>
        <div
          className={`min-h-screen md:left-0 fixed ${
            showNav ? 'bg-black/40 z-50 w-screen' : ''
          }`}
        >
          <div
            className={`hidden lg:-top-0 h-12 w-12  absolute top-0 md:left-0  z-[200] justify-center items-center ${
              showNav ? 'md:hidden' : 'md:flex'
            }`}
            onClick={() => setShowNav(!showNav)}
          >
            <ChevronRightIcon className='w-8 text-gray-300/95' />
          </div>
          <Transition
            as={Fragment}
            show={showNav}
            enter='transform transition duration-[400ms]'
            enterFrom='-translate-x-full'
            enterTo='translate-x-0'
            leave='transform duration-[300ms] transition ease-in-out'
            leaveFrom='translate-x-48'
            leaveTo='-translate-x-full'
          >
            <ClassBannerSideBar
              showNav={showNav}
              courseDB={courseDB}
              clase={clase}
              setShowNav={setShowNav}
            />
          </Transition>
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
              onClick={handleMove}
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
    </div>
  );
}

export default Course;