'use client'
import AdmimDashboardLayout from '../../components/AdmimDashboardLayout';
import { User } from '../../../typings';
import {
  CreditCardIcon,
  TableCellsIcon,
  AtSymbolIcon,
  UserIcon,
  BuildingStorefrontIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { BookOpenIcon, SparklesIcon, CalendarDaysIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import QuickAccessAdminLight from '../../components/PageComponent/Admin/QuickAccessAdminLight';
import { GLOBAL_SITE_DESCRIPTION } from '../../lib/siteMetadata';

interface Props {
  user: User;
}

const Index = () => {
  const router = useRouter();
  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/iniciar-sesion');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/iniciar-sesion');


  }, [auth, router]);

  return (
    
      <AdmimDashboardLayout>
      <Head>
        <title>Admin</title>
        <meta name='description' content={GLOBAL_SITE_DESCRIPTION} />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        <div className='w-full md:h-[100vh]'>
          <div className='mb-8 mt-8'>
            <h1 className='text-4xl md:text-5xl font-light text-gray-900 font-montserrat mb-4'>
              Bienvenido al Dashboard
            </h1>
            <p className='text-gray-600 text-lg font-montserrat mb-6'>
              Gestiona tu plataforma de movimiento
            </p>
            
            {/* Quick Access para Admins */}
            <QuickAccessAdminLight />
          </div>

          <div className='grid lg:grid-cols-3 gap-6 mb-8'>
            <Link href={'/admin/usuarios'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <UserIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-light text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Usuarios</p>
              </div>
            </Link>
            <Link href={'/admin/mentorias'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <AcademicCapIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Mentoría</p>
              </div>
            </Link>
            <Link href={'/admin/clases-presenciales'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <CalendarDaysIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Horarios</p>
              </div>
            </Link>
          </div>
          <div className='grid lg:grid-cols-3 gap-6 mb-8'>
            <Link href={'/admin/membresias'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <BuildingStorefrontIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Membresías</p>
              </div>
            </Link>
            <Link href={'/admin/productos'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <ShoppingBagIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Productos</p>
              </div>
            </Link>
          </div>
        </div>
      </AdmimDashboardLayout>
  );
};


export default Index;
