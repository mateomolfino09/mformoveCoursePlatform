'use client';

import imageLoader from '../../../../imageLoader';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import './forgetStyle.css';
import { alertTypes } from '../../../constants/alertTypes';
import AlertComponent from '../../AlertComponent';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'react-toastify';
import LoginModalForm from '../Login/AccountForm';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import { CldImage } from 'next-cloudinary';

function ForgetForm() {
  const [message, setMessage] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const recaptchaRef = useRef<any>();
  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : '';
  const [capsLock, setCapsLock] = useState<boolean>(false);
  // const { executeRecaptcha } = useGoogleReCaptcha()

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
    // const captcha = captchaToken;

    const email = data.get('email') as string;

    try {
      //const data = await auth.forgetPasswordSendNoCaptcha(email)
      const data = await auth.resetPasswordSendMailchamp(email);

      if (data?.error) {
        setMessage((current: any) => [
          ...current,
          {
            message: data.error,
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
      <MainSideBar where={'index'}>
        <section className="relative min-h-screen bg-black text-white font-montserrat overflow-hidden">
          <div className="absolute inset-0">
            <CldImage
              src="my_uploads/fondos/DSC01436_sy7os9"
              alt="Recuperar contraseña"
              fill
              priority
              className="hidden md:block object-cover opacity-65"
              style={{ objectPosition: 'center top' }}
              loader={imageLoader}
            />
            <CldImage
              src="my_uploads/fondos/DSC01429_kbgawc"
              alt="Recuperar contraseña mobile"
              fill
              priority
              className="md:hidden object-cover opacity-65"
              style={{ objectPosition: 'center top' }}
              loader={imageLoader}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pt-28 md:py-24 md:pt-32">
            <div className="grid gap-10 justify-items-center">
              <div className="text-center max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs uppercase tracking-[0.2em]">
                  <span>Acceso seguro</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-2xl">
                  Recuperá tu contraseña
                </h1>
                <p className="text-sm sm:text-base text-white/70 font-light">
                  Ingresá tu correo y te enviamos el enlace de recuperación.
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="relative rounded-3xl bg-[#0f1115]/85 text-white shadow-2xl border border-white/15 overflow-hidden backdrop-blur">
                  <div className="absolute inset-0 pointer-events-none" />
                  <LoginModalForm
                    submitFunction={forget}
                    buttonTitle={'Recuperar'}
                    showEmail={true}
                    showPassword={false}
                    title=""
                    showForget={false}
                    showLogIn={true}
                    isLoading={loading}
                  />
                  {message?.map((mes: any) => (
                    <AlertComponent key={mes.message} type={mes.type} message={mes.message} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </MainSideBar>
    </div>
  );
}

export default ForgetForm;
