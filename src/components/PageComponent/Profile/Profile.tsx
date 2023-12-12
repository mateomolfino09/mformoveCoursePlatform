'use client'
import Membership from '../../../components/Membership';
import { CourseUser, User } from '../../../../typings';
import cookie from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import './profileStyle.css';

function Profile() {
  const router = useRouter();
  const auth = useAuth()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }


  }, [auth.user]);

  const logoutHandler = async (e: any) => {
    e.preventDefault();

    auth.signOut()
    router.push('/login')
  };

  const cantCourses = auth.user?.courses?.filter(
    (c: CourseUser) => c.purchased
  ).length;

  return (
    <div className='main-container'>
      <main className='sub-main-container'>
        <div className='title-container'>
          <h1 className='title'>Perfil</h1>
        </div>

        <Membership user={auth.user} />
        <div className='second-container'>
          <h4 className='second-title '>Detalles del Plan</h4>
          <div className='col-span-2 font-medium'>
            Cuentas con una cantidad de {cantCourses} cursos
          </div>
          <Link href={'/account/myCourses'}>
            <p
              className='paragraph'
            >
              Detalles de Cursos
            </p>
          </Link>
        </div>
        <div className='second-container'>
          <h4 className='second-title '>Ajustes</h4>
          <p
            className='paragraph-third'
            onClick={(e) => logoutHandler(e)}
          >
            Salir de todos los dispositivos
          </p>
        </div>
      </main>
    </div>
  );
}

export default Profile;
  
  