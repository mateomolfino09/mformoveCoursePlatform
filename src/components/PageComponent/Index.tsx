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
import { FaHamburger } from 'react-icons/fa';
import { GiHamburger } from 'react-icons/gi';
import MainSideBar from '../MainSidebar/MainSideBar';
import Footer from '../Footer';
import NewsletterForm from './Index/NewsletterForm';
import { routes } from '../../constants/routes';

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
        <div className='h-screen bg-gradient-to-bl lg:h-[100vh] overflow-hidden font-montserrat'>
        <MainSideBar where={"index"}>
          <Head>
            <title>MforMove Platform</title>
            <meta name='description' content='Stream Video App' />
            <link rel='icon' href='/favicon.ico' />
          </Head>
          {/* <IndexHeader user={auth.user} /> */}
          <main className='relative pl-4 lg:space-y-24 lg:pl-16'>
            <Banner />
          </main>
            <div className='absolute w-full top-1/2 flex justify-center items-center' >
                <button className='w-48 h-12 md:w-56 md:h-14 md:text-lg rounded-3xl border-white hover:bg-[#234C8C] hover:text-white border text-base font-thin transition-all duration-300 transform hover:scale-105 shadow-lg' >
                  <a href={routes.navegation.mentorship}>
                  Movete Conmigo 
                  </a>
                </button>

          </div>
          <div className='absolute right-0 bottom-0 h-12 w-12'>
          </div>
          <div className='w-full pt-12'>
            <NewsletterForm />

          </div>
          <Footer />

        </MainSideBar>
        </div>
        
      </AnimatePresence>

  );
};


export default Index;
