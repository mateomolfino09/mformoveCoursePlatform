import Membership from '../../../../components/Membership';
import { State } from '../../../../redux/reducers';
import { CourseUser, User } from '../../../../../typings';
import axios from 'axios';
import cookie from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

function Account() {
  const router = useRouter();
  const auth = useAuth()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }


  }, [auth.user]);

  const logoutHandler = async (e: any) => {
    e.preventDefault();

    auth.signOut()
    router.push('/src/user/login')
  };

  const cantCourses = auth.user?.courses.filter(
    (c: CourseUser) => c.purchased
  ).length;

  return (
    <div>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header className={`bg-[#141414]`}>
        <Link href='/src/home'>
          <img
            src='/images/logoWhite.png'
            width={120}
            height={120}
            className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-80 hover:opacity-100'
          />
        </Link>
        <Link href='/src/user/account'>
          <AiOutlineUser className='h-6 w-6 cursor-pointer' />
        </Link>
      </header>

      <main className='mx-auto max-w-6xl pt-24 px-5 pb-12 transition-all md:px-10 '>
        <div className='flex flex-col gap-x-4 md:flex-row md:items-center'>
          <h1 className='text-3xl md:text-4xl'>Cuenta</h1>
          <div className='flex items-center gap-x-1.5'>
            <FaHistory className='h-4 w-4 ' />
            <p className='text-xs font-semibold text=[#5555]'>
              Miembro desde el{' '}
              {auth.user?.createdAt &&
                new Date(auth.user?.createdAt).getDate().toString()}{' '}
              de{' '}
              {auth.user?.createdAt &&
                monthNames[new Date(auth.user?.createdAt).getMonth()]}{' '}
              del{' '}
              {auth.user?.createdAt &&
                new Date(auth.user?.createdAt).getFullYear().toString()}{' '}
            </p>
          </div>
        </div>

        <Membership user={auth.user} />
        <div className='mt-6 grid grid-cols-1 gap-x-4 border px-4 py-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0 md:pb-0'>
          <h4 className='text-lg text-[gray]'>Detalles del Plan</h4>
          {/* Find the current plan */}
          <div className='col-span-2 font-medium'>
            {/* {
              products.filter(
                (product) => product.id === subscription?.product
              )[0]?.name
            } */}
            Cuentas con una cantidad de {cantCourses} cursos
          </div>
          <Link href={'/src/user/account/myCourses'}>
            <p
              className='cursor-pointer text-blue-500 hover:underline md:text-right'
              // onClick={goToBillingPortal}
            >
              Detalles de Cursos
            </p>
          </Link>
        </div>

        <div className='mt-6 grid grid-cols-1 gap-x-4 border px-4 py-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0'>
          <h4 className='text-lg text-[gray]'>Ajustes</h4>
          <p
            className='col-span-3 cursor-pointer text-blue-500 hover:underline'
            onClick={(e) => logoutHandler(e)}
          >
            Salir de todos los dispositivos
          </p>
        </div>
      </main>
    </div>
  );
}

export default Account;
