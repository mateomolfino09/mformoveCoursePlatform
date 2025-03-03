import { User } from '../../typings';
import state from '../valtio';
import { Menu, Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  Bars3CenterLeftIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  CreditCardIcon,
  PencilIcon
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion as m, useAnimation, useScroll } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Fragment, useContext, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import endpoints from '../services/api';
import { CiMenuFries } from "react-icons/ci";
import { useAppSelector } from '../redux/hooks';
import { routes } from '../constants/routes';

interface Props {
  user: User | null;
  toggleNav: any
}
const HeaderHome = ({ user, toggleNav }: Props) => {
  const router = useRouter();
  const headerAnimation = useAnimation();
  const [domLoaded, setDomLoaded] = useState(false);
  const snap = useSnapshot(state);
  const headerScroll = useAppSelector(
    (state: any) => state.headerHomeReducer.value.scrollHeader
    );
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {

    const handleScroll = () => {
      console.log(window.scrollY > 0)
      if (window.scrollY > 0) {
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
      headerAnimation.start({
        y: 0,
        transition: {
          damping: 5,
          stiffness: 20,
          restDelta: 0.001,
          duration: 0.1
        }
      }) ;
    [];
  })

  return (
    <>
      {domLoaded && (
        <m.div
          initial={{
            y: -100,
          }}
          animate={headerAnimation}
          className={`${headerScroll ? 'bg-black/80 fixed' : 'bg-transparent fixed'} ${isScrolled && 'bg-[#141414]'}  w-full h-16 flex justify-between items-center transition-all duration-500 z-[250]`}
        >
          <div className='pl-4 md:pl-16'>
            <a href={pathname != routes.navegation.membresiaHome ? routes.navegation.membresiaHome : `/`}>
              <img
                alt='icon image'
                src='/images/MFORMOVE_blanco03.png'
                width={180}
                height={180}
                className={`${headerScroll ? 'max-w-[120px]' : 'min-w-[100px] mt-1'} cursor-pointer object-contain transition-all duration-100 hover:scale-105 opacity-100`}
              />
            
            </a>
          </div>
          <div className={`${!headerScroll && 'mt-1'} flex items-center pr-4 md:pr-16`}>
            <Menu as='div' className='relative inline-block text-left'>
              <div>
                <Menu.Button className={'inline-flex w-full justify-center items-center'}>
                      <CiMenuFries className='h-6 w-6' onClick={toggleNav}/>                  
                </Menu.Button>
              </div>
            </Menu>
          </div>
        </m.div>
      )}
    </>
  );
};

export default HeaderHome;
