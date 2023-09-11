import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { UserContext } from '../../../../hooks/userContext';
import { CoursesDB, User } from '../../../../../typings';
import { getCourses } from '../../../api/course/getCourses';
import { getUserFromBack } from '../../../api/user/getUserFromBack';
import {
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';

interface Props {
  courses: CoursesDB[];
  user: User;
}
const ShowUsers = ({ courses }: Props) => {
  const cookies = parseCookies();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
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


  function openModal() {
    setIsOpen(true);
  }

  return (
      <AdmimDashboardLayout>
        <>
          <Head>
            <title>Video Streaming</title>
            <meta name='description' content='Stream Video App' />
            <link rel='icon' href='/favicon.ico' />
          </Head>
          <div className='w-full h-[100vh]'>
            <div className='flex flex-col'>
              <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
                  <div className='overflow-hidden'>
                    <h1 className='text-2xl mt-4 mb-4'>Cursos</h1>
                    <table className='min-w-full text-left text-sm font-light'>
                      <thead className='border-b font-medium dark:border-neutral-500'>
                        <tr>
                          <th scope='col' className='px-6 py-4'>
                            Nombre
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Cantidad de Clases
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Duración
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Precio
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Fecha
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses?.map((course: CoursesDB) => (
                          <tr
                            key={course._id}
                            ref={ref}
                            className='border-b dark:border-neutral-500'
                          >
                            <td className='whitespace-nowrap px-6 py-4 font-medium'>
                              {course.name}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {course.classes.length}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
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
                                  .reduce((prev, current) => prev + current) %
                                  60
                              )}{' '}
                              seg
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {course.currency} {course.price}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {new Date(course.createdAt).toLocaleDateString(
                                'es-ES'
                              )}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              <div className='flex item-center justify-center border-solid border-transparent border border-collapse text-base'>
                                <div className='w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer'>
                                  <PencilIcon />
                                </div>
                                <div className='w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse '>
                                  <TrashIcon />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </AdmimDashboardLayout>
  );
};
export async function getServerSideProps(context: any) {
  const courses: any = await getCourses();
  return { props: { courses } };
}

export default ShowUsers;
