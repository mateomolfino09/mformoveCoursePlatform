/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { toast } from '../../../hooks/useToast';
import { useDropzone } from 'react-dropzone';
import requests from '../../../utils/requests';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { InPersonClass, VirtualClass } from '../../../../typings';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const levels = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];
const currencies = ['UYU', 'USD', 'ARS'];

interface Schedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

type EditableAdditionalPrice = {
  label: string;
  amount: number;
  currency: string;
};

interface CreateInPersonClassProps {
  initialData?: InPersonClass | VirtualClass;
  mode?: 'create' | 'edit';
  initialClassType?: 'presencial' | 'virtual';
  initialId?: number | string;
}

const isVirtualClassData = (data: InPersonClass | VirtualClass): data is VirtualClass => {
  return (data as VirtualClass).platform !== undefined;
};

const CreateInPersonClass = ({
  initialData,
  mode = 'create',
  initialClassType,
  initialId,
}: CreateInPersonClassProps = {}) => {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const defaultClassType: 'presencial' | 'virtual' =
    initialClassType ?? (initialData ? (isVirtualClassData(initialData) ? 'virtual' : 'presencial') : 'presencial');
  
  // Tipo de clase
  const [classType, setClassType] = useState<'presencial' | 'virtual'>(defaultClassType);
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [duration, setDuration] = useState(60);
  const [capacity, setCapacity] = useState<number | ''>('');
  const [level, setLevel] = useState('Todos los niveles');
  const [classPersonalizationType, setClassPersonalizationType] = useState<'personalizado' | 'comun'>('comun');
  const [active, setActive] = useState(true);
  
  // Ubicación (solo para presenciales)
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationCountry, setLocationCountry] = useState('Uruguay');
  const [locationLat, setLocationLat] = useState('');
  const [locationLon, setLocationLon] = useState('');
  
  // Plataforma virtual (solo para virtuales)
  const [platform, setPlatform] = useState('Zoom');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Precio presencial
  const [priceCurrency, setPriceCurrency] = useState('UYU');
  const [presentialPriceOncePerWeek, setPresentialPriceOncePerWeek] = useState(0);
  const [presentialPriceTwicePerWeek, setPresentialPriceTwicePerWeek] = useState(0);
  const [presentialPriceThreeTimesPerWeek, setPresentialPriceThreeTimesPerWeek] = useState(0);
  
  // Precios virtuales (1, 2, 3 veces por semana)
  const [priceOncePerWeek, setPriceOncePerWeek] = useState(0);
  const [priceTwicePerWeek, setPriceTwicePerWeek] = useState(0);
  const [priceThreeTimesPerWeek, setPriceThreeTimesPerWeek] = useState(0);
  const [virtualPriceCurrency, setVirtualPriceCurrency] = useState('UYU');
  const [additionalPrices, setAdditionalPrices] = useState<{ label: string; amount: number; currency: string; }[]>([
    { label: '', amount: 0, currency: 'UYU' }
  ]);
  
  // Horarios
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    dayOfWeek: 'Lunes',
    startTime: '09:00',
    endTime: '10:00',
    timezone: 'America/Montevideo'
  });
  
  // Imagen
  const [files, setFiles] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const isEditMode = mode === 'edit' && Boolean(initialData?.id ?? initialId);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles);
        setImagePreview(URL.createObjectURL(acceptedFiles[0]));
      }
    }
  });

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');
    
    if (!cookies) {
      router.push('/login');
    }
    
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user?.rol !== 'Admin') {
      router.push('/login');
    }
  }, [auth, auth.user, router]);

  useEffect(() => {
    if (!initialData) return;
    const derivedType: 'presencial' | 'virtual' =
      initialClassType ?? (isVirtualClassData(initialData) ? 'virtual' : 'presencial');
    const isVirtualData = isVirtualClassData(initialData);
    const presentialData = !isVirtualData ? (initialData as InPersonClass) : null;
    const virtualData = isVirtualData ? (initialData as VirtualClass) : null;

    setClassType(derivedType);
    setName(initialData.name || '');
    setDescription(initialData.description || '');
    setInstructor(initialData.instructor || '');
    setDuration(initialData.duration || 60);
    setCapacity(initialData.capacity ?? '');
    setLevel(initialData.level || 'Todos los niveles');
    setClassPersonalizationType(initialData.classType || 'comun');
    setActive(initialData.active ?? true);
    setSchedules(initialData.schedules as Schedule[]);
    setNewSchedule({
      dayOfWeek: initialData.schedules[0]?.dayOfWeek || 'Lunes',
      startTime: initialData.schedules[0]?.startTime || '09:00',
      endTime: initialData.schedules[0]?.endTime || '10:00',
      timezone: initialData.schedules[0]?.timezone || 'America/Montevideo'
    });
    setImagePreview(initialData.image_url || '');

    if (derivedType === 'presencial' && presentialData) {
      setLocationName(presentialData.location?.name || '');
      setLocationAddress(presentialData.location?.address || '');
      setLocationCity(presentialData.location?.city || '');
      setLocationCountry(presentialData.location?.country || 'Uruguay');
      setLocationLat(presentialData.location?.coordinates?.lat || '');
      setLocationLon(presentialData.location?.coordinates?.lon || '');
      setPriceCurrency(presentialData.price?.currency || 'UYU');
      setPresentialPriceOncePerWeek(
        presentialData.frequencyPrices?.oncePerWeek?.amount || presentialData.price?.amount || 0
      );
      setPresentialPriceTwicePerWeek(presentialData.frequencyPrices?.twicePerWeek?.amount || 0);
      setPresentialPriceThreeTimesPerWeek(presentialData.frequencyPrices?.threeTimesPerWeek?.amount || 0);
    }

    if (derivedType === 'virtual' && virtualData) {
      setPlatform(virtualData.platform || 'Zoom');
      setMeetingLink(virtualData.meetingLink || '');
      setVirtualPriceCurrency(virtualData.prices?.oncePerWeek?.currency || 'UYU');
      setPriceOncePerWeek(virtualData.prices?.oncePerWeek?.amount || 0);
      setPriceTwicePerWeek(virtualData.prices?.twicePerWeek?.amount || 0);
      setPriceThreeTimesPerWeek(virtualData.prices?.threeTimesPerWeek?.amount || 0);
    }

    const defaultCurrency =
      derivedType === 'virtual'
        ? virtualData?.prices?.oncePerWeek?.currency || 'UYU'
        : presentialData?.price?.currency || 'UYU';

    if (initialData.additionalPrices && initialData.additionalPrices.length > 0) {
      setAdditionalPrices(
        (initialData.additionalPrices as EditableAdditionalPrice[]).map((price) => ({
          label: price.label,
          amount: price.amount,
          currency: price.currency || defaultCurrency
        }))
      );
    } else {
      setAdditionalPrices([
        {
          label: '',
          amount: 0,
          currency: defaultCurrency
        }
      ]);
    }
    setInitialized(true);
  }, [initialData, initialClassType]);

  const handleAddSchedule = () => {
    if (newSchedule.startTime && newSchedule.endTime && newSchedule.dayOfWeek) {
      setSchedules([...schedules, { ...newSchedule }]);
      setNewSchedule({
        dayOfWeek: 'Lunes',
        startTime: '09:00',
        endTime: '10:00',
        timezone: 'America/Montevideo'
      });
    } else {
      toast.error('Por favor completa todos los campos del horario');
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };
  
  const handleAdditionalPriceChange = (index: number, field: 'label' | 'amount' | 'currency', value: string) => {
    const updated = [...additionalPrices];
    if (field === 'amount') {
      updated[index].amount = parseFloat(value) || 0;
    } else if (field === 'label' || field === 'currency') {
      updated[index][field] = value;
    }
    setAdditionalPrices(updated);
  };

  const updateAdditionalPricesCurrency = (value: string) => {
    setAdditionalPrices(prev => prev.map(price => ({ ...price, currency: value })));
  };

  const handleVirtualCurrencyChange = (value: string) => {
    setVirtualPriceCurrency(value);
    updateAdditionalPricesCurrency(value);
  };

  const handlePresencialCurrencyChange = (value: string) => {
    setPriceCurrency(value);
    updateAdditionalPricesCurrency(value);
  };

  const handleAddAdditionalPrice = () => {
    const defaultCurrency = classType === 'virtual' ? virtualPriceCurrency : priceCurrency;
    setAdditionalPrices([...additionalPrices, { label: '', amount: 0, currency: defaultCurrency }]);
  };

  const handleRemoveAdditionalPrice = (index: number) => {
    const defaultCurrency = classType === 'virtual' ? virtualPriceCurrency : priceCurrency;
    if (additionalPrices.length === 1) {
      setAdditionalPrices([{ label: '', amount: 0, currency: defaultCurrency }]);
      return;
    }
    setAdditionalPrices(additionalPrices.filter((_, i) => i !== index));
  };

  const [initialized, setInitialized] = useState(false);
  const schedulesCount = schedules.length;
  const enableSecondFrequency = schedulesCount >= 2;
  const enableThirdFrequency = schedulesCount >= 3;

  useEffect(() => {
    if (!initialized) return;
    if (!enableSecondFrequency) {
      setPresentialPriceTwicePerWeek(0);
      setPriceTwicePerWeek(0);
    }
    if (!enableThirdFrequency) {
      setPresentialPriceThreeTimesPerWeek(0);
      setPriceThreeTimesPerWeek(0);
    }
  }, [enableSecondFrequency, enableThirdFrequency, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fallbackCurrency = classType === 'virtual' ? virtualPriceCurrency : priceCurrency;
      const sanitizedAdditionalPrices = additionalPrices
        .filter(price => price.label.trim() !== '' && price.amount >= 0)
        .map(price => ({
          label: price.label.trim(),
          amount: price.amount,
          currency: price.currency || fallbackCurrency
        }));

      // Validaciones generales
      if (!name || !description || !instructor) {
        toast.error('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Validaciones específicas por tipo
      if (classType === 'presencial') {
        if (!locationName || !locationAddress || !locationCity) {
          toast.error('Por favor completa todos los campos de ubicación');
          setLoading(false);
          return;
        }
        if (presentialPriceOncePerWeek <= 0) {
          toast.error('Define al menos el precio de 1 vez por semana para clases presenciales');
          setLoading(false);
          return;
        }
        if (enableSecondFrequency && presentialPriceTwicePerWeek <= 0) {
          toast.error('Define el precio de 2 veces por semana o agrega solo un horario');
          setLoading(false);
          return;
        }
        if (enableThirdFrequency && presentialPriceThreeTimesPerWeek <= 0) {
          toast.error('Define el precio de 3 veces por semana o elimina horarios excedentes');
          setLoading(false);
          return;
        }
      } else {
        if (!meetingLink || !platform) {
          toast.error('Por favor completa la plataforma y el link de la reunión');
          setLoading(false);
          return;
        }
        if (priceOncePerWeek <= 0) {
          toast.error('Define al menos el precio de 1 vez por semana para grupos virtuales');
          setLoading(false);
          return;
        }
        if (enableSecondFrequency && priceTwicePerWeek <= 0) {
          toast.error('Define el precio de 2 veces por semana o agrega solo un horario');
          setLoading(false);
          return;
        }
        if (enableThirdFrequency && priceThreeTimesPerWeek <= 0) {
          toast.error('Define el precio de 3 veces por semana o elimina horarios excedentes');
          setLoading(false);
          return;
        }
      }

      if (schedules.length === 0) {
        toast.error('Debes agregar al menos un horario');
        setLoading(false);
        return;
      }

      if (files.length === 0 && !imagePreview) {
        toast.error('Debes subir una imagen');
        setLoading(false);
        return;
      }

      let uploadedImageUrl = imagePreview;

      if (files.length > 0) {
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('upload_preset', 'my_uploads');

        const imageData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: formData,
        }).then((r) => r.json());

        uploadedImageUrl = imageData.public_id;
      }

      if (!uploadedImageUrl) {
        toast.error('No se pudo obtener la imagen');
        setLoading(false);
        return;
      }

      // Preparar datos según el tipo
      let classData: any;
      
      const sanitizedFrequencyPrices = classType === 'presencial' ? {
        oncePerWeek: {
          amount: presentialPriceOncePerWeek,
          currency: priceCurrency
        },
        twicePerWeek: {
          amount: presentialPriceTwicePerWeek,
          currency: priceCurrency
        },
        threeTimesPerWeek: {
          amount: presentialPriceThreeTimesPerWeek,
          currency: priceCurrency
        }
      } : {
        oncePerWeek: {
          amount: priceOncePerWeek,
          currency: virtualPriceCurrency
        },
        twicePerWeek: {
          amount: priceTwicePerWeek,
          currency: virtualPriceCurrency
        },
        threeTimesPerWeek: {
          amount: priceThreeTimesPerWeek,
          currency: virtualPriceCurrency
        }
      };

      if (classType === 'presencial') {
        const locationObj: any = {
          name: locationName,
          address: locationAddress,
          city: locationCity,
          country: locationCountry,
        };
        if (locationLat && locationLon) {
          locationObj.coordinates = {
            lat: locationLat,
            lon: locationLon
          };
        }
        classData = {
          name,
          description,
          instructor,
          location: locationObj,
          schedules,
          duration,
          capacity: capacity || null,
          level,
          classType: classPersonalizationType,
          price: {
            amount: presentialPriceOncePerWeek,
            currency: priceCurrency,
            type: 'mensual'
          },
          frequencyPrices: sanitizedFrequencyPrices,
          image_url: uploadedImageUrl,
          userEmail: auth.user?.email,
        };
        if (sanitizedAdditionalPrices.length > 0) {
          classData.additionalPrices = sanitizedAdditionalPrices;
        }
      } else {
        classData = {
          name,
          description,
          instructor,
          platform,
          meetingLink,
          schedules,
          duration,
          capacity: capacity || null,
          level,
          classType: classPersonalizationType,
          prices: sanitizedFrequencyPrices,
          image_url: uploadedImageUrl,
          userEmail: auth.user?.email,
        };
        
        if (sanitizedAdditionalPrices.length > 0) {
          classData.additionalPrices = sanitizedAdditionalPrices;
        }
      }

      // Agregar campo active
      classData.active = active;

      const targetId = (initialData && initialData.id) ? initialData.id : (initialId ?? null);
      const apiEndpoint = classType === 'presencial'
        ? (isEditMode && targetId ? `/api/inPersonClass/update/${targetId}` : '/api/inPersonClass/create')
        : (isEditMode && targetId ? `/api/virtualClass/update/${targetId}` : '/api/virtualClass/create');
      const requestMethod = isEditMode ? axios.put : axios.post;

      const { data } = await requestMethod(apiEndpoint, classData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success(data.message || (isEditMode ? 'Clase actualizada con éxito' : 'Clase creada con éxito'));
      router.push('/admin/in-person-classes/all');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || `Error al crear la clase ${classType}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>MForMove Platform - Crear Clase Presencial</title>
        <meta name='description' content='Crear Clase Presencial' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center'>
        <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
	          {/* Header modernizado */}
          <div className='w-full flex pt-8 justify-between items-center mb-8 px-8'>
            <div>
	              <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-montserrat'>{isEditMode ? 'Editar Clase' : 'Crear Clase'}</h1>
	              <p className='text-gray-600 text-lg font-montserrat'>{isEditMode ? 'Actualiza la información de tu clase' : 'Completa la información para crear tu nueva clase'}</p>
            </div>
            <div className='flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm'>
              <div className='w-3 h-3 bg-[#4F7CCF] rounded-full' />
	              <span className='text-gray-700 font-medium font-montserrat'>{isEditMode ? 'Modo edición' : 'Formulario único'}</span>
            </div>
          </div>

          {/* Formulario principal con mejor estructura */}
          <form
            className='relative space-y-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-xl px-8 py-8 md:min-w-[50rem] md:px-12 md:py-10 font-montserrat mb-8'
            autoComplete='nope'
            onSubmit={handleSubmit}
          >
          {/* Sección: Tipo de Clase */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-purple-600 font-bold text-sm'>0</span>
              </div>
              Tipo de Clase
            </h2>
            
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <button
                  type='button'
                  onClick={() => setClassType('presencial')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    classType === 'presencial'
                      ? 'border-[#4F7CCF] bg-[#4F7CCF]/10 text-[#234C8C] shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
                  }`}
                >
                  <div className='flex items-center'>
                    <MapPinIcon className='w-6 h-6 mr-2' />
                    <span className='font-semibold'>Presencial</span>
                  </div>
                  <p className='text-sm mt-2 text-gray-600'>Clase presencial con ubicación física</p>
                </button>
                
                <button
                  type='button'
                  onClick={() => setClassType('virtual')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    classType === 'virtual'
                      ? 'border-[#4F7CCF] bg-[#4F7CCF]/10 text-[#234C8C] shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
                  }`}
                >
                  <div className='flex items-center'>
                    <ClockIcon className='w-6 h-6 mr-2' />
                    <span className='font-semibold'>Virtual</span>
                  </div>
                  <p className='text-sm mt-2 text-gray-600'>Clase online con link de reunión</p>
                </button>
              </div>
            </div>
          </div>

          {/* Sección: Información Básica */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-blue-600 font-bold text-sm'>1</span>
              </div>
              Información Básica
            </h2>
            
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Nombre de la Clase *</p>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Ingresa el nombre de la clase'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Instructor *</p>
                  <input
                    type='text'
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder='Nombre del instructor'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  />
                </label>
              </div>
              
              <label className='flex flex-col space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Descripción *</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Describe la clase, su enfoque y qué aprenderán los estudiantes'
                  className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat min-h-[100px]'
                  rows={4}
                  required
                />
              </label>
              
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Duración (minutos) *</p>
                  <input
                    type='number'
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                    min={1}
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Capacidad</p>
                  <input
                    type='number'
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder='Opcional'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    min={1}
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Nivel *</p>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  >
                    {levels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Tipo de clase *</p>
                  <select
                    value={classPersonalizationType}
                    onChange={(e) => setClassPersonalizationType(e.target.value as 'personalizado' | 'comun')}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  >
                    <option value='comun'>Común</option>
                    <option value='personalizado'>Personalizado</option>
                  </select>
                </label>
              </div>
              
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='active'
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <label htmlFor='active' className='text-sm font-medium text-gray-700'>
                  Clase Activa (visible para los usuarios)
                </label>
              </div>
            </div>
          </div>

          {/* Sección: Ubicación (solo presenciales) */}
          {classType === 'presencial' && (
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-green-600 font-bold text-sm'>2</span>
              </div>
              Ubicación
            </h2>
            
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Nombre del Lugar *</p>
                  <input
                    type='text'
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder='Ej: Estudio de Yoga Centro'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Dirección *</p>
                  <input
                    type='text'
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder='Calle y número'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Ciudad *</p>
                  <input
                    type='text'
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    placeholder='Ej: Montevideo'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>País</p>
                  <input
                    type='text'
                    value={locationCountry}
                    onChange={(e) => setLocationCountry(e.target.value)}
                    placeholder='Ej: Uruguay'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  />
                </label>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Latitud (opcional)</p>
                  <input
                    type='text'
                    value={locationLat}
                    onChange={(e) => setLocationLat(e.target.value)}
                    placeholder='Para mostrar en mapa'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Longitud (opcional)</p>
                  <input
                    type='text'
                    value={locationLon}
                    onChange={(e) => setLocationLon(e.target.value)}
                    placeholder='Para mostrar en mapa'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  />
                </label>
              </div>
            </div>
          </div>
          )}

          {/* Sección: Plataforma Virtual (solo virtuales) */}
          {classType === 'virtual' && (
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-green-600 font-bold text-sm'>2</span>
              </div>
              Plataforma Virtual
            </h2>
            
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Plataforma *</p>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  >
                    <option value='Zoom'>Zoom</option>
                    <option value='Google Meet'>Google Meet</option>
                    <option value='Microsoft Teams'>Microsoft Teams</option>
                    <option value='Otro'>Otro</option>
                  </select>
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Link de la Reunión *</p>
                  <input
                    type='url'
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder='https://zoom.us/j/...'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    required
                  />
                </label>
              </div>
            </div>
          </div>
          )}

          {/* Sección: Horarios */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-purple-600 font-bold text-sm'>{classType === 'presencial' ? '3' : '3'}</span>
              </div>
              Horarios *
            </h2>
            
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Día</p>
                  <select
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Hora Inicio</p>
                  <input
                    type='time'
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Hora Fin</p>
                  <input
                    type='time'
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                  />
                </label>
                
                <div className='flex items-end'>
                  <button
                    type='button'
                    onClick={handleAddSchedule}
                    className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center transition-colors font-montserrat'
                  >
                    <PlusIcon className='w-5 h-5 mr-1' />
                    Agregar
                  </button>
                </div>
              </div>
              
              {/* Lista de horarios agregados */}
              {schedules.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-700 mb-2'>Horarios agregados:</p>
                  {schedules.map((schedule, index) => (
                    <div key={index} className='flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200'>
                      <span className='text-gray-900 font-medium'>
                        {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleRemoveSchedule(index)}
                        className='text-red-500 hover:text-red-700 transition-colors'
                      >
                        <XMarkIcon className='w-5 h-5' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sección: Precio */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-yellow-600 font-bold text-sm'>4</span>
              </div>
              Precio
            </h2>
            
            {classType === 'presencial' ? (
              <div className='space-y-6'>
                <div className='mb-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Moneda</p>
                    <select
                      value={priceCurrency}
                      onChange={(e) => handlePresencialCurrencyChange(e.target.value)}
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat w-full md:w-48'
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio 1 vez/semana *</p>
                    <input
                      type='number'
                      value={presentialPriceOncePerWeek}
                      onChange={(e) => setPresentialPriceOncePerWeek(parseFloat(e.target.value) || 0)}
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      min={0}
                      step={0.01}
                      required
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio 2 veces/semana</p>
                    <input
                      type='number'
                      value={presentialPriceTwicePerWeek}
                      onChange={(e) => setPresentialPriceTwicePerWeek(parseFloat(e.target.value) || 0)}
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      min={0}
                      step={0.01}
                      disabled={!enableSecondFrequency}
                      required={enableSecondFrequency}
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio 3 veces/semana</p>
                    <input
                      type='number'
                      value={presentialPriceThreeTimesPerWeek}
                      onChange={(e) => setPresentialPriceThreeTimesPerWeek(parseFloat(e.target.value) || 0)}
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      min={0}
                      step={0.01}
                      disabled={!enableThirdFrequency}
                      required={enableThirdFrequency}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                <div className='mb-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Moneda</p>
                    <select
                      value={virtualPriceCurrency}
                      onChange={(e) => handleVirtualCurrencyChange(e.target.value)}
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat w-full md:w-48'
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio 1 vez/semana *</p>
                    <input
                      type='number'
                      value={priceOncePerWeek}
                      onChange={(e) => setPriceOncePerWeek(parseFloat(e.target.value) || 0)}
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      min={0}
                      step={0.01}
                      required
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio 2 veces/semana *</p>
                    <input
                      type='number'
                      value={priceTwicePerWeek}
                      onChange={(e) => setPriceTwicePerWeek(parseFloat(e.target.value) || 0)}
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      min={0}
                      step={0.01}
                      required={enableSecondFrequency}
                      disabled={!enableSecondFrequency}
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Precio 3 veces/semana *</p>
                    <input
                      type='number'
                      value={priceThreeTimesPerWeek}
                      onChange={(e) => setPriceThreeTimesPerWeek(parseFloat(e.target.value) || 0)}
                      placeholder='0.00'
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      min={0}
                      step={0.01}
                      required={enableThirdFrequency}
                      disabled={!enableThirdFrequency}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className='border border-gray-200 rounded-lg p-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-semibold text-gray-900'>Precios adicionales (opcional)</p>
                  <p className='text-xs text-gray-500'>
                    {classType === 'virtual'
                      ? 'Ejemplos: clase de prueba, plan mensual especial, etc.'
                      : 'Ejemplos: clase de prueba, promo de lanzamiento, etc.'}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={handleAddAdditionalPrice}
                  className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                >
                  Agregar precio
                </button>
              </div>

              <div className='space-y-3'>
                {additionalPrices.map((price, index) => (
                  <div key={index} className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-200'>
                    <label className='flex flex-col space-y-1'>
                      <span className='text-xs font-medium text-gray-600'>Nombre *</span>
                      <input
                        type='text'
                        value={price.label}
                        onChange={(e) => handleAdditionalPriceChange(index, 'label', e.target.value)}
                        placeholder='Ej: Clase de prueba'
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat text-sm'
                      />
                    </label>
                    <label className='flex flex-col space-y-1'>
                      <span className='text-xs font-medium text-gray-600'>Monto *</span>
                      <input
                        type='number'
                        value={price.amount}
                        onChange={(e) => handleAdditionalPriceChange(index, 'amount', e.target.value)}
                        placeholder='0.00'
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat text-sm'
                        min={0}
                        step={0.01}
                      />
                    </label>
                    <div className='flex items-center space-x-2'>
                      <label className='flex flex-col space-y-1 flex-1'>
                        <span className='text-xs font-medium text-gray-600'>Moneda</span>
                        <select
                          value={price.currency}
                          onChange={(e) => handleAdditionalPriceChange(index, 'currency', e.target.value)}
                          className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors font-montserrat text-sm'
                        >
                          {currencies.map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        type='button'
                        onClick={() => handleRemoveAdditionalPrice(index)}
                        className='px-3 py-2 text-sm text-red-600 hover:text-red-800'
                        title='Eliminar precio'
                      >
                        <XMarkIcon className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección: Imagen */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-pink-600 font-bold text-sm'>5</span>
              </div>
              Imagen *
            </h2>
            
            <div className='space-y-4'>
              {imagePreview ? (
                <div className='relative'>
                  {imagePreview.startsWith('blob:') || imagePreview.startsWith('http') ? (
                    <img
                      src={imagePreview}
                      alt='Preview'
                      className='w-full h-64 object-cover rounded-lg border border-gray-200'
                    />
                  ) : (
                    <div className='w-full h-64 rounded-lg overflow-hidden border border-gray-200'>
                      <div className='relative w-full h-full'>
                        {/* Render Cloudinary URL desde public_id */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${imagePreview}.jpg`}
                          alt='Preview'
                          className='w-full h-full object-cover'
                        />
                      </div>
                    </div>
                  )}
                  <button
                    type='button'
                    onClick={() => {
                      setFiles([]);
                      setImagePreview('');
                    }}
                    className='absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg'
                  >
                    <XMarkIcon className='w-5 h-5' />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all'
                >
                  <input {...getInputProps()} />
                  <PhotoIcon className='w-12 h-12 mx-auto text-gray-400 mb-2' />
                  <p className='text-gray-600 font-medium'>Arrastra una imagen aquí o haz clic para seleccionar</p>
                  <p className='text-xs text-gray-400 mt-2'>JPG, PNG o WebP (máx 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón de envío mejorado */}
          <div className='pt-6 border-t border-gray-200'>
            <div className='flex justify-end space-x-4'>
              <button
                type='button'
                onClick={() => router.push('/admin/in-person-classes')}
                className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 font-montserrat border border-gray-200'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-8 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-montserrat'
              >
                {loading ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Editar Clase' : 'Crear Clase')}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default CreateInPersonClass;

