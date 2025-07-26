import { useAppDispatch } from '../../hooks/useTypeSelector';
import imageLoader from '../../../imageLoader';
import state from '../../valtio';
import { Video } from 'cloudinary-react';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import Footer from '../Footer';
import { CldImage } from 'next-cloudinary';

function FreeProductBanner({ product }) {
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

  return (
    <>
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 min-h-[100vh] justify-end lg:items-end mr-12 lg:mr-24  overflow-hidden'>
      <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
        {/* <video src={'/video/videoTest3.mp4'} autoPlay loop muted={!snap.volumeIndex} className='object-cover h-full w-full'>

        </video> */}
        <CldImage
            src={product?.image_url}
            preserveTransformations
            width={1000}
            height={1000}
            className={`object-cover h-full w-full opacity-40`}
            alt={product?.name}
            loader={imageLoader}
          />
      </div>
    </div>

    </>
  );
}

export default FreeProductBanner;
