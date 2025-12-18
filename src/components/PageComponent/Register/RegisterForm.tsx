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
  const [resendCooldown, setResendCooldown] = useState(0);
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

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

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
      if (res.ok) {
        toast.success('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.');
        setRegistered(true);
        setState({ ...state, stepThree: false });
      }

      else if(data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
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

      if (res.ok) {
        setRegistered(true);
        setState({ ...state, stepThree: false });
        toast.success('¡Cuenta creada con éxito!')
      }
      else if(data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error); 
    }
    setLoading(false);
  };

  const handleResendFromSummary = async () => {
    if (resendCooldown > 0 || loading) return;
    try {
      setLoading(true);
      const res = await fetch(endpoints.auth.resend, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: register.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Reenviamos el correo de verificación.');
        setResendCooldown(10);
      } else {
        toast.error(data?.error || 'No pudimos reenviar el correo.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al reenviar.');
    }
    setLoading(false);
  };


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
  
    if (cookies) {
      router.push('/mentorship');
    }
  }, [router]);
  //using React Hook Form library
  const {
    formState: { errors }
  } = useForm<Inputs>();

  // const onChange = () => {
  //   if (recaptchaRef.current.getValue()) {
  //     setCaptchaToken(recaptchaRef.current.getValue());
  //     );
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
          <div className='h-full w-full relative flex flex-col items-center justify-center px-4 py-12'>
            <div className='w-full max-w-lg mx-auto bg-[#0f1115]/60 text-white shadow-2xl  rounded-3xl overflow-hidden backdrop-blur p-8 space-y-6'>
              <div className="flex items-start justify-start gap-3">
                <div className="text-left">
                  <p className="text-sm text-white/70 uppercase tracking-[0.2em]">Paso final</p>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">Revisá tu correo</h1>
                </div>
              </div>

              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Te enviamos un correo para confirmar tu cuenta. Abrilo y seguí el enlace para activar tu acceso.
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-sm text-white/90 font-semibold">¿No lo ves?</p>
                <ul className="text-sm text-white/70 list-disc pl-5 space-y-1">
                  <li>Chequeá tu carpeta de spam o promociones.</li>
                  <li>Esperá unos segundos y vuelve a actualizar.</li>
                  <li>Si no llega, podés reenviarlo desde la opción de recuperar acceso.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01]"
                >
                  Volver al inicio
                </a>
                <button
                  type="button"
                  onClick={handleResendFromSummary}
                  disabled={resendCooldown > 0 || loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 text-white py-3 px-6 text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar verificación'}
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
