'use client';

import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { PlusCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BitacoraAdminPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');
    
    if (!cookies) {
      router.push('/login');
      return;
    }
    
    if (!auth.user) {
      auth.fetchUser();
      return;
    }
    
    if (auth.user.rol !== 'Admin') {
      router.push('/login');
      return;
    }
    
    setLoading(false);
  }, [auth.user, router]);

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Admin - Bitácoras Semanales</title>
        <meta name='description' content='Gestiona las Bitácoras Semanales' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='w-full md:h-[100vh] p-8'>
        <Link
          href="/admin/memberships"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-montserrat"
        >
          ← Volver al Dashboard de Membresías
        </Link>
        
        <div className='mb-12 mt-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
            Dashboard de Bitácoras Semanales
          </h1>
          <p className='text-gray-600 text-lg font-montserrat'>
            Gestiona las bitácoras mensuales del Camino del Gorila
          </p>
        </div>

        <div className='grid lg:grid-cols-3 gap-6 mb-8'>
          <Link href={'/admin/memberships/bitacora/create'}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'
            >
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                <PlusCircleIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>
                Crear Bitácora Mensual
              </p>
              <p className='text-gray-500 text-sm mt-2 font-montserrat'>
                4 semanas de contenido
              </p>
            </motion.div>
          </Link>
          
          <Link href={'/admin/memberships/bitacora/list'}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'
            >
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4'>
                <BookOpenIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>
                Ver Bitácoras
              </p>
              <p className='text-gray-500 text-sm mt-2 font-montserrat'>
                Lista y edita bitácoras
              </p>
            </motion.div>
          </Link>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default BitacoraAdminPage;

