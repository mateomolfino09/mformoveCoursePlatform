'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import FooterProfile from './FooterProfile';
import UserCoursesSection from './UserCoursesSection';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import ProfileSkeleton from '../../ProfileSkeleton';
import ProfileCommunitySection from './ProfileCommunitySection';
import ProfileMentorshipSection from './ProfileMentorshipSection';
import { useLogout } from '../../../hooks/useLogout';
import { routes } from '../../../constants/routes';

function Profile() {
  const router = useRouter();
  const auth = useAuth()
  const { performLogout } = useLogout(routes.navegation.index);
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasCourses, setHasCourses] = useState(false)
  const [firstCourseSlug, setFirstCourseSlug] = useState<string | null>(null)

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/iniciar-sesion');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/user/cursos', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) return;
        const data = await response.json();
        const cursos = Array.isArray(data.cursos) ? data.cursos : [];
        setHasCourses(cursos.length > 0);
        const firstSlug = cursos.find((c: { slug?: string }) => c?.slug?.trim())?.slug?.trim();
        setFirstCourseSlug(firstSlug || null);
      } catch {
        setHasCourses(false);
        setFirstCourseSlug(null);
      }
    };
    fetchCourses();
  }, [auth.user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const logoutHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    performLogout();
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
        <motion.div className='w-full min-h-screen bg-palette-cream'>
          <main className='w-[95%] md:w-[85%] max-w-6xl mx-auto px-4 md:px-8 py-16 mt-4 md:py-20'>
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
              Gestioná tu información y tus cursos
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='space-y-6'
          >
            <motion.div
              variants={itemVariants}
              className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                  <UserCircleIcon className='w-6 h-6 text-palette-sage' />
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
                    href='/restablecer-correo'
                    className='text-sm md:text-base text-palette-ink font-medium underline underline-offset-2 transition-colors hover:text-palette-ink/75'
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
                    href='/olvide-contrasena'
                    className='text-sm md:text-base text-palette-ink font-medium underline underline-offset-2 transition-colors hover:text-palette-ink/75'
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

            <ProfileMentorshipSection itemVariants={itemVariants} />

            <UserCoursesSection />

            {(hasCourses || auth?.user?.isVip) ? (
              <ProfileCommunitySection itemVariants={itemVariants} preferredSlug={firstCourseSlug} />
            ) : null}

            <motion.div
              variants={itemVariants}
              className='bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40'
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl'>
                  <ArrowRightOnRectangleIcon className='w-6 h-6 text-palette-sage' />
                </div>
                <h2 className='text-xl md:text-2xl font-montserrat font-semibold text-palette-ink tracking-tight'>
                  Salir
                </h2>
              </div>

              <button
                onClick={(e) => logoutHandler(e)}
                className='text-base text-palette-ink font-medium underline underline-offset-2 transition-colors hover:text-palette-ink/75'
              >
                Salir de todos los dispositivos
              </button>
            </motion.div>
          </motion.div>
          </main>

          <hr className='w-full border-t border-palette-stone/20 my-8'/>
          <FooterProfile />
        </motion.div>
      </MainSideBar>
    </div>
  );
}

export default Profile;
