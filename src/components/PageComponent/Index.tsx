'use client'
import Banner from './../IndexBanner';
import IndexHeader from './../IndexHeader';
import VolumeModal from './../VolumeModal';
import { User } from '../../../typings';
import state from '../../valtio';
import { AnimatePresence } from 'framer-motion';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { BiVolumeFull, BiVolumeMute } from 'react-icons/bi';
import { useSnapshot } from 'valtio';
import { useAuth } from '../../hooks/useAuth';
import { verify } from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const Index = () => {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    // if (!cookies) {
    //   router.push('/login');
    // }
    
    if(!auth.user) {
      auth.fetchUser()
    }


  }, [auth.user]);
  


  return (
    <AnimatePresence>
      <div className='h-screen bg-gradient-to-b lg:h-[100vh]'>
        <Head>
          <title>Video Streaming</title>
          <meta name='description' content='Stream Video App' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <IndexHeader user={auth.user} />
        <main className='relative pl-4 lg:space-y-24 lg:pl-16'>
          <Banner />
        </main>
        <VolumeModal />
        <div className='absolute right-0 bottom-0 h-12 w-12'>
          {!state.volumeIndex ? (
            <BiVolumeMute
              className='h-6 w-6 text-white opacity-50 cursor-pointer hover:opacity-100 transition duration-500'
              onClick={() => (state.volumeIndex = true)}
            />
          ) : (
            <BiVolumeFull
              className='h-6 w-6 text-white opacity-50 cursor-pointer hover:opacity-100 transition duration-500'
              onClick={() => (state.volumeIndex = false)}
            />
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};


export default Index;
