'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { User } from '../../../../typings';
import {
  PlusCircleIcon,
  TableCellsIcon,
} from '@heroicons/react/24/solid';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';

const AdminMentorshipIndex = () => {
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
        <title>MForMove Platform - Mentoría</title>
        <meta name='description' content='Administración de Mentoría' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='w-full md:h-[100vh]'>
        <div className='mb-12 mt-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
            Bienvenido al Dashboard de Mentoría
          </h1>
          <p className='text-gray-600 text-lg font-montserrat'>
            Gestiona tus planes y solicitudes de mentoría
          </p>
        </div>

        <div className='grid lg:grid-cols-4 gap-6 mb-8'>
          <Link href={'/admin/mentorship/createPlan'}>
            <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                <PlusCircleIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Crear Plan</p>
            </div>
          </Link>
          <Link href={'/admin/mentorship/plans'}>
            <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                <TableCellsIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Planes</p>
            </div>
          </Link>
          <Link href={'/admin/mentorship/analytics'}>
            <div className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                <ClipboardDocumentListIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>Analytics</p>
            </div>
          </Link>
          <Link href={'/admin/mentorship/solicitudes'}>
            <div className='group relative bg-gradient-to-br from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] border border-[#234C8C]/20 rounded-2xl h-48 shadow-xl hover:shadow-2xl flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'>
              <div className='p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 mb-4'>
                <ClipboardDocumentListIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-white font-bold text-lg font-montserrat'>Solicitudes de Mentoría</p>
            </div>
          </Link>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default AdminMentorshipIndex; 