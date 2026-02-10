'use client'
import imageLoader from '../../../imageLoader';
import Cookies from 'js-cookie';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import endpoints from '../../services/api';
import Footer from '../Footer';
import MainSideBar from '../MainSidebar/MainSideBar';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
    token: string
}

function EmailVerification({ token }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
  
    if (cookies) {
      router.push('/library');
    }
  }, [router]);

  useEffect(() => {
    sendToken(token ? token : '');
  }, [token]);

  const sendToken = async (token: string | undefined) => {
    setLoading(true);
    setError(null);
    setMessage(null);
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
        if(data.message) {
          setMessage(data.message);
          // Si la verificación fue exitosa, guardar la URL de redirección para cuando hagan login
          // (La URL ya debería estar guardada si vinieron desde una página protegida)
        }
        else setError(data.error || 'No pudimos verificar tu cuenta.');

      
    } catch (error: any) {
        const data = await error.json()
        setError(data?.response?.data?.error || 'No pudimos verificar tu cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const statusVariant = useMemo(() => {
    if (loading) return 'loading';
    if (error) return 'error';
    return 'success';
  }, [loading, error]);

  const statusConfig: Record<string, { icon: string; title: string; desc: string; bg: string; border: string; text: string }> = {
    loading: {
      icon: '',
      title: 'Estamos Verificando tu cuenta',
      desc: 'Procesando tu enlace de verificación...',
      bg: 'bg-white/5',
      border: 'border-white/15',
      text: 'text-white'
    },
    success: {
      icon: '',
      title: 'Cuenta verificada',
      desc: message || 'Tu cuenta quedó activa. Ya podés ingresar.',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-300/40',
      text: 'text-emerald-50'
    },
    error: {
      icon: '',
      title: 'No pudimos verificar',
      desc: error || 'El enlace no es válido o expiró. Pedí un nuevo correo.',
      bg: 'bg-amber-500/10',
      border: 'border-amber-300/40',
      text: 'text-amber-50'
    }
  };

  const currentStatus = statusConfig[statusVariant];

  return (
    <div>
      <MainSideBar where={'index'}>
        <section className="relative min-h-screen bg-black text-white font-montserrat overflow-hidden">
          <div className="absolute inset-0">
            <CldImage
              src="my_uploads/fondos/DSC01436_sy7os9"
              alt="Email verification"
              fill
              priority
              className="hidden md:block object-cover opacity-65"
              style={{ objectPosition: 'center top' }}
              loader={imageLoader}
            />
            <CldImage
              src="my_uploads/fondos/DSC01429_kbgawc"
              alt="Email verification mobile"
              fill
              priority
              className="md:hidden object-cover opacity-65"
              style={{ objectPosition: 'center top' }}
              loader={imageLoader}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center py-14 pt-28 md:py-24 md:pt-32">
            <div className="grid gap-10 justify-items-center w-full">
              <div className="text-center max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs uppercase tracking-[0.2em]">
                  <span>Verificación</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-2xl">
                  {currentStatus.title}
                </h1>
              </div>

              <div className="w-full max-w-md">
                <div className="relative rounded-3xl overflow-hidden backdrop-blur">
                  <div className={`rounded-3xl p-8 md:p-10 space-y-6 ${currentStatus.bg} ${currentStatus.border} border`}>
                    {loading ? (
                      <div className="flex items-center justify-center gap-3 text-white/80 text-sm">
                        <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      <>
                        {/* Icono de estado */}
                        <div className="flex flex-col items-center gap-4">
                          {statusVariant === 'success' && (
                            <>
                              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                                <CheckCircleIcon className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                              </div>
                              <p className="text-center text-sm md:text-base text-emerald-50 font-medium">
                                {message || 'Tu cuenta ha sido verificada exitosamente'}
                              </p>
                            </>
                          )}
                          {statusVariant === 'error' && (
                            <>
                              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/20 border border-amber-400/30">
                                <ExclamationCircleIcon className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
                              </div>
                              <p className="text-center text-sm md:text-base text-amber-50 font-medium">
                                {error || 'El enlace no es válido o expiró'}
                              </p>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link
                            href="/login"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3 px-6 text-base font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                          >
                            Ingresar
                          </Link>
                          <Link
                            href="/"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 text-white py-3 px-6 text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
                          >
                            Volver
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
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

export default EmailVerification;
