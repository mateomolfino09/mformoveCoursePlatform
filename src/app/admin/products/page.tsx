'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { PlusCircleIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { Link, useRouter } from 'next13-progressbar';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
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
    <div className='bg-gray-700 w-full md:h-[100vh]'>
      <p className='text-white font-boldFont text-3xl my-12 font-bold'>
        Bienvenido al Dashboard de Productos
      </p>
      <div className='grid lg:grid-cols-3 gap-5 mb-16'>
        <Link href={'/admin/products/createProduct'}>
          <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
            <PlusCircleIcon className='w-24' />
            <p>Crear Producto</p>
          </div>
        </Link>
        <Link href={'/admin/products/createFilters'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <BsTools className='w-20 h-20 pb-2' />
                <p className='-mb-4'>Crear Filtro de Producto</p>
              </div>
            </Link>
        <Link href={'/admin/products/allProducts'}>
          <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
            <TableCellsIcon className='w-24' />
            <p>Productos</p>
          </div>
        </Link>
      </div>
      <div className='grid col-1 bg-gray-500 h-96 shadow-sm' />
    </div>
    </AdmimDashboardLayout> 
  );
}

export default Index;

