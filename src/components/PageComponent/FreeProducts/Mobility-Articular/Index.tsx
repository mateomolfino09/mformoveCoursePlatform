'use client'
import React from 'react'
import { FreeProduct } from '../../../../../typings';
import { profile } from 'console';
import { AnimatePresence } from 'framer-motion';
import MainSideBar from '../../../MainSideBar';
import Head from 'next/head';
import Banner from '../../../IndexBanner';
import Footer from '../../../Footer';
import FreeProductsSideBar from '../../../MainSideBarProducts/FreeProducts';
import FreeProductBanner from '../../../MainSideBarProducts/FreeProductBanner';
import FreeProductTitle from '../../../MainSideBarProducts/FreeProductTitle';

interface Props {
  product: FreeProduct;
}

const Index = ({ product }: Props) => {
  return (
    <AnimatePresence>
    <div className='h-screen bg-gradient-to-b lg:h-[100vh] overflow-hidden'>
    <FreeProductsSideBar>
      <Head>
        <title>MforMove Platform</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {/* <IndexHeader user={auth.user} /> */}
      <main className='relative pl-4 lg:space-y-24 lg:pl-16'>
        <FreeProductBanner />
      </main>
        <div className='absolute w-full top-1/2 flex justify-center items-center' >
        <div className='flex flex-col justify-center items-center'>
          <FreeProductTitle product={product}/>
          <button className='w-48 h-12 md:w-56 md:h-14 md:text-lg rounded-3xl border-white hover:bg-white hover:text-black border text-base font-thin' >
                <a href="/home">
                Practicar Conmigo 
                </a>
              </button>

        </div>


      </div>
      <div className='absolute right-0 bottom-0 h-12 w-12'>
      </div>
      <Footer />

    </FreeProductsSideBar>
    </div>
    
  </AnimatePresence>
  )
}

export default Index