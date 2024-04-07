'use client';

import Head from 'next/head';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import React, { useEffect, useRef, useState } from 'react';
import { WorkShopDB } from '../../../../typings';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import DeleteWorkShop from './DeleteWorkShop';
import { toast } from 'react-toastify';
import endpoints from '../../../services/api';

interface Props {
    workShops: WorkShopDB[];
  }

const AllWorkShops = ({ workShops }: Props) => {

    let [isOpenDelete, setIsOpenDelete] = useState(false);
    const [elementos, setElementos] = useState<WorkShopDB[]>([]);
    const ref = useRef(null);
    const [workShopSelected, setWorkShopSelected] = useState<WorkShopDB | null>(null);
    const router = useRouter();
    const auth = useAuth();
    let [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const cookies: any = Cookies.get('userToken');
        if (!cookies) {
          router.push('/login');
        }
        if (!auth.user) {
          auth.fetchUser();
        } else if (auth.user.rol != 'Admin') router.push('/login');
      }, [auth.user]);

      useEffect(() => {
        setElementos(workShops);
      }, []);





      function openModal() {
        setIsOpen(true);
      }
    function openModalDelete(workShop: WorkShopDB) {
        setWorkShopSelected(workShop);
        setIsOpenDelete(true);
      }
    
      function openEdit(workShop: WorkShopDB) {
        setWorkShopSelected(workShop);
      }





      const deleteWorkShop = async () => {
        if(workShopSelected) {
    
          const workShopId = workShopSelected?._id;
    
          const res = await fetch(endpoints.workShop.delete(workShopId.toString()), {
            method: 'DELETE',
            headers: {  
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
               workShopId
            }),
            })
    
          const data = await res.json()
          await auth.fetchUser()
          const updatedWorkShops = workShops.filter(
            (workShop: WorkShopDB) => workShop._id !== workShopSelected._id
          );
          console.log(data)
          setElementos(updatedWorkShops);
          if (data.success) {
            toast.success(`${workShopSelected.name} fue eliminado correctamente`);
          }
      
          setIsOpenDelete(false);
        }
         
      };
    





  return (
    <AdmimDashboardLayout>
      <>
      <Head>
          <title>Video Streaming</title>
          <meta name='description' content='Stream Video App' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
      </>
      <div className='w-full h-[100vh]'>
          <div className='flex flex-col'>
            <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
                <div className='overflow-hidden'>
                  <h1 className='text-2xl mt-4 mb-4'>WorkShops</h1>
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
                      {elementos?.map((workShop: WorkShopDB) => (
                        <tr
                          key={workShop._id}
                          ref={ref}
                          className='border-b dark:border-neutral-500'
                        >
                          <td className='whitespace-nowrap px-6 py-4 font-medium'>
                            {workShop.name}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            {workShop.classes.length}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            {Math.floor(
                              workShop.classes
                                .map((c) => c.totalTime)
                                .reduce((prev, current) => prev + current) /
                                60 /
                                60
                            )}{' '}
                            hrs{' '}
                            {Math.floor(
                              (workShop.classes
                                .map((c) => c.totalTime)
                                .reduce((prev, current) => prev + current) /
                                60) %
                                60
                            )}{' '}
                            min{' '}
                            {Math.round(
                              workShop.classes
                                .map((c) => c.totalTime)
                                .reduce((prev, current) => prev + current) % 60
                            )}{' '}
                            seg
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            {workShop.currency} {workShop.price}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            {new Date(workShop.createdAt).toLocaleDateString(
                              'es-ES'
                            )}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <div className='flex item-center justify-center border-solid border-transparent border border-collapse text-base'>
                              <div className='w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer'>
                                <PencilIcon onClick={() => openEdit(workShop)} />
                              </div>
                              <div className='w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse '>
                                <TrashIcon
                                  onClick={() => openModalDelete(workShop)}
                                />
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
        <DeleteWorkShop
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            workShop={workShopSelected}
            deleteWorkShop={deleteWorkShop}
          />
    </AdmimDashboardLayout>
  );
};

export default AllWorkShops;
