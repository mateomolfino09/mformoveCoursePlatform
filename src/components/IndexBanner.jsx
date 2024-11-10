import { useAppDispatch } from '../hooks/useTypeSelector';
import imageLoader from '../../imageLoader';
import { loadCourse, closeCourse } from '../redux/features/courseModalSlice'; 
import state from '../valtio';
import { Video } from 'cloudinary-react';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import Footer from './Footer';
import { CldImage } from 'next-cloudinary';
import Vimeo from '@u-wave/react-vimeo';


function Banner() {
  const dispatch = useAppDispatch();
  const animation = useAnimation();
  const snap = useSnapshot(state);
  const [hasWindow, setHasWindow] = useState(false);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Asegúrate de que la biblioteca de Vimeo se cargue solo en el lado del cliente
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    const handleResize = () => setIsMobile(window.innerWidth <= 768); // Ajusta el ancho según tus necesidades
    handleResize();
    window.addEventListener('resize', handleResize);

    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }

    return () => {
      document.body.removeChild(script);
      window.removeEventListener('resize', handleResize);
    };
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

  const handleLoad = () => {
    setIsLoading(false); // Cambia el estado cuando el iframe termina de cargar
  };

  return (
    <>
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 min-h-[100vh] justify-end lg:items-end mr-12 lg:mr-24  overflow-hidden'>
      <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
        {isLoading && (
          <div className="absolute inset-0 mb-12 flex items-center justify-center bg-black bg-opacity-75">
            <span className="text-white">Cargando...</span>
          </div>
        )}
        {isMobile ? (
            <iframe
            src="https://player.vimeo.com/video/1023611525?autoplay=1&loop=1&background=1&muted=1&preload=auto"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute top-0 left-0 w-full h-full"
            title="videointroMFM"
            style={{ transform: 'scale(1.2)', objectFit: 'cover' }} // Aumenta el tamaño del video
            onLoad={handleLoad}

          />
        ) : (
          <iframe
             src="https://player.vimeo.com/video/1023607510?autoplay=1&loop=1&background=1&muted=1&preload=auto"
             frameBorder="0"
             allow="autoplay; fullscreen; picture-in-picture"
             className="absolute top-0 left-0 w-full h-full"
             title="videointroMFM"
             style={{ transform: 'scale(1.1)', objectFit: 'cover' }} // Aumenta el tamaño del video
             onLoad={handleLoad}

           />
        )}
        {/* <Vimeo
          video={"1023607510"}
          muted
          autoplay
          loading="eager"  // Simulación de preload
          loop
          controls={false}
          className='object-cover h-full w-full overflow-hidden'

        /> */}
        {/* <Video
          cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
          publicId='Untitled_phr1ga'
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          className='object-cover h-full w-full overflow-hidden'
        /> */}
        {/* <CldImage layout='fill'
          alt="" src={"my_uploads/image00014_tqwhm5"} className="object-contain h-full object-top w-full md:object-cover md:object-bottom opacity-80" /> */}
        {/* <Image
          src={'/images/bgIndex2.jpg'}
          className='object-cover h-full w-full md:hidden opacity-40'
          fill
          loader={imageLoader}
        /> */}
      </div>
    </div>

    </>
  );
}

export default Banner;
