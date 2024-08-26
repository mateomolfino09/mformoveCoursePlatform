'use client';

import { toast } from 'react-toastify';
import imageLoader from '../../../../imageLoader';
import { Plan, User } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import Footer from '../../Footer';
import { LoadingSpinner } from '../../LoadingSpinner';
import MainSideBar from '../../MainSideBar';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion as m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const SuccessOneTimePayment = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log(auth.user);
    if (!user?.subscription) {
      handleMembership();
    } else if (!auth.user) {
      auth.fetchUser();
    } else {
      setLoading(false);
      Cookies.remove('userPaymentToken');
    }
  }, [auth.user]);

  const handleMembership = () => {
    setLoading(true);
    const paymentToken = Cookies.get('userPaymentToken');

    if (!paymentToken) {
      toast.error(`No tienes token de membresia, te redireccionaremos al inicio...`);
      router.push('/home');
      return;
    }

    const fetchMembership = async () => {
      try {
        const user = auth.user;
        if (!user) {
          await auth.fetchUser();
          return;
        }
        const data = await auth.newMembership(user._id, paymentToken);
        if (data.error) {
          toast.error(`${data.error}`);
          router.push('/home');
        } else {
          setUser(data.user);
          toast.success(`Membership creada con éxito`);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  };

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }

    const handleScroll = () => {
      if (window.scrollY === 0) {
        dispatch(toggleScroll(false));
      } else {
        dispatch(toggleScroll(true));
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
     <MainSideBar where={''}>
       <div className='h-[100vh]  w-full bg-transparent items-center justify-center relative flex overflow-x-hidden'>
         <div className='absolute top-0 left-0 h-full w-screen -z-10'>
           <Image
             src='/images/image00006.jpeg'
             alt={'image'}
             fill={true}
             loader={imageLoader}
             className='object-cover opacity-50 '
           />
         </div>
         <m.div
           initial={{ y: '-150%' }}
           animate={{ y: '0%' }}
           transition={{ duration: 0.9, ease: 'easeOut' }}
           exit={{ opacity: 1 }}
           className='w-96 relative lg:w-[28rem] md:left-32 lg:left-1/4 bottom-24'
         >
           <div className='flex'>
             <h1 className='text-4xl md:text-5xl font-light mb-6'>
               Bienvenido a la Membresía de MforMove
             </h1>
             <AiFillCheckCircle className='h-32 w-32 text-green-500' />
           </div>
           <p className='text-base md:text-lg font-light'>
             Elevate your Practice: Rooted in Science, Cultivated with
             Mindfulness. Uniting Yoga, Movement, Breathwork, and Skill-Based
             Training with Dylan Werner
           </p>
           {loading ? (
             <>
               <LoadingSpinner />
             </>
           ) : (
             <div className='flex px-24 py-3 mt-6 border-white border rounded-full justify-center items-center w-full group cursor-pointer hover:bg-white hover:text-black'>
               <button className='w-full' onClick={() => router.push('/')}>
                 Empezar{' '}
               </button>
               <ArrowRightIcon className='w-4 h-4 relative left-4' />
             </div>
           )}
         </m.div>
       </div>
       <Footer />
     </MainSideBar>
  );
};

export default SuccessOneTimePayment;
