'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
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
        <title>Admin - Caminos Semanales</title>
        <meta name='description' content='Gestiona las Caminos Semanales' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='w-full md:h-[100vh]'>
        <div className='mb-12 mt-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
            Dashboard de Caminos Semanales
          </h1>
          <p className='text-gray-600 text-lg font-montserrat'>
            Gestiona las caminos mensuales del Camino
          </p>
        </div>

        <div className='grid lg:grid-cols-3 gap-6 mb-8'>
          <Link href={'/admin/bitacora/create'}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-orange-500/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'
            >
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-orange-500 transition-all duration-300 mb-4'>
                <PlusCircleIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-orange-600 transition-colors duration-300'>
                Crear Camino Mensual
              </p>
              <p className='text-gray-500 text-sm mt-2 font-montserrat'>
                4 semanas de contenido
              </p>
            </motion.div>
          </Link>
          
          <Link href={'/admin/bitacora/list'}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-orange-500/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden'
            >
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <div className='p-4 rounded-full bg-gray-800 group-hover:bg-orange-500 transition-all duration-300 mb-4'>
                <BookOpenIcon className='w-12 h-12 text-white transition-colors duration-300' />
              </div>
              <p className='text-gray-900 font-medium text-lg font-montserrat group-hover:text-orange-600 transition-colors duration-300'>
                Ver Caminos
              </p>
              <p className='text-gray-500 text-sm mt-2 font-montserrat'>
                Lista y edita caminos
              </p>
            </motion.div>
          </Link>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
          <h3 className='text-xl font-semibold text-gray-900 mb-4 font-montserrat'>
            Información
          </h3>
          <div className='space-y-3 text-gray-600 font-montserrat'>
            <p>
              <strong>Camino Mensual:</strong> Cada camino contiene 4 semanas de contenido (video, audio y texto).
            </p>
            <p>
              <strong>Publicación Automática:</strong> El contenido se publica cada lunes según las fechas configuradas.
            </p>
            <p>
              <strong>Camino:</strong> Esta es la característica principal de retención para miembros de Move Crew.
            </p>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default BitacoraAdminPage;

