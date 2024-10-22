'use client'
import { LoadingSpinner } from '../LoadingSpinner';
import RegisterStepCero from '../RegisterStepCero';
import RegisterStepOne from '../RegisterStepOne';
import RegisterStepThree from '../RegisterStepThree';
import RegisterStepTwo from '../RegisterStepTwo';
import imageLoader from '../../../imageLoader';
import axios from 'axios';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import endpoints from '../../services/api';

interface Inputs {
  email: string;
  password: string;
}

function Register() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [conPassword, setConPassword] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');

  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false
  });
  const { stepCero, stepOne, stepTwo, stepThree } = state;
  const [registered, setRegistered] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  // const recaptchaRef = useRef<any>();

  const clearData = () => {
    setState({
      ...state,
      stepCero: true,
      stepOne: false,
      stepTwo: false,
      stepThree: false
    });
  };

  const step0ToStep1 = () => {
    setState({ ...state, stepCero: false, stepOne: true });
  };
  const step2ToStep3 = () => {
    setState({ ...state, stepTwo: false, stepThree: true });
  };
  const step1ToStep2 = () => {
    setState({ ...state, stepOne: false, stepTwo: true });
  };

  const setDataStepOne = (
    nombre: string,
    apellido: string,
    genero: any,
    pais: string
  ) => {
    setFirstname(nombre);
    setLastname(apellido);
    setGender(genero);
    setCountry(pais);
  };

  const setDataStepTwo = (password: string, conPassword: string) => {
    setPassword(password);
    setConPassword(conPassword);
  };

  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : '';

  const signupUser = async (e: MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      setLoading(true);

      //  const captcha = null;
      // const captcha = captchaToken;
      // if (!captcha) {
      //   toast.error('Error de CAPTCHA, vuelva a intentarlo mas tarde');
      //   setLoading(false);
      //   setTimeout(() => {
      //     window.location.reload();
      //   }, 4000);
      //   return;
      // }

      if (password !== conPassword) {
        toast.error('Las contraseñas no coinciden');
        setLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 4000);
        return;
      }

      const res = await fetch(endpoints.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstname, lastname, gender, country }),
      })

      const data = await res.json()

      console.log(data )

      if (res.ok) {
        setRegistered(true);
        setState({ ...state, stepThree: false });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.error);
    }
    setLoading(false);
  };


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
  
    if (cookies) {
      router.push('/home');
    }
  }, [router]);
  //using React Hook Form library
  const {
    formState: { errors }
  } = useForm<Inputs>();

  // const onChange = () => {
  //   if (recaptchaRef.current.getValue()) {
  //     setCaptchaToken(recaptchaRef.current.getValue());
  //     console.log(recaptchaRef.current.getValue());
  //   } else {
  //     setCaptchaToken(null);
  //   }
  // };

  return (
    <div className='relative flex h-screen w-screen flex-col bg-white md:items-center md:justify-center font-montserrat'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {loading && (
        <div
          className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
        >
          <LoadingSpinner />
        </div>
      )}
      {!registered && !loading && (
        <>
          {stepCero && (
            <RegisterStepCero
              setEmail={(email: string) => setEmail(email)}
              step0ToStep1={step0ToStep1}
            />
          )}
          {!stepCero && (
            <div className='w-full'>
              <header className='absolute sm:fixed border border-b border-b-slate-500/20'>
                <Link href={'/'}>
                  <img
                    alt='icon image'
                    src='/images/logo.png'
                    className='left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
                    width={150}
                    height={150}
                  />
                </Link>

                <button
                  className='font-bold text-xl text-black hover:underline'
                  onClick={() => clearData()}
                >
                  Sign Out
                </button>
              </header>
              {stepOne && (
                <RegisterStepOne
                  step1ToStep2={step1ToStep2}
                  setData={setDataStepOne}
                />
              )}
              {stepTwo && (
                <RegisterStepTwo
                  step2ToStep3={step2ToStep3}
                  setData={setDataStepTwo}
                />
              )}
              {stepThree && (
                <RegisterStepThree
                  user={{
                    email,
                    firstname,
                    lastname,
                    gender,
                    country,
                    password,
                    conPassword
                  }}
                  signUp={signupUser}
                  // onChange={onChange}
                  // recaptchaRef={recaptchaRef}
                />
              )}
            </div>
          )}
        </>
      )}

      {registered && !loading && (
        <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
          <Image
            src='/images/bgIndex2.jpg'
            layout='fill'
            className='-z-10 !hidden opacity-50 sm:!inline'
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
            alt='icon image'
          />
          <div className='relative mt-24 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0 md:max-w-lg md:px-14'>
            <h1 className='text-4xl font-semibold font-boldFont'>
              Hemos enviado un correo a tu cuenta.
            </h1>
            <div className='space-y-4'>
              <label className='inline-block w-full'>
                <p>
                  Verifica tu casilla de correos para poder confirmar tu cuenta!
                </p>
              </label>
              <Link href={'/login'}>
                <button
                  type='button'
                  className='text-white underline cursor-pointer'
                >
                  Volver al Inicio
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Register;
