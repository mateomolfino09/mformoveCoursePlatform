'use client'
import React, { useEffect, useState } from 'react'
import MainSideBar from '../../MainSidebar/MainSideBar'
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'
import { ArrowDownIcon, ArrowRightIcon, ChevronDoubleDownIcon } from '@heroicons/react/24/outline'
import SelectYourPlan from '../Membership/SelectYourPlan'
import { Plan } from '../../../../typings'
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link'
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerHomeSlice'
import Footer from '../../Footer'
import FreeProductWhoAreWe from '../../MainSideBarProducts/FreeProductWhoAreWe'
import { useAuth } from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { throttle } from 'lodash';
import SelectYourPlanIntro from './SelectYourPlanIntro'
import { ChevronDownIcon } from '@heroicons/react/24/solid'

interface Props {
    plans: Plan[]
    origin: string
}

const SelectPlan = ({ plans, origin }: Props ) => {
    const dispatch = useAppDispatch()
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
      
      if(!auth.user) {
        auth.fetchUser()
      }    
  
    }, [auth.user]);

    const handleScroll = (event: any) => {
      let isScrolled = 0

      isScrolled = (event.target.scrollTop);

      if(isScrolled === 0) {
        dispatch(toggleScroll(false))
      }
      else {
        dispatch(toggleScroll(true))
      }
    };

    // useEffect(() => {
    //     // Function to handle scroll eventc
    //     // Add scroll event listener when component mounts
    //     window.addEventListener('scroll', handleScroll);
    
    //     // Remove scroll event listener when component unmounts
    //     return () => {
    //       window.removeEventListener('scroll', handleScroll);
    //     };
    //   }, [router]);

  return (
    <div className='relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden' onScroll={(event:any) => handleScroll(event)}
    >          
    <MainSideBar where={'selectPlan'}>
    <SelectYourPlanIntro />

          <SelectYourPlan plans={plans} select={"select"} origin={origin}/>  
          <FreeProductWhoAreWe />
 
          <Footer />
          
      </MainSideBar>

    </div>
  )
}

export default SelectPlan