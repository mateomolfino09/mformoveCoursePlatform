'use client';

import React, { useState } from 'react';
import { InPersonClass, VirtualClass } from '../../../../typings';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import Head from 'next/head';

interface Props {
  classes: InPersonClass[];
  setClasses: React.Dispatch<React.SetStateAction<InPersonClass[]>>;
  virtualClasses?: VirtualClass[];
  setVirtualClasses?: React.Dispatch<React.SetStateAction<VirtualClass[]>>;
}

const AllInPersonClasses: React.FC<Props> = ({ classes, setClasses, virtualClasses = [], setVirtualClasses }) => {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [virtualLoading, setVirtualLoading] = useState<{ [key: number]: boolean }>({});
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleCardDetails = (cardId: string) => {
    setExpandedCardId(prev => (prev === cardId ? null : cardId));
  };

  const handleDelete = async (id: number, isVirtual: boolean = false) => {
    const classType = isVirtual ? 'grupo de clases virtuales' : 'clase presencial';
    if (!confirm(`¿Estás seguro de que quieres eliminar este ${classType}?`)) {
      return;
    }

    if (isVirtual) {
      setVirtualLoading({ ...virtualLoading, [id]: true });
    } else {
      setLoading({ ...loading, [id]: true });
    }

    try {
      const endpoint = isVirtual 
        ? `/api/virtualClass/delete/${id}` 
        : `/api/inPersonClass/delete/${id}`;
      
      await axios.delete(endpoint, {
        data: { userEmail: auth.user?.email },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success(`${isVirtual ? 'Grupo de clases virtuales' : 'Clase presencial'} eliminado con éxito`);
      
      if (isVirtual && setVirtualClasses) {
        setVirtualClasses(virtualClasses.filter(c => c.id !== id));
      } else {
        setClasses(classes.filter(c => c.id !== id));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || `Error al eliminar el ${classType}`);
    } finally {
      if (isVirtual) {
        setVirtualLoading({ ...virtualLoading, [id]: false });
      } else {
        setLoading({ ...loading, [id]: false });
      }
    }
  };

  const formatPrice = (amount: number, currency: string, type: string) => {
    const currencySymbol = currency === 'UYU' ? '$' : currency === 'USD' ? 'US$' : currency;
    const typeLabels: { [key: string]: string } = {
      'clase_suelta': 'por clase',
      'mensual': 'por mes',
      'trimestral': 'por trimestre',
      'anual': 'por año'
    };
    return `${currencySymbol}${amount} ${typeLabels[type] || ''}`;
  };

  const formatVirtualPrices = (prices: VirtualClass['prices']) => {
    const once = prices.oncePerWeek?.amount || 0;
    const twice = prices.twicePerWeek?.amount || 0;
    const three = prices.threeTimesPerWeek?.amount || 0;
    if (once + twice + three <= 0) return null;
    const currency = prices.oncePerWeek?.currency || 'UYU';
    const currencySymbol = currency === 'UYU' ? '$' : currency === 'USD' ? 'US$' : currency;
    return {
      currencySymbol,
      once,
      twice,
      three
    };
  };

  const formatPresencialFrequency = (prices?: InPersonClass['frequencyPrices']) => {
    if (!prices) return null;
    const once = prices.oncePerWeek?.amount || 0;
    const twice = prices.twicePerWeek?.amount || 0;
    const three = prices.threeTimesPerWeek?.amount || 0;
    if (once + twice + three <= 0) return null;
    const currency = prices.oncePerWeek?.currency || 'UYU';
    const currencySymbol = currency === 'UYU' ? '$' : currency === 'USD' ? 'US$' : currency;
    return {
      currencySymbol,
      once,
      twice,
      three
    };
  };

  const formatSchedules = (schedules: any[]) => {
    const days = schedules.map(s => `${s.dayOfWeek}: ${s.startTime}-${s.endTime}`).join(', ');
    return days.length > 50 ? days.substring(0, 50) + '...' : days;
  };

  const totalClasses = classes.length + virtualClasses.length;
  
  if (totalClasses === 0) {
    return (
      <div className='w-full min-h-screen p-8'>
        <Head>
          <title>MForMove Platform - Horarios y Grupos</title>
          <meta name='description' content='Lista de Horarios y Grupos de Clases Virtuales' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <div className='mb-12 mt-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
            Horarios y Grupos de Clases
          </h1>
          <p className='text-gray-600 text-lg font-montserrat'>
            Gestiona tus clases presenciales y virtuales
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg'>
          <p className='text-gray-900 text-lg font-montserrat mb-4'>No hay horarios ni grupos de clases registrados.</p>
          <button
            onClick={() => router.push('/admin/in-person-classes/create')}
            className='mt-4 px-6 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold font-montserrat'
          >
            Crear Primera Clase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen p-8'>
      <Head>
        <title>MForMove Platform - Horarios y Grupos</title>
        <meta name='description' content='Lista de Horarios y Grupos de Clases Virtuales' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex justify-between items-center mb-8 mt-8'>
        <div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-2'>
            Horarios y Grupos de Clases
          </h1>
          <p className='text-gray-600 text-lg font-montserrat'>
            Gestiona tus clases presenciales y virtuales
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/in-person-classes/create')}
          className='px-6 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold font-montserrat'
        >
          Crear Nueva Clase
        </button>
      </div>

      {/* Clases Presenciales */}
      {classes.length > 0 && (
        <div className='mb-12'>
          <h2 className='text-gray-900 text-2xl font-montserrat font-bold mb-6 flex items-center'>
            <MapPinIcon className='w-6 h-6 mr-2 text-[#4F7CCF]' />
            Clases Presenciales
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {classes.map((clase) => {
              const presentialFrequencyPrices = formatPresencialFrequency(clase.frequencyPrices);
              const cardId = `presencial-${clase.id}`;
              const isExpanded = expandedCardId === cardId;
              return (
              <div key={clase._id} className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg transition hover:border-[#4F7CCF]/50 hover:shadow-xl'>
                <div className='relative w-full h-48'>
                  <CldImage src={clase.image_url} alt={clase.name} fill className='object-cover' />
                  {clase.active ? (
                    <div className='absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                      Activa
                    </div>
                  ) : (
                    <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                      Inactiva
                    </div>
                  )}
                  <div className='absolute top-2 left-2 bg-slate-900/70 text-white px-2 py-1 rounded text-xs font-semibold'>
                    Presencial
                  </div>
                </div>

                <div className='p-5 space-y-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='text-gray-900 text-xl font-semibold font-montserrat'>{clase.name}</h3>
                      <p className='text-gray-600 text-sm font-montserrat'>Instructor: {clase.instructor}</p>
                    </div>
                    <button
                      onClick={() => toggleCardDetails(cardId)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300 text-gray-700 hover:border-[#4F7CCF] hover:text-[#4F7CCF] transition font-montserrat'
                    >
                      {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </div>

                  <div className='flex flex-wrap gap-4 text-sm text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <MapPinIcon className='w-4 h-4' />
                      {clase.location.city}
                    </div>
                    <div className='flex items-center gap-2'>
                      <ClockIcon className='w-4 h-4' />
                      {formatSchedules(clase.schedules)}
                    </div>
                    {clase.price.amount > 0 && (
                      <div className='flex items-center gap-2'>
                        <CurrencyDollarIcon className='w-4 h-4' />
                        {formatPrice(clase.price.amount, clase.price.currency, clase.price.type)}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className='space-y-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-700'>
                      <div>
                        <p className='text-xs uppercase tracking-wide text-gray-600 mb-1 font-semibold font-montserrat'>Descripción</p>
                        <p className='text-gray-700 font-montserrat'>{clase.description}</p>
                      </div>
                      <div className='grid sm:grid-cols-2 gap-3 text-xs'>
                        <div className='bg-white rounded-lg p-3 border border-gray-200'>
                          <p className='text-gray-900 text-xs font-semibold mb-1 font-montserrat'>Ubicación</p>
                          <p className='text-gray-700 font-montserrat'>{clase.location.name}</p>
                          <p className='text-gray-600 text-[11px] font-montserrat'>{clase.location.address}, {clase.location.city}, {clase.location.country}</p>
                        </div>
                        <div className='bg-white rounded-lg p-3 border border-gray-200'>
                          <p className='text-gray-900 text-xs font-semibold mb-1 font-montserrat'>Nivel & duración</p>
                          <p className='text-gray-700 font-montserrat'>{clase.level}</p>
                          <p className='text-gray-600 text-[11px] font-montserrat'>{clase.duration} minutos</p>
                        </div>
                      </div>
                      {presentialFrequencyPrices && (
                        <div className='bg-white rounded-lg p-3 text-xs text-gray-700 border border-gray-200 space-y-1'>
                          <p className='text-gray-900 text-xs font-semibold mb-1 font-montserrat'>Precios por frecuencia:</p>
                          {presentialFrequencyPrices.once > 0 && (
                            <div className='flex justify-between'>
                              <span>1 vez/semana</span>
                              <span className='font-semibold'>
                                {presentialFrequencyPrices.currencySymbol}{presentialFrequencyPrices.once}
                              </span>
                            </div>
                          )}
                          {presentialFrequencyPrices.twice > 0 && (
                            <div className='flex justify-between'>
                              <span>2 veces/semana</span>
                              <span className='font-semibold'>
                                {presentialFrequencyPrices.currencySymbol}{presentialFrequencyPrices.twice}
                              </span>
                            </div>
                          )}
                          {presentialFrequencyPrices.three > 0 && (
                            <div className='flex justify-between'>
                              <span>3 veces/semana</span>
                              <span className='font-semibold'>
                                {presentialFrequencyPrices.currencySymbol}{presentialFrequencyPrices.three}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {clase.additionalPrices && clase.additionalPrices.length > 0 && (
                        <div className='bg-white rounded-lg p-3 text-xs text-gray-700 border border-gray-200'>
                          <p className='text-gray-900 text-xs font-semibold mb-2 font-montserrat'>Precios adicionales:</p>
                          {clase.additionalPrices.map((price) => (
                            <div key={price.label} className='flex justify-between'>
                              <span>{price.label}</span>
                              <span className='font-semibold'>
                                {(price.currency === 'UYU' ? '$' : price.currency === 'USD' ? 'US$' : price.currency)}
                                {price.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                    <div className='flex items-center gap-3 text-xs text-gray-600'>
                      <EyeIcon className='w-4 h-4' />
                      <span className='font-montserrat'>{clase.location.name}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => router.push(`/classes-schedule`)}
                        className='text-[#4F7CCF] hover:text-[#234C8C]'
                        title='Ver en horarios públicos'
                      >
                        <EyeIcon className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/in-person-classes/edit/${clase.id}`)}
                        className='text-yellow-600 hover:text-yellow-700'
                        title='Editar'
                      >
                        <PencilIcon className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(clase.id, false)}
                        disabled={loading[clase.id]}
                        className='text-red-600 hover:text-red-700 disabled:opacity-50'
                        title='Eliminar'
                      >
                        <TrashIcon className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Grupos de Clases Virtuales */}
      {virtualClasses.length > 0 && (
        <div className='mb-12'>
        <h2 className='text-gray-900 text-2xl font-montserrat font-bold mb-6 flex items-center'>
            <VideoCameraIcon className='w-6 h-6 mr-2 text-[#4F7CCF]' />
            Grupos de Clases Virtuales
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {virtualClasses.map((clase) => {
              const cardId = `virtual-${clase.id}`;
              const isExpanded = expandedCardId === cardId;
              const virtualFrequency = formatVirtualPrices(clase.prices);
              return (
              <div key={clase._id} className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg transition hover:border-[#4F7CCF]/50 hover:shadow-xl'>
                <div className='relative w-full h-48'>
                  <CldImage src={clase.image_url} alt={clase.name} fill className='object-cover' />
                  {clase.active ? (
                    <div className='absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                      Activa
                    </div>
                  ) : (
                    <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                      Inactiva
                    </div>
                  )}
                  <div className='absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold'>
                    Virtual
                  </div>
                </div>

                <div className='p-5 space-y-4'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='text-gray-900 text-xl font-semibold font-montserrat'>{clase.name}</h3>
                      <p className='text-gray-600 text-sm font-montserrat'>Plataforma: {clase.platform}</p>
                    </div>
                    <button
                      onClick={() => toggleCardDetails(cardId)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300 text-gray-700 hover:border-[#4F7CCF] hover:text-[#4F7CCF] transition font-montserrat'
                    >
                      {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>
                  </div>

                  <div className='flex flex-wrap gap-4 text-sm text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <UserIcon className='w-4 h-4' />
                      {clase.instructor}
                    </div>
                    <div className='flex items-center gap-2'>
                      <ClockIcon className='w-4 h-4' />
                      {formatSchedules(clase.schedules)}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className='space-y-4 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-700'>
                      <div>
                        <p className='text-xs uppercase tracking-wide text-gray-600 mb-1 font-semibold font-montserrat'>Descripción</p>
                        <p className='text-gray-700 font-montserrat'>{clase.description}</p>
                      </div>
                      {virtualFrequency && (
                        <div className='bg-white rounded-lg p-3 text-xs text-gray-700 border border-gray-200 space-y-1'>
                          <p className='text-gray-900 text-xs font-semibold mb-1 font-montserrat'>Precios por frecuencia:</p>
                          <div className='flex justify-between'>
                            <span>1 vez/semana</span>
                            <span className='font-semibold'>
                              {virtualFrequency.currencySymbol}{virtualFrequency.once}
                            </span>
                          </div>
                          {virtualFrequency.twice > 0 && (
                            <div className='flex justify-between'>
                              <span>2 veces/semana</span>
                              <span className='font-semibold'>
                                {virtualFrequency.currencySymbol}{virtualFrequency.twice}
                              </span>
                            </div>
                          )}
                          {virtualFrequency.three > 0 && (
                            <div className='flex justify-between'>
                              <span>3 veces/semana</span>
                              <span className='font-semibold'>
                                {virtualFrequency.currencySymbol}{virtualFrequency.three}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {clase.additionalPrices && clase.additionalPrices.length > 0 && (
                        <div className='bg-white rounded-lg p-3 text-xs text-gray-700 border border-gray-200'>
                          <p className='text-gray-900 text-xs font-semibold mb-2 font-montserrat'>Precios adicionales:</p>
                          {clase.additionalPrices.map((price) => (
                            <div key={price.label} className='flex justify-between'>
                              <span>{price.label}</span>
                              <span className='font-semibold'>
                                {(price.currency === 'UYU' ? '$' : price.currency === 'USD' ? 'US$' : price.currency)}
                                {price.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                    <div className='text-xs text-gray-600'>
                      <p className='font-montserrat'>Reunión: <span className='text-gray-700 break-all font-montserrat'>{clase.meetingLink}</span></p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => router.push(`/classes-schedule`)}
                        className='text-[#4F7CCF] hover:text-[#234C8C]'
                        title='Ver en horarios públicos'
                      >
                        <EyeIcon className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/in-person-classes/edit/${clase.id}?type=virtual`)}
                        className='text-yellow-600 hover:text-yellow-700'
                        title='Editar'
                      >
                        <PencilIcon className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(clase.id, true)}
                        disabled={virtualLoading[clase.id]}
                        className='text-red-600 hover:text-red-700 disabled:opacity-50'
                        title='Eliminar'
                      >
                        <TrashIcon className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllInPersonClasses;

