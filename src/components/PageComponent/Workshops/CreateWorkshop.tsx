
'use client'
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { clearData } from '../../../redux/features/filterClass';
import requests from '../../../utils/requests';
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
    workShopVimeoId:string,
    currency: string = 'USD',
    price: number,
    portraitImageArray:any,
    diplomaImageArray:any,
    diploma:any,
  ) {
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      //console.log(name, description, currency, price , workShopVimeoId);
      console.log(portraitImageArray, diplomaImageArray );
      const formData = new FormData();

      for (const file of portraitImageArray) {
        formData.append('file', file);
      }

      formData.append('upload_preset', 'my_uploads');

      if (portraitImageArray[0].size / 1000000 > 10) {
        toast.error('Formato Incorrecto');
        return;
      }
      
      const portraitData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData
      }).then((r) => r.json());

      

      const formData2 = new FormData();

      for (const file of diplomaImageArray) {
        formData2.append('file', file);
      }

      formData2.append('upload_preset', 'my_uploads');

      if (portraitImageArray[0].size / 1000000 > 10) {
        toast.error('Formato Incorrecto');
        return;
      }
      
      const diplomaData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData2
      }).then((r) => r.json());


      const portraitUrl = portraitData.public_id;
      const diplomaUrl = diplomaData.public_id;



      

      const userEmail = auth.user.email;

      const { data } = await axios.post(
        '/api/workShop/createWorkshop',
        {
          name,
          description,
          workShopVimeoId,
          currency,
          price,
          userEmail,
          portraitUrl,
          diplomaUrl
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
