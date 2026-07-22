'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { toast } from '../../../hooks/useToast';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { GLOBAL_SITE_DESCRIPTION } from '../../../lib/siteMetadata';

const mentorshipLevels = [
  { value: 'explorer', label: 'Explorador' },
  { value: 'practitioner', label: 'Practicante' },
  { value: 'student', label: 'Estudiante' },
];

const CreateMentorshipPlan = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    interval: 'trimestral' as 'mensual' | 'trimestral',
    description: '',
    features: '',
    level: mentorshipLevels[0].value,
    active: true,
    proveedoresHabilitados: ['stripe', 'mercadopago'] as Array<
      'stripe' | 'dlocalgo' | 'mercadopago'
    >,
  });
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState(mentorshipLevels[0]);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/iniciar-sesion');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/iniciar-sesion');
  }, [auth.user]);

  // Verificar si estamos en modo edición
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setIsEditing(true);
      setPlanId(id);
      loadPlanData(id);
    }
  }, [searchParams]);

  // Cargar datos del plan para edición
  const loadPlanData = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/getPlans?type=mentorship&id=${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const plan = data[0];
          
          // Precio del ciclo corto: preferir trimestral (3 meses); mensual legacy → ×3
          const shortPrice = plan.prices?.find(
            (p: any) => p.interval === 'trimestral' || p.interval === 'mensual',
          );
          const shortInterval = shortPrice?.interval === 'mensual' ? 'mensual' : 'trimestral';
          const rawPrice = shortPrice?.price || plan.price || 0;
          const price =
            shortInterval === 'mensual'
              ? Math.round(Number(rawPrice) * 3)
              : Number(rawPrice);
          const currency = shortPrice?.currency || plan.currency || 'USD';
          
          setForm({
            name: plan.name || '',
            price: price,
            currency: currency,
            interval: 'trimestral',
            description: plan.description || '',
            features: plan.features ? plan.features.join(', ') : '',
            level: plan.level || mentorshipLevels[0].value,
            active: plan.active !== undefined ? plan.active : true,
            proveedoresHabilitados: plan.proveedoresHabilitados?.length
              ? plan.proveedoresHabilitados
              : ['stripe', 'mercadopago'],
          });
          setDescriptionLength(plan.description ? plan.description.length : 0);
          const levelObj = mentorshipLevels.find(l => l.value === plan.level);
          if (levelObj) {
            setSelectedLevel(levelObj);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando plan:', error);
      toast.error('Error al cargar los datos del plan');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    if (name === 'description') setDescriptionLength(value.length);
  };

  const handleLevelChange = (level: any) => {
    setSelectedLevel(level);
    setForm(prev => ({ ...prev, level: level.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.name.length < 5) {
        toast.error('El Nombre del plan debe tener al menos 5 caracteres');
        setLoading(false); return;
      }
      if (descriptionLength < 30) {
        toast.error('Debe poner una descripción de 30 caracteres mínimo');
        setLoading(false); return;
      }
      if (!form.price || form.price <= 0) {
        toast.error('Debe poner un precio válido');
        setLoading(false); return;
      }
      const featuresArray = form.features.split(',').map(f => f.trim()).filter(f => f);
      
      const requestData = {
        name: form.name,
        description: form.description,
        features: featuresArray,
        level: form.level,
        priceTrimestral: form.price,
        currency: form.currency,
        proveedoresHabilitados: form.proveedoresHabilitados,
      };

      let response;
      if (isEditing && planId) {
        // Actualizar plan existente
        response = await fetch(`/api/payments/mentorship/updatePlan`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...requestData,
            planId: planId
          }),
        });
      } else {
        // Crear nuevo plan
        response = await fetch('/api/payments/mentorship/createPlan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });
      }
      
      if (!response.ok) throw new Error(isEditing ? 'Error al actualizar el plan' : 'Error al crear el plan');
      toast.success(isEditing ? 'Plan de mentoría actualizado exitosamente' : 'Plan de mentoría creado exitosamente');
      router.push('/admin/mentorias/planes');
    } catch (error) {
      console.error('Error:', error);
      toast.error(isEditing ? 'Error al actualizar el plan' : 'Error al crear el plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Crear plan de mentoría</title>
        <meta name='description' content={GLOBAL_SITE_DESCRIPTION} />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center'>
        <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
          {/* Header mejorado */}
          <div className='w-full flex pt-8 justify-between items-center mb-8 px-8'>
            <div>
              <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-montserrat'>{isEditing ? 'Editar Plan de Mentoría' : 'Crear un Plan de Mentoría'}</h1>
              <p className='text-gray-600 text-lg font-montserrat'>{isEditing ? 'Modifica la información del plan existente' : 'Completa la información para crear tu nuevo plan'}</p>
            </div>
            <div className='flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm'>
              <div className='w-3 h-3 bg-[#4F7CCF] rounded-full' />
              <span className='text-gray-700 font-medium font-montserrat'>Paso único</span>
            </div>
          </div>

          {/* Formulario principal con mejor estructura */}
          <form
            className='relative space-y-6 rounded-xl bg-white shadow-lg px-8 py-8 md:min-w-[50rem] md:px-12 md:py-10 font-montserrat'
            autoComplete='nope'
            onSubmit={handleSubmit}
          >
            {/* Sección: Información Básica */}
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-blue-600 font-bold text-sm'>1</span>
                </div>
                Información Básica
              </h2>
              
              <div className='space-y-6'>
                <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3'>
                  <p className='text-sm font-medium text-gray-900'>Métodos de pago habilitados</p>
                  <p className="text-sm text-gray-500">
                    Por defecto: Stripe + Mercado Pago. Activá dLocal solo si lo necesitás. Podés
                    cambiarlo cuando quieras.
                  </p>
                  <div className='flex flex-wrap gap-4'>
                    {(
                      [
                        { id: 'stripe' as const, label: 'Stripe (internacional)' },
                        { id: 'mercadopago' as const, label: 'Mercado Pago (Checkout Bricks · 12 cuotas)' },
                        { id: 'dlocalgo' as const, label: 'dLocal GO (opcional · locales + 12 cuotas)' },
                      ] as const
                    ).map((opt) => (
                      <label
                        key={opt.id}
                        className='flex items-center gap-2 text-sm text-gray-900 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-gray-300 text-[#4F7CCF] focus:ring-[#4F7CCF]'
                          checked={form.proveedoresHabilitados.includes(opt.id)}
                          onChange={(e) => {
                            setForm((prev) => {
                              const next = e.target.checked
                                ? Array.from(new Set([...prev.proveedoresHabilitados, opt.id]))
                                : prev.proveedoresHabilitados.filter((p) => p !== opt.id);
                              return {
                                ...prev,
                                proveedoresHabilitados: next.length ? next : (['stripe'] as typeof prev.proveedoresHabilitados),
                              };
                            });
                          }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Nombre del plan</p>
                  <input
                    type='text'
                    name='name'
                    placeholder='Ingresa el nombre del plan'
                    value={form.name}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio cada 3 meses (USD)</p>
                    <input
                      type='number'
                      name='price'
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      value={form.price || ''}
                      onChange={handleChange}
                      min={0}
                      step={0.01}
                      required
                      onKeyDown={(e) => (e.key === '-' ? e.preventDefault() : null)}
                    />
                  </label>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Moneda</p>
                    <input
                      type='text'
                      name='currency'
                      placeholder='Moneda'
                      className='w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat cursor-not-allowed'
                      value='USD'
                      readOnly
                    />
                  </label>
                </div>
                <div className='space-y-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4'>
                  <p className='text-sm font-medium text-gray-700'>Facturación del plan</p>
                  <div className='flex flex-wrap gap-2'>
                    <span className='rounded-full bg-[#4F7CCF]/10 px-3 py-1 text-xs font-semibold text-[#234C8C]'>
                      Trimestral (3 meses)
                    </span>
                    <span className='rounded-full bg-[#4F7CCF]/10 px-3 py-1 text-xs font-semibold text-[#234C8C]'>
                      Anual (−15%)
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 font-montserrat leading-relaxed'>
                    El precio de arriba es el cobro cada 3 meses. Al guardar se crean ambos ciclos en
                    Stripe y los links de pago (Stripe + Mercado Pago / dLocal si están habilitados). El
                    anual se calcula con 15% de descuento sobre 4 trimestres.
                  </p>
                  {isEditing && form.interval === 'mensual' ? (
                    <p className='text-xs text-amber-700 font-montserrat leading-relaxed'>
                      Este plan tenía facturación mensual legacy. Al guardar pasará a trimestral +
                      anual.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Sección: Configuración del Plan */}
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-green-600 font-bold text-sm'>2</span>
                </div>
                Configuración del Plan
              </h2>
              
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <p className='text-sm font-medium text-gray-700'>Nivel del plan</p>
                  <RadioGroup value={selectedLevel} onChange={handleLevelChange} className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {mentorshipLevels.map((level) => (
                      <Radio
                        key={level.value}
                        value={level}
                        className={({ checked }) =>
                          `${
                            checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900 border-gray-200'
                          } relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm border-2 focus:outline-none transition-all duration-200 hover:shadow-md`
                        }
                      >
                        {({ checked }) => (
                          <>
                            <div className='flex w-full items-center justify-between'>
                              <div className='flex items-center'>
                                <div className='text-sm'>
                                  <p
                                    className={`font-medium ${
                                      checked ? 'text-white' : 'text-gray-900'
                                    }`}
                                  >
                                    {level.label}
                                  </p>
                                </div>
                              </div>
                              {checked && (
                                <div className='shrink-0 text-white'>
                                  <CheckCircleIcon className='h-6 w-6' />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>

                <div className='space-y-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Descripción del plan</p>
                    <textarea
                      name='description'
                      placeholder='Describe las características y beneficios del plan'
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat min-h-[100px]'
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </label>
                  <div className='flex flex-row justify-between items-center'>
                    <p className='font-light text-xs text-gray-500 font-montserrat'>Largo mínimo 30 caracteres</p>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xs text-gray-500'>{descriptionLength}/30</span>
                      {descriptionLength < 30 ? (
                        <RxCrossCircled className='text-xs text-red-500' />
                      ) : (
                        <AiOutlineCheckCircle className='text-xs text-green-500' />
                      )}
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Características del plan</p>
                    <textarea
                      name='features'
                      placeholder='Sesión inicial de evaluación personal, Plan de entrenamiento personalizado, 2 sesiones de mentoría por mes...'
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat min-h-[80px]'
                      value={form.features}
                      onChange={handleChange}
                      rows={2}
                    />
                    <p className='text-xs text-gray-500'>Separa las características con comas</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Botón de envío mejorado */}
            <div className='pt-6 border-t border-gray-200'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                disabled={loading}
              >
                {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Plan' : 'Crear Plan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default CreateMentorshipPlan; 