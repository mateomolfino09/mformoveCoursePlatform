'use client';

import { toast } from 'react-toastify';
import imageLoader from '../../../../imageLoader';
import { Plan, User } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import Footer from '../../Footer';
import { LoadingSpinner } from '../../LoadingSpinner';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion as m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button, Transition } from '@headlessui/react';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';

interface Props {}

const Success = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const router =  useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [created, setCreated] = useState<boolean | null>(false);
  const searchParams = useSearchParams();
  const external_id = searchParams.get('external_id');  // Capturamos el external_id
  const subCalled = useRef(false);
  let [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth]);

  useEffect(() => {
    if (!subCalled.current && auth.user && !user?.subscription && !created) {
      handleSub();
    }
  }, [auth.user]);

  useEffect(() => {
    if(!loading) {
      setIsShowing(false)
      setTimeout(() => setIsShowing(true), 500)    
    }
  }, [loading])

  const handleSub = async () => {
    subCalled.current = true; // Previene llamadas futuras al subscribe
    setLoading(true);
    
    const planId = Cookies.get('planToken');

    console.log(planId, external_id)

    if (!external_id || !planId) {
      toast.error(`No tienes token de subscripcion, te redireccionaremos al inicio...`);
      // router.push('/select-plan');
      return;
    }
    else {
    try {
        const data = await auth.newSub(external_id, planId);
        if (data.error && !created) {
          toast.error(`${data?.error}`);
        } else {
          setUser(data.user);
          await auth.fetchUser();
          toast.success(`Subscriptor creado con éxito`);
          setCreated(true);
        }
      } catch (error: any) {
        toast.error(`${error?.error ?? 'Hubo un error'}`);
      } finally {
        setLoading(false);
      }
    }


  };

  useEffect(() => {
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
  }, [dispatch]);

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
        {loading ? (
          <>
          <LoadingSpinner/>
          </>
        ) : (
          <Transition show={isShowing}>
          <div
            className='w-96 relative lg:w-[38rem] bottom-24 rounded-xl transition duration-1000
                data-[closed]:scale-50 data-[closed]:rotate-[-120deg] data-[closed]:opacity-0
                data-[leave]:duration-200 data-[leave]:ease-in-out
                data-[leave]:data-[closed]:scale-95 data-[leave]:data-[closed]:rotate-[0deg]'
          >
            <div className='flex'>
              <h1 className='text-4xl md:text-5xl font-normal mb-6 font-montserrat'>
                Bienvenido a la Membresía de MforMove
              </h1>
              <AiFillCheckCircle className='h-32 w-32 text-green-500' />
            </div>
            <p className='text-base md:text-lg italic font-light font-montserrat'>
              Eleva tu práctica: Enriquecida con presencia. Integra movimiento, ejercicios de respiración y entrenamiento basado en capacidades orgánicas.
            </p>
            <p className='text-xs md:text-normal font-montserrat font-bold mt-2'>Mateo Molfino</p>

            {/* <div className='flex px-24 py-3 mt-6 border-white border rounded-full justify-center items-center w-full group cursor-pointer hover:bg-white hover:text-black'> */}
            <Button onClick={() => router.push('/home')} className="  gap-2 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-rich-black/50 data-[open]:bg-rich-black data-[focus]:outline-1 data-[focus]:outline-white mt-4 flex px-24 py-3 transition-all duration-700 font-montserrat border-white border rounded-full justify-center items-center w-full group cursor-pointer">
            Empezar
            <ArrowRightIcon className='w-4 h-4 relative left-4' />
            </Button>
              {/* 
            </div> */}
          </div>
          </Transition>
        )}


      </div>
      <Footer />
    </MainSideBar>
  );
};

export default Success;
