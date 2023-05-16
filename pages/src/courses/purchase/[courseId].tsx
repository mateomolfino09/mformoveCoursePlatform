import Customizer from '../../../../components/Customizer';
import PaymentGateway from '../../../../components/PaymentGateway';
import connectDB from '../../../../config/connectDB';
import imageLoader from '../../../../imageLoader';
import {
  CourseUser,
  CoursesDB,
  User
} from '../../../../typings';
import requests from '../../../../utils/requests';
import { getCourseById } from '../../../api/course/getCourseById';
import { getUserFromBack } from '../../../api/user/getUserFromBack';
import state from './../../../../valtio';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { RefObject, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSnapshot } from 'valtio';

interface Props {
  course: CoursesDB;
  classId: number;
  lastCourseClass: number;
  user: User | null;
}

function Course({ course, user }: Props) {
  const courseDB = course;
  const [courseUser, setCourseUser] = useState<CourseUser | null>(null);
  const [hasWindow, setHasWindow] = useState(false);
  const router = useRouter();
  const snap = useSnapshot(state);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
    if (!user) {
      router.push('/src/user/login');
    } else {
      let courseActual = user.courses.find(
        (course: CourseUser) => course.course === courseDB._id
      );
      setCourseUser(courseActual ? courseActual : null);
    }
  }, [router]);

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
            <PaymentGateway user={user} course={course} />
            <Customizer user={user} course={course} />
          </div>
        </div>
      </main>
      {!snap.intro && (
        <div className='absolute w-full top-0 left-1/2 -ml-[50%] h-full '></div>
      )}
    </section>
  );
}

export async function getServerSideProps(context: any) {
  connectDB();
  const { params, req } = context;
  const session = await getSession({ req });
  const cookies = parseCookies(context);
  const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user;
  const email = userCookie?.email;
  const { courseId } = params;
  const course = await getCourseById(courseId);
  const user = await getUserFromBack(email);

  return {
    props: { course, user }
  };
}

export default Course;
