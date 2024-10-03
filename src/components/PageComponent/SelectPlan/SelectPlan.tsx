'use client';

import imageLoader from '../../../../imageLoader';
import { Plan } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import Footer from '../../Footer';
import MainSideBar from '../../MainSideBar';
import FreeProductWhoAreWe from '../../MainSideBarProducts/FreeProductWhoAreWe';
import SelectYourPlan from '../Membership/SelectYourPlan';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Select, { StylesConfig } from 'react-select';

interface Props {
  plans: Plan[];
  origin: string;
}

const SelectPlan = ({ plans, origin }: Props) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  useEffect(() => {
    // Function to handle scroll event
    const handleScroll = () => {
      // Your code to handle scroll
      if (window.scrollY === 0) {
        dispatch(toggleScroll(false));
      } else {
        dispatch(toggleScroll(true));
      }
    };

    // Add scroll event listener when component mounts
    window.addEventListener('scroll', handleScroll);

    // Remove scroll event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const [activo, setActivo] = useState(false);
  useEffect(() => {
    console.log(activo);
  }, [activo]);
  return (
    <div
      className={`relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden `}
      style={{ backgroundColor: activo ? 'black' : '' }}
    >
      <MainSideBar
        where={'index'}
        setActivo={(estado: any) => setActivo(estado)}
      >
        <SelectYourPlan plans={plans} select={'select'} origin={origin} />
        <FreeProductWhoAreWe />
        <Footer />
      </MainSideBar>
    </div>
  );
};

export default SelectPlan;
