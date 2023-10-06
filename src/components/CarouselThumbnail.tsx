import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { loadCourse, closeCourse } from '../redux/features/courseModalSlice'; 
import imageLoader from '../../imageLoader';
import { CourseUser, CoursesDB, Ricks, User } from '../../typings';
import {
  ChevronDownIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import zIndex from '@mui/material/styles/zIndex';
import axios from 'axios';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AiOutlineCheckCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { BiAddToQueue } from 'react-icons/bi';
import { BsPlayCircle } from 'react-icons/bs';
import { FaHistory, FaPlay } from 'react-icons/fa';
import { GiDiploma } from 'react-icons/gi';
import { GoCreditCard } from 'react-icons/go';
import { MdAdd, MdBlock, MdOutlineClose, MdRemove } from 'react-icons/md';
import { TbLockOpenOff } from 'react-icons/tb';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useGlobalContext } from '../app/context/store';

interface Props {
  course: CoursesDB;
  setSelectedCourse: Dispatch<SetStateAction<CoursesDB | null>> | null;
  user: User | null;
  courseIndex: number;
  isOpen: number;
  setIsOpen: any;
}

const notify = (message: String, agregado: boolean, like: boolean) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          like ? 'notificationWrapperLike' : 'notificationWrapper'
        } ${t.visible ? 'top-0' : '-top-96'}`}
      >
        <div className={'iconWrapper'}>
          {agregado ? <AiOutlineCheckCircle /> : <AiOutlineMinusCircle />}
        </div>
        <div className={`contentWrapper`}>
          <h1>{message}</h1>
          {like ? (
            <p>Le has dado {message} a este curso</p>
          ) : (
            <p>Este curso ha sido {message} exitosamente</p>
          )}
        </div>
        <div className={'closeIcon'} onClick={() => toast.dismiss(t.id)}>
          <MdOutlineClose />
        </div>
      </div>
    ),
    { id: 'unique-notification', position: 'top-center' }
  );

function CarouselThumbnail({
  course,
  setSelectedCourse,
  user,
  courseIndex,
  isOpen,
  setIsOpen
}: Props) {
  const dispatch = useAppDispatch();
  const [courseUser, setCourseUser] = useState<CourseUser | null>(null);
  const [zIndex, setZIndex] = useState(0);
  const { listCourse, setListCourse } = useGlobalContext();
  const animation = useAnimation();
  const animationButton = useAnimation();
  const animationArrow = useAnimation();
  const auth = useAuth()
  const router = useRouter()


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);


  useEffect(() => {
    if (isOpen == course.id) {
      animation.start({
        y: 70,
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });

      animationButton.start({
        y: -15,
        display: 'flex',
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });
      animationArrow.start({
        transform: 'rotate(180deg)',
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });
    } else {
      animation.start({
        y: 0,
        zIndex: 500,
        transition: {
          delay: 0,
          ease: 'linear',
          duration: 0.33,
          stiffness: 0
        }
      });

      animationButton.start({
        y: 50,
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0,
          modifyTarget: ''
        },
        end: zIndex
      });

      animationArrow.start({
        transform: 'rotate(0deg)',
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.25,
          stiffness: 0
        }
      });
    }
  }, [isOpen]);

  const addCourseToList = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const courseId = course?.id;
    const userId = user?._id;
    notify('Agregado a la Lista', true, false);
    auth.addCourseToList(courseId, userId)
    setListCourse([...listCourse, course]);
  };
  const removeCourseToList = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const courseId = course?.id;
    const userId = user?._id;
    auth.deleteCourseFromList(courseId, userId)
    notify('Eliminado de la Lista', false, false);
    setListCourse([
      ...listCourse.filter((value: CoursesDB) => value.id != course?.id)
    ]);
  };

  const handleOpen = () => {
    dispatch(loadCourse());
    if (setSelectedCourse !== null) setSelectedCourse(course);
  };

  return (
    <AnimatePresence>
      <m.div
        className={`thumbnailContainer relative ${
          isOpen == course.id
            ? 'h-[25rem] md:h-[30rem] transition-all duration-500'
            : 'h-[20rem] md:h-[25rem] transition-all duration-500'
        } overflow-hidden `}
      >
        <div
          className={`thumb-color rounded-lg min-w-[20rem] min-h-[25rem] md:min-h-[30rem] md:min-w-[23rem] ${
            isOpen == course.id ? 'max-h-[25rem] md:max-h-[30rem]' : ''
          } overflow-hidden`}
        />
        <div className='thumbnailItem relative'>
          <div className='absolute bottom-0 h-28 z-[100] thumbnailItem'>
            <div className='flex justify-between'>
              <h4 className='text-white text-lg md:text-xl lg:text-2xl mt-2 ml-2 font-light'>
                {course?.name}
              </h4>
              <h4 className='text-white text-base md:text-lg lg:text-xl mt-2 mr-2 font-light'>
                {course?.currency} {course?.price}
              </h4>
            </div>
            <div className='flex w-full relative  h-full flex-col py-4 mt-4 justify-start space-y-8 z-[100]'>
              <m.div
                initial={{ y: 0 }}
                animate={animation}
                onClick={(e) => {
                  e.currentTarget.style.color = '#fff';
                }}
                className='flex flex-row items-center '
              >
                <div className='cursor-pointer w-8 h-8 bg-white rounded-full flex justify-center items-center transition ml-2 first:text-black hover:bg-black hover:text-white hover:first:text-white'>
                  <PlayIcon className=' w-6 h-6 z-[200]' onClick={handleOpen} />
                </div>
                <div className='cursor-pointer w-8 h-8 bg-transparent border-white  border rounded-full flex justify-center items-center transition  ml-2'>
                  {auth.user && !auth.user?.courses[courseIndex]?.inList ? (
                    <MdAdd
                      className=' text-white w-6 h-6'
                      onClick={() => addCourseToList()}
                    />
                  ) : (
                    <MdRemove
                      className=' text-white w-6 h-6'
                      onClick={() => removeCourseToList()}
                    />
                  )}
                </div>
                {!courseUser?.purchased && user?.rol !== 'Admin' && (
                  <div className='cursor-pointer group/item w-8 h-8 border-white border rounded-full flex justify-center items-center transition hover:border-neutral-300 ml-2'>
                    <TbLockOpenOff className='text-white group-hover/item:text-neutral-300 w-6' />
                  </div>
                )}

                <m.div
                  initial={{ y: 0 }}
                  animate={animationArrow}
                  className='cursor-pointer ml-auto group/item w-8 h-8 border-white border rounded-full flex justify-center items-center transition hover:border-neutral-300 mr-2'
                >
                  <ChevronDownIcon
                    className='text-white group-hover/item:text-neutral-300 w-6 z-[200]'
                    onClick={() =>
                      isOpen !== course.id ? setIsOpen(course.id) : setIsOpen(0)
                    }
                  />
                </m.div>
              </m.div>
              <m.div
                initial={{ display: 'none', y: 0 }}
                animate={animationButton}
                className={`absolute flex justify-between h-auto w-full !mt-0`}
              >
                <div className='flex w-full h-auto flex-col '>
                  {!courseUser?.purchased && user?.rol !== 'Admin' ? (
                    <Link href={`/courses/purchase/${course.id}`}>
                      <button
                        className='flex items-center gap-x-2 ml-2 rounded-md px-4 py-1 text-sm transition duration-500 hover:scale-105 md:py-1.5 md:px-6 md:text-base
         bg-white text-black font-light hover:bg-black hover:text-white hover:first:text-white'
                      >
                        <BiAddToQueue className='h-3 w-3 md:h-4 md:w-4 hover:text-white' />{' '}
                        Obtener
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={handleOpen}
                      className='flex items-center gap-x-2 ml-2 rounded-md px-4 py-1 text-sm transition duration-500 hover:scale-105 md:py-1.5 md:px-6 md:text-base bg-white text-black font-light max-w-[5.5rem] md:max-w-[7rem] hover:bg-black hover:text-white hover:first:text-white '
                    >
                      <BsPlayCircle className='h-3 w-3 md:h-4 md:w-4 text-center ml-0.5' />{' '}
                      Ver
                    </button>
                  )}
                </div>
                <div className='w-1/2 flex flex-col mr-2'>
                  <div className='w-full text-end mr-2 flex flex-row relative'>
                    <GoCreditCard className='text-white group-hover/item:text-neutral-300 w-6 absolute -ml-6' />
                    <p className='text-xs md:text-sm font-light relative left-1'>
                      Hasta 12 cuotas{' '}
                    </p>
                  </div>
                  <div className='w-full text-end mr-2 flex flex-row relative'>
                    <FaHistory className='text-white group-hover/item:text-neutral-300 w-6 absolute -ml-6' />
                    <p className='text-xs md:text-sm relative left-1 font-light'>
                      {Math.floor(
                        course?.classes
                          .map((c) => c.totalTime)
                          .reduce((prev, current) => prev + current) /
                          60 /
                          60
                      )}{' '}
                      hrs{' '}
                      {Math.floor(
                        (course?.classes
                          .map((c) => c.totalTime)
                          .reduce((prev, current) => prev + current) /
                          60) %
                          60
                      )}{' '}
                      min{' '}
                    </p>
                  </div>
                  <div className='w-full text-end mr-2 flex flex-row relative'>
                    <GiDiploma className='text-white group-hover/item:text-neutral-300 w-6 absolute -ml-6' />
                    <p className='text-xs md:text-sm relative left-1 font-light'>
                      Certificado Lavis{' '}
                    </p>
                  </div>
                </div>
              </m.div>
            </div>
          </div>
          <CldImage
            src={course?.image_url}
            preserveTransformations
            width={1000}
            height={1000}
            className={`cldImage`}
            alt={course?.name}
            loader={imageLoader}
          />
        </div>
        <div
          className={`${
            isOpen == course.id ? 'flex z-[0]' : 'hidden'
          } w-full  h-full flex-col p-4 justify-start space-y-8 `}
        >
          <div className='flex flex-row items-center ' />
          <div className='flex flex-row mt-0 lg:mt-4 gap-2 items-center' />
        </div>
      </m.div>
    </AnimatePresence>
  );
}

export default CarouselThumbnail;
