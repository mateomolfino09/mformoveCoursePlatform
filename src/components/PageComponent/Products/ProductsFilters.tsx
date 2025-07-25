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
import { toast } from 'react-toastify';

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
        <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
          <div
            className={`h-full min-h-[100vh] w-full relative flex flex-col md:items-center md:justify-start`}
          >
            {/* Logo position */}
            <div className='w-full flex pt-12 justify-between items-center'>
              <h1 className='text-4xl font-light '>Agregar un Filtro de Producto</h1>
            </div>
            <form
              className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
              autoComplete='nope'
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className='space-y-8'>
                <label className='flex flex-col space-y-3 w-full'>
                  <p>Elige un nombre para el filtro</p>

                  <input
                    type='nombre'
                    placeholder='Nombre'
                    className='input'
                    {...register('name', { required: true })}
                  />
                </label>
                <label className='flex flex-col space-y-3 w-full'>
                  <p>Elige el tipo de filtro</p>
                  <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                      <input 
                      {...register('type')} 
                      onChange={(e) => e.target.checked ? setType(true) : setType(false)}
                      id="bordered-checkbox-1" 
                      type="checkbox" 
                      value="" 
                      name="bordered-checkbox" 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                      <label htmlFor="bordered-checkbox-1" className="w-full py-4 ml-4 text-gray-900 dark:text-gray-300">¿Quieres un filtro SI/NO?</label>
                  </div>
                </label>
                <label className='flex flex-col space-y-3 w-full'>
                  <p>Introduce una descripción</p>
                  <label className='inline-block w-full'>
                    <textarea
                      placeholder='Descripción'
                      className='input'
                      {...register('description')}
                    />
                  </label>
                </label>
                {type ? (
                  <>
                               <label className='flex flex-col space-y-3 w-full'>
                    <p>Agrega pregunta</p>

                    <input
                      type='text'
                      placeholder='Pregunta'
                      className='input'
                      {...register('question')}
                    />
                  </label>
                  </>
                ) : (
                 <>
                  <label className='flex flex-col space-y-3 w-full'>
                    <p>Agrega valores al filtro</p>

                    <input
                      type='text'
                      placeholder='Nuevo Valor'
                      className='input'
                      onChange={(e: any) => setCurrentValue(e.target.value)}
                    />
                    <input
                      type='text'
                      placeholder='Nueva Etiqueta'
                      className='input'
                      onChange={(e: any) => setCurrentValueLabel(e.target.value)}
                    />

                      <textarea
                        placeholder='Descripción'
                        className='input'
                        onChange={(e: any) => setCurrentValueDescription(e.target.value)}
                        />
                    <button
                      className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
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
              <div className='flex justify-start w-full items-center flex-shrink flex-wrap space-y-3' >
                {values.map((v: any) => (
                  <>
                    <div key={v} style={{ flex: '1 0 21%'}} className='h-12 w-fit px-4 mx-3 rounded-full bg-black flex justify-between items-center'>
                      <p className='text-white'>{v.label}</p>
                      <RxCross2 className='w-4 h-4 cursor-pointer' onClick={() => {
                        let newArr = values.filter((x: any) => x.value != v.value)
                        setValues([...newArr])
                      }}/>
                    </div>
                  </>
                ))}

              </div>
              <button
                type='submit'
                className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
              >
                Enviar{' '}
              </button>
              <div className='text-[gray]'>
                Volver al Inicio
                <Link href={'/home'}>
                  <button
                    type='button'
                    className='text-white hover:underline ml-2'
                  >
                    {' '}
                    Volver
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdmimDashboardLayout>
  );
};

export default ProductsFilters;
