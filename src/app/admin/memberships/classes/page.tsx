'use client'
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { User } from '../../../../../typings';
import {
  PlusCircleIcon,
  TableCellsIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { TbToolsKitchen } from 'react-icons/tb';
import { BsTools } from 'react-icons/bs';


const Index = () => {
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
        <div className='w-full md:h-[100vh] p-8'>
          <div className='mb-12 mt-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
              Clases de Membresía
            </h1>
            <p className='text-gray-600 text-lg font-montserrat'>
              Gestiona las clases exclusivas para miembros
            </p>
          </div>

          <div className='grid lg:grid-cols-3 gap-6 mb-8'>
            <Link href={'/admin/memberships/classes/createClass'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <PlusCircleIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Crear Clase</p>
              </div>
            </Link>
            <Link href={'/admin/memberships/classes/createClassType'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <BsTools className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Crear Filtro</p>
              </div>
            </Link>
            <Link href={'/admin/memberships/classes/allClasses'}>
              <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
                <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                  <BookOpenIcon className='w-12 h-12 text-white transition-colors duration-300' />
                </div>
                <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Ver Todas</p>
              </div>
            </Link>
          </div>
        </div>
      </AdmimDashboardLayout>
  );
};


export default Index;
