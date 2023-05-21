import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { UserContext } from '../../../hooks/userContext';
import { User } from '../../../../typings';
import { getUserFromBack } from '../../api/user/getUserFromBack';
import {
  CreditCardIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';

interface Props {
  user: User;
}

const Index = () => {
  const router = useRouter();
  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/src/user/login');


  }, [auth.user]);

  return (
      <AdmimDashboardLayout>
        <div className='bg-gray-700 w-full md:h-[100vh]'>
          <p className='text-white text-3xl my-12 font-bold'>
            Bienvenido al Dashboard
          </p>

          <div className='grid lg:grid-cols-3 gap-5 mb-16'>
            <Link href={'/src/admin/users'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <UserIcon className='w-24' />
                <p>Usuarios</p>
              </div>
            </Link>
            <Link href={'/src/admin/courses'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <TableCellsIcon className='w-24' />
                <p>Cursos</p>
              </div>
            </Link>
            <Link href={'/src/admin/billing'}>
              <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
                <CreditCardIcon className='w-24' />
                <p>Facturación</p>
              </div>
            </Link>
          </div>
          <div className='grid col-1 bg-gray-500 h-96 shadow-sm' />
        </div>
      </AdmimDashboardLayout>
  );
};


export default Index;
