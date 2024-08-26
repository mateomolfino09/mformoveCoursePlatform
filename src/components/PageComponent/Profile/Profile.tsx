'use client'
import Membership from '../../../components/Membership';
import { CourseUser, User } from '../../../../typings';
import cookie from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { AnchorHTMLAttributes, useEffect, useRef, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import './profileStyle.css';
import Footer from '../../Footer';
import FooterProfile from './FooterProfile';
import UnsubscribeModal from './UnsubscribeModal';

function Profile() {
  const router = useRouter();
  const auth = useAuth()
  const aRef = useRef<any>(null)
  const [visible, setVisible] = useState<boolean>(false)

  const handleVisibility = () => {
    setVisible(!visible)
  }

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

    aRef?.current?.click()
  };

  const cantCourses = auth.user?.courses?.filter(
    (c: CourseUser) => c.purchased
  ).length;

  return (
    <div className='main-container font-montserrat'>
      <main className='sub-main-container h-screen'>
        <div className='title-container'>
          <h1 className='title text-black font-light'>Mi Cuenta</h1>
        </div>

        <Membership user={auth.user} handleVisibility={handleVisibility}/>
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
        <a href="/login" ref={aRef} className='hidden'>Salir</a>
      </main>
      <hr className='w-full border-[0.5px] border-solid border-black'/>
      <FooterProfile />
      <UnsubscribeModal handleVisiblity={handleVisibility} visible={visible}/>
    </div>
  );
}

export default Profile;
  
  