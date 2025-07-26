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
import { BookOpenIcon } from '@heroicons/react/24/outline';

interface Props {
  user: User;
}

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
        <title>MForMove Platform</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
        <div className='bg-gray-700 w-full md:h-[100vh]'>
          <p className='text-white font-boldFont text-3xl my-12 font-bold'>
            Bienvenido al Dashboard
          </p>

          <div className='grid lg:grid-cols-3 gap-5 mb-16'>
            <Link href={'/admin/users'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <UserIcon className='w-24' />
                <p>Usuarios</p>
              </div>
            </Link>
            <Link href={'/admin/billing'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <CreditCardIcon className='w-24' />
                <p>Facturación</p>
              </div>
            </Link>
            <Link href={'/admin/mentorship'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <AcademicCapIcon className='w-24' />
                <p>Mentoría</p>
              </div>
            </Link>
          </div>
          <div className='grid lg:grid-cols-3 gap-5 mb-16'>
            <Link href={'/admin/emailmarketing'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <AtSymbolIcon className='w-24' />
                <p>Email Marketing</p>
              </div>
            </Link>
            <Link href={'/admin/classes'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <BookOpenIcon className='w-24' />
                <p>Clases</p>
              </div>
            </Link>
            <Link href={'/admin/memberships'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <BuildingStorefrontIcon className='w-24' />
                <p>Memberships</p>
              </div>
            </Link>

            {/* <Link href={'#'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              </div>
            </Link> */}
          </div>
          <div className='grid col-1 bg-gray-500 h-96 shadow-sm' />
        </div>
      </AdmimDashboardLayout>
  );
};


export default Index;
