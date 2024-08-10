'use client'
import React, { useEffect } from 'react'
import MainSideBar from '../../../MainSideBar';
import Head from 'next/head';
import Banner from '../../../IndexBanner';
import Footer from '../../../Footer';
import FreeProductsSideBar from '../../../MainSideBarProducts/FreeProducts';
import FreeProductBanner from '../../../MainSideBarProducts/FreeProductBanner';
import FreeProductTitle from '../../../MainSideBarProducts/FreeProductTitle';
import FreeProductForm from '../../../MainSideBarProducts/FreeProductForm';
import FreeProductDescription from '../../../MainSideBarProducts/FreeProductDescription';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import '../../../MainSideBarProducts/freeProductStyle.css'


const Index = ({ product }) => {

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
        <div className='absolute w-full top-[20%] flex justify-center items-center' >
        <div className='flex flex-col justify-center items-center'>
          <FreeProductTitle product={product}/>
              <m.button
                initial={{ "--x": "100%", scale: 1 }}
                animate={{ "--x": "-100%" }}
                whileTap={{ scale: 0.97 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 1,
                  type: "spring",
                  stiffness: 20,
                  damping: 15,
                  mass: 2,
                  scale: {
                    type: "spring",
                    stiffness: 10,
                    damping: 5,
                    mass: 0.1,
                  },
                }}
                className="px-16 py-6 mt-12 rounded-full relative radial-gradient"
              >
                <span className="text-white tracking-wide font-semibold h-full w-full block relative linear-mask font-montserrat text-2xl ">
                  Obtener Gratis...
                </span>
      <span className="block absolute inset-0 rounded-full p-px linear-overlay" />
    </m.button>
        </div>


      </div>
      <div className='absolute right-0 bottom-0 h-12 w-12'>
      </div>
      <FreeProductDescription product={product}/>
      <FreeProductForm />
      <Footer />

    </FreeProductsSideBar>
    </div>
    
  </AnimatePresence>
  )
}

export default Index