'use client'
import imageLoader from '../../../imageLoader';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import endpoints from '../../services/api';

interface Props {
    token: string
}

function EmailVerification({ token }: Props) {
    const router = useRouter()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
  
    if (cookies) {
      router.push('/home');
    }
  }, [router]);

  useEffect(() => {
    sendToken(token ? token : '');
  }, [token]);

  const sendToken = async (token: string | undefined) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const res = await fetch(endpoints.auth.email(token ? token : ''), {
				method: 'PUT',
				headers: {  
				  'Content-Type': 'application/json',
				},
			  })

        const data = await res.json()
        if(data.message) toast.success(data.message);
        else toast.error(data.error);

      
    } catch (error: any) {
        const data = await error.json()
        toast.error(data.response.data.error);
    }
  };

  return (
    <div className='relative flex h-screen w-screen flex-col bg-black md:items-center md:justify-center md:bg-transparent'>
      <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
      <Image
        src={'/images/image00013.jpeg'}
        layout='fill'
        className={`bg-image`} 
        objectFit='cover'
        alt='icon image'
        loader={imageLoader}
          />
        {/* Logo position */}
        <img
          src='/images/logo.png'
          className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
          width={150}
          height={150}
          alt={'icon img'}
        />
        <div className='relative mt-48 space-y-8 rounded py-10 px-6 md:mt-0 md:max-w-lg md:px-14'>
          <h1 className='text-4xl font-semibold'>Enhorabuena!</h1>
          <div className='space-y-4'>
            <label className='inline-block w-full'>
              <p>Ya puedes utilizar tu cuenta</p>
            </label>
            <Link href={'/login'}>
              <button
                type='button'
                className='text-white underline cursor-pointer'
              >
                Ingresar al sitio
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
