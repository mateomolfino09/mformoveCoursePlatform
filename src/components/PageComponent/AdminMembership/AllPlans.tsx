'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import {
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import endpoints from '../../../services/api';
import { toast } from '../../../hooks/useToast';
import DeletePlan from './DeletePlan';
import { Plan } from '../../../../typings';
import { Dialog } from '@headlessui/react';
import { planFrequencys } from '../../../constants/planFrequency';

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
  let [isOpenEdit, setIsOpenEdit] = useState(false);
  const [elementos, setElementos] = useState<Plan[]>([]);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editAmountDisplay, setEditAmountDisplay] = useState<string>('0');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [editDescription, setEditDescription] = useState('');
  const [editFrequencyType, setEditFrequencyType] = useState(planFrequencys[0].value);
  const [editFrequencyLabel, setEditFrequencyLabel] = useState(planFrequencys[0].label);

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/login');


  }, [auth.user, auth, router]);

  useEffect(() => {
    setElementos(plans);
  }, [plans]);


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
    setIsOpenEdit(true);
  }

  useEffect(() => {
    if (!planSelected) return;
    setEditName(planSelected.name || '');
    const amountValue = planSelected.amount ??
      // fallback para datos legacy
      (planSelected as any).price ??
      0;
    setEditAmount(amountValue);
    setEditAmountDisplay(amountValue.toString().replace('.', ','));
    setEditCurrency(planSelected.currency || (planSelected as any).currency || 'USD');
    setEditDescription(planSelected.description || '');

    const freqRaw = (
      planSelected.frequency_type ||
      planSelected.frequency_label ||
      (planSelected as any).interval ||
      ''
    ).toLowerCase();
    if (freqRaw.includes('year') || freqRaw.includes('anual')) {
      setEditFrequencyType('YEARLY');
      setEditFrequencyLabel('Anual');
    } else {
      setEditFrequencyType('MONTHLY');
      setEditFrequencyLabel('Mensual');
    }
  }, [planSelected, isOpenEdit]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planSelected) return;
    try {
      const res = await fetch(`/api/payments/plans/${planSelected._id}?type=membership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          amount: editAmount,
          currency: editCurrency,
          description: editDescription,
          frequency_type: editFrequencyType,
          frequency_value: 1,
          frequency_label: editFrequencyLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'No se pudo actualizar el plan');
      }

      const updated = elementos.map((plan) =>
        plan._id === planSelected._id
          ? { 
              ...plan, 
              name: editName, 
              amount: editAmount, 
              currency: editCurrency,
              description: editDescription,
              frequency_type: editFrequencyType,
              frequency_label: editFrequencyLabel,
            }
          : plan
      );
      setElementos(updated);
      toast.success('Plan actualizado correctamente');
      setIsOpenEdit(false);
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar el plan');
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
          <Dialog open={isOpenEdit} onClose={() => setIsOpenEdit(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Editar plan</Dialog.Title>
                <form className="space-y-4" onSubmit={handleEdit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      value={editDescription}
                      minLength={10}
                      onChange={(e) => setEditDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      value={editAmountDisplay}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Permitir números, coma y punto
                        val = val.replace(/[^0-9,.]/g, '');
                        // Si hay múltiples comas o puntos, mantener solo el primero
                        const commaIndex = val.indexOf(',');
                        const dotIndex = val.indexOf('.');
                        if (commaIndex !== -1 && dotIndex !== -1) {
                          // Si hay ambos, mantener el primero que aparezca
                          if (commaIndex < dotIndex) {
                            val = val.replace(/\./g, '');
                          } else {
                            val = val.replace(/,/g, '');
                          }
                        }
                        setEditAmountDisplay(val);
                        // Normalizar: convertir coma a punto para el valor numérico
                        const normalizedVal = val.replace(',', '.');
                        const numValue = normalizedVal === '' ? 0 : parseFloat(normalizedVal) || 0;
                        setEditAmount(numValue);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      value={editFrequencyType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditFrequencyType(val);
                        const label = planFrequencys.find((f) => f.value === val)?.label || '';
                        setEditFrequencyLabel(label);
                      }}
                      required
                    >
                      {planFrequencys.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpenEdit(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#4F7CCF] text-white hover:bg-[#234C8C]"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      </AdmimDashboardLayout>
  );
};

export default AllPlans;
