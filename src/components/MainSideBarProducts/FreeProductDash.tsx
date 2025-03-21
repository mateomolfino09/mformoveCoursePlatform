import { useAuth } from '../../hooks/useAuth';
import state from '../../valtio';
import { Transition } from '@headlessui/react';
import {
  CreditCardIcon,
  HomeIcon,
  PlusCircleIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { Fragment, forwardRef, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

interface Props {
  showNav: boolean;
}

const FreeProductMainSideBarDash = ({ showNav }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const animation = useAnimation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const animationPhones = useAnimation();
  const auth = useAuth();

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    // Attach the event listener when the component mounts
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); //

  const snap = useSnapshot(state);

  useEffect(() => {
    animation.start({
      color: '#d1cfcf6e',
      x: 0,
      transition: {
        damping: 5,
        stiffness: 40,
        restDelta: 0.001,
        duration: 0.2
      }
    });
    animationPhones.start({
      x: 0,
      transition: {
        damping: 5,
        stiffness: 40,
        restDelta: 0.001,
        duration: 0.2
      }
    });
  }, []);

  //   flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24

  return (
    <div className='fixed   w-full h-full bg-black z-[200]'>
      <div className='w-full h-full relative top-40 md:top-28 right-12 flex flex-col space-y-4 md:space-y-4 justify-start lg:items-end mr-12 lg:mr-24'>
        {(!auth.user || !auth?.user?.subscription?.active) && (
        //   <Link href={'/membership'}>
            <m.div
              initial={{ color: '#fff', x: 700 }}
              animate={+windowWidth < 768 ? animationPhones : animation}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              onClick={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              className='flex flex-col justify-end items-end !mb-4 -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
            >
              <h2 className='font-extralight lg:text-xl'>Clases Online</h2>

              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl text-end'>
                Próximamente...
              </h1>
            </m.div>
        )}
        {auth.user && auth?.user?.subscription?.active && (
            <m.div
              initial={{ color: '#fff', x: 700 }}
              animate={+windowWidth < 768 ? animationPhones : animation}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              onClick={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              className='flex flex-col justify-end items-end !mb-4 -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
            >
              <h2 className='font-extralight lg:text-xl'>Clases Online</h2>

              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl text-end'>
                Próximamente...
              </h1>
            </m.div>
        //   </Link>
        )}
        {/* <Link href={'/products'}> */}
          <m.div
            initial={{ color: '#fff', x: 700 }}
            animate={+windowWidth < 768 ? animationPhones : animation}
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
            <h2 className='font-light lg:text-xl'>Productos</h2>
            <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl'>
                Próximamente...
            </h1>
          </m.div>
        {/* </Link> */}
        {/* <Link href={'/about'}> */}
          <m.div
            initial={{ color: '#fff', x: 700 }}
            animate={+windowWidth < 768 ? animationPhones : animation}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
            onClick={(e) => {
              e.currentTarget.style.color = '#fff';
            //   router.push('/about');
            }}
            className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
          >
            <h2 className='font-light lg:text-xl'>Sobre nosotros</h2>
            <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl'>
              Mateo Molfino
            </h1>
          </m.div>
        {/* </Link> */}
        {/* {!auth.user ? (
          <Link href={'/login'}>
            <m.div
              initial={{ color: '#fff', x: 700 }}
              animate={+windowWidth < 768 ? animationPhones : animation}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              onClick={(e) => {
                e.currentTarget.style.color = '#fff';
                router.push(' ');
              }}
              className='flex flex-col justify-end items-end  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
            >
              <h2 className='font-light lg:text-xl'>Login </h2>
              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl'>
                Ingresar al sitio
              </h1>
            </m.div>
          </Link>
        ) : (
          <>
            <Link href={'/account'}>
              <m.div
                initial={{ color: '#fff', x: 700 }}
                animate={+windowWidth < 768 ? animationPhones : animation}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = '#d1cfcf6e')
                }
                onClick={(e) => {
                  e.currentTarget.style.color = '#fff';
                }}
                className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
              >
                <h2 className='font-light lg:text-xl'>Perfil</h2>
                <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl'>
                  Mi Cuenta
                </h1>
              </m.div>
            </Link>
          </>
        )} */}

        {auth.user && auth.user.rol === 'Admin' && (
          <>
            <m.div
              initial={{ color: '#fff', x: 700 }}
              animate={+windowWidth < 768 ? animationPhones : animation}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              onClick={(e) => {
                e.currentTarget.style.color = '#fff';
                router.push('/admin');
              }}
              className='flex flex-col justify-end items-end  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
            >
              <h2 className='font-light lg:text-xl'>Admin</h2>
              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl'>
                Dashboard
              </h1>
            </m.div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreeProductMainSideBarDash;
