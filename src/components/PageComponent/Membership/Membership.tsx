'use client'
import React, { useEffect, useState } from 'react'
import MainSideBar from '../../MainSideBar'
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import SelectYourPlan from './SelectYourPlan'
import { Plan } from '../../../../typings'
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link'
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerHomeSlice'
import Footer from '../../Footer'

interface Props {
    plans: Plan[]
}

const Membership = ({ plans }: Props ) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        // Function to handle scroll event
        const handleScroll = () => {
          // Your code to handle scroll
          if(window.scrollY === 0) {
            dispatch(toggleScroll(false))
          }
          else {
            dispatch(toggleScroll(true))
          }
        };
    
        // Add scroll event listener when component mounts
        window.addEventListener('scroll', handleScroll);
    
        // Remove scroll event listener when component unmounts
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);

  return (
    <MainSideBar where={''}>
        <div className='h-[100vh] w-full bg-transparent items-center justify-center relative flex overflow-x-hidden'>
        <div className='absolute top-0 left-0 h-full w-screen -z-10'>
          <Image
            src='/images/membershipbg.jpg'
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover'
          />
        </div>
        <div className='w-96 relative lg:w-[28rem] md:left-32 lg:left-1/4 bottom-24'>
            <h1 className='text-4xl md:text-5xl font-light mb-6'>Membresías</h1>
            <p className='text-base md:text-lg font-light'>Elevate your Practice: Rooted in Science, Cultivated with Mindfulness. Uniting Yoga, Movement, Breathwork, and Skill-Based Training with Dylan Werner</p>
            <Link href={'select-plan'}>
            <div className='flex px-24 py-3 mt-6 border-white border rounded-full justify-center items-center w-full group cursor-pointer hover:bg-white hover:text-black'>
                <button className='w-full'>Empezar Prueba Gratis </button>
                <ArrowRightIcon className='w-4 h-4 relative left-4'/>

            </div>
            </Link>

          </div>

        </div>
        <div className='h-auto w-full bg-[#131212] items-center justify-center relative flex flex-col pb-12'>
            <SelectYourPlan plans={plans} select=''/>   
        </div>
        <Footer />
        
    </MainSideBar>
  )
}

export default Membership