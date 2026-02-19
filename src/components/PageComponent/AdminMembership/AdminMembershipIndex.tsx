'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { User } from '../../../../typings';
import {
  PlusCircleIcon,
  TableCellsIcon,
} from '@heroicons/react/24/solid';
import { BookOpenIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
const AdminMembershipIndex = () => {
  const router = useRouter();
  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/login');


  }, [auth.user]);

  return (
    
      <AdmimDashboardLayout>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        <div className='w-full md:h-[100vh]'>
          <div className='mb-12 mt-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
              Bienvenido al Dashboard de Membresías
            </h1>
            <p className='text-gray-600 text-lg font-montserrat'>
              Gestiona tus planes y clases de Move Crew
            </p>
          </div>

          <div className='grid lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'>
            <Link href={'/admin/memberships/createPlan'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <PlusCircleIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Crear Plan</p>
              </div>
            </Link>
            <Link href={'/admin/memberships/plans'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <TableCellsIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Planes</p>
              </div>
            </Link>
            <Link href={'/admin/memberships/promociones'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#ae9359]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ae9359] via-[#c9a86a] to-[#ae9359] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#ae9359] transition-all duration-300 mb-4'>
                  <svg className='w-12 h-12 text-white transition-colors duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#ae9359] transition-colors duration-300'>Promociones</p>
              </div>
            </Link>
            <Link href={'/admin/memberships/classes'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <BookOpenIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Clases</p>
              </div>
            </Link>
            <Link href={'/admin/memberships/class-modules'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <Squares2X2Icon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Módulos de clase</p>
                <p className='text-gray-500 text-sm font-montserrat mt-1'>módulos, submódulos y clases</p>
              </div>
            </Link>
          </div>
        </div>
      </AdmimDashboardLayout>
  );
};


export default AdminMembershipIndex;
