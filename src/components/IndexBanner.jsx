import { useAppDispatch } from '../hooks/useTypeSelector';
import imageLoader from '../../imageLoader';
import { loadCourse } from '../redux/courseModal/courseModalAction';
import state from '../valtio';
import { Video } from 'cloudinary-react';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

function Banner() {
  const dispatch = useAppDispatch();
  const animation = useAnimation();
  const snap = useSnapshot(state);
  const [hasWindow, setHasWindow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    if (!snap.volumeModal) {
      animation.start({
        color: '#d1cfcf6e',
        transition: {
          type: 'just',
          damping: 5,
          stiffness: 40,
          restDelta: 0.001,
          duration: 1
        }
      });
    }
  }, [snap.volumeModal]);

  const handleOpen = () => {
    dispatch(loadCourse());
  };

  return (
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24'>
      <div className='absolute top-0 left-0 h-[100vh] w-screen -z-10'>
        {/* <video src={'/video/videoTest3.mp4'} autoPlay loop muted={!snap.volumeIndex} className='object-cover h-full w-full'>

        </video> */}
        <Video
          cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
          publicId='pexels-tima-miroshnichenko-6068292-3840x2160-25fps_znl04z'
          autoPlay
          loop
          muted={!snap.volumeIndex}
          controls={false}
          className='object-cover h-full w-full hidden md:block'
        />
        <Image
          src={'/images/bgIndex2.jpg'}
          className='object-cover h-full w-full md:hidden opacity-40'
          fill
          loader={imageLoader}
        />
      </div>
      <Link href={'/src/home'}>
        <m.div
          initial={{ color: '#fff' }}
          animate={animation}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
          onClick={(e) => {
            e.currentTarget.style.color = '#fff';
            router.push('/src/home');
          }}
          className='flex flex-col justify-end items-end !mb-4 -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
        >
          <h2 className='font-light lg:text-xl'>Mis Clases</h2>
          <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl text-end'>
            Aprender en línea
          </h1>
        </m.div>
      </Link>
      <Link href={'/'}>
        <m.div
          initial={{ color: '#fff' }}
          animate={animation}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
          onClick={(e) => {
            e.currentTarget.style.color = '#fff';
            router.push('/');
          }}
          className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
        >
          <h2 className='font-light lg:text-xl'>En Línea</h2>
          <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>
            Corrientes
          </h1>
        </m.div>
      </Link>
      <Link href={'/aboutUs'}>
        <m.div
          initial={{ color: '#fff' }}
          animate={animation}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
          onClick={(e) => {
            e.currentTarget.style.color = '#fff';
            router.push('/aboutUs');
          }}
          className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
        >
          <h2 className='font-light lg:text-xl'>Sobre nosotros</h2>
          <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>
            Salón
          </h1>
        </m.div>
      </Link>

      <m.div
        initial={{ color: '#fff' }}
        animate={animation}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
        onClick={(e) => {
          e.currentTarget.style.color = '#fff';
          router.push('/');
        }}
        className='flex flex-col justify-end items-end  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
      >
        <h2 className='font-light lg:text-xl'>Mis Bienes</h2>
        <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>
          Comercio
        </h1>
      </m.div>
    </div>
  );
}

export default Banner;
