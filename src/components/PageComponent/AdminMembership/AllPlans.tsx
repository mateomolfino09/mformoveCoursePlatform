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
import { AdminPage, AdminPageHeader, AdminBadge, AdminButton, AdminInput, AdminSelect, AdminTextarea, AdminEmptyState } from '../../admin';

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
      router.push('/iniciar-sesion');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/iniciar-sesion');


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
          <AdminPage wide>
            <AdminPageHeader title="Planes" description="Planes de membresía." />
            {elementos?.length ? (
              <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--admin-border)]">
                        <th scope="col">Nombre</th>
                        <th scope="col">Id</th>
                        <th scope="col">Precio</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Activo</th>
                        <th scope="col" className="text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {elementos.map((plan: Plan) => (
                        <tr
                          key={plan._id}
                          ref={ref}
                          className="border-b border-[var(--admin-border)] last:border-0"
                        >
                          <td className="whitespace-nowrap font-medium">{plan.name}</td>
                          <td className="whitespace-nowrap font-mono text-[12px] text-[var(--admin-muted)]">
                            {plan.id}
                          </td>
                          <td className="whitespace-nowrap tabular-nums">
                            {plan.amount} {plan.currency}
                          </td>
                          <td className="whitespace-nowrap text-[var(--admin-muted)]">
                            {plan.frequency_label}
                          </td>
                          <td className="whitespace-nowrap tabular-nums text-[var(--admin-muted)]">
                            {new Date(plan.createdAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className="whitespace-nowrap">
                            <AdminBadge variant={plan.active ? 'success' : 'destructive'}>
                              {plan.active ? 'Activo' : 'Inactivo'}
                            </AdminBadge>
                          </td>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(plan)}
                                className="rounded-[var(--admin-radius)] p-1.5 text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                                title="Editar"
                                aria-label="Editar plan"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openModalDelete(plan)}
                                className="rounded-[var(--admin-radius)] p-1.5 text-[var(--admin-muted)] hover:bg-[var(--admin-destructive-bg)] hover:text-[var(--admin-destructive)]"
                                title="Eliminar"
                                aria-label="Eliminar plan"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <AdminEmptyState
                title="No hay planes"
                description="Cuando existan planes de membresía aparecerán en esta tabla."
              />
            )}
          </AdminPage>
          <DeletePlan
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            plan={planSelected}
            deletePlan={deletePlan}
          />
          <Dialog open={isOpenEdit} onClose={() => setIsOpenEdit(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-white p-5">
                <Dialog.Title className="mb-4 text-[15px] font-medium text-[var(--admin-fg)]">Editar plan</Dialog.Title>
                <form className="space-y-3" onSubmit={handleEdit}>
                  <AdminInput
                    label="Nombre"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <AdminTextarea
                    label="Descripción"
                    value={editDescription}
                    minLength={10}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />
                  <AdminInput
                    label="Monto"
                    type="text"
                    value={editAmountDisplay}
                    onChange={(e) => {
                      let val = e.target.value;
                      val = val.replace(/[^0-9,.]/g, '');
                      const commaIndex = val.indexOf(',');
                      const dotIndex = val.indexOf('.');
                      if (commaIndex !== -1 && dotIndex !== -1) {
                        if (commaIndex < dotIndex) {
                          val = val.replace(/\./g, '');
                        } else {
                          val = val.replace(/,/g, '');
                        }
                      }
                      setEditAmountDisplay(val);
                      const normalizedVal = val.replace(',', '.');
                      const numValue = normalizedVal === '' ? 0 : parseFloat(normalizedVal) || 0;
                      setEditAmount(numValue);
                    }}
                    required
                  />
                  <AdminSelect
                    label="Frecuencia"
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
                  </AdminSelect>
                  <AdminInput
                    label="Moneda"
                    type="text"
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    required
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <AdminButton type="button" variant="ghost" onClick={() => setIsOpenEdit(false)}>
                      Cancelar
                    </AdminButton>
                    <AdminButton type="submit" variant="primary">
                      Guardar
                    </AdminButton>
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
