import { useAuth } from '../../hooks/useAuth';
import state from '../../valtio';
import { motion as m, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import './MainSidebarDashboard.css';
import { routes } from '../../constants/routes';

interface Props {
  showNav: boolean;
  where: any;
  toggleNav: any;
}

const MainSideBarDash = ({ showNav, where, toggleNav }: Props) => {
  const router = useRouter();
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

  // Variable para pausar la membresía (debe estar sincronizada con la de la página)
  const IS_MEMBERSHIP_PAUSED = true;

  const navMotionProps = {
    initial: { color: '#fff', x: 700 },
    animate: +windowWidth < 768 ? animationPhones : animation,
  };

  const itemShell =
    'flex w-full flex-col items-stretch text-right gap-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer';

  return (
    <div className='fixed inset-0 z-[200] flex flex-col bg-black font-montserrat overflow-hidden'>
      <div className='flex flex-1 flex-col min-h-0 justify-center gap-7 md:gap-9 px-6 pb-10 pt-[4.5rem] md:px-12 md:pt-24 md:pb-14 lg:px-16 lg:pr-24 overflow-y-auto scrollbar-hide overscroll-contain'>
        {!IS_MEMBERSHIP_PAUSED && (
          <Link href={routes.navegation.membership.library} className='block w-full shrink-0'>
            <m.div
              {...navMotionProps}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              className={itemShell}
            >
              <h2 className='font-light lg:text-xl'>Membresía</h2>
              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
                Movete conmigo
              </h1>
            </m.div>
          </Link>
        )}
        <Link href={routes.navegation.moveCrew} className='group block w-full shrink-0'>
          <m.div
            {...navMotionProps}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
            className={itemShell}
          >
            <h2 className='font-light lg:text-xl'>Programas</h2>
            <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
              Ver programas
            </h1>
          </m.div>
        </Link>
        <Link href='/mentoria' className='block w-full shrink-0'>
          <m.div
            {...navMotionProps}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
            className={itemShell}
          >
            <h2 className='font-light lg:text-xl'>Mentoría</h2>
            <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
              Entrena 1 a 1
            </h1>
          </m.div>
        </Link>
        <Link href={routes.navegation.eventos} className='block w-full shrink-0'>
          <m.div
            {...navMotionProps}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
            className={itemShell}
          >
            <h2 className='font-light lg:text-xl'>Talleres y Eventos</h2>
            <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
              Experiencias
            </h1>
          </m.div>
        </Link>
        {!auth.user && (where != 'products' || where != 'productsLibrary') ? (
          <Link href={'/iniciar-sesion'} className='block w-full shrink-0'>
            <m.div
              {...navMotionProps}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              onClick={(e) => {
                e.currentTarget.style.color = '#fff';
                toggleNav();
              }}
              className={itemShell}
            >
              <h2 className='font-light lg:text-xl'>Cuenta</h2>
              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
                Ingresar al sitio
              </h1>
            </m.div>
          </Link>
        ) : (
          <>
            {!auth.user && (where == 'products' || where == 'productsLibrary') ? (
              <>
                <m.div
                  {...navMotionProps}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#d1cfcf6e')
                  }
                  onClick={(e) => {
                    e.currentTarget.style.color = '#fff';
                    toggleNav();
                    state.loginForm = true;
                  }}
                  className={`${itemShell} shrink-0`}
                >
                  <h2 className='font-light lg:text-xl'>Cuenta</h2>
                  <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
                    Ingresar al sitio
                  </h1>
                </m.div>
              </>
            ) : (
              <a href={'/cuenta'} className='block w-full shrink-0'>
                <m.div
                  {...navMotionProps}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#d1cfcf6e')
                  }
                  onClick={(e) => {
                    e.currentTarget.style.color = '#fff';
                  }}
                  className={itemShell}
                >
                  <h2 className='font-light lg:text-xl'>Cuenta</h2>
                  <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
                    Perfil
                  </h1>
                </m.div>
              </a>
            )}
          </>
        )}

        {/* <Link href="/preguntas-frecuentes">
          <m.div
            initial={{ color: '#fff', x: 700 }}
            animate={+windowWidth < 768 ? animationPhones : animation}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
            className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'
          >
            <h2 className='font-light lg:text-xl'>Ayuda</h2>
            <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl'>
              Preguntas Frecuentes
            </h1>
          </m.div>
        </Link> */}

        {auth.user && auth.user.rol === 'Admin' && (
          <>
            <m.div
              {...navMotionProps}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d1cfcf6e')}
              onClick={(e) => {
                e.currentTarget.style.color = '#fff';
                router.push('/admin');
              }}
              className={`${itemShell} shrink-0`}
            >
              <h2 className='font-light lg:text-xl'>Admin</h2>
              <h1 className='text-4xl font-thin lg:text-6xl md:text-4xl leading-[1.08] w-full'>
                Dashboard
              </h1>
            </m.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainSideBarDash;
