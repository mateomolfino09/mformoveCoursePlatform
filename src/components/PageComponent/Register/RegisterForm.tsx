'use client';

import { LoadingSpinner } from '../../LoadingSpinner';
import imageLoader from '../../../../imageLoader';
import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from '../../../hooks/useToast';
import Cookies from 'js-cookie';
import endpoints from '../../../services/api';
import { useAppSelector } from '../../../redux/hooks';
import RegisterStepCero from './RegisterStepCero';
import RegisterStepOne from './RegisterStepOne';
import RegisterStepTwo from './RegisterStepTwo';
import RegisterStepThree from './RegisterStepThree';
import { AnimatePresence, motion as m } from 'framer-motion';
import './registerStyle.css';
import ResendEmail from './ResendEmail';
import { useAuth } from '../../../hooks/useAuth';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import AuthSkeleton from '../../AuthSkeleton';
import { CldImage } from 'next-cloudinary';
import CourseDarkSectionBackground from '../Course/CourseDarkSectionBackground';
import {
  authBtnGhostClass,
  authBtnPrimaryClass,
  authFormCardInnerClass,
  authFormCardShellClass,
  REGISTER_BG,
} from '../../../constants/authFormDesign';

type RegisterStepId = 'cero' | 'one' | 'two' | 'three' | 'resend';

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 56 : -56,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -56 : 56,
    opacity: 0,
    scale: 0.98,
  }),
};

function Register() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const [activeStep, setActiveStep] = useState<RegisterStepId>('cero');
  const [direction, setDirection] = useState(1);

  const [registered, setRegistered] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const recaptchaRef = useRef<any>();
  const register = useAppSelector((state) => state.registerReducer.value);

  const goToStep = (next: RegisterStepId, dir: number) => {
    setDirection(dir);
    setActiveStep(next);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
      return;
    }
    if (auth.user.rol === 'Admin') {
      router.replace('/admin');
      return;
    }
    if (auth.user.subscription?.active || auth.user.isVip) {
      router.replace('/biblioteca');
      return;
    }
    router.replace('/');
  }, [auth, auth.user, router]);

  const step0ToStep1 = () => goToStep('one', 1);
  const step0ToResend = () => goToStep('resend', 1);
  const step1ToStep0 = () => goToStep('cero', -1);
  const step2ToStep3 = () => goToStep('three', 1);
  const step3ToStep2 = () => goToStep('two', -1);
  const step1ToStep2 = () => goToStep('two', 1);
  const step2ToStep1 = () => goToStep('one', -1);

  const signupUser = async (
    e: MouseEvent<HTMLButtonElement>,
    password: string,
    confirmPassword: string
  ) => {
    const { email, firstname, lastname, gender, country } = register;
    try {
      e.preventDefault();
      setLoading(true);

      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        setLoading(false);
        setTimeout(() => window.location.reload(), 4000);
        return;
      }

      const res = await fetch(endpoints.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstname, lastname, gender, country }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.');
        setRegistered(true);
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    }
    setLoading(false);
  };

  const resendEmail = async (e: MouseEvent<HTMLButtonElement>) => {
    const { email } = register;
    try {
      e.preventDefault();
      setLoading(true);

      const res = await fetch(endpoints.auth.resend, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setRegistered(true);
        toast.success('¡Cuenta creada con éxito!');
      } else if (data?.error) {
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
        headers: { 'Content-Type': 'application/json' },
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
    const cookies: any = Cookies.get('userToken');
    if (cookies) {
      router.push('/mentoria');
    }
  }, [router]);

  useForm<{ email: string; password: string }>();

  const renderStep = () => {
    switch (activeStep) {
      case 'cero':
        return (
          <RegisterStepCero step0ToStep1={step0ToStep1} step0ToResend={step0ToResend} />
        );
      case 'one':
        return (
          <RegisterStepOne step1ToStep2={step1ToStep2} step1ToStep0={step1ToStep0} />
        );
      case 'two':
        return (
          <RegisterStepTwo
            step2ToStep3={step2ToStep3}
            step2ToStep1={step2ToStep1}
            signUp={signupUser}
          />
        );
      case 'three':
        return (
          <RegisterStepThree
            signUp={signupUser}
            recaptchaRef={recaptchaRef}
            step3ToStep2={step3ToStep2}
          />
        );
      case 'resend':
        return (
          <ResendEmail
            resendEmail={resendEmail}
            recaptchaRef={recaptchaRef}
            step3ToStep2={step3ToStep2}
          />
        );
      default:
        return null;
    }
  };

  if (initialLoading) {
    return <AuthSkeleton />;
  }

  return (
    <div>
      <MainSideBar where={'index'} flowLayout className="md:block">
        <section className="relative isolate flex flex-col min-h-[100dvh] bg-palette-ink text-palette-cream font-montserrat md:min-h-[100svh] md:flex-none">
          {/* Hero: mínimo 100dvh en mobile para que la imagen cubra toda la pantalla */}
          <div className="pointer-events-none absolute inset-0 z-0 min-h-[100dvh] md:min-h-full overflow-hidden" aria-hidden>
            <CldImage
              src={REGISTER_BG}
              alt=""
              fill
              priority
              className="object-cover opacity-65 md:opacity-60"
              style={{ objectPosition: 'center center' }}
              loader={imageLoader}
            />
            <div className="absolute inset-0 bg-black/50 md:bg-black/55" />
          </div>

          {loading && (
            <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 py-24 md:min-h-[100svh]">
              <LoadingSpinner />
            </div>
          )}

          {!registered && !loading && (
            <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-3 sm:px-6 py-24 md:min-h-[100svh] md:px-6 md:py-24 md:pt-32 md:pb-16">
              <div className={authFormCardShellClass}>
                <CourseDarkSectionBackground />
                <div className={authFormCardInnerClass}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <m.div
                      key={activeStep}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full"
                    >
                      {renderStep()}
                    </m.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {registered && !loading && (
            <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-3 sm:px-6 py-24 md:min-h-[100svh] md:px-6 md:py-12">
              <div className={authFormCardShellClass}>
                <CourseDarkSectionBackground />
                <div className={`${authFormCardInnerClass} space-y-6`}>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream/55">
                      Paso final
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight text-palette-cream mt-2">
                      Revisá tu correo
                    </h1>
                  </div>

                  <p className="text-palette-cream/80 text-sm md:text-base leading-relaxed">
                    Te enviamos un correo para confirmar tu cuenta. Abrilo y seguí el enlace para
                    activar tu acceso.
                  </p>

                  <div className="rounded-2xl border border-palette-cream/15 bg-palette-cream/5 p-4 space-y-2">
                    <p className="text-sm text-palette-cream/90 font-semibold">¿No lo ves?</p>
                    <ul className="text-sm text-palette-cream/70 list-disc pl-5 space-y-1">
                      <li>Chequeá tu carpeta de spam o promociones.</li>
                      <li>Esperá unos segundos y volvé a actualizar.</li>
                      <li>Si no llega, podés reenviarlo desde abajo.</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="/iniciar-sesion" className={authBtnPrimaryClass}>
                      Volver al inicio
                    </a>
                    <button
                      type="button"
                      onClick={handleResendFromSummary}
                      disabled={resendCooldown > 0 || loading}
                      className={`${authBtnGhostClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {resendCooldown > 0
                        ? `Reenviar en ${resendCooldown}s`
                        : 'Reenviar verificación'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="relative z-20 shrink-0 bg-palette-cream">
          <Footer />
        </div>
      </MainSideBar>
    </div>
  );
}

export default Register;
