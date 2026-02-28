'use client';

import { RxCross2 } from 'react-icons/rx';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { useAppSelector } from '../../../redux/hooks';
import requests from '../../../utils/requests';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from '../../../hooks/useToast';

interface User {
  id: number;
  name: string;
  rol: string;
  email: string;
  password: string;
}

const ProductsFilters = () => {
  const [values, setValues] = useState<string | any>([]);
  const [currentValue, setCurrentValue] = useState('');
  const [currentValueLabel, setCurrentValueLabel] = useState('');
  const [currentValueDescription, setCurrentValueDescription] = useState('');

  const cookies = parseCookies();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [type, setType] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { register, handleSubmit, formState, getValues, watch } = useForm();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/login');
  }, [auth.user]);

  async function onSubmit(data: any) {
    const { name, description, question } = data;
    setLoading(true);
    if (name.length < 3) {
      toast.error(
        'El Nombre del tipo de clase debe tener almenos 3 caracteres'
      );
      setLoading(false);
      return;
    }
    if(values.length < 2 && !type) {
      toast.error(
        'Debes agregar al menos 2 valores'
      );
      setLoading(false);
      return;
    }

    try {
      const userEmail = auth.user.email;

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const typeSend = type ? 'two' : 'multiple'

      const { data } = await axios.post(
        '/api/product/filters/create',
        {
          name,
          description,
          values,
          userEmail,
          type: typeSend,
          question
        },
        config
      );

      auth.fetchUser();

      toast.success(data.message);
      router.push('/admin/products')
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
    setLoading(false);
  }

  return (
    <AdmimDashboardLayout>
      {loading ? (
        <div className='md:h-[100vh] w-full flex flex-col justify-center items-center'>
          <LoadingSpinner />
          <p className='font-light text-xs text-[gray] mt-4'>
            Esto puede demorar unos segundos...
          </p>
        </div>
      ) : (
        <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center'>
          <div
            className={`h-full min-h-[100vh] w-full relative flex flex-col md:items-center md:justify-center`}
          >
            {/* Header modernizado */}
            <div className='w-full flex pt-8 justify-between items-center mb-8 px-8'>
              <div>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-montserrat'>Agregar un Filtro de Producto</h1>
                <p className='text-gray-600 text-lg font-montserrat'>Crea filtros para categorizar y organizar tus productos</p>
              </div>
              <div className='flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm'>
                <div className='w-3 h-3 bg-[#4F7CCF] rounded-full' />
                <span className='text-gray-700 font-medium font-montserrat'>Formulario único</span>
              </div>
            </div>
            <form
              className='relative space-y-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-xl px-8 py-8 md:min-w-[40rem] md:px-12 md:py-10 font-montserrat mb-8'
              autoComplete='nope'
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className='space-y-6'>
                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>Nombre del filtro *</p>
                  <input
                    type='text'
                    placeholder='Ej: Nivel de dificultad'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                    {...register('name', { required: true })}
                    required
                  />
                </label>
                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>Tipo de filtro</p>
                  <div className="flex items-center ps-4 py-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                      <input 
                      {...register('type')} 
                      onChange={(e) => e.target.checked ? setType(true) : setType(false)}
                      id="bordered-checkbox-1" 
                      type="checkbox" 
                      value="" 
                      name="bordered-checkbox" 
                      className="w-4 h-4 text-[#4F7CCF] bg-white border-gray-300 rounded focus:ring-[#4F7CCF] focus:ring-2" />
                      <label htmlFor="bordered-checkbox-1" className="w-full py-2 ml-4 text-gray-900 font-montserrat cursor-pointer">¿Quieres un filtro SI/NO?</label>
                  </div>
                </label>
                <label className='flex flex-col space-y-2 w-full'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>Descripción</p>
                  <textarea
                    placeholder='Describe el propósito de este filtro'
                    className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat min-h-[100px]'
                    {...register('description')}
                  />
                </label>
                {type ? (
                  <>
                    <label className='flex flex-col space-y-2 w-full'>
                      <p className='text-sm font-medium text-gray-700 font-montserrat'>Pregunta *</p>
                      <input
                        type='text'
                        placeholder='Ej: ¿Es para principiantes?'
                        className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                        {...register('question')}
                        required
                      />
                    </label>
                  </>
                ) : (
                 <>
                  <label className='flex flex-col space-y-3 w-full'>
                    <p className='text-sm font-medium text-gray-700 font-montserrat'>Agregar valores al filtro</p>
                    <div className='space-y-3'>
                      <input
                        type='text'
                        placeholder='Nuevo Valor'
                        className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                        onChange={(e: any) => setCurrentValue(e.target.value)}
                      />
                      <input
                        type='text'
                        placeholder='Nueva Etiqueta (texto visible)'
                        className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                        onChange={(e: any) => setCurrentValueLabel(e.target.value)}
                      />
                      <textarea
                        placeholder='Descripción del valor (opcional)'
                        className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat min-h-[80px]'
                        onChange={(e: any) => setCurrentValueDescription(e.target.value)}
                      />
                    </div>
                    <button
                      className='w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-xl transition-all duration-300 hover:bg-gray-200 py-3 font-semibold font-montserrat'
                      type='button'
                      onClick={() => {
                        if(values.filter((x: any) => x.value === currentValue).length > 0) {
                          toast.error("No puedes agregar el mismo valor");
                        }
                        else setValues([...values, {
                          value: currentValue,
                          label: currentValueLabel,
                          description: currentValueDescription
                        }])
                      }
                        
                        }
                    >
                      Agregar
                    </button>
                  </label>
                 </> 
                )}
              </div>
              {values.length > 0 && (
                <div className='space-y-3'>
                  <p className='text-sm font-medium text-gray-700 font-montserrat'>Valores agregados:</p>
                  <div className='flex flex-wrap gap-3'>
                    {values.map((v: any, index: number) => (
                      <div key={index} className='h-auto px-4 py-2 rounded-xl bg-gray-800 flex items-center gap-2 shadow-sm'>
                        <p className='text-white font-medium text-sm font-montserrat'>{v.label}</p>
                        <RxCross2 className='w-4 h-4 cursor-pointer text-white hover:text-red-400 transition-colors' onClick={() => {
                          let newArr = values.filter((x: any) => x.value != v.value)
                          setValues([...newArr])
                        }}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
                <Link href={'/admin/products'}>
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
                  Crear Filtro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdmimDashboardLayout>
  );
};

export default ProductsFilters;
