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
import ClassesFiltersCategory from './FiltersCategory';

interface Props {
  classesDB: IndividualClass[];
  filters: ClassTypes[];
  filter: string
}

const ClassesCategory = ({ classesDB, filters, filter  }: Props) => {
    const [typedClasses, setClasses] = useState<any | null>(classesDB);
    const [isMember, setIsMember] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);  const [selectedClass, setSelectedClass] = useState<IndividualClass | null>(null);
  const router = useRouter()
  const dispatch = useAppDispatch()
  const filterClassSlice = useAppSelector(
    (state) => state.filterClass.value
    );
  const auth = useAuth()

  useEffect(() => {
    const iCGroup = classesDB
    setLoading(true)
    
      let classesFilter: IndividualClass[] = []
      classesFilter = [...iCGroup.filter((iC: IndividualClass) => {
        let lengthCondition = true
        if(filterClassSlice.largo && filterClassSlice.largo?.length > 0) {
          filterClassSlice.largo.forEach(l => {
            lengthCondition ? lengthCondition = iC.minutes <= +l : false
          });
        } 

        let levelCondition = false

        if(filterClassSlice.nivel && filterClassSlice.nivel?.length > 0) {
          filterClassSlice.nivel.forEach(n => {
            !levelCondition ? levelCondition = iC.level == +n : true
          });
        }
        else {
          levelCondition = true
        }

        let orderCondition = true

        if(filterClassSlice.ordenar && filterClassSlice.ordenar?.length > 0) {
          filterClassSlice.ordenar.forEach(n => {
            if(n == "nuevo") {
              orderCondition ? orderCondition = iC.new : false
            }
            
          });
        }
        else {
          orderCondition = true
        }

        let seenCondition = true 
          if(filterClassSlice.seen) {
            seenCondition = auth.user?.classesSeen?.includes(iC._id)
          }
        
        return levelCondition && lengthCondition && seenCondition && orderCondition
      })];
      
    setClasses(classesFilter)
    setLoading(false)
  }, [filterClassSlice.largo, filterClassSlice.nivel, filterClassSlice.ordenar, filterClassSlice.seen])

  useEffect(() => {
    setClasses(classesDB)
  }, [classesDB])
  

  return (
    <FilterNavWrapper>
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
            <ClassesFiltersCategory filtersDB={filters} classType={filter}/>
          </section>
          <section>
            <CarouselSearchClasses classesDB={typedClasses} title={``} description={``} setSelectedClass={setSelectedClass}/>
          </section>
        </main>
      
      <Toaster />
      </MainSideBar>
    </div>
    </FilterNavWrapper>
  );
};


export default ClassesCategory;
