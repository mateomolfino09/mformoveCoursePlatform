'use client';

import imageLoader from '../../../../imageLoader';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import { MiniLoadingSpinner } from '../../MiniLoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import './loginStyle.css';
import { alertTypes } from '../../../constants/alertTypes';
import state from '../../../valtio';
import Footer from '../../Footer';
import FooterProfile from '../Profile/FooterProfile';
import AlertComponent from '../../AlertComponent';
import MainSideBar from '../../MainSidebar/MainSideBar';
import LoginModalForm from './AccountForm';
import NewsletterF from '../Index/NewsletterForm';
import { CldImage } from 'next-cloudinary';
import { getAndClearRedirectUrl } from '../../../utils/redirectQueue';
import { executePlanIntent } from '../../../utils/executePlanIntent';
import AuthSkeleton from '../../AuthSkeleton';

function LoginForm() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>([]);
  const [verifyInfo, setVerifyInfo] = useState<{ email: string; message?: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
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

  const signinUser = async (data: FormData) => {
    setLoading(true);

    const email = data.get('email') as string;
    const password = data.get('password') as string;

    try {
      const res = await auth.signIn(email, password);
      
      if (res.type != 'error') {
        // Mostrar mensaje de éxito
        setMessage((current: any) => [
          ...current,
          {
            message: '¡Login exitoso! Redirigiendo...',
            type: alertTypes.success.type
          }
        ]);
        setLoading(false);

        // Verificar estado de onboarding solo si el usuario tiene suscripción activa
        try {
          const onboardingRes = await fetch('/api/onboarding/status', {
            credentials: 'include'
          });
          
          if (onboardingRes.ok) {
            const onboardingData = await onboardingRes.json();
            
            // Si el usuario no tiene suscripción, no necesita onboarding
            if (onboardingData.sinSuscripcion) {
              setTimeout(() => {
                router.push('/move-crew');
              }, 1000);
              return;
            }
            
            // Si necesita onboarding (tiene suscripción activa pero no completó el onboarding)
            if (onboardingData.necesitaOnboarding) {
              // Si no aceptó el contrato, ir a la pantalla de bienvenida
              if (!onboardingData.contratoAceptado) {
                setTimeout(() => {
                  router.push('/onboarding/bienvenida');
                }, 1000);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error verificando onboarding:', error);
          // Si hay error, continuar con el flujo normal de login
        }

        // Verificar si hay una intención de plan guardada para ejecutarla
        const userEmail = res?.user?.email || auth.user?.email;
        const userId = res?.user?._id || auth.user?._id;
        
        if (userEmail && userId) {
          const planIntentExecuted = await executePlanIntent(userEmail, userId, router);
          
          if (planIntentExecuted) {
            // Si se ejecutó una intención de plan, no hacer nada más (ya redirigió)
            return;
          }
        }
        
        // Si no hay intención de plan, verificar si hay una URL guardada para redirigir
        const redirectUrl = getAndClearRedirectUrl();
        
        if (redirectUrl) {
          // Si hay una URL guardada, redirigir ahí
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        } else {
          // Si el onboarding está completo o no es necesario, redirigir normalmente
          const hasActiveSub = res?.user?.subscription?.active || auth.user?.subscription?.active;
          setTimeout(() => {
            router.push(hasActiveSub ? '/library' : '/move-crew');
          }, 1000);
        }
      } else {
        if (res.validate) {
          setVerifyInfo({ email, message: res.message });
          setMessage([]);
        } else {
          setMessage((current: any) => [
            ...current,
            {
              message: res.message,
              type: alertTypes.error.type
            }
          ]);
        }
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      setMessage((current: any) => [
        ...current,
        {
          message: error?.message || 'Error al iniciar sesión',
          type: alertTypes.error.type
        }
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (!verifyInfo?.email || cooldown > 0) return;
    try {
      setLoading(true);
      const res = await fetch('/api/user/auth/register/resendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyInfo.email })
      });
      const data = await res.json();
      if (res.ok) {
        setCooldown(10);
        setMessage([]);
      } else {
        setMessage([{ message: data?.error || 'No pudimos reenviar el correo.', type: alertTypes.error.type }]);
      }
    } catch (error: any) {
      setMessage([{ message: error?.response?.data?.error || 'Error al reenviar.', type: alertTypes.error.type }]);
    }
    setLoading(false);
  };

  if (initialLoading) {
    return <AuthSkeleton />;
  }

  return (
    <div>
      <MainSideBar where={'index'}>
        <section className="relative min-h-screen bg-black text-white font-montserrat overflow-hidden">
          <div className="absolute inset-0">
            <CldImage
              src="my_uploads/fondos/DSC01436_sy7os9"
              alt="Login MFM"
              fill
              priority
              className="hidden md:block object-cover opacity-65"
              style={{ objectPosition: 'center top' }}
              loader={imageLoader}
            />
            <CldImage
              src="my_uploads/fondos/DSC01429_kbgawc"
              alt="Login MFM mobile"
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
                  Ingresá a tu cuenta
                </h1>
                <p className="text-sm sm:text-base text-white/70 font-light">
                  Si no tenés cuenta, registrate para empezar.
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="relative rounded-3xl  overflow-hidden backdrop-blur">
                  <div className="absolute inset-0 pointer-events-none" />
      
                    <LoginModalForm
                      submitFunction={signinUser}
                      buttonTitle={'Ingresar'}
                      showEmail={true}
                      showPassword={true}
                      title=""
                      showForget={true}
                      showLogIn={false}
                      isLoading={loading}
                    />
                    {message?.map((mes: any) => (
                      <AlertComponent key={mes.message} type={mes.type} message={mes.message} />
                    ))}
                    {verifyInfo && (
                      <div className="mt-2 rounded-2xl border border-amber-300/30 bg-amber-500/10 text-amber-50 p-4 space-y-2">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 border border-amber-300/40 text-amber-100 text-sm font-bold">!</span>
                          <div className="text-sm leading-snug flex-1">
                            <p className="font-semibold">Confirma tu cuenta</p>
                            <p className="text-amber-100/80">{verifyInfo.message || 'Necesitas validar tu email antes de ingresar.'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            type="button"
                            disabled={cooldown > 0 || loading}
                            onClick={handleResendVerification}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/60 text-amber-50 py-2.5 px-4 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar verificación'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVerifyInfo(null);
                              setMessage([]);
                              setCooldown(0);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black py-2.5 px-4 text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                          >
                            Cambiar correo
                          </button>
                        </div>
                      </div>
                    )}
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

export default LoginForm;
