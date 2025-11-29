import { User } from '../../typings';
import state from '../valtio';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  Bars3CenterLeftIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  CreditCardIcon,
  PencilIcon
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next13-progressbar';
import { usePathname } from 'next/navigation';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import endpoints from '../services/api';
import { CiMenuFries } from "react-icons/ci";
import { useAppSelector } from '../redux/hooks';
import { throttle } from 'lodash';
import { Menu, MenuButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { useAuth } from '../hooks/useAuth';
import { routes } from '../constants/routes';

interface Props {
  user: User | null;
  toggleNav: any
  where: any
  showNav: any
}
const IndexHeader = ({ user, toggleNav, where, showNav }: Props) => {
  const router = useRouter();
  const path = usePathname()
  const headerAnimation = useAnimation();
  const [isScrolled, setIsScrolled] = useState(false);
  const auth = useAuth();
    const linkRef = useRef<HTMLAnchorElement | null>(null);

    const handleClick = () => {
      linkRef.current?.click(); // Simula el clic en el enlace oculto
    };
  const [domLoaded, setDomLoaded] = useState(false);
  const snap = useSnapshot(state);
  const headerScroll = useAppSelector(
    (state: any) => state.headerHomeReducer.value.scrollHeader
    );

  useEffect(() => {

    const handleScroll = () => {
      let scroll = 0;
      scroll = (window.scrollY);

    if (scroll > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router]);

  useEffect(() => {
    setDomLoaded(true);
      where === "home" ?
      headerAnimation.start({
        y: 100,
        transition: {
          damping: 5,
          stiffness: 40,
          restDelta: 0.001,
          duration: 1
        }
      }) :      
      headerAnimation.start({
        y: 0,
        transition: {
          damping: 5,
          stiffness: 40,
          restDelta: 0.001,
          duration: 1
        }
      }) ;
    [];
  });

  return (
    <>
      {domLoaded && (
        <m.div
          initial={{
            y: -100,
            opacity: 1
          }}
          animate={headerAnimation}
          className={`bg-transparent fixed w-full h-16 flex justify-between items-center px-8 md:gap-x-16 transition-all duration-[400ms] z-[250] ${(isScrolled || headerScroll) && 'bg-white/80'} ${where === "home" ? "mt-28" : ""}`}
        >
          <div className=''>
            <Link href="/">
            <>
              {showNav ? (
                <>
              <img
                alt='icon image'
                src='/images/MFORMOVE_blanco03.png'
                width={180}
                height={180}
                className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-100'
              /></>
              ) : (
              <>               
              <img
                alt='icon image'
                src='/images/MFORMOVE_v2.negro03.png'
                width={180}
                height={180}
                className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-80'
              />
              </>
              )}
            </>
            </Link>
          </div>
          <div className="flex w-full justify-center">
          <div className={`gap-8 font-montserrat relative -left-8 ${showNav ? 'md:hidden' : 'md:flex'} hidden`}>
          <Popover>
              <PopoverButton className="block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black font-normal">
              Escuela
              </PopoverButton>
              <PopoverPanel
                transition
                anchor="bottom"
                className="divide-y divide-black/5 rounded-xl bg-black/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-8)] data-[closed]:-translate-y-1 data-[closed]:opacity-0 mt-4 font-normal"
              >
                <div className="p-4 font-montserrat">
                  <a className="block rounded-lg py-2 px-3 transition hover:bg-black/5" target="_blank" href="https://www.google.com/maps/place/Kinetikuy/@-34.9040232,-56.1706911,17z/data=!3m1!4b1!4m6!3m5!1s0x959f81d3c44ddd3d:0x4850160c4c6b00bb!8m2!3d-34.9040232!4d-56.1681108!16s%2Fg%2F11g0tpk3g3?entry=ttu&g_ep=EgoyMDI1MDIyNC4wIKXMDSoASAFQAw%3D%3D">
                    <p className="font-semibold text-black text-lg">Montevideo</p>
                    <p className="text-black/50 font-light -mt-1">Kinetic</p>
                  </a>
                </div>
                <div />
              </PopoverPanel>
            </Popover>
            <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${path == routes.navegation.mentorship && '!text-black'}`} onClick={() => {
                router.push('/mentorship');
              }}>
                Mentoría
                {path == routes.navegation.mentorship && (
                  <svg
                    width="100%"
                    height="3"
                    viewBox="0 0 120 5"
                    className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
                    style={{ minWidth: '100%', maxWidth: '100%' }}
                  >
                    <ellipse cx="60" cy="4" rx="60" ry="3" fill="black" />
                  </svg>
                )}
            </div>
            <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${path == routes.navegation.eventos && '!text-black'}`} onClick={() => {
                router.push(routes.navegation.eventos);
              }}>
                Eventos
                {path == routes.navegation.eventos && (
                  <svg
                    width="100%"
                    height="3"
                    viewBox="0 0 120 5"
                    className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
                    style={{ minWidth: '100%', maxWidth: '100%' }}
                  >
                    <ellipse cx="60" cy="4" rx="60" ry="3" fill="black" />
                  </svg>
                )}
            </div>
            {/* Membresía eliminada */}
            <a href="/account" ref={linkRef} style={{ display: 'none' }}>
              Ir a Cuenta
            </a>
            <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${(path == routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail || path == routes.user.perfil || path == '/account') && '!text-black'}`} onClick={() => {
                    if(!auth.user) {
                      router.push('/login')
                    }
                    else handleClick();
                  }}>
                Cuenta
                {(path == routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail || path == routes.user.perfil || path == '/account') && (
                  <svg
                    width="100%"
                    height="3"
                    viewBox="0 0 100 5"
                    className="block mx-auto mt-0 relative bottom-1 left-1/2 -translate-x-1/2"
                    style={{ minWidth: '100%', maxWidth: '100%' }}
                  >
                    <ellipse cx="60" cy="4" rx="60" ry="3" fill="black" />
                  </svg>
                )}
            </div>
          </div>
        </div>
          <div className='flex items-center pr-4 md:pr-16 gap-3'>
            {auth.user?.rol === 'Admin' && (
              <Cog8ToothIcon
                className={`h-6 w-6 cursor-pointer ${showNav ? 'text-white' : 'text-black/80'} hover:text-black`}
                onClick={() => router.push('/admin')}
              />
            )}
            <Menu as='div' className='relative inline-block text-left'>
              <div>
                <MenuButton className='inline-flex w-full justify-center items-center'>
                      <CiMenuFries className={`h-6 w-6 ${showNav && 'text-white'}`} onClick={toggleNav}/>                  
                </MenuButton>
              </div>
            </Menu>
          </div>
        </m.div>
      )}
    </>
  );
};

export default IndexHeader;
