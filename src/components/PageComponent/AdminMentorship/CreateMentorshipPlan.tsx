'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const mentorshipLevels = [
  { value: 'explorer', label: 'Explorador' },
  { value: 'practitioner', label: 'Practicante' },
  { value: 'student', label: 'Estudiante' },
];

const CreateMentorshipPlan = () => {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    interval: 'trimestral',
    description: '',
    features: '',
    level: mentorshipLevels[0].value,
    active: true
  });
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState(mentorshipLevels[0]);

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
      const response = await fetch('/api/payments/mentorship/createPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          features: featuresArray,
          level: form.level,
          priceTrimestral: form.price,
          currency: form.currency
        }),
      });
      if (!response.ok) throw new Error('Error al crear el plan');
      toast.success('Plan de mentoría creado exitosamente');
      router.push('/admin/mentorship/plans');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Crear Plan de Mentoría - MForMove</title>
        <meta name='description' content='Crear nuevo plan de mentoría' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center'>
        <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
          <div className='w-full flex pt-12 justify-between items-center'>
            <h1 className='text-4xl font-light'>Crear un Plan de Mentoría</h1>
            <p>Paso único</p>
          </div>
          <form
            className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14 font-montserrat'
            autoComplete='nope'
            onSubmit={handleSubmit}
          >
            <div className='space-y-8'>
              <label className='flex flex-col space-y-3 w-full'>
                <p>Elige un nombre para el plan</p>
                <input
                  type='text'
                  name='name'
                  placeholder='Nombre'
                  value={form.name}
                  className='input font-montserrat'
                  onChange={handleChange}
                  required
                />
              </label>
              <div className='flex flex-row space-x-2 justify-center items-start'>
                <label className='inline-block w-full'>
                  <p className='mb-2 font-semibold font-montserrat'>Precio del plan</p>
                  <input
                    type='number'
                    name='price'
                    placeholder='Precio'
                    className='input font-montserrat'
                    value={form.price || ''}
                    onChange={handleChange}
                    min={0}
                    step={1}
                    required
                    onKeyDown={(e) => (e.key === '-' ? e.preventDefault() : null)}
                  />
                </label>
                <label className='inline-block w-full'>
                  <p className='mb-2 font-semibold font-montserrat'>Moneda</p>
                  <input
                    type='text'
                    name='currency'
                    placeholder='Moneda'
                    className='input font-montserrat'
                    value='US$'
                    readOnly
                  />
                </label>
              </div>
              <div className='space-y-4'>
                <p className='font-semibold font-montserrat'>Elige el intervalo del plan</p>
                <select
                  name='interval'
                  value={form.interval}
                  onChange={handleChange}
                  className='input font-montserrat'
                  disabled
                >
                  <option value='trimestral'>Trimestral</option>
                </select>
                <p className='text-xs text-[#A7B6C2] font-montserrat'>Se crean anuales con 15% de descuento</p>
              </div>
              <div className='space-y-4'>
                <p className='font-semibold font-montserrat'>Elige el nivel del plan</p>
                <RadioGroup value={selectedLevel} onChange={handleLevelChange} className='flex flex-row gap-4'>
                  {mentorshipLevels.map((level) => (
                    <Radio
                      key={level.value}
                      value={level}
                      className={({ checked }) =>
                        `group font-montserrat relative flex cursor-pointer rounded-lg border px-4 py-2 text-sm shadow-md transition focus:outline-none
                        ${checked ? 'bg-[#333] border-blue-500' : 'bg-[#333] border-gray-700'}`
                      }
                    >
                      <div className='flex items-center'>
                        <span className='font-semibold text-white'>{level.label}</span>
                        {selectedLevel.value === level.value && (
                          <CheckCircleIcon className='w-5 h-5 ml-2 text-[#234C8C]' />
                        )}
                      </div>
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
              <div className='flex flex-col justify-center items-start'>
                <label className='inline-block w-full'>
                  <p className='mb-2 font-semibold font-montserrat'>Descripción del plan</p>
                  <textarea
                    name='description'
                    placeholder='Descripción'
                    className='input font-montserrat'
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </label>
                <div className='flex flex-row justify-center items-center space-x-2'>
                  <p className='font-light text-xs text-[gray] font-montserrat'>Largo mínimo 30 caracteres</p>
                  {descriptionLength < 30 ? (
                    <RxCrossCircled className='text-xs text-red-600' />
                  ) : (
                    <AiOutlineCheckCircle className='text-xs text-green-600' />
                  )}
                </div>
              </div>
              <div className='flex flex-col justify-center items-start'>
                <label className='inline-block w-full'>
                  <p className='mb-2 font-semibold font-montserrat'>Características (separadas por coma)</p>
                  <textarea
                    name='features'
                    placeholder='Sesión inicial de evaluación personal, Plan de entrenamiento personalizado, 2 sesiones de mentoría por mes...'
                    className='input font-montserrat'
                    value={form.features}
                    onChange={handleChange}
                    rows={2}
                  />
                </label>
              </div>
              <div className='flex flex-row justify-end'>
                <button
                  type='submit'
                  className='bg-[#234C8C] text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-[#1a3763] transition-all duration-300 shadow-lg'
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Plan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default CreateMentorshipPlan; 