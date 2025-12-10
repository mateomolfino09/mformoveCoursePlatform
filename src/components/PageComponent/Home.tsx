'use client';

import {
  ClassTypes,
  Images,
  IndividualClass,
  User
} from '../../../typings';
import connectDB from '../../config/connectDB';
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
import AddQuestionModal from '../AddQuestionModal';
import CarouselClasses from '../CarouselClasses';
import ClassesFilters from '../ClassesFilters';
import FilterNavWrapper from '../FilterNavWrapper';
import Footer from '../Footer';
import GetMembershipModal from '../GetMembershipModal';
import GetMembershipModal2 from '../GetMembershipModal2';
import { LoadingSpinner } from '../LoadingSpinner';
import MainSideBar from '../MainSidebar/MainSideBar';
import { m, motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { verify } from 'jsonwebtoken';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useSnapshot as useSnapshotValtio } from 'valtio';
import { FireIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import MoveCrewQuickAccess from './MoveCrew/MoveCrewQuickAccess';
import MoveCrewLoading from './MoveCrew/MoveCrewLoading';
import MoveCrewFeaturesNav from './MoveCrew/MoveCrewFeaturesNav';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../imageLoader';

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
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<IndividualClass | null>(
    null
  );
  const [coherenceStreak, setCoherenceStreak] = useState<number | null>(null);
  const [hasBitacoraContent, setHasBitacoraContent] = useState<boolean>(false);
  const router = useRouter();
  const snap = useSnapshotValtio(state);

  const dispatch = useAppDispatch();
  const filterClassSlice = useAppSelector((state) => state.filterClass.value);

  const openModal = filterClassSlice.openModal;
  const auth = useAuth();

  const handleModal = () => {
    dispatch(setOpenModal(!openModal));
  };

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!auth.user) {
      auth.fetchUser();
    }
    
    // Verificar membresía
    if (auth.user && (auth.user.subscription?.active || auth.user.isVip)) {
      setIsMember(true);
      fetchCoherenceTracking();
      checkBitacoraContent();
    }
    
    setReload(true);

    filters != null && dispatch(setFilters(filters));

    const groupedData = classesDB?.reduce((acc: any, obj) => {
      const groupKey = obj.type;

      // If the group doesn't exist in the accumulator, create it
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      // Push the current object to the group
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
      ?.slice(-5) // Toma los últimos 5 elementos
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ); // Orden por fecha descendente (opcional)

    setLastClasses({
      group: 0,
      items: lastFiveClasses
    });

    dispatch(setIndividualClasses(arrayOfObjects));
    setClasses(arrayOfObjects);
    
    // Finalizar loading inicial después de un pequeño delay
    setTimeout(() => {
      setInitialLoading(false);
    }, 500);
  }, [reload]);

  useEffect(() => {
    const ic = filterClassSlice.individualClasses;
    let newArr: any = [];
    setLoading(true);

    //filtro ultimas clases

    let lastFiveClasses = classesDB
      ?.slice(-5) // Toma los últimos 5 elementos
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ); // Orden por fecha descendente (opcional)

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
    filterClassSlice.seen
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
      console.error('Error verificando bitácora:', err);
      setHasBitacoraContent(false);
    }
  };

  return (
    <>
      <MoveCrewLoading show={initialLoading} />
    <div
        className='relative bg-black lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden font-montserrat'
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

          {/* Banner Web - Fuera del main para que comience desde arriba */}
          <section className='hidden md:block relative min-h-[60vh] w-full overflow-hidden bg-black' style={{ marginTop: 0 }}>
            {/* Imagen de fondo */}
            <div className='absolute inset-0 z-0'>
              <CldImage
                src="my_uploads/fondos/DSC01526_hcas98"
                alt="Move Crew Background"
                fill
                priority
                className="object-cover opacity-50"
                style={{ objectPosition: 'center center' }}
                loader={imageLoader}
              />
            </div>

            {/* Banner de Bienvenida - Web */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='relative z-10 w-full h-[45vh] min-h-[450px] max-h-[550px] flex flex-col justify-center px-8 lg:px-16 xl:px-24 2xl:px-32'
              style={{ paddingTop: '64px' }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className='text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-5 lg:mb-6 font-montserrat tracking-tight drop-shadow-2xl max-w-5xl'
              >
                ¡Bienvenido a Move Crew!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='text-xl lg:text-2xl xl:text-3xl text-white/95 font-light max-w-4xl leading-relaxed mb-5 lg:mb-6 drop-shadow-lg'
              >
                Este es tu espacio para dejar de sentirte rígido/a, desarrollar fuerza real, dominar tu movilidad y moverte con mayor libertad.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className='text-lg lg:text-xl text-white/85 font-light max-w-3xl drop-shadow-md mb-8 lg:mb-10'
              >
                Simple, claro y sostenible. Al servicio de tu vida.
              </motion.p>
              
    
            </motion.div>
          </section>

          {/* Menú de Features Web - Separado del banner */}
          <section className='hidden md:block relative w-full bg-black py-8'>
            <div className='max-w-7xl mx-auto px-6 sm:px-8 md:px-6 lg:px-8'>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='rounded-2xl border border-amber-300/20 backdrop-blur-md p-6 mb-4'
              >
                <MoveCrewFeaturesNav 
                  coherenceStreak={coherenceStreak}
                  hasBitacoraContent={hasBitacoraContent}
                />
              </motion.div>
            </div>
          </section>

          {/* Banner Mobile - Fuera del main para que se vea detrás del header */}
          <section className='md:hidden relative overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black' style={{ marginTop: 0, marginBottom: '2rem' }}>
            {/* Imagen de fondo */}
            <div className='absolute inset-0 z-0 w-full'>
              <CldImage
                src="my_uploads/fondos/fondo3_jwv9x4"
                alt="Move Crew Background"
                fill
                priority
                className="object-cover opacity-30"
                style={{ objectPosition: 'center center' }}
                loader={imageLoader}
              />
            </div>

            {/* Contenido sobre la imagen */}
            <div className='relative z-10' style={{ paddingTop: '64px' }}>
              <div className='mx-auto px-6 sm:px-8'>
                  {/* Espacio negro arriba del menú */}

                {/* Menú de Features de Membresía */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className='relative rounded-2xl border border-amber-300/20 backdrop-blur-none p-4 z-20 mb-6'
                >
                  <MoveCrewFeaturesNav 
                    coherenceStreak={coherenceStreak}
                    hasBitacoraContent={hasBitacoraContent}
                  />
                </motion.div>

                {/* Banner de Bienvenida - Mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className='mb-8'
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className='relative rounded-2xl border border-amber-300/20 bg-white/5 backdrop-blur-none p-6 overflow-hidden z-20'
                  >
                    {/* Decoración de fondo */}
                    <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl z-[1]' />
                    <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/10 to-orange-200/5 rounded-full blur-3xl z-[1]' />
                    
                    <div className='relative z-10'>
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className='text-2xl sm:text-3xl font-extrabold text-white mb-3 font-montserrat tracking-tight drop-shadow-2xl'
                      >
                        ¡Bienvenido a Move Crew!
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className='text-base sm:text-lg text-white font-light max-w-3xl leading-relaxed mb-4 drop-shadow-lg'
                      >
                        Este es tu espacio para dejar de sentirte rígido/a, desarrollar fuerza real, dominar tu movilidad y moverte con mayor libertad.
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className='text-sm sm:text-base text-white/95 font-light max-w-2xl drop-shadow-md mb-6'
                      >
                        Simple, claro y sostenible. Al servicio de tu vida.
                      </motion.p>
                      
                      {/* Quick Access Bar - Acceso compacto a todas las features de Move Crew */}
                      {(isMember && (auth.user?.subscription?.active || auth.user?.isVip)) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <MoveCrewQuickAccess 
                            coherenceStreak={coherenceStreak}
                            hasBitacoraContent={hasBitacoraContent}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          <main className='relative mt-20 md:mt-0 bg-black'>
            {/* Filters Section */}
            <section className='px-3 sm:px-4 md:px-6 lg:px-8 mb-6 md:mb-12 bg-black -mt-12 pt-12'>
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
                          className='flex flex-col justify-center items-center h-[50vh] mb-10 rounded-3xl border border-amber-300/20 bg-gradient-to-br from-white/5 via-amber-500/5 to-orange-500/5 backdrop-blur-sm'
                        >
                          <h1 className='text-2xl font-light text-white font-montserrat text-center mb-2'>
                          Próximamente clases...
                        </h1>
                          <p className='text-white/70 font-montserrat text-center'>
                            Estamos preparando contenido para ti. ¡Mantenete atento!
                        </p>
                        </motion.div>
                    )}
                </>
              ) : (
                  <p className='text-white/70'>No filters found</p>
              )}
              </div>
            </section>

            {/* Classes Section */}
            <section className='px-3 sm:px-4 md:px-6 lg:px-8 mb-6 md:mb-12 bg-black'>
              <div className='max-w-7xl mx-auto'>
              {typedClasses && !loading ? (
                <>
                  <CarouselClasses
                    key={lastClasses.group}
                    classesDB={[...(lastClasses.items || [])]}
                    title={'Publicadas Recientemente'}
                    description={'Clases agregadas recientemente'}
                    setSelectedClass={setSelectedClass}
                  />
                  {typedClasses?.map((t: any) => (
                      <div key={t.group}>
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
                      </div>
                  ))}
                </>
              ) : (
                  <div className='flex justify-center items-center min-h-[400px]'>
                <LoadingSpinner />
                  </div>
              )}
              </div>
            </section>

            {/* Footer */}
            {typedClasses && !loading && (
              <section className='mt-16'>
                <div className=''>
                <Footer />
                </div>
              </section>
            )}
          </main>

          {/* <GetMembershipModal2 handleVisiblity={handleModal} visible={openModal}/> */}
          <Toaster />
        </FilterNavWrapper>
      </MainSideBar>
    </div>
    </>
  );
};

export default Home;
