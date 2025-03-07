'use client'
import { LoadingSpinner } from '../../LoadingSpinner';
import imageLoader from '../../../../imageLoader';
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
import endpoints from '../../../services/api';
import { clearData as clear, addEmail,addStepOne,addStepTwo } from '../../../redux/features/register';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../redux/hooks';
import RegisterStepCero from './RegisterStepCero';
import RegisterStepOne from './RegisterStepOne';
import RegisterStepTwo from './RegisterStepTwo';
import RegisterStepThree from './RegisterStepThree';
import { motion as m, useAnimation } from 'framer-motion';
import './registerStyle.css';
import ResendEmail from './ResendEmail';
import { useAuth } from '../../../hooks/useAuth';
import { routes } from '../../../constants/routes';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';

interface Inputs {
  email: string;
  password: string;
}

function Register() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>()
  const animationstepcero = useAnimation();
  const animationstepone = useAnimation();
  const animationresend = useAnimation();

  const auth = useAuth()

  const animationsteptwo = useAnimation();
  const animationstepthree = useAnimation();

  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false,
    resend: false
  });
  const { stepCero, stepOne, stepTwo, stepThree, resend } = state;
  const [registered, setRegistered] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const recaptchaRef = useRef<any>();
  const register = useAppSelector(
    (state) => state.registerReducer.value
  );

  useEffect(() => {
    if (stepCero) {
        animationstepcero.start({
            x: 0,
            display: 'flex',
            zIndex: 500,
            transition: {
              delay: 0.05,
              ease: 'linear',
              duration: 0.32,
              stiffness: 0
            }
          });
    }
    if (stepOne) {
        animationstepone.start({
            x: 0,
            display: 'flex',
            zIndex: 500,
            transition: {
              delay: 0.05,
              ease: 'linear',
              duration: 0.33,
              stiffness: 0
            }
          });
    }
    if (stepTwo) {
        animationsteptwo.start({
            x: 0,
            display: 'flex',
            zIndex: 500,
            transition: {
              delay: 0.05,
              ease: 'linear',
              duration: 0.33,
              stiffness: 0
            }
          });
    }
    if (stepThree) {
        animationstepthree.start({
            x: 0,
            display: 'flex',
            zIndex: 500,
            transition: {
              delay: 0.05,
              ease: 'linear',
              duration: 0.33,
              stiffness: 0
            }
          });
    }
    if(resend) {
      animationresend.start({
        x: 0,
        display: 'flex',
        zIndex: 500,
        transition: {
          delay: 0.05,
          ease: 'linear',
          duration: 0.33,
          stiffness: 0
        }
      });
    }
  }, [state]);

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

  const step0ToResend = () => {
    setState({ ...state, stepCero: false, resend: true });
  };

  const step1ToStep0 = () => {
    setState({ ...state, stepCero: true, stepOne: false });
  };
  const step2ToStep3 = () => {
    setState({ ...state, stepTwo: false, stepThree: true });
  };

  const step3ToStep2 = () => {
    setState({ ...state, stepTwo: true, stepThree: false });
  };

  const step1ToStep2 = () => {
    setState({ ...state, stepOne: false, stepTwo: true });
  };
  const step2ToStep1 = () => {
    setState({ ...state, stepTwo: false, stepOne: true });
  };


  const signupUser = async (e: MouseEvent<HTMLButtonElement>, password: string, confirmPassword: string) => {
    const { email, firstname, lastname, gender, country } = register
    console.log(password, confirmPassword)
    try {
      e.preventDefault();
      setLoading(true);

      // const captcha = captchaToken;

      // if (!executeRecaptcha) {
      //   toast.error('Error de CAPTCHA, vuelva a intentarlo mas tarde');
      //   setLoading(false);
      //   setTimeout(() => {
      //     window.location.reload();
      //   }, 4000);
      //   return;
      // }

      // const gRecaptchaObj = await executeRecaptcha("inquirySubmit")


      if (password !== confirmPassword) {
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
      const token = data.token

      if (res.ok) {
        await auth.signInPostRegister(token).then((res: any) => {
          toast.success('¡Cuenta creada con éxito!')
          setRegistered(true);
          setState({ ...state, stepThree: false });

          setTimeout(() => {
            router.push(routes.navegation.membresiaHome)
          }, 3000)

        })
      }

      else if(data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error); 
    }
    setLoading(false);
  };

  const resendEmail = async (e: MouseEvent<HTMLButtonElement>) => {
    const { email } = register
    try {
      e.preventDefault();
      setLoading(true);

      // const captcha = captchaToken;

      // if (!executeRecaptcha) {
      //   toast.error('Error de CAPTCHA, vuelva a intentarlo mas tarde');
      //   setLoading(false);
      //   setTimeout(() => {
      //     window.location.reload();
      //   }, 4000);
      //   return;
      // }

      // const gRecaptchaObj = await executeRecaptcha("inquirySubmit")

      const res = await fetch(endpoints.auth.resend, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      console.log(data)

      if (res.ok) {
        setRegistered(true);
        setState({ ...state, stepThree: false });
        toast.success('¡Cuenta creada con éxito!')
      }
      else if(data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error); 
    }
    setLoading(false);
  };


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
  
    if (cookies) {
      router.push(routes.navegation.membresiaHome);
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
    <div>
      <MainSideBar where={"index"}>
      <div className='relative flex h-screen w-full flex-col md:items-center md:justify-center overflow-hidden font-montserrat'>

        <Image
        src={'/images/image00013.jpeg'}
        layout='fill'
        className={`bg-image ${stepThree && '!h-[120%]'} `} 
        objectFit='cover'
        alt='icon image'
        loader={imageLoader}
            />
        {loading && (
          <div
            className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
          >
            <LoadingSpinner />
          </div>
        )}
        {!registered && !loading && (
          <div className='container-register'>
            {stepCero && (
              <RegisterStepCero
                step0ToStep1={step0ToStep1}
                step0ToResend={step0ToResend}
              />
            )}
            {!stepCero && (
              <>
                  {resend && (
                  <m.div
                  initial={{ x: 1200 }}
                  animate={animationresend}
                  >
                    <ResendEmail
                    resendEmail={resendEmail}
                    // onChange={onChange}
                    recaptchaRef={recaptchaRef}
                    step3ToStep2={step3ToStep2}
                  />
                  </m.div>

                )}
                {stepOne && (
                  <m.div
                  initial={{ x: 1200 }}
                  animate={animationstepone}
                  >
                    <RegisterStepOne
                    step1ToStep2={step1ToStep2}
                    step1ToStep0={step1ToStep0}
                  />
                  </m.div>

                )}
                {stepTwo && (
                  <m.div
                  initial={{ x: 1200 }}
                  animate={animationsteptwo}
                  >
                  <RegisterStepTwo
                    step2ToStep3={step2ToStep3}
                    step2ToStep1={step2ToStep1}
                    signUp={signupUser}
                  />
                  </m.div>

                )}
                {stepThree && (
                  <m.div
                  initial={{ x: 1200 }}
                  animate={animationstepthree}
                  >
                  <RegisterStepThree
                    signUp={signupUser}
                    // onChange={onChange}
                    recaptchaRef={recaptchaRef}
                    step3ToStep2={step3ToStep2}
                  />
                  </m.div>

                )}
              </>
            )}
          </div>
        )}

        {registered && !loading && (
          <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
            {/* Logo position */}
            <img
              src='/images/logo.png'
              className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
              width={150}
              height={150}
              alt='icon image'
            />
            <div className='relative top-48 md:top-0 space-y-8 rounded py-10 px-6 md:mt-0 md:max-w-lg md:px-14'>
              <h1 className='text-4xl font-semibold font-montserrat'>
                Hemos enviado un correo a tu cuenta.
              </h1>
              <div className='space-y-4'>
                <label className='inline-block w-full'>
                  <p>
                  Tu cuenta ha sido creada con éxito
                  </p>
                </label>
                  <button
                    type='button'
                    className='text-white underline cursor-pointer'
                  >
                    <a href="/login">Volver al Inicio</a>
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
      </MainSideBar>
    </div>


  );
}


export default Register;
