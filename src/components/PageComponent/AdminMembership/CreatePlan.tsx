'use client'
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import requests from '../../../utils/requests';
import axios from 'axios';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import { useAppSelector } from '../../../redux/hooks';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { ClassTypes } from '../../../../typings';
import CreatePlanStepOne from './CreatePlanStepOne';


const CreatePlan = () => {
  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false
  });

  const cookies = parseCookies();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch()

  const { stepCero } = state;

  const auth = useAuth()
    
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

  async function handleSubmit(name: string, description: string, currency: string = "USD", amount: number, amountAnual: number, frequency_type: string, useStripe: boolean) {
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const { data } = await axios.post(
        '/api/payments/membership/createPlan',
        {
          name,
          description,
          features: [], // Puedes adaptar esto si tienes features
          level: '', // Puedes adaptar esto si tienes niveles
          price: amount,
          currency,
          interval: frequency_type || 'month',
        },
        config
      );
      auth.fetchUser();
      toast.success('Plan de membresía creado exitosamente');
      router.push('/admin/memberships');
      dispatch(clearData());
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear el plan');
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
          <>
            {stepCero && (
              <>
                <CreatePlanStepOne handleSubmit={handleSubmit}/>
              </>
            )                             
            }
          </>
        )}
      </AdmimDashboardLayout>
  );
};


export default CreatePlan;
