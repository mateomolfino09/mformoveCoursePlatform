
'use client'
import Customizer from '../../components/Customizer';
import PaymentGateway from '../../components/PaymentGateway';
import connectDB from '../../config/connectDB';
import {
  CourseUser,
  CoursesDB,
  User
} from '../../../typings';
import requests from '../../utils/requests';
import state from '../../valtio';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { RefObject, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSnapshot } from 'valtio';
import Cookies from 'js-cookie';
import { useAuth } from '../../hooks/useAuth';
import imageLoader from '../../../imageLoader';

interface Props {
  course: CoursesDB;
}

function CoursePurchase({ course }: Props) {
  const courseDB = course;
  const [courseUser, setCourseUser] = useState<CourseUser | null>(null);
  const [hasWindow, setHasWindow] = useState(false);
  const router = useRouter();
  const auth = useAuth()
  const snap = useSnapshot(state);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }

  }, [router]);


  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else {
      let courseActual = auth?.user?.courses.find(
        (course: CourseUser) => course.course === courseDB._id
      );

      setCourseUser(courseActual ? courseActual : null);
    }

  }, [auth.user]);

  return (
    <section>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='app transition-all ease-in'>
        <div className='absolute top-0 left-0 h-[100vh] w-screen -z-10'>
          <Image
            src='/images/facebg.jpg'
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover object-left   opacity-60  '
          />
        </div>
        <div className='w-full h-full flex'>
          <div className='w-full h-full relative'>
            <PaymentGateway user={auth.user} course={course} />
            <Customizer user={auth.user} course={course} />
          </div>
        </div>
      </main>
      {!snap.intro && (
        <div className='absolute w-full top-0 left-1/2 -ml-[50%] h-full ' />
      )}
    </section>
  );
}

export default CoursePurchase;