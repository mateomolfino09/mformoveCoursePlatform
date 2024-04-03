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
interface Props {
  c: IndividualClass;
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
  c
}: Props) {
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const filterClassSlice = useAppSelector(
    (state) => state.filterClass.value
    );
  

  const ComponentToRender = ({ children }: any) => (
    <>
      {auth.user && auth?.user?.subscription?.active ? (
        <>
        <Link href={`/classes/${c.id}`}>
            {children}
          </Link>
        </>
      ) : (
        <div onClick={() => dispatch(setOpenModal(!filterClassSlice.openModal))}>
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
                } overflow-hidden `}
            >
                <div
                className={`thumb-class-color group rounded-lg min-w-[20rem] min-h-[17rem] md:min-h-[19rem] md:min-w-[23rem]
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
                <div className={`absolute w-full h-full ${!auth?.user || (!auth?.user?.isMember && auth.user.rol !== "Admin")  ? 'hover:bg-black/50 justify-center items-center' : '' } hidden hover:flex`}>
                    <CiLock className='h-14 text-xs w-14 font-light'/>
                </div>
                <div className={`${auth?.user && auth.user?.classesSeen?.includes(c._id) ? "h-2 bg-white" : " bg-white/80 h-1"} w-full rounded-lg mt-1`}>

                </div>
                <div className='flex flex-col justify-center items-start mt-1 w-full px-1 py-1'>
                    <h3 className='font-light text-xl mb-1'>{c.name}</h3>
                    <div className='flex justify-start space-x-8 items-center w-full'>
                        <p className="after:content-[''] after:mr-2 after:bg-white after:w-1 after:h-1 after:absolute after:bottom-3 after:left-[3.5rem] after:translate-y-[-50%]  after:rounded-full after:">{c.minutes} min</p>
                        <p className="after:content-[''] after:mr-2 after:bg-white after:w-1 after:h-1 after:absolute after:bottom-3 after:left-[7.3rem] after:translate-y-[-50%]  after:rounded-full after:">{c.type?.toUpperCase()}</p>
                        <p className="after:content-[''] after:mr-2 ">Nivel {c.level}</p>


                    </div>
                </div>
            </m.div>
        </div>
        
        </ComponentToRender>
    </AnimatePresence>
  );
}

export default CarouselClassesThumbnail;
