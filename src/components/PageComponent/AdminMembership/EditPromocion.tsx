'use client'
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import endpoints from '../../../services/api';
import Link from 'next/link';

interface PromocionFormData {
  nombre: string;
  descripcion: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  codigoPromocional: string;
}

interface EditPromocionProps {
  promocionId: string;
}

const EditPromocion = ({ promocionId }: EditPromocionProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const auth = useAuth();
  
  const [formData, setFormData] = useState<PromocionFormData>({
    nombre: '',
    descripcion: '',
    porcentajeDescuento: 0,
    frecuenciasAplicables: [],
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    activa: true,
    codigoPromocional: ''
  });

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');
    
    if (!cookies) {
      router.push('/login');
    }
    
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') {
      router.push('/login');
    }
  }, [auth.user]);

  useEffect(() => {
    fetchPromocion();
  }, [promocionId]);

  const fetchPromocion = async () => {
    setLoadingData(true);
    try {
      const url = endpoints?.payments?.promocion?.get
        ? endpoints.payments.promocion.get(promocionId)
        : `/api/payments/promocion/${promocionId}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.promocion) {
        const promocion = data.promocion;
        setFormData({
          nombre: promocion.nombre || '',
          descripcion: promocion.descripcion || '',
          porcentajeDescuento: promocion.porcentajeDescuento || 0,
          frecuenciasAplicables: promocion.frecuenciasAplicables || [],
          fechaInicio: promocion.fechaInicio ? new Date(promocion.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          fechaFin: promocion.fechaFin ? new Date(promocion.fechaFin).toISOString().split('T')[0] : '',
          activa: promocion.activa !== undefined ? promocion.activa : true,
          codigoPromocional: promocion.codigoPromocional || ''
        });
      } else {
        toast.error('Promoción no encontrada');
        router.push('/admin/memberships/promociones');
      }
    } catch (error: any) {
      toast.error('Error al cargar la promoción');
      router.push('/admin/memberships/promociones');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFrecuenciaChange = (frecuencia: string) => {
    setFormData(prev => {
      if (frecuencia === 'ambas') {
        return { ...prev, frecuenciasAplicables: ['ambas'] };
      }
      const nuevas = prev.frecuenciasAplicables.includes(frecuencia)
        ? prev.frecuenciasAplicables.filter(f => f !== frecuencia)
        : [...prev.frecuenciasAplicables.filter(f => f !== 'ambas'), frecuencia];
      return { ...prev, frecuenciasAplicables: nuevas };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.nombre.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres');
      return;
    }
    
    if (formData.porcentajeDescuento <= 0 || formData.porcentajeDescuento > 100) {
      toast.error('El porcentaje de descuento debe estar entre 1 y 100');
      return;
    }
    
    if (formData.frecuenciasAplicables.length === 0) {
      toast.error('Debe seleccionar al menos una frecuencia aplicable');
      return;
    }
    
    if (!formData.fechaFin) {
      toast.error('Debe seleccionar una fecha de fin');
      return;
    }
    
    const fechaFin = new Date(formData.fechaFin);
    const fechaInicio = new Date(formData.fechaInicio);
    
    if (fechaFin <= fechaInicio) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setLoading(true);
    try {
      const url = endpoints?.payments?.promocion?.edit
        ? endpoints.payments.promocion.edit(promocionId)
        : `/api/payments/promocion/${promocionId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          codigoPromocional: formData.codigoPromocional || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al editar la promoción');
      }

      toast.success('Promoción actualizada exitosamente');
      router.push('/admin/memberships/promociones');
    } catch (error: any) {
      toast.error(error.message || 'Error al editar la promoción');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdmimDashboardLayout>
        <div className='md:h-[100vh] w-full flex flex-col justify-center items-center'>
          <LoadingSpinner />
          <p className='font-light text-xs text-gray-500 mt-4'>
            Cargando promoción...
          </p>
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Editar Promoción</title>
        <meta name='description' content='Editar promoción' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {loading ? (
        <div className='md:h-[100vh] w-full flex flex-col justify-center items-center'>
          <LoadingSpinner />
          <p className='font-light text-xs text-gray-500 mt-4'>
            Actualizando promoción...
          </p>
        </div>
      ) : (
        <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
          <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
            {/* Header */}
            <div className='w-full flex pt-8 justify-between items-center mb-8 px-8'>
              <div>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-montserrat'>
                  Editar Promoción
                </h1>
                <p className='text-gray-600 text-lg font-montserrat'>
                  Modifica la información de la promoción
                </p>
              </div>
            </div>

            <form
              className='relative space-y-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-xl px-8 py-8 md:min-w-[40rem] md:px-12 md:py-10 font-montserrat mb-8'
              onSubmit={handleSubmit}
            >
              <div className='space-y-6'>
                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>
                    Nombre de la promoción *
                  </p>
                  <input
                    type='text'
                    placeholder='Ej: Descuento de Verano'
                    value={formData.nombre}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </label>

                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>
                    Descripción
                  </p>
                  <textarea
                    placeholder='Describe la promoción (opcional)'
                    value={formData.descripcion}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat min-h-[100px]'
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </label>

                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>
                    Porcentaje de descuento *
                  </p>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='number'
                      placeholder='0'
                      min={1}
                      max={100}
                      value={formData.porcentajeDescuento || ''}
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      onChange={(e) => setFormData({ ...formData, porcentajeDescuento: Number(e.target.value) })}
                      required
                    />
                    <span className='text-gray-600 font-semibold'>%</span>
                  </div>
                </label>

                <div className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>
                    Frecuencias aplicables *
                  </p>
                  <div className='space-y-2'>
                    <label className='flex items-center space-x-3 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={formData.frecuenciasAplicables.includes('mensual')}
                        onChange={() => handleFrecuenciaChange('mensual')}
                        className='w-5 h-5 text-[#4F7CCF] border-gray-300 rounded focus:ring-[#4F7CCF]'
                      />
                      <span className='text-gray-700 font-montserrat'>Mensual</span>
                    </label>
                    <label className='flex items-center space-x-3 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={formData.frecuenciasAplicables.includes('trimestral')}
                        onChange={() => handleFrecuenciaChange('trimestral')}
                        className='w-5 h-5 text-[#4F7CCF] border-gray-300 rounded focus:ring-[#4F7CCF]'
                      />
                      <span className='text-gray-700 font-montserrat'>Trimestral</span>
                    </label>
                    <label className='flex items-center space-x-3 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={formData.frecuenciasAplicables.includes('ambas')}
                        onChange={() => handleFrecuenciaChange('ambas')}
                        className='w-5 h-5 text-[#4F7CCF] border-gray-300 rounded focus:ring-[#4F7CCF]'
                      />
                      <span className='text-gray-700 font-montserrat'>Ambas</span>
                    </label>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700 font-montserrat'>
                      Fecha de inicio *
                    </p>
                    <input
                      type='date'
                      value={formData.fechaInicio}
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      required
                    />
                  </label>

                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700 font-montserrat'>
                      Fecha de fin *
                    </p>
                    <input
                      type='date'
                      value={formData.fechaFin}
                      min={formData.fechaInicio}
                      className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>
                    Código promocional (opcional)
                  </p>
                  <input
                    type='text'
                    placeholder='Ej: VERANO2024'
                    value={formData.codigoPromocional}
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat uppercase'
                    onChange={(e) => setFormData({ ...formData, codigoPromocional: e.target.value.toUpperCase() })}
                  />
                </label>

                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={formData.activa}
                    onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                    className='w-5 h-5 text-[#4F7CCF] border-gray-300 rounded focus:ring-[#4F7CCF]'
                  />
                  <span className='text-gray-700 font-montserrat'>Promoción activa</span>
                </label>
              </div>

              <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
                <Link href={'/admin/memberships/promociones'}>
                  <button
                    type='button'
                    className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 font-montserrat border border-gray-200'
                  >
                    Cancelar
                  </button>
                </Link>
                <button
                  type='submit'
                  className='px-8 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg font-montserrat'
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdmimDashboardLayout>
  );
};

export default EditPromocion;

