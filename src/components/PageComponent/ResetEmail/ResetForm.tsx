'use client';

import imageLoader from '../../../../imageLoader';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import ErrorComponent from '../../AlertComponent';
import { MiniLoadingSpinner } from '../../MiniLoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import './resetStyle.css';
import { alertTypes } from '../../../constants/alertTypes';
import AlertComponent from '../../AlertComponent';
import Cookies from 'js-cookie';
import ReCAPTCHA from 'react-google-recaptcha';
import MainSideBar from '../../MainSidebar/MainSideBar';
import AccountForm from '../Login/AccountForm';
import NewsletterF from '../Index/NewsletterForm';
import Footer from '../../Footer';

function ForgetForm() {
  const [message, setMessage] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const [capsLock, setCapsLock] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window != 'undefined' && document != undefined) {
      document.addEventListener('keydown', testCapsLock);
      document.addEventListener('keyup', testCapsLock);
    }
  }, []);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/mentorship');
    }
  }, [router]);

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

  const forget = async (data: FormData) => {
    setLoading(true);
    const email = data.get('email') as string;

    try {
      const data = await auth.resetMailSend(email);

      if (data?.type) {
        setMessage((current: any) => [
          ...current,
          {
            message: data.message,
            type: alertTypes.error.type
          }
        ]);
        setLoading(false);
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

  return (
    <div>
    <MainSideBar where={"index"}>
      <div className='main-container background-gradient-right'>
      <div className='right-container'>
      <div className='right-card-container'>
      <Image
                  src='/images/image00029.jpeg'
                  // src={srcImg}
                  alt={'image'}
                  fill={true}
                  loader={imageLoader}
                  className='image-gradient-right max-h-screen'
                />
          <AccountForm title={"Cambiar Email"}  submitFunction={forget} buttonTitle={"Recuperar"} showEmail={true} showPassword={false} showForget={false} showLogIn={true}/>
                
          {/* <form className='form-container' action={forget}>
            <h1 className='sub-title'>Cambiar Email</h1>
            <p className='sub-p'>Ingresa el email para verificar su cuenta</p>
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

            <p className={`capslock ${!capsLock && 'hidden'}`}>
              Bloq Mayús Activado
            </p>
            <div className='relative'>
              <button type='submit' className='reset-btn'>
                Recuperar{' '}
              </button>
              {loading && <MiniLoadingSpinner />}
            </div>
            <div className='flex flex-col md:flex-row md:justify-between mt-4 text-sm text-gray-500'>
              <Link href={routes.user.login}>
                <span className='links text-center'>Ingresar a mi cuenta</span>
              </Link>
              <Link href={routes.user.register}>
                <span className='links text-center mt-2 md:mt-0'>¿No tienes una cuenta todavía?</span>
              </Link>
            </div>

          </form> */}
        </div>
        {message.length > 0 &&
          message?.map((mes: any) => (
            <AlertComponent type={mes.type} message={mes.message} />
          ))}
      </div>
      </div>
      <NewsletterF/>
      <Footer />
      </MainSideBar>
    </div>

  );
}

export default ForgetForm;
