import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
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
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import { CiBookmarkCheck, CiUnlock, CiMobile4 } from "react-icons/ci";
import { HiComputerDesktop } from "react-icons/hi2";
import { useForm } from 'react-hook-form';



interface Props {
}

const LoginModal = () => {
  const router = useRouter();
  const pathname = usePathname();
  const animation = useAnimation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const animationPhones = useAnimation();
  const auth = useAuth();
  const [errorMessage, setErrorMessage] = useState(null);
  const { register, handleSubmit, formState: { errors,  } } = useForm()

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

  const validateForm = () => {

  }

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
    <div className='fixed flex justify-center md:items-center items-end w-full h-full bg-black/70 z-[300]'>
     <div className='w-96 md:w-[30rem] h-[90%] relative bottom-0 md:mb-12 md:h-[95%] md:mt-12 bg-white rounded-2xl'>
        <Image src='/images/image00006.jpeg' 
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover object-top rounded-2xl'/>
        <div className='absolute bg-gradient-to-w from-stone-50 to-slate-50  h-full w-full rounded-2xl overflow-scroll scrollbar-hide'>
          <div className='w-full py-12 px-8 flex flex-col'> 
            <h1 className='text-black font-bold text-2xl md:text-3xl pr-12 mt-4 capitalize'>Registrate para empezar</h1>
            <div className='mt-12 w-full h-full flex flex-col justify-start space-y-1 capitalize'>
              <div className='flex justify-start space-x-4 items-center h-20 w-96'>
                <div>
                <CiUnlock className='text-[#7912FD] w-8 h-8' style={{flex: '0 1 18%'}}/>

                </div>
                <div className='flex space-y-1 flex-col text-black'>
                  <h4 className='text-xl font-bold'>Acceso Instantáneo</h4>
                  <p className='text-sm font-medium'>Obtene acceso Instantáneo a la plataforma de MForMove</p>
                </div>
              </div>
              <div className='flex justify-start space-x-4 items-center h-20 w-96 '>
                <div>
                  <CiBookmarkCheck style={{flex: '0 1 18%'}} className='text-[#7912FD] w-8 h-8'/>
                </div>
                <div className='flex space-y-1 flex-col text-black'>
                  <h4 className='text-xl font-bold'>Transforma Tu Vida</h4>
                  <p className='text-sm font-medium'>Sumate al Estilo de Vida del Movimiento</p>
                </div>
                
              </div>
              <div className='flex justify-start space-x-4 items-center h-20 w-96'>
                <div>
                  <CiMobile4 className='text-[#7912FD] w-8 h-8' style={{flex: '0 1 18%'}}/>

                </div>
                <div className='flex space-y-1 flex-col text-black'>
                  <h4 className='text-xl font-bold'>Practica Donde Quieras, Cuando Quieras</h4>
                  <p className='text-sm font-medium'>Acceso Total, Estés Donde Estés</p>
                </div>
                
              </div>
            </div>

          </div>
          <form className=" shadow-md rounded px-8 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nombre
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="name" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="example@gmail.com" />
              <p className="text-red-500 text-xs italic">Please choose a email.</p>
            </div>
            <div className="flex items-center justify-between">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In
              </button>
              <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                Forgot Password?
              </a>
            </div>
        </form>
        </div>


     </div>
    </div>
  );
};

export default LoginModal;
