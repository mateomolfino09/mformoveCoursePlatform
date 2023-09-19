import imageLoader from '../../imageLoader';
import { LoadingSpinner } from './LoadingSpinner';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  setEmail: (email: string) => void;
  step0ToStep1: any;
}

const RegisterStepCero = ({ setEmail, step0ToStep1 }: Props) => {
  const [email, setEmailStep] = useState('');
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window != 'undefined' && document != undefined) {
      document.addEventListener('keydown', testCapsLock);
      document.addEventListener('keyup', testCapsLock);
    }
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

  const handleClick = async () => {
    if (!email.includes('@')) {
      toast.error('Ingresa un email válido');
      return;
    }
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      let { data } = await axios.post(
        '/api/user/email/verifyEmail',
        { email },
        config
      );

      setEmail(email);
      step0ToStep1();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }

    setLoading(false);
  };

  const keyDownHandler = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleClick();
    }
  };

  return (
    <div
      className={`h-full w-full relative flex flex-col md:items-center md:justify-center bg-black`}
    >
      {/* Logo position */}
      <header className=''>
        <Link href={'/'}>
          <img
            alt='icon image'
            src='/images/logoWhite.png'
            className='left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
            width={150}
            height={150}
          />
        </Link>
        <Link href={'/user/login'}>
          <button
            type='button'
            className='text-white text-sm ml-2 bg-black/70 border border-white rounded-md transition duration-500 hover:bg-black  w-16 h-8 md:w-20 '
          >
            Log In
          </button>
        </Link>
      </header>
      <Image
        src={'/images/bgIndex2.jpg'}
        layout='fill'
        className='!inline opacity-50'
        objectFit='cover'
        alt='icon image'
        loader={imageLoader}
      />
      {loading ? (
        <>
          <LoadingSpinner />
        </>
      ) : (
        <>
          <div className='flex flex-col items-center justify-center relative mt-48 space-y-8 rounded py-12 md:-mt-24'>
            <h1 className='font-extrabold text-4xl text-center'>
              Lleva al siguiente nivel tus conocimientos de peluqueria
            </h1>
            <h2 className='font-semibold text-xl text-center'>
              Pronto para aprender? Ingresa tu email para crear tu cuenta.
            </h2>
          </div>
          <div className='flex items-center justify-center relative space-x-8 rounded px-8 md:w-full'>
            <div className='w-2/3 bg-transparent border border-white rounded-md md:w-[40%] lg:w-[30%]'>
              <label className='inline-block w-full'>
                <input
                  type='email'
                  id='email'
                  placeholder='Email'
                  className='inputRegister'
                  value={email}
                  onChange={(e) => setEmailStep(e.target.value)}
                  onKeyDown={keyDownHandler}
                  required
                />
              </label>
            </div>
            <button
              onClick={() => handleClick()}
              className='w-1/3 bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold md:w-[20%] lg:w-[10%]'
            >
              Empezar!{' '}
            </button>
          </div>
          <div className='w-full my-0 flex justify-center items-center relative top-2'>
            <p className={`text-white/80 text-xs ${!capsLock && 'hidden'}`}>
              Bloq Mayús Activado
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterStepCero;
