import {
    CreditCardIcon,
    HomeIcon,
    PlusCircleIcon,
    TableCellsIcon,
    UserIcon
  } from '@heroicons/react/24/solid';
  import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
  import Link from 'next/link';
  import { useRouter, usePathname } from 'next/navigation';
  import React, { Fragment, forwardRef, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import state from '../valtio';
import { Transition } from '@headlessui/react';
import { useAuth } from '../hooks/useAuth';
import { IoCloseOutline } from "react-icons/io5";
import { useAppDispatch } from '../hooks/useTypeSelector';
import { toggleNav } from '../redux/features/filterClass';

interface Props {
    showNav: boolean
}

const FilterNav = ({ showNav }: Props) => {  
      const router = useRouter();
      const pathname = usePathname();
      const animation = useAnimation();
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      const animationPhones = useAnimation();
      const auth = useAuth()
        const dispatch = useAppDispatch()

      const snap = useSnapshot(state);

      useEffect(() => {
          animation.start({
            x: 0,
            transition: {
              damping: 5,
              stiffness: 40,
              restDelta: 0.001,
              duration: 0.2,
            }
          });
          animationPhones.start({
            x: 0,
            transition: {
              damping: 5,
              stiffness: 40,
              restDelta: 0.001,
              duration: 0.2,
            }
          });
      }, []);

      

    //   flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24

      return (
        <div className='fixed flex justify-end  w-full h-full bg-black md:bg-black/80 z-[300]'>

            <m.div initial={{ x: 700 }}
                animate={+windowWidth  < 768 ? animationPhones : animation} className='w-1/2 h-screen relative flex flex-col space-y-4 md:space-y-4 justify-start lg:items-end md:bg-white'>
                <div className='absolute right-0 top-2' onClick={() => dispatch(toggleNav(false))}>
                <IoCloseOutline className='text-white md:text-black w-10 h-10'/>
                </div>


            </m.div>
        </div>
      );
    }
  
  export default FilterNav;
  