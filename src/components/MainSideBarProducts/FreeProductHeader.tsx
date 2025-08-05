import { User } from '../../../typings';
import state from '../../valtio';
import { Menu, Popover, Transition } from '@headlessui/react';
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
import { Fragment, useContext, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import endpoints from '../../services/api';
import { CiMenuFries } from "react-icons/ci";

interface Props {
  user: User | null;
  toggleNav: any
}
const FreeProductHeader = ({ user, toggleNav }: Props) => {
  const router = useRouter();
  const headerAnimation = useAnimation();

  const [domLoaded, setDomLoaded] = useState(false);
  const snap = useSnapshot(state);

  useEffect(() => {
    setDomLoaded(true);
      headerAnimation.start({
        y: 100,
        transition: {
          damping: 5,
          stiffness: 40,
          restDelta: 0.001,
          duration: 1
        }
      });
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
          className={`bg-transparent fixed w-full h-16 flex justify-between items-center transition-all duration-[400ms] z-[250] -mt-24`}
        >
          <div className='pl-4 md:pl-16'>
            <img
              alt='icon image'
              src='/images/MFORMOVE_blanco03.png'
              width={180}
              height={180}
              className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-100'
            />
          </div>
          <div className='flex items-center pr-4 md:pr-16'>
            <Menu as='div' className='relative inline-block text-left'>
              <div>
                <Menu.Button className='inline-flex w-full justify-center items-center'>
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

export default FreeProductHeader;
