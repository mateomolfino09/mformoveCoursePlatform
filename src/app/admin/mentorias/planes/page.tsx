"use client"
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import Link from 'next/link';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { toast } from '../../../../hooks/useToast';
import {
  mentorshipPricesHaveStaleLinks,
  stripTrailingSlash,
} from '../../../../lib/resolveMentorshipPaymentOrigin';

interface MentorshipPlanPagoOption {
  proveedor: 'stripe' | 'dlocalgo';
  etiqueta: string;
  descripcion: string;
  monto: number;
  moneda: string;
  paymentLink: string;
  activo: boolean;
  originBase?: string;
}

interface MentorshipPlan {
  _id?: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  level: string;
  stripePriceId: string;
  active: boolean;
  prices?: Array<{
    interval: string;
    price: number;
    currency: string;
    stripePriceId: string;
    opcionesPago?: MentorshipPlanPagoOption[];
  }>;
}

function PaymentLinkField({ label, href }: { label: string; href?: string }) {
  const copyLink = () => {
    if (!href) return;
    navigator.clipboard.writeText(href);
    toast.success('Link copiado al portapapeles');
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-[#1A1A1A]">{label}</p>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={href || 'Sin link generado'}
          readOnly
          className="flex-1 text-xs text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 font-mono"
        />
        {href ? (
          <>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#234C8C] text-white px-3 py-1 rounded text-xs hover:bg-[#1a3763] transition-colors"
            >
              Abrir
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
            >
              Copiar
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

const emptyPlan: MentorshipPlan = {
  name: "",
  price: 0,
  currency: "USD",
  interval: "trimestral",
  description: "",
  features: [],
  level: "explorer",
  stripePriceId: "",
  active: true,
};

const levels = [
  { value: "explorer", label: "Explorador" },
  { value: "practitioner", label: "Practicante" },
  { value: "student", label: "Estudiante" },
];

export default function AdminMentorshipPlansPage() {
  const router = useRouter();
  const auth = useAuth();
  const [plans, setPlans] = useState<MentorshipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const [planSelected, setPlanSelected] = useState<MentorshipPlan | null>(null);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenInfo, setIsOpenInfo] = useState(false);
  const [regeneratingLinks, setRegeneratingLinks] = useState(false);

  const expectedPaymentOrigin = stripTrailingSlash(
    process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : ''),
  );

  const planHasStaleLinks = planSelected
    ? mentorshipPricesHaveStaleLinks(planSelected.prices, expectedPaymentOrigin)
    : false;

  // Protección de admin
  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    if (!cookies) {
      router.push('/iniciar-sesion');
    }
    if (!auth.user) {
      auth.fetchUser()
    }
    else if (auth.user.rol != 'Admin') {
      router.push('/iniciar-sesion');
    }
  }, [auth.user]);

  // Fetch all plans (including inactive ones for admin)
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/getPlans?type=mentorship&all=true");
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Delete plan
  const deletePlan = async () => {
    if(planSelected) {
      const planId = planSelected?._id;
      const res = await fetch(`/api/payments/plans/${planId}?type=mentorship`, {
        method: "DELETE",
        headers: {  
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      if (res.ok) {
        toast.success(`${planSelected.name} fue eliminado correctamente`);
        fetchPlans();
      } else {
        toast.error('Error al eliminar el plan');
      }
      setIsOpenDelete(false);
    }
  };

  function openModalDelete(p: MentorshipPlan) {
    setPlanSelected(p);
    setIsOpenDelete(true);
  }

  function openEdit(p: MentorshipPlan) {
    router.push(`/admin/mentorias/crear-plan?id=${p._id}`);
  }

  function openInfo(p: MentorshipPlan) {
    setPlanSelected(p);
    setIsOpenInfo(true);
  }

  const regeneratePaymentLinks = async (forceRegenerate = false) => {
    if (!planSelected?._id) return;

    setRegeneratingLinks(true);
    try {
      const response = await fetch('/api/mentorship/stripe/createPaymentLinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planSelected._id,
          forceRegenerate,
        }),
      });

      const data = await response.json();

      if (data.success && data.prices) {
        setPlanSelected({ ...planSelected, prices: data.prices });
        setPlans((prev) =>
          prev.map((plan) =>
            plan._id === planSelected._id ? { ...plan, prices: data.prices } : plan,
          ),
        );
        const originNote = data.originUsed ? ` (${data.originUsed})` : '';
        toast.success(
          forceRegenerate
            ? `Links regenerados con base${originNote}`
            : data.regeneratedBecauseStale
              ? `Links actualizados (había URLs de localhost)${originNote}`
              : `Links de pago actualizados${originNote}`,
        );
      } else {
        toast.error(data.error || 'Error al generar los links de pago');
      }
    } catch {
      toast.error('Error al generar los links de pago');
    } finally {
      setRegeneratingLinks(false);
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className="w-full min-h-screen font-montserrat">
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <div className="flex justify-between items-center mb-8 mt-8">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-montserrat">
                      Planes de Mentoría
                    </h1>
                    <p className='text-gray-600 text-lg font-montserrat'>Gestiona todos tus planes de mentoría</p>
                  </div>
                  <Link href="/admin/mentorias/crear-plan">
                    <button className="bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-montserrat font-semibold shadow-lg">
                      <PlusCircleIcon className="w-5 h-5" />
                      <span>Crear Plan</span>
                    </button>
                  </Link>
                </div>
                <table className="min-w-full text-left text-sm font-light bg-[#F7F7F7] rounded-xl shadow font-montserrat border border-[#E5E7EB]">
                  <thead className="border-b font-medium border-[#E5E7EB] bg-white">
                    <tr>
                      <th className="px-6 py-4 text-[#1A1A1A]">Nombre</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Id</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Precio</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Nivel</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Stripe Price ID</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Activo</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan._id} ref={ref} className="border-b border-[#E5E7EB] text-[#222] font-montserrat bg-[#F7F7F7]">
                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#1A1A1A]">
                          <button 
                            onClick={() => openInfo(plan)}
                            className="hover:text-[#234C8C] hover:underline cursor-pointer transition-colors duration-200"
                          >
                            {plan.name}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#6B7280]">{plan._id}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#1A1A1A]">
                          {plan.prices && plan.prices.length > 0 ? (
                            <div className="space-y-1">
                              {plan.prices.map((price, index) => (
                                <div key={index} className="text-sm">
                                  ${price.price} {price.currency} ({price.interval})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span>${plan.price} {plan.currency}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]`}>
                            {levels.find(l => l.value === plan.level)?.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#A7B6C2]">{plan.stripePriceId}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {plan.active ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-600 border border-green-500">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-300/20 text-gray-600 border border-gray-300">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex item-center justify-center border-solid border-transparent border border-collapse text-base">
                            <div className="w-6 mr-2 transform hover:text-[#A7B6C2] hover:scale-110 cursor-pointer">
                              <PencilIcon onClick={() => openEdit(plan)}/>
                            </div>
                            <div className="w-6 mr-2 transform hover:text-[#FFD600] hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse ">
                              <TrashIcon onClick={() => openModalDelete(plan)}/>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Modal de confirmación de borrado */}
                {isOpenDelete && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 font-montserrat">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E5E7EB]">
                      <h2 className="text-xl font-bold mb-4 text-[#1A1A1A] font-montserrat">¿Seguro que deseas eliminar este plan?</h2>
                      <div className="flex justify-end space-x-4">
                        <button className="bg-[#F7F7F7] px-4 py-2 rounded font-montserrat border border-[#E5E7EB] text-[#1A1A1A]" onClick={() => setIsOpenDelete(false)}>Cancelar</button>
                        <button className="bg-[#FFD600] text-[#1A1A1A] px-4 py-2 rounded font-montserrat border border-[#FFD600]" onClick={deletePlan}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal informativo del plan */}
                {isOpenInfo && planSelected && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 font-montserrat">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E5E7EB] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-[#1A1A1A] font-montserrat">{planSelected.name}</h2>
                        <button 
                          onClick={() => setIsOpenInfo(false)}
                          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#F7F7F7] p-4 rounded-lg">
                            <h3 className="font-semibold text-[#1A1A1A] mb-2">Precio</h3>
                            {planSelected.prices && planSelected.prices.length > 0 ? (
                              <div className="space-y-2">
                                {planSelected.prices.map((price, index) => (
                                  <div key={index}>
                                    <p className="text-lg font-semibold text-[#234C8C]">
                                      ${price.price} {price.currency}
                                    </p>
                                    <p className="text-sm text-gray-600 capitalize">
                                      {price.interval}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-2xl font-bold text-[#234C8C]">
                                ${planSelected.price} {planSelected.currency}
                              </p>
                            )}
                          </div>
                          <div className="bg-[#F7F7F7] p-4 rounded-lg">
                            <h3 className="font-semibold text-[#1A1A1A] mb-2">Nivel</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]`}>
                              {levels.find(l => l.value === planSelected.level)?.label}
                            </span>
                          </div>
                        </div>

                        {/* Descripción */}
                        <div>
                          <h3 className="font-semibold text-[#1A1A1A] mb-2">Descripción</h3>
                          <p className="text-gray-700 leading-relaxed">{planSelected.description}</p>
                        </div>

                        {/* Características */}
                        {planSelected.features && planSelected.features.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-[#1A1A1A] mb-3">Características</h3>
                            <ul className="space-y-2">
                              {planSelected.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-[#234C8C] mr-2 mt-1">•</span>
                                  <span className="text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Información técnica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold text-[#1A1A1A] mb-2">ID del Plan</h3>
                            <p className="text-sm text-gray-600 font-mono break-all">{planSelected._id}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1A1A1A] mb-2">Stripe Price ID</h3>
                            <p className="text-sm text-gray-600 font-mono break-all">{planSelected.stripePriceId}</p>
                          </div>
                        </div>

                        {/* Links de Pago */}
                        <div>
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-semibold text-[#1A1A1A]">Links de pago (Stripe y dLocal)</h3>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={regeneratingLinks}
                                onClick={() => regeneratePaymentLinks(false)}
                                className="bg-[#234C8C] text-white px-3 py-1 rounded text-xs hover:bg-[#1a3763] transition-colors disabled:opacity-60"
                              >
                                {regeneratingLinks ? 'Generando…' : 'Actualizar links'}
                              </button>
                              <button
                                type="button"
                                disabled={regeneratingLinks}
                                onClick={() => regeneratePaymentLinks(true)}
                                className="bg-[#F7F7F7] text-[#1A1A1A] px-3 py-1 rounded text-xs border border-[#E5E7EB] hover:bg-gray-200 transition-colors disabled:opacity-60"
                              >
                                Regenerar todos
                              </button>
                            </div>
                          </div>
                          {planHasStaleLinks ? (
                            <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                              Estos links se generaron con otra URL base (p. ej. localhost). dLocal no
                              redirige bien después del pago. Usá <strong>Actualizar links</strong> con{' '}
                              <code className="font-mono">NEXT_PUBLIC_BASE_URL</code> apuntando a ngrok.
                              Base esperada: <span className="font-mono">{expectedPaymentOrigin}</span>
                            </div>
                          ) : null}
                          <p className="mb-3 text-xs text-gray-500">
                            Para pagos desde <code className="font-mono">/mentoria/empezar</code>, dLocal
                            crea un checkout nuevo al vuelo. Estos links son útiles para pruebas directas
                            desde admin.
                          </p>
                          <div className="space-y-3">
                            {planSelected.prices && planSelected.prices.length > 0 ? (
                              planSelected.prices.map((price, index) => {
                                const stripeOption = price.opcionesPago?.find(
                                  (o) => o.proveedor === 'stripe',
                                );
                                const dlocalOption = price.opcionesPago?.find(
                                  (o) => o.proveedor === 'dlocalgo',
                                );

                                return (
                                  <div key={index} className="bg-[#F7F7F7] p-3 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-[#1A1A1A] capitalize">
                                        {price.interval}
                                      </span>
                                      <span className="text-sm font-semibold text-[#234C8C]">
                                        ${price.price} {price.currency}
                                      </span>
                                    </div>
                                    {stripeOption?.originBase ? (
                                      <p className="text-[10px] text-gray-500 font-mono">
                                        Base: {stripeOption.originBase}
                                      </p>
                                    ) : null}
                                    <PaymentLinkField
                                      label="Stripe — suscripción"
                                      href={stripeOption?.paymentLink}
                                    />
                                    <PaymentLinkField
                                      label="dLocal GO — cuotas locales"
                                      href={dlocalOption?.paymentLink}
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              <div className="bg-[#F7F7F7] p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  Este plan no tiene precios por intervalo configurados.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Estado */}
                        <div>
                          <h3 className="font-semibold text-[#1A1A1A] mb-2">Estado</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            planSelected.active 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {planSelected.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-[#E5E7EB]">
                        <button 
                          onClick={() => setIsOpenInfo(false)}
                          className="bg-[#F7F7F7] px-4 py-2 rounded font-montserrat border border-[#E5E7EB] text-[#1A1A1A] hover:bg-gray-200 transition-colors"
                        >
                          Cerrar
                        </button>
                        <button 
                          onClick={() => {
                            setIsOpenInfo(false);
                            openEdit(planSelected);
                          }}
                          className="bg-[#234C8C] text-white px-4 py-2 rounded font-montserrat hover:bg-[#1a3763] transition-colors"
                        >
                          Editar Plan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
} 