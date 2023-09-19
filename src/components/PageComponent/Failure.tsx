'use client'
import imageLoader from '../../../imageLoader';
import { CoursesDB, User } from '../../../typings';
import { motion as m } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { VscError } from 'react-icons/vsc';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';

interface Props {
  course: CoursesDB;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 1.5
    }
  }
};

const Failure = ({ course }: Props) => {
  const router = useRouter();
  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);

  return (
    <div className='relative flex h-screen w-screen flex-col bg-transparent md:items-center md:justify-center'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
        <Image
          src='/images/bgIndex1.jpg'
          layout='fill'
          className='-z-10 !hidden opacity-60 sm:!inline'
          objectFit='cover'
          alt='icon image'
          loader={imageLoader}
        />
        {/* Logo position */}
        <img
          src='/images/logoWhite.png'
          className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
          width={150}
          height={150}
          alt='icon image'
        />
        <m.div
          initial={{ y: '-120%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          exit={{ opacity: 1 }}
          className='relative mt-24 space-y-8 rounded md:bg-black/90 py-10 px-6 md:mt-0 md:max-w-lg md:px-14'
        >
          <div className='w-full flex flex-row justify-between items-start'>
            <h1 className='text-4xl font-semibold'>
              Hubo un error al realizar tu compra.
            </h1>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                ease: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5],
                duration: 2.5
              }}
              className='h-12 w-12'
            >
              <VscError className='h-12 w-12 text-red-500' />
            </m.div>
          </div>

          <div className='space-y-4'>
            <label className='inline-block w-full'>
              <p>Hubo un error al procesar tu pago</p>
            </label>
            <div className='w-full bg-black/50 flex justify-center items-center cursor-pointer border border-white rounded-md transition duration-500 hover:bg-black hover:scale-105'>
              <button
                className='p-1 text-center'
                onClick={() =>
                  router.push(`/courses/purchase//${course.id}`)
                }
              >
                Volver a Intentar
              </button>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
};

export default Failure;
