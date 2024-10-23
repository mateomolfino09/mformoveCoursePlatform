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
import MainSideBar from '../MainSidebar/MainSideBar';
import ClassesFilters from '../ClassesFilters';
import { m } from 'framer-motion';
import FilterNavWrapper from '../FilterNavWrapper';
import CarouselClasses from '../CarouselClasses';
import { useAppDispatch } from '../../hooks/useTypeSelector';
import { toggleScroll } from '../../redux/features/headerHomeSlice';
import { setFilters, setIndividualClasses } from '../../redux/features/filterClass';
import { LoadingSpinner } from '../LoadingSpinner';
import Footer from '../Footer';
import AddQuestionModal from '../AddQuestionModal';
import GetMembershipModal from '../GetMembershipModal';
import { setOpenModal } from '../../redux/features/filterClass';
import GetMembershipModal2 from '../GetMembershipModal2';

interface Props {
  classesDB: IndividualClass[];
  filters: ClassTypes[];
}

const Home = ({ classesDB, filters }: Props) => {
  const [reload, setReload] = useState<boolean>(false)
  const [typedClasses, setClasses] = useState<any | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<IndividualClass | null>(null);
  const router = useRouter()

  
  const dispatch = useAppDispatch()
  const filterClassSlice = useAppSelector(
    (state) => state.filterClass.value
    );

  const openModal = filterClassSlice.openModal
  const auth = useAuth()

  const handleModal = () => {
    dispatch(setOpenModal(!openModal))
  }

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if(!auth.user) {
      auth.fetchUser()
    } 
    setReload(true)
    
    filters != null && dispatch(setFilters(filters))

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

    dispatch(setIndividualClasses(arrayOfObjects))
    setClasses(arrayOfObjects)

  }, [reload]);


  useEffect(() => {

    const ic = filterClassSlice.individualClasses
    let newArr: any = []
    setLoading(true)

    console.log(ic)
    
    ic?.forEach((iCGroup: any) => {
      let classesFilter: IndividualClass[] = []
      classesFilter = [...iCGroup.items.filter((iC: IndividualClass) => {
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
            if(auth.user) {
              seenCondition = auth.user?.classesSeen?.includes(iC._id)
            }
            else seenCondition = false
          }
        
        return levelCondition && lengthCondition && seenCondition && orderCondition
      })];
      classesFilter.length > 0 && newArr.push({ group: iCGroup.group , items: classesFilter })
      
    });

    console.log(newArr)

    setClasses(newArr)
    setLoading(false)
  }, [filterClassSlice.largo, filterClassSlice.nivel, filterClassSlice.ordenar, filterClassSlice.seen])
  

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
      <MainSideBar where={'index'}>
      <FilterNavWrapper>

      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        <main className='relative lg:space-y-12 mt-32'>
        <section className='!mt-0'>
      {/* Solo renderizamos ClassesFilters si hay filtros disponibles */}
      {filters.length > 0 ? (
        <ClassesFilters filtersDB={filters} />
      ) : (
        <p>No filters found</p>
      )}
    </section>
          <section>
            {typedClasses && !loading ? typedClasses?.map((t: any) => (
              <>
              <CarouselClasses key={t.group} classesDB={t.items} title={filters[0].values.find(x => x.value === t.group)?.label} description={filters[0].values.find(x => x.value === t.group)?.description} setSelectedClass={setSelectedClass}/>              
              </>
            )) : (
              <LoadingSpinner />
            )}
          </section>
          {typedClasses && !loading ? (
              <>
              <Footer />
              </>
            ) : (
              <LoadingSpinner />
            )}
          
        </main>
      
      {/* <GetMembershipModal2 handleVisiblity={handleModal} visible={openModal}/> */}
      <Toaster />
      </FilterNavWrapper>
      </MainSideBar>
    </div>
  );
};


export default Home;
