'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { CoursesDB, Plan, User } from '../../../../typings';
import {
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import DeleteCourse from '../../DeleteCourse';
import endpoints from '../../../services/api';
import { toast } from 'react-toastify';
import DeletePlan from './DeletePlan';

interface Props {
  plans: Plan[];
}
const AllPlans = ({ plans }: Props) => {
  const cookies = parseCookies();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const auth = useAuth()
  const [planSelected, setPlanSelected] = useState<Plan | null>(null);
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  const [elementos, setElementos] = useState<Plan[]>([]);

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
    setElementos(plans);
  }, []);


  function openModal() {
    setIsOpen(true);
  }

  const deletePlan = async () => {
    if(planSelected) {

      const planId = planSelected?.id;

      const res = await fetch(endpoints.payments.deletePlan(planId.toString()), {
        method: 'DELETE',
        headers: {  
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            planId
        }),
        })

      const data = await res.json()
      await auth.fetchUser()
      const updatedPlans = plans.filter(
        (p: Plan) => p._id !== planSelected._id
      );
      console.log(data)
      setElementos(updatedPlans);
      if (data.success) {
        toast.success(`${planSelected.name} fue eliminado correctamente`);
      }
  
      setIsOpenDelete(false);
    }
     
  };

  function openModalDelete(p: Plan) {
    setPlanSelected(p);
    setIsOpenDelete(true);
  }

  function openEdit(p: Plan) {
    setPlanSelected(p);
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
                    <h1 className='text-2xl font-boldFont mt-4 mb-4'>Planes</h1>
                    <table className='min-w-full text-left text-sm font-light'>
                      <thead className='border-b font-medium dark:border-neutral-500'>
                        <tr>
                          <th scope='col' className='px-6 py-4'>
                            Nombre
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Id
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Precio
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Tipo
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Fecha
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Activo
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {elementos?.map((plan: Plan) => (
                          <tr
                            key={plan._id}
                            ref={ref}
                            className='border-b dark:border-neutral-500'
                          >
                            <td className='whitespace-nowrap px-6 py-4 font-medium'>
                              {plan.name}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {plan.id}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {plan.amount} {plan.currency}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {plan.frequency_label}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {new Date(plan.createdAt).toLocaleDateString(
                                'es-ES'
                              )}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {plan.active ? 'Si' : 'No'}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              <div className='flex item-center justify-center border-solid border-transparent border border-collapse text-base'>
                                <div className='w-6 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer'>
                                  <PencilIcon onClick={() => openEdit(plan)}/>
                                </div>
                                <div className='w-6 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse '>
                                  <TrashIcon onClick={() => openModalDelete(plan)}/>
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
          <DeletePlan
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            plan={planSelected}
            deletePlan={deletePlan}
          />
        </>
      </AdmimDashboardLayout>
  );
};

export default AllPlans;
