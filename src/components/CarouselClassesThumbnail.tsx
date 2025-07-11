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
import { MdAdd, MdBlock, MdOutlineClose, MdRemove } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import { CiLock } from 'react-icons/ci';
import { setOpenModal } from '../redux/features/filterClass';
import state from '../valtio';
import { useRouter } from 'next/navigation';
import { classFilters } from '../constants/classFilters';
interface Props {
  c: IndividualClass;
  isNew: boolean;
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
  c,
  isNew }: Props) {
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<any>(null);

  const filterClassSlice = useAppSelector(
    (state) => state.filterClass.value
    );

    const checkLogin = () => {
      if(!auth.user) {
        state.loginForm = true;
        return false;
      }
      else {
        state.loginForm = false;
        return true
      }
    }
  

  const ComponentToRender = ({ children }: any) =>  (
    <>
      {(auth.user && ((auth?.user?.subscription?.active || auth?.user?.rol === "Admin" || auth?.user?.isVip) || c.isFree))  ? (
        <>
        <Link href={`/classes/${c.id}`}>
            {children}
          </Link>
        </>
      ) : (
        <div onClick={() => {
          checkLogin() ? router.push('/mentorship') : null;
        }}>
            {children}
        </div>
      )}
    </>
  )

  return (
    <AnimatePresence>
        <ComponentToRender>

        <div className='flex flex-col space-y-0'>
            <m.div
                className={`thumbnailClassContainer relative 
                h-[17rem] md:h-[19rem] transition-all duration-500
                } overflow-hidden `} onMouseEnter={() => {
                  setHoveredIndex(c.id)}
                } 
                onMouseLeave={() => setHoveredIndex(null)}
            > 
                <div
                className={`thumb-class-color group rounded-lg min-w-[20rem] md:min-w-[23rem]
                overflow-hidden`}
                />
                <div className='thumbnailClassesItem relative'>
                <CldImage
                  src={c?.image_url}
                  preserveTransformations
                  // width={1000}
                  // height={1000}
                  className={`cldImage`}
                  alt={c?.description}
                  loader={imageLoader}
                  fill={true}
                />
                {/* <Image
                    src={c.image_url}
                    className='object-cover rounded-lg'
                    alt={c.description}
                    loader={imageLoader}
                    fill={true}    
                    /> */}
                </div>
                <div className="absolute group/item w-full md:h-[12.94rem] h-[11.25rem]"          
                >
                  <div className={` w-full h-full ${!auth?.user?.subscription?.active && auth?.user?.rol !== "Admin" && c.isFree == false && !auth?.user?.isVip ? 'bg-black/20 justify-center flex items-center h-full border-t-md' : 'hidden' } hover:flex`}>
                      <CiLock className={`h-14 text-xs w-14 ${hoveredIndex === c.id ? "block" : "hidden"}  font-light`}/>
                  </div>
                </div>

                <div className={`${auth?.user && auth.user?.classesSeen?.includes(c._id) ? "h-2 bg-white" : " bg-white/80 h-1"} w-full rounded-lg mt-1`}>

                </div>
                <div className='flex flex-col justify-center items-start mt-1 w-full px-1 py-1'>
                    <h3 className='font-light text-lg mb-1'>{c.name}</h3>
                    <div className='flex justify-start space-x-4 items-center w-full'>
                        <p className=" text-xs font-light">{c.minutes} min</p>
                        <p className={`text-xs ${c.type?.toUpperCase() == classFilters[0].value.toUpperCase() ? "" : c.type?.toUpperCase() == classFilters[1].value.toUpperCase() ? "" : c.type?.toUpperCase() == classFilters[2].value.toUpperCase() ? "" : ""} font-light after:`}>{c.type?.toUpperCase()}</p>
                        <p className=" text-xs font-light after:mr-2 ">Nivel {c.level}</p>


                    </div>
                </div>
                  {/* Rectángulo en diagonal para mostrar "FREE" */}
                {c.isFree && (
                  <div className="absolute top-4 left-[-30px] w-[120px] h-[30px] bg-[#a38951] font-boldFont text-white font-bold text-center transform rotate-[-45deg] flex justify-center items-center">
                    <p className='text-sm'>GRATIS</p>
                  </div>
                )}
                {isNew && !c.isFree && (
                  <div className="absolute top-4 left-[-30px] w-[120px] h-[30px] bg-soft-black font-boldFont text-white font-bold text-center transform rotate-[-45deg] flex justify-center items-center">
                    <p className='text-sm'>NUEVA</p>
                  </div>
                )}
            </m.div>
        </div>
        
        </ComponentToRender>
    </AnimatePresence>
  );
}

export default CarouselClassesThumbnail;
