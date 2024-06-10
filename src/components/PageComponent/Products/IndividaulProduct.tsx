'use client';

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
            'Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2 Ejemplo 2  ',
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

      debugger;
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
    <div className='product-page'>
      <header className='product-header'>
        <h1>MForMove</h1>
      </header>
      <main className='product-main'>
        <div className='product-details'>
          <div className='product-name-image'>
            <h2 className='titulo'>{product?.name}</h2>
            <div className='product-image'>
              <img
                src={
                  'https://img.freepik.com/foto-gratis/vista-posterior-mujer-haciendo-yoga-al-aire-libre_23-2148769551.jpg'
                }
                alt={product?.name}
              />
            </div>
          </div>
          <p>{product?.description}</p>
          <p>Precio: {product?.price}</p>
          <p>Cantidad de clases: {product?.classesQuantity}</p>
        </div>

        <button
          onClick={(e) => handleSubmit()}
          className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
        >
          Subscribirse{' '}
        </button>
      </main>
      <footer className='product-footer'>
        <p>&copy; 2024 MForMove. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default IndividualProduct;
