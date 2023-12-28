'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { User } from '../../../../typings';
import {
  PlusCircleIcon,
  TableCellsIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
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
        <div className='bg-gray-700 w-full md:h-[100vh]'>
          <p className='text-white text-3xl my-12 font-bold'>
            Bienvenido al Dashboard de Cursos
          </p>

          <div className='grid lg:grid-cols-3 gap-5 mb-16'>
            <Link href={'/admin/classes/createClass'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <PlusCircleIcon className='w-24' />
                <p>Crear Clase</p>
              </div>
            </Link>
            <Link href={'/admin/classes/createClassType'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <BsTools className='w-20 h-20 pb-2' />
                <p className='-mb-4'>Crear Filtro de Clase</p>
              </div>
            </Link>
            <Link href={'/admin/classes/allClasses'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <BookOpenIcon className='w-24' />
                <p>Clases</p>
              </div>
            </Link>
          </div>
          <div className='grid col-1 bg-gray-500 h-96 shadow-sm' />
        </div>
      </AdmimDashboardLayout>
  );
};


export default Index;
