import { headContentAnimation } from '../config/motion';
import { CoursesContext } from '../hooks/coursesContext';
import imageLoader from '../../imageLoader';
import { loadCourse, closeCourse } from '../redux/features/courseModalSlice'; 
import { Images } from '../../typings';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion as m } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { BsPlayCircle } from 'react-icons/bs';
import { FaPlay } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../redux/hooks'

interface Props {
  scrollToModa: any;
}

function Banner({ scrollToModa }: Props) {
  // const srcImg: string = image?.urls.regular != null ? image?.urls.regular : ''
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleOpen = () => {
    dispatch(loadCourse());
  };

  return (
    <AnimatePresence>
      <div className='relative bg-to-dark h-screen flex flex-col space-y-2 py-16'>
        <div className='absolute top-0 left-0 h-full w-screen -z-10'>
          <Image
            src='/images/bgHome.jpg'
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover'
          />
        </div>

        <m.div
          {...headContentAnimation}
          className='flex flex-col space-y-4 md:space-y-12 relative top-40 px-8 md:px-12'
        >
          <h1 className='text-3xl font-medium lg:text-7xl md:text-4xl '>
            Lavis Academy
          </h1>
          <p className='text-lg font-normal lg:text-2xl md:text-xl'>
            Descubre tu potencial: aprende con nosotros a crear tu propio estilo
            y expresarte con confianza.
          </p>
          <div className='flex space-x-3 !mt-16 md:!mt-32'>
            <button
              className='bannerButton bg-white text-black font-light'
              onClick={scrollToModa}
            >
              <BsPlayCircle className='h-5 w-5 text-black md:h-6 md:w-6 ' />{' '}
              Comenzar
            </button>
            <button
              className='bannerButton darkGray font-light'
              onClick={() => router.push('/aboutUs')}
            >
              <InformationCircleIcon className='h-6 w-6 md:h-7 md:w-7 ' />
              Más Info{' '}
            </button>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}

export default Banner;
