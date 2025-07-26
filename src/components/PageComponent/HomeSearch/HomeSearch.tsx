"use client"
import {
  ClassTypes,
  Images,
  IndividualClass,
  User
} from '../../../../typings';
import state from '../../../valtio';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSnapshot } from 'valtio';
import { useAuth } from '../../../hooks/useAuth';
import { verify } from 'jsonwebtoken';
import Cookies from 'js-cookie';
import connectDB from '../../../config/connectDB';
import { useAppSelector } from '../../../redux/hooks';
import MainSideBar from '../../MainSidebar/MainSideBar';
import ClassesFilters from '../../ClassesFilters';
import { m } from 'framer-motion';
import FilterNavWrapper from '../../FilterNavWrapper';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import { setFilters, setIndividualClasses } from '../../../redux/features/filterClass';
import CarouselSearchClasses from '../../CarouselSearchClasses';
import Link from 'next/link';

interface Props {
  classesDB: IndividualClass[];
  search: string
}

const HomeSearch = ({ classesDB, search }: Props) => {
  const [isMember, setIsMember] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<IndividualClass | null>(null);
  const router = useRouter()
  const dispatch = useAppDispatch()
  const filterClassSlice = useAppSelector(
    (state) => state.filterClass.value
    );
  const auth = useAuth()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if(!auth.user) {
      auth.fetchUser()
    } 
    else {
      setIsMember(true)
    }

  }, [auth?.user]);
  

  return (
    <div className='relative bg-to-dark lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'  
    onScroll={(e: any) => {
      if(e.target.scrollTop === 0) {
        dispatch(toggleScroll(false))
      }
      else {
        dispatch(toggleScroll(true))
      }
    } }
    >
      <MainSideBar where={'home'}>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        <main className='relative lg:space-y-12 mt-32'>
          <section className='!mt-0'>
          </section>
          <section>
            <a href={'/home'}>
            <h5 className='ml-12 md:text-base w-fit mb-12 py-2 text-white relative font-light text-sm hover:scale-105 transition duration-200 before:content-[""]  before:h-[1px] before:absolute before:w-full before:bottom-[-3px] before:left-0 before:bg-yellow-500/80 cursor-pointer'>Ver todas las clases</h5>
            
            </a>

            <h1 className='ml-12 md:text-3xl'>Resultados de búsqueda para: {search}</h1>
            <CarouselSearchClasses classesDB={classesDB} title={``} description={`Resultados de búsqueda para ${search}`} setSelectedClass={setSelectedClass}/>
          </section>
        </main>
      
      <Toaster />
      </MainSideBar>
    </div>
  );
};


export default HomeSearch;
