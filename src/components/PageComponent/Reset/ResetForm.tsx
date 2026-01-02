'use client';

import imageLoader from '../../../../imageLoader';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import { MiniLoadingSpinner } from '../../MiniLoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { alertTypes } from '../../../constants/alertTypes';
import AlertComponent from '../../AlertComponent';
import { CldImage } from 'next-cloudinary';

interface Props {
  token: string;
}

function ResetForm({ token }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>([]);
  const auth = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      message.some((mes: any) => mes.type === alertTypes.success.type) &&
        router.push('/mentorship');
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

  const changePassword = async (data: FormData) => {
    setLoading(true);

    const password = data.get('password') as string
    const passwordCheck = data.get('passwordCheck') as string

      try {
        const data = await auth.resetPassword(passwordCheck, password, token)

        if(data?.error) {
          setMessage((current: any) => [...current, {
            message: data?.error,
            type: alertTypes.error.type
          }
        ]);
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
    setLoading(false);
  };

  return (
    <section className="relative min-h-screen bg-black text-white font-montserrat overflow-hidden">
      <div className="absolute inset-0">
        <CldImage
          src="my_uploads/fondos/DSC01436_sy7os9"
          alt="Reset password"
          fill
          priority
          className="hidden md:block object-cover opacity-65"
          style={{ objectPosition: 'center top' }}
          loader={imageLoader}
        />
        <CldImage
          src="my_uploads/fondos/DSC01429_kbgawc"
          alt="Reset password mobile"
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
              <span>Restablecer acceso</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-2xl">
              Cambiá tu contraseña
            </h1>
            <p className="text-sm sm:text-base text-white/70 font-light">
              Ingresa tu nueva contraseña y confirmala para continuar.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative rounded-3xl bg-[#0f1115]/85 text-white shadow-2xl border border-white/15 overflow-hidden backdrop-blur">
              <div className="absolute inset-0 pointer-events-none" />
              <form className="relative z-10 p-6 md:p-8 space-y-4" onSubmit={(e) => { e.preventDefault(); changePassword(new FormData(e.currentTarget)); }}>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">Ingreso</p>
                  <h2 className="text-2xl font-semibold text-white">Actualizá tu clave</h2>
                  <p className="text-sm text-white/70">Usá una contraseña segura y recordable.</p>
                </div>
                <div className="space-y-3">
                  <input
                    id='password'
                    className='w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                    type='password'
                    name='password'
                    placeholder='Contraseña'
                    required
                  />
                  <input
                    className='w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30'
                    type='password'
                    name='passwordCheck'
                    id='passwordCheck'
                    placeholder='Confirmar contraseña'
                    required
                  />
                </div>
                <p className={`text-xs text-amber-200 ${!capsLock && 'hidden'}`}>
                  Bloq Mayús Activado
                </p>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {loading && <span className="h-4 w-4 border-2 border-black/40 border-t-black rounded-full animate-spin" aria-hidden />}
                  {loading ? 'Procesando...' : 'Cambiar contraseña'}
                </button>
                <div className='flex flex-col md:flex-row md:justify-between mt-2 text-sm text-white/80 space-y-2 md:space-y-0'>
                  <Link href={routes.user.login}>
                    <span className='links block text-center underline underline-offset-4 decoration-white/60'>
                      Ingresar a mi cuenta
                    </span>
                  </Link>
                  <Link href={routes.user.register}>
                    <span className='links block text-center underline underline-offset-4 decoration-white/60'>
                      Crear cuenta
                    </span>
                  </Link>
                </div>
              </form>
            </div>
              {message?.map((mes: any) => (
                <AlertComponent key={mes.message} type={mes.type} message={mes.message} />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResetForm;
