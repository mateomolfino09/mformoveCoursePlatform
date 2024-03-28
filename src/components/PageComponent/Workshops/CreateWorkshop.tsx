
'use client'
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { clearData } from '../../../redux/features/filterClass';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import CreateWorkshopStep1 from './CreateWorkshopStep1';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CreateWorkshop = () => {
  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false
  });

  const cookies = parseCookies();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const { stepCero } = state;

  const auth = useAuth();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/login');
  }, [auth.user]);

  async function handleSubmit(
    name: string,
    description: string,
    currency: string = 'USD',
    amount: number,
    frequency_type: string
  ) {
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      console.log(name, description, currency, amount, frequency_type);
      const userEmail = auth.user.email;
      const { data } = await axios.post(
        '/api/workShop/createWorkshop',
        {
          name,
          description,
          currency,
          amount,
          frequency_type,
          userEmail
        },
        config
      );



      auth.fetchUser();

      toast.success(data.message);
      router.push('/admin/memberships');
      dispatch(clearData());
    } catch (error: any) {
      console.log(error);
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
        <>
          {stepCero && (
            <>
              <CreateWorkshopStep1 handleSubmit={handleSubmit} />
            </>
          )}
        </>
      )}
    </AdmimDashboardLayout>
  );
};

export default CreateWorkshop;
