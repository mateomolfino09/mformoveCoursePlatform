import { User } from '../../../../typings';
import state from '../../../valtio';
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
import endpoints from '../../../services/api';
import { CiMenuFries } from "react-icons/ci";
import { useAppSelector } from '../../../redux/hooks';
import { routes } from '../../../constants/routes';

interface Props {
  user: User | null;
  toggleNav: any
}
const ProductHeader = ({ user, toggleNav }: Props) => {
  const router = useRouter();
  const headerAnimation = useAnimation();
  const [domLoaded, setDomLoaded] = useState(false);
  const snap = useSnapshot(state);
  const headerScroll = useAppSelector(
    (state: any) => state.headerHomeReducer.value.scrollHeader
    );
  const pathname = usePathname()
  console.log('hola')

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
        <m.div initial={{
            y: -100,
        }}
        animate={headerAnimation} className={`bg-light-cream fixed w-full h-16 flex flex-col items-center transition-all duration-500 z-[250]`}>
            <div
            className={` w-full h-full flex justify-between items-center`}
            >
            <div className='pl-4 md:pl-16'>
                <a href={pathname != routes.navegation.membresiaHome ? routes.navegation.membresiaHome : `/`}>
                <img
                    alt='icon image'
                    src='/images/MFORMOVE_v2.negro03.png'
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
                        <CiMenuFries className='h-6 w-6 text-black' onClick={toggleNav}/>                  
                    </Menu.Button>
                </div>
                </Menu>
            </div>

            </div>
            <hr className='text-black border-gray-300/80 border-[0.5px] w-full border-solid'/>
        </m.div>

      )}

    </>
  );
};

export default ProductHeader;
