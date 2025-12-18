'use client'
import imageLoader from '../../../imageLoader';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import endpoints from '../../services/api';
import MainSideBarDash from '../MainSidebar/MainSideBarDash';
import HeaderUnified from '../HeaderUnified';
import Footer from '../Footer';

interface Props {
    token: string
}

function EmailVerification({ token }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
  
    if (cookies) {
      router.push('/home');
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
        if(data.message) setMessage(data.message);
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
      icon: '⏳',
      title: 'Estamos Verificando tu cuenta',
      desc: 'Procesando tu enlace de verificación...',
      bg: 'bg-white/5',
      border: 'border-white/15',
      text: 'text-white'
    },
    success: {
      icon: '✅',
      title: 'Cuenta verificada',
      desc: message || 'Tu cuenta quedó activa. Ya podés ingresar.',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-300/40',
      text: 'text-emerald-50'
    },
    error: {
      icon: '⚠️',
      title: 'No pudimos verificar',
      desc: error || 'El enlace no es válido o expiró. Pedí un nuevo correo.',
      bg: 'bg-amber-500/10',
      border: 'border-amber-300/40',
      text: 'text-amber-50'
    }
  };

  const currentStatus = statusConfig[statusVariant];

  return (
    <div className='relative flex min-h-screen w-screen flex-col bg-black text-white font-montserrat overflow-auto'>
      <HeaderUnified user={null} toggleNav={() => setShowNav((v) => !v)} where="email" showNav={showNav} />
      {showNav && (
        <MainSideBarDash showNav={showNav} where="email" toggleNav={() => setShowNav(false)} />
      )}
      <div className='h-[100vh] w-full relative flex flex-col items-center justify-center z-[180] px-4 py-12 md:py-16'>
        <Image
          src={'/images/image00013.jpeg'}
          layout='fill'
          className="bg-image"
          objectFit='cover'
          alt='icon image'
          loader={imageLoader}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        <div className='relative w-full max-w-xl'>
          <div className={`rounded-3xl ${currentStatus.bg} ${currentStatus.border} border shadow-2xl backdrop-blur p-8 md:p-10 space-y-6`}>
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-2xl">
                {currentStatus.icon}
              </span>
              <div className="space-y-2 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Verificación de cuenta</p>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{currentStatus.title}</h1>
                <p className="text-sm md:text-base text-white/80 leading-relaxed">{currentStatus.desc}</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                <span>Procesando...</span>
              </div>
            )}

            {!loading && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01]"
                >
                  Ingresar al sitio
                </Link>
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 text-white py-3 px-6 text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Volver al inicio
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default EmailVerification;
