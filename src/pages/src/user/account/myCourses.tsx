import { UserContext } from '../../../../hooks/userContext';
import { ClassesDB, CoursesDB, User } from '../../../../../typings';
import { getUserCourses } from '../../../api/user/course/getUserCourses';
import { getUserFromBack } from '../../../api/user/getUserFromBack';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import Cookies from 'js-cookie';
import { useAuth } from '../../../../hooks/useAuth';

interface Props {
  courses: CoursesDB[];
  user: User;
}
const MyCourses = ({ courses, user }: Props) => {
  const cookies = parseCookies();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
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

  function openModal() {
    setIsOpen(true);
  }

  return (
      <>
        <Head>
          <title>Mis Cursos</title>
          <meta name='description' content='Cursos del Usuario' />
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
        <div className='w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen mt-24'>
          <h1 className='text-2xl mb-8'>Detalles Cursos</h1>
          <table className='min-w-full text-sm  '>
            <thead>
              <tr>
                <th className='border rounded-md text-xl px-1'>Nombre</th>
                <th className='border  text-xl px-1'>Cantidad de Clases</th>
                <th className='border  text-xl px-1'>Duración</th>
                <th className='border  text-xl px-1'>Precio</th>
                <th className='border rounded-md  text-xl px-1'>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: CoursesDB) => (
                <tr key={course ? +course._id : 0} ref={ref}>
                  <th className='border-solid border border-collapse  bg-gray-900/70 text-base opacity-75'>
                    {course.name}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {course.classes.length}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {Math.floor(
                      course.classes
                        .map((c) => c.totalTime)
                        .reduce((prev, current) => prev + current) /
                        60 /
                        60
                    )}{' '}
                    hrs{' '}
                    {Math.floor(
                      (course.classes
                        .map((c) => c.totalTime)
                        .reduce((prev, current) => prev + current) /
                        60) %
                        60
                    )}{' '}
                    min{' '}
                    {Math.round(
                      course.classes
                        .map((c) => c.totalTime)
                        .reduce((prev, current) => prev + current) % 60
                    )}{' '}
                    seg
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {course.currency} {course.price}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {new Date(course.createdAt).toLocaleDateString('es-ES')}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
  );
};
export async function getServerSideProps(context: any) {
  const { req } = context;
  const courses: any = await getUserCourses(req);

  return { props: { courses } };
}

export default MyCourses;
