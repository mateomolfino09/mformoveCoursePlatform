'use client'


import React, { useState } from 'react';
import './IndividualProduct.css';
import { ProductDB } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import {
  oneTymePaymentSlice,
  setOnePaymentToken
} from '../../../redux/features/oneTimePayment';
import endpoints from '../../../services/api';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import MainSideBar from '../../MainSideBar';
import Footer from '../../Footer';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

interface Props {
  product: ProductDB;
}

const IndividualProduct = ({ product }: Props) => {
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  async function handleSubmit() {
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.post(
        '/api/payments/oneTimePayment',
        {
          name: 'Ejemplo 2 ',
          description:
            'Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo',
          currency: 'USD',
          amount: 10,
          frequency_type: 'MONTHLY'
        },
        config
      );
      const token = data?.response?.merchant_checkout_token;
      dispatch(setOnePaymentToken(token));
     

      const userId = '65f6ea07aa3f6e1ac4464579';
      const productId = product?._id;

      const res = await axios.put(
        '/api/user/memberships/asignMembershipToken',
        {
          userId,
          token,
          productId
        },
        config
      );

      Cookies.set('userPaymentToken', token ? token : '', { expires: 5 });
      auth.fetchUser();

      toast.success(data.message);
      const redirectPaymentLink = data?.response?.redirect_url;
      if (res.status == 200) {
        router.push(redirectPaymentLink);
      }
      // dispatch(clearData()) //VERLO BIEN
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.error);
    }
    setLoading(false);
  }

  return (
    <div className='relative bg-to-dark font-montserrat lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden scrollbar-thin'>
    <MainSideBar where={'product'}>
    <main className='pt-32 bg-white'>
        <div className='product-details flex flex-col space-y-12 lg:flex-row'>
          <div className='product-name-image lg:w-1/2 flex flex-col space-y-4 px-5 lg:pl-24'>
            <div className='w-full lg:pr-12 flex justify-between items-center'>
              <h2 className='text-black text-4xl md:text-5xl font-bold lg:pr-4'>{product?.name}</h2>
              <AcademicCapIcon className='h-8 w-8 hidden lg:block text-black'/>
            </div>
            <p className='text-black lg:pr-12 text-lg md:text-lg font-normal'>{product.description}</p>
            <div className='product-image'>
              <img
                src={
                  'https://img.freepik.com/foto-gratis/vista-posterior-mujer-haciendo-yoga-al-aire-libre_23-2148769551.jpg'
                }
                alt={product?.name}
              />
            </div>
            <div className='flex w-full lg:bg-gray-300/50 lg:p-6 lg:rounded-md flex-col lg:space-y-4'>
            <button
              onClick={(e) => handleSubmit()}
              className='w-full hidden md:block bg-black border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
            >
              Comprar Ahora{' '} ({product.price} {product.currency})
            </button>
              <p className='text-black text-lg md:text-lg font-normal'>{product.longDescription}</p>
            </div>

          </div>
          <div className='product-name-image lg:w-1/2 flex flex-col space-y-4 px-5'>
            <h2 className='text-black text-3xl md:text-4xl font-bold'>Contenido del Curso</h2>
            <p className='text-black text-lg md:text-lg font-normal'>{product.description}</p>
            <div className='product-image'>
              <img
                src={
                  'https://img.freepik.com/foto-gratis/vista-posterior-mujer-haciendo-yoga-al-aire-libre_23-2148769551.jpg'
                }
                alt={product?.name}
              />
            </div>
            <p className='text-black text-lg md:text-lg font-normal'>{product.longDescription}</p>
          </div>
        </div>



      </main>
      <Footer />
      </MainSideBar>
      <div className='bottom-0 md:hidden flex justify-center items-end mb-4 text-center fixed w-full h-24 px-3'>
      <button
          onClick={(e) => handleSubmit()}
          className='w-full bg-black border border-white rounded-md transition duration-500 text-xl font-light hover:bg-black py-4 font-semibold'
        >
          Comprar Ahora{' '}
        </button>
      </div>
    </div>
  );
};

export default IndividualProduct;
