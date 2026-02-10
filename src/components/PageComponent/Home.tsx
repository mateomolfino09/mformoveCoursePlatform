'use client';

import {
  ClassTypes,
  IndividualClass,
} from '../../../typings';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useTypeSelector';
import {
  setFilters,
  setIndividualClasses,
  setOpenModal
} from '../../redux/features/filterClass';
import { toggleScroll } from '../../redux/features/headerHomeSlice';
import { useAppSelector } from '../../redux/hooks';
import state from '../../valtio';
import CarouselClasses from '../CarouselClasses';
import ClassesFilters from '../ClassesFilters';
import FilterNavWrapper from '../FilterNavWrapper';
import Footer from '../Footer';
import MainSideBar from '../MainSidebar/MainSideBar';
import { motion, useScroll, useTransform } from 'framer-motion';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import React, {
  useEffect,
  useState,
  useRef
} from 'react';
import { Toaster } from 'react-hot-toast';
import { useSnapshot as useSnapshotValtio } from 'valtio';
import Image from 'next/image';
import imageLoader from '../../../imageLoader';
import BitacoraMenuTutorial from './Home/BitacoraMenuTutorial';

interface Props {
  classesDB: IndividualClass[];
  filters: ClassTypes[];
}

const Home = ({ classesDB, filters }: Props) => {
  const [reload, setReload] = useState<boolean>(false);
  const [typedClasses, setClasses] = useState<any | null>(null);
  const [lastClasses, setLastClasses] = useState<any | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<IndividualClass | null>(null);
  const [coherenceStreak, setCoherenceStreak] = useState<number | null>(null);
  const [hasBitacoraContent, setHasBitacoraContent] = useState<boolean>(false);
  const [showBitacoraTutorial, setShowBitacoraTutorial] = useState<boolean>(false);
  const router = useRouter();
  const snap = useSnapshotValtio(state);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const dispatch = useAppDispatch();
  const filterClassSlice = useAppSelector((state) => state.filterClass.value);
  const openModal = filterClassSlice.openModal;
  const auth = useAuth();

  // Transformaciones para efectos parallax
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const handleModal = () => {
    dispatch(setOpenModal(!openModal));
  };

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!auth.user) {
      auth.fetchUser();
    }
    
    if (auth.user && (auth.user.subscription?.active || auth.user.isVip)) {
      setIsMember(true);
      fetchCoherenceTracking();
      checkBitacoraContent();
    }
    
    setReload(true);
    filters != null && dispatch(setFilters(filters));

    const groupedData = classesDB?.reduce((acc: any, obj) => {
      const groupKey = obj.type;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(obj);
      return acc;
    }, {});

    const arrayOfObjects = Object.entries(groupedData).map(
      ([group, groupArray]) => {
        return {
          group,
          items: groupArray
        };
      }
    );

    const lastFiveClasses = classesDB
      ?.slice(-5)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    setLastClasses({
      group: 0,
      items: lastFiveClasses
    });

    dispatch(setIndividualClasses(arrayOfObjects));
    setClasses(arrayOfObjects);
  }, [reload, auth, classesDB, dispatch, filters]);

  useEffect(() => {
    if (auth.user && (auth.user.subscription?.active || auth.user.isVip)) {
      const contratoAceptado = auth.user.subscription?.onboarding?.contratoAceptado || false;
      const tutorialCompletado = auth.user.subscription?.onboarding?.tutorialBitacoraCompletado || false;
      
      if (contratoAceptado && !tutorialCompletado) {
        setTimeout(() => {
          setShowBitacoraTutorial(true);
        }, 1000);
      }
    }
  }, [auth.user]);

  useEffect(() => {
    const ic = filterClassSlice.individualClasses;
    let newArr: any = [];
    setLoading(true);

    let lastFiveClasses = classesDB
      ?.slice(-5)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    lastFiveClasses = lastFiveClasses.filter((iC: IndividualClass) => {
      let lengthCondition = true;
      if (filterClassSlice.largo && filterClassSlice.largo?.length > 0) {
        filterClassSlice.largo.forEach((l) => {
          lengthCondition ? (lengthCondition = iC.minutes <= +l) : false;
        });
      }

      let levelCondition = false;
      if (filterClassSlice.nivel && filterClassSlice.nivel?.length > 0) {
        filterClassSlice.nivel.forEach((n) => {
          !levelCondition ? (levelCondition = iC.level == +n) : true;
        });
      } else {
        levelCondition = true;
      }

      let orderCondition = true;
      if (filterClassSlice.ordenar && filterClassSlice.ordenar?.length > 0) {
        filterClassSlice.ordenar.forEach((n) => {
          if (n == 'nuevo') {
            orderCondition ? (orderCondition = iC.new) : false;
          }
        });
      } else {
        orderCondition = true;
      }

      let seenCondition = true;
      if (filterClassSlice.seen) {
        if (auth.user) {
          seenCondition = auth.user?.classesSeen?.includes(iC._id);
        } else seenCondition = false;
      }

      return (
        levelCondition && lengthCondition && seenCondition && orderCondition
      );
    });

    setLastClasses({
      group: 0,
      items: lastFiveClasses
    });

    ic?.forEach((iCGroup: any) => {
      let classesFilter: IndividualClass[] = [];

      classesFilter = [
        ...iCGroup.items.filter((iC: IndividualClass) => {
          let lengthCondition = true;
          if (filterClassSlice.largo && filterClassSlice.largo?.length > 0) {
            filterClassSlice.largo.forEach((l) => {
              lengthCondition ? (lengthCondition = iC.minutes <= +l) : false;
            });
          }

          let levelCondition = false;
          if (filterClassSlice.nivel && filterClassSlice.nivel?.length > 0) {
            filterClassSlice.nivel.forEach((n) => {
              !levelCondition ? (levelCondition = iC.level == +n) : true;
            });
          } else {
            levelCondition = true;
          }

          let orderCondition = true;
          if (
            filterClassSlice.ordenar &&
            filterClassSlice.ordenar?.length > 0
          ) {
            filterClassSlice.ordenar.forEach((n) => {
              if (n == 'nuevo') {
                orderCondition ? (orderCondition = iC.new) : false;
              }
            });
          } else {
            orderCondition = true;
          }

          let seenCondition = true;
          if (filterClassSlice.seen) {
            if (auth.user) {
              seenCondition = auth.user?.classesSeen?.includes(iC._id);
            } else seenCondition = false;
          }

          return (
            levelCondition && lengthCondition && seenCondition && orderCondition
          );
        })
      ];
      classesFilter.length > 0 &&
        newArr.push({ group: iCGroup.group, items: classesFilter });
    });

    setClasses(newArr);
    setLoading(false);
  }, [
    filterClassSlice.largo,
    filterClassSlice.nivel,
    filterClassSlice.ordenar,
    filterClassSlice.seen,
    auth.user,
    classesDB,
    filterClassSlice.individualClasses
  ]);

  const fetchCoherenceTracking = async () => {
    try {
      const response = await fetch('/api/coherence/tracking', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setCoherenceStreak(data.tracking?.currentStreak || 0);
      }
    } catch (err) {
      console.error('Error obteniendo tracking:', err);
    }
  };

  const checkBitacoraContent = async () => {
    try {
      const response = await fetch('/api/bitacora/current', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setHasBitacoraContent(data.logbook && data.weeklyContent && data.weeklyContent.isPublished);
      }
    } catch (err) {
      console.error('Error verificando camino:', err);
      setHasBitacoraContent(false);
    }
  };

  return (
    <div
      className='relative bg-palette-cream lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden font-montserrat'
      onScroll={(e: any) => {
        if (e.target.scrollTop === 0) {
          dispatch(toggleScroll(false));
        } else {
          dispatch(toggleScroll(true));
        }
      }}
    >
      <MainSideBar where={'index'}>
        <FilterNavWrapper>
          <Head>
            <title>Move Crew - Clases</title>
            <meta name='description' content='Clases de movimiento y entrenamiento' />
            <link rel='icon' href='/favicon.ico' />
          </Head>

          {/* Hero Section - Minimalista y elegante */}
          <motion.section
            ref={heroRef}
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
            className='relative w-full overflow-hidden bg-palette-cream'
          >
            {/* Contenido Hero - Centrado y minimalista */}
            <div className='relative z-10 w-full h-full flex flex-col justify-center items-center px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 pt-24 md:pt-32 pb-16 md:pb-24'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className='max-w-5xl mx-auto text-center'
              >
                {/* Label superior minimalista */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className='text-xs md:text-sm font-light tracking-[0.3em] uppercase text-palette-stone mb-6 md:mb-8'
                >
                  Biblioteca Move Crew
                </motion.p>

                {/* Título principal - Tipografía elegante */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className='text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-palette-ink mb-6 md:mb-8 tracking-tight leading-[1.1]'
                >
                  Tu espacio de{' '}
                  <span className='font-semibold italic'>movimiento</span>
                </motion.h1>

                {/* Descripción - Texto fino y claro */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className='text-lg md:text-xl lg:text-2xl text-palette-stone font-light max-w-3xl mx-auto leading-relaxed mb-4'
                >
                  Desarrolla fuerza real, domina tu movilidad y muévete con mayor libertad.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className='text-base md:text-lg text-palette-stone/80 font-light max-w-2xl mx-auto'
                >
                  Simple, claro y sostenible.
                </motion.p>
              </motion.div>
            </div>
          </motion.section>

          {/* Sección de Disciplinas - 3 imágenes con bordes redondeados */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className='relative w-full bg-palette-cream px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12 md:py-16 -mt-8 md:-mt-12'
          >
            <div className='max-w-7xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10'>
                {/* Movimiento */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className='w-full flex flex-col items-center group'
                >
                  <div className='relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-palette-stone/10 shadow-[0_4px_24px_rgba(20,20,17,0.06)] ring-1 ring-palette-stone/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(20,20,17,0.12)] hover:ring-palette-stone/20'>
                    <Image
                      src='https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg'
                      alt='Movimiento'
                      fill
                      className='object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, 33vw'
                      loader={imageLoader}
                    />
                  </div>
                  <span className='mt-4 text-sm md:text-base font-light tracking-wide text-palette-ink'>
                    Movimiento
                  </span>
                </motion.div>

                {/* Movilidad */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className='w-full flex flex-col items-center group'
                >
                  <div className='relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-palette-stone/10 shadow-[0_4px_24px_rgba(20,20,17,0.06)] ring-1 ring-palette-stone/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(20,20,17,0.12)] hover:ring-palette-stone/20'>
                    <Image
                      src='https://res.cloudinary.com/dbeem2avp/image/upload/v1765658798/my_uploads/fondos/DSC01753_qdv9o0.jpg'
                      alt='Movilidad'
                      fill
                      className='object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, 33vw'
                      loader={imageLoader}
                    />
                  </div>
                  <span className='mt-4 text-sm md:text-base font-light tracking-wide text-palette-ink'>
                    Movilidad
                  </span>
                </motion.div>

                {/* Handstand */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className='w-full flex flex-col items-center group'
                >
                  <div className='relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-palette-stone/10 shadow-[0_4px_24px_rgba(20,20,17,0.06)] ring-1 ring-palette-stone/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(20,20,17,0.12)] hover:ring-palette-stone/20'>
                    <Image
                      src='https://res.cloudinary.com/dbeem2avp/image/upload/v1764272388/my_uploads/fondos/DSC01472_mvzgw7.jpg'
                      alt='Handstand'
                      fill
                      className='object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, 33vw'
                      loader={imageLoader}
                    />
                  </div>
                  <span className='mt-4 text-sm md:text-base font-light tracking-wide text-palette-ink'>
                    Handstand
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Contenido Principal */}
          <main className='relative bg-palette-cream'>
            {/* Filters Section - Estilo minimalista */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className='px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12 md:py-16 bg-palette-cream'
            >
              <div className='max-w-7xl mx-auto'>
                {filters.length > 0 ? (
                  <>
                    <ClassesFilters filtersDB={filters} />

                    {typedClasses &&
                      filterClassSlice?.classType !== 'all' &&
                      !typedClasses?.some(
                        (x: any) => x.group === filterClassSlice.classType
                      ) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className='flex flex-col justify-center items-center h-[50vh] mb-10 rounded-3xl border border-palette-stone/10 bg-palette-cream/50 backdrop-blur-sm'
                        >
                          <h1 className='text-2xl font-light text-palette-ink font-montserrat text-center mb-2'>
                            Próximamente clases...
                          </h1>
                          <p className='text-palette-stone font-montserrat text-center'>
                            Estamos preparando contenido para ti. ¡Mantenete atento!
                          </p>
                        </motion.div>
                      )}
                  </>
                ) : (
                  <p className='text-palette-stone/70'>No filters found</p>
                )}
              </div>
            </motion.section>

            {/* Classes Section - Diseño limpio */}
            <section className='px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 pb-16 md:pb-24 bg-palette-cream'>
              <div className='max-w-7xl mx-auto'>
                {typedClasses && (
                  <>
                    <CarouselClasses
                      key={lastClasses.group}
                      classesDB={[...(lastClasses.items || [])]}
                      title={'Publicadas Recientemente'}
                      description={'Clases agregadas recientemente'}
                      setSelectedClass={setSelectedClass}
                    />
                    {typedClasses?.map((t: any, index: number) => (
                      <motion.div
                        key={t.group}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      >
                        <CarouselClasses
                          key={t.group}
                          classesDB={[...(t.items || [])].reverse()}
                          title={
                            filters[0].values.find((x) => x.value === t.group)
                              ?.label
                          }
                          description={
                            filters[0].values.find((x) => x.value === t.group)
                              ?.description
                          }
                          setSelectedClass={setSelectedClass}
                        />
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </section>

            {/* Footer */}
            {typedClasses && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className='mt-16 md:mt-24'
              >
                <div className=''>
                  <Footer />
                </div>
              </motion.section>
            )}
          </main>

          <Toaster />
        </FilterNavWrapper>
      </MainSideBar>
      
      {/* Tutorial de Camino */}
      <BitacoraMenuTutorial
        isOpen={showBitacoraTutorial}
        onComplete={async () => {
          setShowBitacoraTutorial(false);
          if (auth.user) {
            await auth.fetchUser();
          }
        }}
      />
    </div>
  );
};

export default Home;
