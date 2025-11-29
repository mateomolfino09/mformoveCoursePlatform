'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
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
import endpoints from '../../../services/api';
import { toast } from 'react-toastify';
import DeletePlan from './DeletePlan';
import { Plan } from '../../../../typings';

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
                    <div className='mb-8 mt-8'>
                      <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>Planes</h1>
                      <p className='text-gray-600 text-lg font-montserrat'>Gestiona tus planes de membresía</p>
                    </div>
                    <div className='bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden'>
                      <table className='min-w-full text-left text-sm font-light font-montserrat'>
                        <thead className='border-b font-medium border-gray-200 bg-gray-50'>
                          <tr>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Nombre
                            </th>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Id
                            </th>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Precio
                            </th>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Tipo
                            </th>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Fecha
                            </th>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Activo
                            </th>
                            <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {elementos?.map((plan: Plan) => (
                            <tr
                              key={plan._id}
                              ref={ref}
                              className='border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200'
                            >
                              <td className='whitespace-nowrap px-6 py-4 font-medium text-gray-900'>
                                {plan.name}
                              </td>
                              <td className='whitespace-nowrap px-6 py-4 text-gray-600'>
                                {plan.id}
                              </td>
                              <td className='whitespace-nowrap px-6 py-4 text-gray-900 font-semibold'>
                                {plan.amount} {plan.currency}
                              </td>
                              <td className='whitespace-nowrap px-6 py-4 text-gray-600'>
                                {plan.frequency_label}
                              </td>
                              <td className='whitespace-nowrap px-6 py-4 text-gray-600'>
                                {new Date(plan.createdAt).toLocaleDateString(
                                  'es-ES'
                                )}
                              </td>
                              <td className='whitespace-nowrap px-6 py-4'>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  plan.active 
                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}>
                                  {plan.active ? 'Sí' : 'No'}
                                </span>
                              </td>
                              <td className='whitespace-nowrap px-6 py-4'>
                                <div className='flex items-center justify-center gap-3'>
                                  <button
                                    onClick={() => openEdit(plan)}
                                    className='text-[#4F7CCF] hover:text-[#234C8C] hover:scale-110 cursor-pointer transition-all duration-200'
                                    title='Editar'
                                  >
                                    <PencilIcon className='w-5 h-5'/>
                                  </button>
                                  <button
                                    onClick={() => openModalDelete(plan)}
                                    className='text-red-600 hover:text-red-700 hover:scale-110 cursor-pointer transition-all duration-200'
                                    title='Eliminar'
                                  >
                                    <TrashIcon className='w-5 h-5'/>
                                  </button>
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
