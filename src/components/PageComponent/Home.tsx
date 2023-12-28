"use client"
import Banner from './../Banner';
import Carousel from './../Carousel';
import Header from './../Header';
import Modal from './../Modal';
import SearchBar from './../SearchBar';
import {
  ClassTypes,
  CourseUser,
  CoursesDB,
  Images,
  IndividualClass,
  User
} from '../../../typings';
import state from '../../valtio';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSnapshot } from 'valtio';
import { useAuth } from '../../hooks/useAuth';
import { verify } from 'jsonwebtoken';
import Cookies from 'js-cookie';
import connectDB from '../../config/connectDB';
import { useAppSelector } from '../../redux/hooks';
import { useGlobalContext } from '../../app/context/store';
import MainSideBar from '../MainSideBar';
import ClassesFilters from '../ClassesFilters';
import { m } from 'framer-motion';
import FilterNavWrapper from '../FilterNavWrapper';
import CarouselClasses from '../CarouselClasses';

interface Props {
  classesDB: IndividualClass[];
  filters: ClassTypes[];
}

const Home = ({ classesDB, filters }: Props) => {
  const [typedClasses, setClasses] = useState<any | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<IndividualClass | null>(null);
  const snap = useSnapshot(state);
  const router = useRouter()
  const [scrollPosition, setScrollPosition] = useState(0);
  const ref = React.createRef<any>();

  const auth = useAuth()
  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if(!auth.user) {
      auth.fetchUser()
    } 
    else {
      setIsMember(true)
    }

    const groupedData = classesDB?.reduce((acc: any , obj) => {
      const groupKey = obj.type;
    
      // If the group doesn't exist in the accumulator, create it
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
    
      // Push the current object to the group
      acc[groupKey].push(obj);

      return acc
    
    }, {});

    const arrayOfObjects = Object.entries(groupedData).map(([group, groupArray]) => {
      return {
        group,
        items: groupArray,
      };
    });

    console.log(arrayOfObjects)

    setClasses(arrayOfObjects)

    


  }, [auth?.user]);

  return (
    <div className='relative bg-to-dark lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'  
    onScroll={(e: any) => setScrollPosition(e.target.scrollTop)}
    ref={ref}
    >
      <MainSideBar where={'home'}>
      <FilterNavWrapper>

      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        <main className='relative lg:space-y-12 mt-32'>
          <section className='!mt-0'>
            <ClassesFilters filtersDB={filters}/>
          </section>
          <section>
            { typedClasses?.map((t: any) => (
                <CarouselClasses classesDB={t.items} title={filters[0].values.find(x => x.value === t.group)?.label} description={filters[0].values.find(x => x.value === t.group)?.description} setSelectedClass={setSelectedClass}/>
            ))}
            {/* {typedClasses typedClasses?.map((t) => (
              <CarouselClasses classesDB={t} title={filters[0].values.find(x => x.value === t[0].type)?.label}/>
            ))} */}

          {/* <CarouselClasses classesDB={} title={''} /> */}
          </section>
        </main>
      
      <Toaster />
      </FilterNavWrapper>
      </MainSideBar>
    </div>
  );
};


export default Home;
