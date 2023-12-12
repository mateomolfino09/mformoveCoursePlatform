'use client'
import AdmimDashboardLayout from '../../components/AdmimDashboardLayout';
import { CoursesDB, User } from '../../../typings';
import {
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import DeleteCourse from '../DeleteCourse';
import endpoints from '../../services/api';
import { toast } from 'react-toastify';

interface Props {
  courses: CoursesDB[];
}
const AllCourses = ({ courses }: Props) => {
  const cookies = parseCookies();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const auth = useAuth()
  const [courseSelected, setCourseSelected] = useState<CoursesDB | null>(null);
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  const [elementos, setElementos] = useState<CoursesDB[]>([]);

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

  useEffect(() => {
    setElementos(courses);
  }, []);


  function openModal() {
    setIsOpen(true);
  }

  const deleteCourse = async () => {
    if(courseSelected) {

      const courseId = courseSelected?._id;

      const res = await fetch(endpoints.course.delete(courseId.toString()), {
        method: 'DELETE',
        headers: {  
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseId
        }),
        })

      const data = await res.json()
      await auth.fetchUser()
      const updatedCourses = courses.filter(
        (course: CoursesDB) => course._id !== courseSelected._id
      );
      console.log(data)
      setElementos(updatedCourses);
      if (data.success) {
        toast.success(`${courseSelected.name} fue eliminado correctamente`);
      }
  
      setIsOpenDelete(false);
    }
     
  };

  function openModalDelete(course: CoursesDB) {
    setCourseSelected(course);
    setIsOpenDelete(true);
  }

  function openEdit(course: CoursesDB) {
    setCourseSelected(course);
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
                        {elementos?.map((course: CoursesDB) => (
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
                                  <PencilIcon onClick={() => openEdit(course)}/>
                                </div>
                                <div className='w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse '>
                                  <TrashIcon onClick={() => openModalDelete(course)}/>
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
          <DeleteCourse
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            course={courseSelected}
            deleteCourse={deleteCourse}
          />
        </>
      </AdmimDashboardLayout>
  );
};

export default AllCourses;
