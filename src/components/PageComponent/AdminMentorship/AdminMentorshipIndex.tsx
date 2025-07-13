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
      <div className='bg-gray-700 w-full md:h-[100vh]'>
        <p className='text-white font-boldFont text-3xl my-12 font-bold'>
          Bienvenido al Dashboard de Mentoría
        </p>

        <div className='grid lg:grid-cols-4 gap-5 mb-16'>
          <Link href={'/admin/mentorship/createPlan'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              <PlusCircleIcon className='w-24' />
              <p>Crear Plan</p>
            </div>
          </Link>
          <Link href={'/admin/mentorship/plans'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              <TableCellsIcon className='w-24' />
              <p>Planes</p>
            </div>
          </Link>
          <Link href={'/admin/mentorship/analytics'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              <p>Analytics</p>
            </div>
          </Link>
          <Link href={'/admin/mentorship/solicitudes'}>
            <div className='rounded bg-[#234C8C] h-40 shadow-lg flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer border-2 border-[#234C8C]'>
              <ClipboardDocumentListIcon className='w-24 text-white' />
              <p className='text-white font-bold mt-2'>Solicitudes de Mentoría</p>
            </div>
          </Link>
        </div>
        <div className='grid col-1 bg-gray-500 h-96 shadow-sm' />
      </div>
    </AdmimDashboardLayout>
  );
};

export default AdminMentorshipIndex; 