'use client'
import AdmimDashboardLayout from '../components/AdmimDashboardLayout';
import { CoursesDB, IndividualClass, User } from '../../typings';
import {
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import DeleteCourse from './DeleteCourse';
import endpoints from '../services/api';
import { toast } from 'react-toastify';
import DeleteClass from './DeleteClass';

interface Props {
  classes: IndividualClass[];
}
const AllClasses = ({ classes }: Props) => {
  const cookies = parseCookies();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const auth = useAuth()
  const [classSelected, setClassSelected] = useState<IndividualClass | null>(null);
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  const [elementos, setElementos] = useState<IndividualClass[]>([]);

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
    setElementos(classes);
  }, []);


  function openModal() {
    setIsOpen(true);
  }

  const deleteClass= async () => {
    if(classSelected) {

      const classId = classSelected?._id;

      const res = await fetch(endpoints.individualClass.delete(classId.toString()), {
        method: 'DELETE',
        headers: {  
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          classId
        }),
        })

      const data = await res.json()
      await auth.fetchUser()
      const updatedClasses = classes.filter(
        (c: IndividualClass) => c._id !== classSelected._id
      );
      console.log(data)
      setElementos(updatedClasses);
      if (data.success) {
        toast.success(`${classSelected.name} fue eliminado correctamente`);
      }
  
      setIsOpenDelete(false);
    }
     
  };

  function openModalDelete(c: IndividualClass) {
    setClassSelected(c);
    setIsOpenDelete(true);
  }

  function openEdit(c: IndividualClass) {
    setClassSelected(c);
  }

  return (
      <AdmimDashboardLayout>
        <>
          <Head>
            <title>MForMove Platform</title>
            <meta name='description' content='Stream Video App' />
            <link rel='icon' href='/favicon.ico' />
          </Head>
          <div className='w-full h-[100vh]'>
            <div className='flex flex-col'>
              <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
                  <div className='overflow-hidden'>
                    <h1 className='text-2xl mt-4 mb-4'>Clases</h1>
                    <table className='min-w-full text-left text-sm font-light'>
                      <thead className='border-b font-medium dark:border-neutral-500'>
                        <tr>
                          <th scope='col' className='px-6 py-4'>
                            Nombre
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Tipo
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Duración
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Es Gratis
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Descripcion
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
                        {elementos?.map((c: IndividualClass) => (
                          <tr
                            key={c._id}
                            ref={ref}
                            className='border-b dark:border-neutral-500'
                          >
                            <td className='whitespace-nowrap px-6 py-4 font-medium'>
                              {c.name}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {c.type}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {c.level} 
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {`${c.isFree ? 'Si' : 'No'}`} 
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {c.description.substring(0, 40)}... 
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {new Date(c.createdAt).toLocaleDateString(
                                'es-ES'
                              )}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              <div className='flex item-center justify-center border-solid border-transparent border border-collapse text-base'>
                                <div className='w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer'>
                                  <PencilIcon onClick={() => openEdit(c)}/>
                                </div>
                                <div className='w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse '>
                                  <TrashIcon onClick={() => openModalDelete(c)}/>
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
          <DeleteClass
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            clase={classSelected}
            deleteClass={deleteClass}
          />
        </>
      </AdmimDashboardLayout>
  );
};

export default AllClasses;
