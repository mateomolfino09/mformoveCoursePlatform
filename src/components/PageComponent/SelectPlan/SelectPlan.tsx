'use client'
import React, { useEffect, useState } from 'react'
import MainSideBar from '../../MainSideBar'
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import SelectYourPlan from '../Membership/SelectYourPlan'
import { Plan } from '../../../../typings'
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link'
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerHomeSlice'
import Footer from '../../Footer'

interface Props {
    plans: Plan[]
}

const SelectPlan = ({ plans }: Props ) => {
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

        <div className='h-auto w-full bg-[#131212] items-center justify-center relative flex flex-col pt-16 pb-12'>
            <SelectYourPlan plans={plans} select={"select"}/>   
        </div>
        <Footer />
        
    </MainSideBar>
  )
}

export default SelectPlan