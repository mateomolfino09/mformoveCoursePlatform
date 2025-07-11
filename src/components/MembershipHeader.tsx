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
import { useRouter, usePathname } from 'next/navigation';
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
const MembershipHeader = ({ user, toggleNav, where, showNav }: Props) => {
  const router = useRouter();
  const path = usePathname()
  const headerAnimation = useAnimation();
  const [isScrolled, setIsScrolled] = useState(false);
  const auth = useAuth();
    const linkRef = useRef<HTMLAnchorElement | null>(null);
    const linkMembRef = useRef<HTMLAnchorElement | null>(null);

    const handleClick = () => {
      linkRef.current?.click(); // Simula el clic en el enlace oculto
    };
    const handleClickMemb = () => {
      linkMembRef.current?.click(); // Simula el clic en el enlace oculto
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

  // Variable para pausar la membresía (debe estar sincronizada con la de la página)
  const IS_MEMBERSHIP_PAUSED = true;

  return (
    <>
      {domLoaded && (
        <m.div
          initial={{
            y: -100,
            opacity: 1
          }}
          animate={headerAnimation}
          className={`bg-transparent fixed w-full h-16 flex justify-between items-center px-8 md:gap-x-16 transition-all duration-[400ms] z-[250] ${where === "home" ? "mt-28" : ""} ${(isScrolled || headerScroll) && 'bg-[#F3F5F7]'} ${(path === routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail || path == routes.user.register) && !isScrolled && !headerScroll && 'md:bg-[#F3F5F7]'}`}
        >
          <div className=''>
            <Link href={`${path === routes.navegation.selectPlan ? routes.navegation.membresiaHome : path === routes.navegation.membresiaHome ? "/" : "/"}`}>
              <img
                alt='icon image'
                src='/images/MFORMOVE_v2.negro03.png'
                width={180}
                height={180}
                className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-100'
              />
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
                  {/* <a className="block rounded-lg py-2 px-3 transition hover:bg-black/5" href="#">
                    <p className="font-semibold text-black text-lg">Mentoría Online</p>
                    <p className="text-black/50 font-light -mt-1">Próximamente...</p>
                  </a>
                  <a className="block rounded-lg py-2 px-3 transition hover:bg-black/5" href="#">
                    <p className="font-semibold text-black text-lg">Clases Presenciales</p>
                    <p className="text-black/50 font-light -mt-1">Info</p>
                  </a> */}
                </div>
                <div>

                </div>
              </PopoverPanel>
            </Popover>
            {/* <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${path == routes.navegation.mentorship && '!text-black'}`} onClick={(e) => {
                e.currentTarget.style.color = '#fff';
                router.push('/mentorship');
              }}>Mentoría</div> */}
            {!IS_MEMBERSHIP_PAUSED && (
              <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${(path == routes.navegation.membresiaHome || path == routes.navegation.selectPlan) && '!text-black relative'}`} onClick={(e) => {
                  e.currentTarget.style.color = '#fff';
                  handleClickMemb();
                }}>
                    Membresia
                    {(path == routes.navegation.membresiaHome || path == routes.navegation.selectPlan) && (
                      <svg
                        width="120%"
                        height="8"
                        viewBox="0 0 120 8"
                        className="block mx-auto mt-0 relative left-1/2 -translate-x-1/2"
                        style={{ minWidth: '110%', maxWidth: '120%' }}
                      >
                        <ellipse cx="60" cy="4" rx="60" ry="3" fill="black" />
                      </svg>
                    )}
                  </div>
            )}
            <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${path == routes.navegation.mentorship && '!text-black relative'}`} onClick={(e) => {
                e.currentTarget.style.color = '#fff';
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
              <a href={`${routes.navegation.membresia(auth?.user?.subscription?.active || auth?.user?.isVip)}`} ref={linkMembRef} style={{ display: 'none' }}>
              Ir a Membresia
            </a>
            <a href="/account" ref={linkRef} style={{ display: 'none' }}>
              Ir a Cuenta
            </a>
            <div className={`block text-sm/6 text-black/50 focus:outline-none data-[active]:text-black data-[hover]:text-black data-[focus]:outline-1 data-[focus]:outline-black cursor-pointer hover:text-black focus:text-black active:text-black font-normal ${(path == routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail) && '!text-black relative'}`} onClick={(e) => {
                    e.currentTarget.style.color = '#fff';
                    if(!auth.user) {
                      router.push('/login')
                    }
                    else handleClick();

                  }}>Cuenta
                  {(path == routes.user.login || path == routes.user.forget || path == routes.user.forgetEmail) && (
                    <svg
                      width="120%"
                      height="8"
                      viewBox="0 0 120 8"
                      className="block mx-auto mt-0 relative left-1/2 -translate-x-1/2"
                      style={{ minWidth: '110%', maxWidth: '120%' }}
                    >
                      <ellipse cx="60" cy="4" rx="60" ry="3" fill="black" />
                    </svg>
                  )}
                  </div>

          </div>
        </div>
          <div className='flex items-center pr-4 md:pr-16'>
            <Menu as='div' className='relative inline-block text-left'>
              <div>
                <MenuButton className='inline-flex w-full justify-center items-center'>
                      <CiMenuFries className={`h-6 w-6 ${showNav ? 'text-white' : 'text-black' } `} onClick={toggleNav}/>                  
                </MenuButton>
              </div>
            </Menu>
          </div>
        </m.div>
      )}
    </>
  );
};

export default MembershipHeader;
