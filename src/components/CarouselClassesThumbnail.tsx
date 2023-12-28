import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { loadCourse, closeCourse } from '../redux/features/courseModalSlice'; 
import imageLoader from '../../imageLoader';
import { CourseUser, CoursesDB, IndividualClass, Ricks, User } from '../../typings';
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
import { IoLockClosedOutline } from "react-icons/io5";
import { HiOutlineLockClosed } from 'react-icons/hi2';

interface Props {
  c: IndividualClass;
  setSelectedClass: Dispatch<SetStateAction<IndividualClass | null>> | null;
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

function CarouselClassesThumbnail({
  courseIndex,
  isOpen,
  setIsOpen,
  setSelectedClass,
  c
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

  const user = auth.user


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);

  const addCourseToList = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const courseId = c?.id;
    const userId = user?._id;
    notify('Agregado a la Lista', true, false);
    auth.addCourseToList(courseId, userId)
    setListCourse([...listCourse, c]);
  };
  const removeCourseToList = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const courseId = c?.id;
    const userId = user?._id;
    auth.deleteCourseFromList(courseId, userId)
    notify('Eliminado de la Lista', false, false);
    setListCourse([
      ...listCourse.filter((value: CoursesDB) => value.id != c?.id)
    ]);
  };

  const handleOpen = () => {
    dispatch(loadCourse());
    if (setSelectedClass !== null) setSelectedClass(c);
  };

  return (
    <AnimatePresence>
        <div className='flex flex-col space-y-0'>
            <m.div
                className={`thumbnailClassContainer relative 
                h-[17rem] md:h-[19rem] transition-all duration-500
                } overflow-hidden `}
            >
                <div
                className={`thumb-class-color rounded-lg min-w-[20rem] min-h-[17rem] md:min-h-[19rem] md:min-w-[23rem]
                overflow-hidden`}
                />
                <div className='thumbnailClassesItem relative'>
                <Image
                    src={c.image_base_link}
                    className='object-cover rounded-lg'
                    alt={c.description}
                    loader={imageLoader}
                    fill={true}    
                    />
                </div>
                <div className={`absolute w-full h-full ${false ? 'bg-black/50 flex justify-center items-center' : 'hidden' } `}>
                    <HiOutlineLockClosed className='h-16 w-16 font-light'/>
                </div>
                <div className={`w-full h-2 bg-white rounded-lg mt-1`}>

                </div>
                <div className='flex flex-col justify-center items-start mt-1 w-full px-1 py-1'>
                    <h3 className='font-light text-xl mb-1'>{c.name}</h3>
                    <div className='flex justify-start space-x-8 items-center w-full'>
                        <p className="after:content-[''] after:mr-2 after:bg-white after:w-1 after:h-1 after:absolute after:bottom-3 after:left-[3.5rem] after:translate-y-[-50%]  after:rounded-full after:">{c.minutes} min</p>
                        <p className="after:content-[''] after:mr-2 after:bg-white after:w-1 after:h-1 after:absolute after:bottom-3 after:left-[7.3rem] after:translate-y-[-50%]  after:rounded-full after:">{c.type.toUpperCase()}</p>
                        <p className="after:content-[''] after:mr-2 ">Nivel {c.level}</p>


                    </div>
                </div>
            </m.div>
        </div>
    </AnimatePresence>
  );
}

export default CarouselClassesThumbnail;
