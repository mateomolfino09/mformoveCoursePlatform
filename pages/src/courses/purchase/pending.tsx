import imageLoader from '../../../../imageLoader';
import { CoursesDB, User } from '../../../../typings';
import { getCourseById } from '../../../api/course/getCourseById';
import { getUserFromBack } from '../../../api/user/getUserFromBack';
import { motion as m } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { BiErrorCircle } from 'react-icons/bi';

interface Props {
  user: User;
  course: CoursesDB;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 1.5
    }
  }
};

const Success = ({ course, user }: Props) => {
  const router = useRouter();

  useEffect(() => {
    if (!user || !course) router.push('/');
  }, []);

  return (
    <div className='relative flex h-screen w-screen flex-col bg-transparent md:items-center md:justify-center'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
        <Image
          src='/images/bgIndex1.jpg'
          layout='fill'
          className='-z-10 !hidden opacity-60 sm:!inline'
          objectFit='cover'
          alt='icon image'
          loader={imageLoader}
        />
        {/* Logo position */}
        <img
          src='/images/logoWhite.png'
          className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
          width={150}
          height={150}
          alt='icon image'
        />
        <m.div
          initial={{ y: '-120%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          exit={{ opacity: 1 }}
          className='relative mt-24 space-y-8 rounded md:bg-black/90 py-10 px-6 md:mt-0 md:max-w-lg md:px-14'
        >
          <div className='w-full flex flex-row justify-between items-start'>
            <h1 className='text-4xl font-semibold'>
              Hubo un error al realizar tu compra.
            </h1>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                ease: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5],
                duration: 2.5
              }}
              className='h-12 w-12'
            >
              <BiErrorCircle className='h-12 w-12 text-yellow-300' />
            </m.div>
          </div>

          <div className='space-y-4'>
            <label className='inline-block w-full'>
              <p>
                Pago pendiente... Cuando sea confirmado el curso estará
                disponible.
              </p>
            </label>
            <div className='w-full bg-black/50 flex justify-center items-center cursor-pointer border border-white rounded-md transition duration-500 hover:bg-black hover:scale-105'>
              <button
                className='p-1 text-center'
                onClick={() => router.push(`/src/home`)}
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { query } = context;
  const { email, courseId } = query;
  const course = await getCourseById(courseId);
  const user = await getUserFromBack(email);

  return {
    props: { course, user }
  };
}
export default Success;
