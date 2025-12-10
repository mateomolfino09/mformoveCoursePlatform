'use client'
import Membership from '../../../components/Membership';
import { Plan, User } from '../../../../typings';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import FooterProfile from './FooterProfile';
import UnsubscribeModal from './UnsubscribeModal';
import MainSideBar from '../../MainSidebar/MainSideBar';
import endpoints from '../../../services/api';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  CalendarIcon, 
  CreditCardIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import GorillaLevelDisplay from '../Bitacora/GorillaLevelDisplay';

function Profile() {
  const router = useRouter();
  const auth = useAuth()
  const aRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDates, setLoadingDates] = useState(false)

  const [plan, setPlan] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [coherenceTracking, setCoherenceTracking] = useState<any>(null)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

    // Obtener tracking de coherencia
    const fetchCoherenceTracking = async () => {
      try {
        const response = await fetch('/api/coherence/tracking', {
          credentials: 'include',
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tracking) {
            setCoherenceTracking(data.tracking);
          }
        }
      } catch (error) {
        console.error('Error obteniendo tracking de coherencia:', error);
      }
    };
    fetchCoherenceTracking();

    let plan: any = null

    if(auth?.user?.subscription?.planId) {
      const fetchData = async () => {
        setLoading(true)
        try {
          const data = await fetch(endpoints.auth.getUserPlan(auth?.user?.subscription?.planId), {
            method: 'GET',
          }).then((r) => r.json());

          setPlan(data?.plan)
          fetchSubscriptionPeriod(data?.plan);

        } catch (err: any) {
          throw new Error(err)
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      const fetchSubscriptionPeriod = async (plan:Plan) => {
        if(plan.provider == "stripe") {
          setLoadingDates(true)
          try {
            const data = await fetch(endpoints.user.getSubscriptionPeriod(auth?.user?.subscription?.id), {
              method: 'GET',
            }).then((r) => r.json());
  
            setStartDate(data?.startDate)
            setEndDate(data?.endDate);
  
            } catch (err: any) {
            throw new Error(err)
          } finally {
            setLoadingDates(false);
          }
        }
      };

      }
  }, [auth.user]);

  const logoutHandler = async (e: any) => {
    e.preventDefault();
    auth.signOut()
    aRef?.current?.click()
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className='w-full min-h-screen bg-white font-montserrat'>
      <MainSideBar where={"index"}>
        <div className='w-full min-h-screen bg-white'>
          <main className='w-full max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-16'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-12'
          >
            <h1 className='text-5xl md:text-5xl font-bold text-black mb-3'>
              Mi Cuenta
            </h1>
            <p className='text-base md:text-lg text-gray-600 font-light'>
              Gestiona tu información y suscripción
            </p>
          </motion.div>

          {/* Cards Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='space-y-6'
          >
            {/* Información General */}
            <motion.div
              variants={itemVariants}
              className='bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gray-100 rounded-lg'>
                  <UserCircleIcon className='w-6 h-6 text-gray-700' />
                </div>
                <h2 className='text-xl md:text-2xl font-semibold text-black'>
                  Información General
                </h2>
              </div>

              <div className='space-y-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100'>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-light uppercase tracking-wide'>
                      Email
                    </p>
                    <p className='text-base md:text-lg text-black font-light'>
                      {auth.user?.email}
                    </p>
                  </div>
                  <Link 
                    href='/resetEmail'
                    className='text-sm md:text-base text-gray-700 hover:text-black font-medium underline underline-offset-2 transition-colors'
                  >
                    Cambiar Email
                  </Link>
                </div>

                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100'>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-500 font-light uppercase tracking-wide'>
                      Contraseña
                    </p>
                    <p className='text-base md:text-lg text-black font-light'>
                      ••••••••••••
                    </p>
                  </div>
                  <Link 
                    href='/forget'
                    className='text-sm md:text-base text-gray-700 hover:text-black font-medium underline underline-offset-2 transition-colors'
                  >
                    Cambiar Contraseña
                  </Link>
                </div>

                <div className='pt-2'>
                  <p className='text-sm text-gray-500 font-light uppercase tracking-wide mb-1'>
                    Cuenta creada
                  </p>
                  <p className='text-base text-gray-700 font-light'>
                    {auth.user?.createdAt &&
                      new Date(auth.user?.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progreso del Gorila */}
            {coherenceTracking && (
              <motion.div
                variants={itemVariants}
                className='bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300'
              >
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 bg-gray-100 rounded-lg'>
                    <span className='text-2xl'>🦍</span>
                  </div>
                  <h2 className='text-xl md:text-2xl font-semibold text-black'>
                    Mi Progreso
                  </h2>
                </div>
                <div className='flex justify-center'>
                  <GorillaLevelDisplay
                    level={coherenceTracking.level || 1}
                    gorillaIcon={coherenceTracking.gorillaIcon || '🦍'}
                    evolutionName={coherenceTracking.evolutionName || 'Gorila Bebé'}
                    progressToNextLevel={coherenceTracking.progressToNextLevel || 0}
                    monthsCompleted={coherenceTracking.monthsCompleted || 0}
                    size="md"
                    showProgressBar={true}
                    showLevel={true}
                  />
                </div>
              </motion.div>
            )}

            {/* Membresía */}
            <Membership user={auth.user} handleVisibility={open} plan={plan} loading={loading}/>

            {/* Detalles del Plan */}
            <motion.div
              variants={itemVariants}
              className='bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gray-100 rounded-lg'>
                  <CreditCardIcon className='w-6 h-6 text-gray-700' />
                </div>
                <h2 className='text-xl md:text-2xl font-semibold text-black'>
                  Detalles del Plan
                </h2>
              </div>

              <div className='space-y-4'>
                {auth?.user?.subscription?.active || auth?.user?.isVip ? (
                  <>
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-500 font-light uppercase tracking-wide'>
                        Estado
                      </p>
                      <div className='flex items-center gap-2'>
                        <div className={`w-2 h-2 rounded-full ${auth?.user?.subscription?.isCanceled ? 'bg-orange-500' : 'bg-green-500'}`} />
                        <p className='text-base md:text-lg text-black font-light'>
                          {loadingDates || !startDate 
                            ? 'Subscripción activa' 
                            : `Subscripción activa desde el ${startDate}`
                          }
                        </p>
                      </div>
                    </div>

                    {!loadingDates && startDate && (
                      <div className='pt-2 border-t border-gray-100'>
                        <p className='text-sm text-gray-500 font-light uppercase tracking-wide mb-1'>
                          {auth?.user?.subscription?.isCanceled ? 'Fin del plan' : 'Próxima renovación'}
                        </p>
                        <p className='text-base text-gray-700 font-light'>
                          {endDate}
                        </p>
                      </div>
                    )}

                    <div className='pt-4'>
                      <Link 
                        href='/account/myCourses'
                        className='inline-flex items-center gap-2 text-sm md:text-base text-gray-700 hover:text-black font-medium underline underline-offset-2 transition-colors'
                      >
                        Ver mis cursos
                        <ArrowRightIcon className='w-4 h-4' />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className='space-y-4'>
                    <p className='text-base text-gray-600 font-light'>
                      Aún no estás subscripto
                    </p>
                    <Link 
                      href='/mentorship'
                      className='inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors'
                    >
                      Subscribirme
                      <ArrowRightIcon className='w-4 h-4' />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Salir */}
            <motion.div
              variants={itemVariants}
              className='bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gray-100 rounded-lg'>
                  <ArrowRightOnRectangleIcon className='w-6 h-6 text-gray-700' />
                </div>
                <h2 className='text-xl md:text-2xl font-semibold text-black'>
                  Salir
                </h2>
              </div>

              <button
                onClick={(e) => logoutHandler(e)}
                className='text-base text-red-600 hover:text-red-700 font-medium underline underline-offset-2 transition-colors'
              >
                Salir de todos los dispositivos
              </button>
            </motion.div>
          </motion.div>
          </main>

          <hr className='w-full border-t border-gray-200 my-8'/>
          <FooterProfile />
        </div>
        <UnsubscribeModal handleVisiblity={open} visible={isOpen} close={close}/>
        <a href="/login" ref={aRef} className='hidden'>Salir</a>
      </MainSideBar>
    </div>
  );
}

export default Profile;