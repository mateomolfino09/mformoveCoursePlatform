'use client';

import imageLoader from '../../../../imageLoader';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import ErrorComponent from '../../AlertComponent';
import { MiniLoadingSpinner } from '../../MiniLoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import './resetStyle.css';
import { alertTypes } from '../../../constants/alertTypes';
import AlertComponent from '../../AlertComponent';
import AuthSkeleton from '../../AuthSkeleton';

interface Props {
  token: string;
}

function ResetEmailForm({ token }: Props) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>([]);
  const auth = useAuth();
  const router = useRouter();
  const [capsLock, setCapsLock] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window != 'undefined' && document != undefined) {
      document.addEventListener('keydown', testCapsLock);
      document.addEventListener('keyup', testCapsLock);
    }
  }, []);

  useEffect(() => {
    // Mostrar skeleton al inicio y luego ocultarlo
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  function testCapsLock(event: any) {
    if (event.code === 'CapsLock') {
      let isCapsLockOn = event.getModifierState('CapsLock');
      if (isCapsLockOn) {
        setCapsLock(true);
      } else {
        setCapsLock(false);
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      message.some((mes: any) => mes.type === alertTypes.success.type) &&
        router.push('/login');
    }, 3000);
    setTimeout(() => {
      const copy = [...message];
      if (message.some((mes: any) => mes.type === alertTypes.error.type)) {
        setMessage((c: any) =>
          copy.filter((mes) => mes.type != alertTypes.error.type)
        );
      }
    }, 5000);
  }, [message]);

  // useEffect(() => {
  //   const cookies: any = Cookies.get('userToken')

  //   if (!cookies) {
  //     router.push('/home');
  //   }
  // }, [router]);

  const changeEmail = async (data: FormData) => {
    setLoading(true);

    const email = data.get('email') as string;
    const confEmail = data.get('emailCheck') as string;

    if (email !== confEmail) {
      setMessage((current: any) => [
        ...current,
        {
          message: 'Los emails deben ser iguales',
          type: alertTypes.error.type
        }
      ]);
      return;
    }

    try {
      const data = await auth.resetMail(email, token);

      if (data?.type === alertTypes.error.type) {
        setMessage((current: any) => [
          ...current,
          {
            message: data?.message,
            type: alertTypes.error.type
          }
        ]);
        return;
      }
      setMessage((current: any) => [
        ...current,
        {
          message: data?.message,
          type: alertTypes.success.type
        }
      ]);
    } catch (error: any) {
      setMessage((current: any) => [
        ...current,
        {
          message: error?.response?.data?.error,
          type: alertTypes.error.type
        }
      ]);
    }
  };

  if (initialLoading) {
    return <AuthSkeleton />;
  }

  return (
    <div className="main-container">
      <div className="background-image background-gradient">
          <Image
            src='/images/image00029.jpeg'
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='image-gradient'
          />
        <div className="left-container">
        <h1 className="title font-boldFont">MForMove Platform</h1>
        <p className="text !mt-0">Moverse es el medio para reconocerse</p>
        <div className='about-us-btn-container'>
            <a
              href='/mentorship'
              className='about-us-btn !py-3 rounded-full font-light font-montserrat !px-3'
            >
              Membresias
            </a>
          </div>
        </div>
      </div>
      <div className='right-container'>
        <div className='right-card-container'>
          <form className='form-container' action={changeEmail}>
            <h1 className='sub-title'>Cambiar email</h1>
            <p className='sub-p'>Elige tu nuevo email.</p>
            <div className='input-container mb-8'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                />
              </svg>
              <input
                id='email'
                className='input-login'
                type='email'
                name='email'
                placeholder='Email Address'
              />
            </div>
            <div className='input-container mb-8'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                />
              </svg>
              <input
                id='emailCheck'
                className='input-login'
                type='email'
                name='emailCheck'
                placeholder='Email Address Check'
              />
            </div>
            <p className={`capslock ${!capsLock && 'hidden'}`}>
              Bloq Mayús Activado
            </p>
            <div className='relative'>
              <button type='submit' className='login-btn'>
                Enviar{' '}
              </button>
              {loading && <MiniLoadingSpinner />}
            </div>
            <div className='flex justify-between mt-4'>
              <Link href={routes.user.login}>
                <span className='links'>Ingresar a mi cuenta</span>
              </Link>
              <Link href={routes.user.register}>
                <span className='links'>¿No tienes una cuenta todavía?</span>
              </Link>
            </div>
          </form>
        </div>
        {message?.map((mes: any) => (
          <AlertComponent type={mes.type} message={mes.message} />
        ))}
      </div>
    </div>
  );
}

export default ResetEmailForm;
