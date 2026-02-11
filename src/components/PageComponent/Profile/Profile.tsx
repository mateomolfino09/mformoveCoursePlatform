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
  CreditCardIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { TbMessageCircleCode } from 'react-icons/tb';
import ProfileSkeleton from '../../ProfileSkeleton';

function Profile() {
  const router = useRouter();
  const auth = useAuth()
  const aRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
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
        // Validar que plan existe y tiene provider antes de acceder
        if(plan && plan.provider == "stripe") {
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

  useEffect(() => {
    // Mostrar skeleton al inicio y luego ocultarlo
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

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

  if (initialLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className='w-full min-h-screen bg-palette-cream font-montserrat'>
      <MainSideBar where={"index"}>
        <div className='w-full min-h-screen bg-palette-cream'>
          <main className='w-[85%] max-w-6xl mx-auto px-4 md:px-8 py-16 mt-4 md:py-20'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-12 md:mb-14 text-left md:text-left'
          >
            <p className='font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2'>Tu perfil</p>
            <h1 className='text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-3'>
              Mi Cuenta
            </h1>
            <p className='font-raleway italic text-palette-stone text-base md:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed'>
              Gestioná tu información y suscripción
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
              className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                  <UserCircleIcon className='w-6 h-6 text-palette-teal' />
                </div>
                <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
                  Información General
                </h2>
              </div>

              <div className='space-y-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-palette-stone/20'>
                  <div className='space-y-1'>
                    <p className='font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone'>
                      Email
                    </p>
                    <p className='text-base md:text-lg text-palette-ink font-light'>
                      {auth.user?.email}
                    </p>
                  </div>
                  <Link 
                    href='/resetEmail'
                    className='text-sm md:text-base text-palette-teal hover:text-palette-ink font-medium underline underline-offset-2 transition-colors'
                  >
                    Cambiar Email
                  </Link>
                </div>

                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-palette-stone/20'>
                  <div className='space-y-1'>
                    <p className='font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone'>
                      Contraseña
                    </p>
                    <p className='text-base md:text-lg text-palette-ink font-light'>
                      ••••••••••••
                    </p>
                  </div>
                  <Link 
                    href='/forget'
                    className='text-sm md:text-base text-palette-teal hover:text-palette-ink font-medium underline underline-offset-2 transition-colors'
                  >
                    Cambiar Contraseña
                  </Link>
                </div>

                <div className='pt-2'>
                  <p className='font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone mb-1'>
                    Cuenta creada
                  </p>
                  <p className='text-base text-palette-stone font-light'>
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

            {/* Mi Progreso (sin gorila/emojis, solo iconos y datos) */}
            {coherenceTracking && (
              <motion.div
                variants={itemVariants}
                className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
              >
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                    <ChartBarIcon className='w-6 h-6 text-palette-teal' />
                  </div>
                  <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
                    Mi Progreso
                  </h2>
                </div>
                <div className='flex flex-col items-center max-w-sm mx-auto'>
                  <div className='flex items-center justify-between w-full mb-2'>
                    <span className='font-montserrat text-xs text-palette-stone'>Nivel {coherenceTracking.level ?? 0}</span>
                    <span className='font-montserrat text-sm font-medium text-palette-ink'>{coherenceTracking.monthsCompleted ?? 0} {coherenceTracking.monthsCompleted === 1 ? 'mes' : 'meses'}</span>
                  </div>
                  <div className='w-full h-2 bg-palette-stone/20 rounded-full overflow-hidden mb-1'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${coherenceTracking.progressToNextLevel ?? 0}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className='h-full rounded-full bg-palette-teal'
                    />
                  </div>
                  <p className='font-montserrat text-xs text-palette-stone'>{coherenceTracking.progressToNextLevel ?? 0}% hacia el siguiente nivel</p>
                </div>
              </motion.div>
            )}

            {/* Membresía */}
            <Membership user={auth.user} handleVisibility={open} plan={plan} loading={loading}/>

            {/* Comunidad Move Crew */}
            {(auth?.user?.subscription?.active || auth?.user?.isVip) && (
              <motion.div
                variants={itemVariants}
                className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
              >
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                    <TbMessageCircleCode className='text-xl text-palette-teal w-6 h-6'/>
                  </div>
                  <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
                    Comunidad Move Crew
                  </h2>
                </div>
                <p className='text-base text-palette-stone font-light mb-4 leading-relaxed'>
                  Accedé al grupo privado de Telegram para soporte, avisos y novedades.
                </p>
                <a
                  href='https://t.me/+_9hJulwT690yNWFh'
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-2 px-5 py-3 rounded-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-teal hover:border-palette-teal transition-all duration-200 w-full md:w-auto justify-center text-center'
                >
                  Unirme a la comunidad
                </a>
              </motion.div>
            )}

            {/* Detalles del Plan */}
            <motion.div
              variants={itemVariants}
              className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                  <CreditCardIcon className='w-6 h-6 text-palette-teal' />
                </div>
                <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
                  Detalles del Plan
                </h2>
              </div>

              <div className='space-y-4'>
                {auth?.user?.subscription?.active || auth?.user?.isVip ? (
                  <>
                    <div className='space-y-2'>
                      <p className='font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone'>
                        Estado
                      </p>
                      <div className='flex items-center gap-2'>
                        <div className={`w-2 h-2 rounded-full ${auth?.user?.subscription?.isCanceled ? 'bg-amber-500' : 'bg-palette-teal'}`} />
                        <p className='text-base md:text-lg text-palette-ink font-light'>
                          {loadingDates || !startDate 
                            ? 'Subscripción activa' 
                            : `Subscripción activa desde el ${startDate}`
                          }
                        </p>
                      </div>
                    </div>

                    {!loadingDates && startDate && (
                      <div className='pt-2 border-t border-palette-stone/20'>
                        <p className='font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone mb-1'>
                          {auth?.user?.subscription?.isCanceled ? 'Fin del plan' : 'Próxima renovación'}
                        </p>
                        <p className='text-base text-palette-stone font-light'>
                          {endDate}
                        </p>
                      </div>
                    )}

                    <div className='pt-4'>
                      <Link 
                        href='/account/myCourses'
                        className='inline-flex items-center gap-2 text-sm md:text-base text-palette-teal hover:text-palette-ink font-medium underline underline-offset-2 transition-colors'
                      >
                        Ver mis cursos
                        <ArrowRightIcon className='w-4 h-4' />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className='space-y-4'>
                    <p className='text-base text-palette-stone font-light'>
                      Aún no estás subscripto
                    </p>
                    <Link 
                      href='/mentorship'
                      className='inline-flex items-center gap-2 px-6 py-3 font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-teal hover:border-palette-teal transition-all duration-200'
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
              className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                  <ArrowRightOnRectangleIcon className='w-6 h-6 text-palette-teal' />
                </div>
                <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
                  Salir
                </h2>
              </div>

              <button
                onClick={(e) => logoutHandler(e)}
                className='text-base text-palette-stone hover:text-palette-ink font-medium underline underline-offset-2 transition-colors'
              >
                Salir de todos los dispositivos
              </button>
            </motion.div>
          </motion.div>
          </main>

          <hr className='w-full border-t border-palette-stone/20 my-8'/>
          <FooterProfile />
        </div>
        <UnsubscribeModal handleVisiblity={open} visible={isOpen} close={close}/>
        <a href="/login" ref={aRef} className='hidden'>Salir</a>
      </MainSideBar>
    </div>
  );
}

export default Profile;