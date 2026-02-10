'use client'
import Banner from './../IndexBanner';
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
import { FaHamburger } from 'react-icons/fa';
import { GiHamburger } from 'react-icons/gi';
import MainSideBar from '../MainSidebar/MainSideBar';
import Footer from '../Footer';
import NewsletterForm from './Index/NewsletterForm';
import IndexMovementSection from './Index/IndexMovementSection';
import { routes } from '../../constants/routes';
import IndexSkeleton from '../IndexSkeleton';

const Index = () => {
  const auth = useAuth()
  const router = useRouter()
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    // if (!cookies) {
    //   router.push('/login');
    // }
    
    if(!auth.user) {
      auth.fetchUser()
    }
  }, [auth.user]);

  // Fallback: si el video no dispara onLoad en 6s, mostrar contenido igual
  useEffect(() => {
    const fallback = setTimeout(() => {
      setVideoLoaded(true)
    }, 6000)
    return () => clearTimeout(fallback)
  }, []);

  const handleVideoLoaded = () => {
    setVideoLoaded(true)
  };

  return (
    <AnimatePresence>
        <div className='min-h-screen bg-gradient-to-bl font-montserrat'>
        <MainSideBar where={"index"}>
          <Head>
            <title>MforMove Platform</title>
            <meta name='description' content='Stream Video App' />
            <link rel='icon' href='/favicon.ico' />
          </Head>
          <main className='relative'>
            <Banner onVideoLoaded={handleVideoLoaded} />
            <IndexMovementSection />
          </main>
          <div className='absolute right-0 bottom-0 h-12 w-12'>
          </div>

          <Footer />

        </MainSideBar>
        </div>

        {/* Skeleton de carga hasta que el video del banner esté listo */}
        {!videoLoaded && (
          <div className="fixed inset-0 z-[300]">
            <IndexSkeleton />
          </div>
        )}
        
      </AnimatePresence>

  );
};


export default Index;
