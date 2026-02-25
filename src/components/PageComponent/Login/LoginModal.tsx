'use client';

import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import { Button } from '@headlessui/react';
import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';
import { toast } from '../../../hooks/useToast';
import { useSnapshot } from 'valtio';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { getAndClearRedirectUrl } from '../../../utils/redirectQueue';
import { executePlanIntent } from '../../../utils/executePlanIntent';
import endpoints from '../../../services/api';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const inputBase =
  'w-full rounded-xl border border-palette-stone/40 bg-palette-cream px-4 py-3 text-palette-ink placeholder-palette-stone outline-none transition focus:ring-2 focus:ring-palette-sage/50 focus:border-palette-sage';

const inputError = 'border-soft-error ring-1 ring-soft-error';

const LoginModal = () => {
  const router = useRouter();
  const auth = useAuth();
  const snap = useSnapshot(state);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState(false);
  const [forgetForm, setForgetForm] = useState(false);
  const [forgetSend, setForgetSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!auth.user) auth.fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auth.user is the intended dependency
  }, [auth.user]);

  useEffect(() => {
    if (!mounted) return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [mounted]);

  const close = () => {
    state.loginForm = false;
    setErrorMessage(null);
    setForgetSend(false);
  };

  const signupUser = async (name: string, email: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(endpoints.auth.easyRegisterSubscribe, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, gender: '', country: '' }),
      });
      const data = await res.json();

      if (data.ok) {
        const { token, newUser } = data;
        await auth.signInPostRegister(token).then(async (res: any) => {
          toast.success('¡Cuenta creada! Revisa tu correo para confirmar.');
          close();
          const userEmail = newUser?.email || res?.user?.email || auth.user?.email;
          const userId = newUser?._id || res?.user?._id || auth.user?._id;
          if (userEmail && userId) {
            const planIntentExecuted = await executePlanIntent(userEmail, userId, router);
            if (!planIntentExecuted) {
              const redirectUrl = getAndClearRedirectUrl();
              if (redirectUrl) setTimeout(() => router.push(redirectUrl), 500);
            }
          } else {
            const redirectUrl = getAndClearRedirectUrl();
            if (redirectUrl) setTimeout(() => router.push(redirectUrl), 500);
          }
        }).catch(console.error);
      } else if (data?.error) {
        setErrorMessage(data.error);
        toast.error(data.error);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al crear la cuenta';
      setErrorMessage(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const signinUser = async (email: string, password: string) => {
    setLoading(true);
    setErrorMessage(null);
    await auth.signIn(email, password).then(async (res: any) => {
      if (res?.type === 'error') {
        setErrorMessage(res?.message ?? 'Error al ingresar');
        setLoading(false);
        return;
      }
      toast.success('¡Login exitoso!');
      close();
      const userEmail = res?.user?.email ?? auth.user?.email;
      const userId = res?.user?._id ?? auth.user?._id;
      if (userEmail && userId) {
        const planIntentExecuted = await executePlanIntent(userEmail, userId, router);
        if (!planIntentExecuted) {
          const redirectUrl = getAndClearRedirectUrl();
          if (redirectUrl) setTimeout(() => router.push(redirectUrl), 500);
        }
      } else {
        const redirectUrl = getAndClearRedirectUrl();
        if (redirectUrl) setTimeout(() => router.push(redirectUrl), 500);
      }
    });
  };

  const forgetPassword = async (email: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await auth.resetPasswordSendMailchamp(email);
      if (data?.error) {
        setErrorMessage(data.error);
        setLoading(false);
        return;
      }
      toast.success(data?.message);
      setForgetSend(true);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error ?? 'Error al enviar');
    }
    setLoading(false);
  };

  const onSubmit = async (data: any) => {
    const { name, email, password } = data;
    if (loginForm && !forgetForm) await signinUser(email, password);
    else if (loginForm && forgetForm) await forgetPassword(email);
    else await signupUser(name, email);
  };

  const modalCard = (
    <div className="relative w-full max-w-[400px] rounded-2xl bg-palette-cream shadow-2xl border border-palette-stone/20">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-palette-stone/30 px-6 py-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-palette-stone font-medium">
            {forgetForm ? 'Recuperar' : loginForm ? 'Acceso' : 'Registro'}
          </p>
          <h2 className="mt-0.5 text-xl font-semibold text-palette-ink">
            {forgetSend
              ? 'Revisá tu correo'
              : forgetForm
                ? 'Recuperar contraseña'
                : loginForm
                  ? 'Ingresá a tu cuenta'
                  : 'Crear cuenta'}
          </h2>
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded-full p-1.5 text-palette-stone hover:bg-palette-stone/10 hover:text-palette-ink transition"
          aria-label="Cerrar"
        >
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 py-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <MiniLoadingSpinner />
          </div>
        ) : forgetSend ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-palette-sage/10 text-palette-sage">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-palette-ink font-medium">Te enviamos un enlace a tu email.</p>
            <p className="mt-1 text-sm text-palette-stone">Revisá la bandeja de entrada y el spam.</p>
            <button
              type="button"
              onClick={() => { setForgetSend(false); setForgetForm(false); }}
              className="mt-6 text-sm font-medium text-palette-sage hover:text-palette-ink underline"
            >
              Volver al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!loginForm && !forgetForm && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-palette-ink mb-1.5">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  className={`${inputBase} ${errorMessage ? inputError : 'border-palette-stone/40'}`}
                  {...register('name', { required: true })}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-palette-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@gmail.com"
                className={`${inputBase} ${errorMessage ? inputError : 'border-palette-stone/40'}`}
                {...register('email', { required: true })}
              />
              {errorMessage && (
                <p className="mt-1.5 text-xs text-soft-error">{errorMessage}</p>
              )}
            </div>

            {loginForm && !forgetForm && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-palette-ink mb-1.5">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`${inputBase} ${errorMessage ? inputError : 'border-palette-stone/40'}`}
                  {...register('password', { required: true })}
                />
                <button
                  type="button"
                  onClick={() => { setForgetForm(true); setErrorMessage(null); }}
                  className="mt-1.5 text-xs text-palette-sage hover:text-palette-ink font-medium"
                >
                  Olvidé mi contraseña
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl bg-palette-ink py-3.5 text-sm font-semibold text-palette-cream shadow-lg transition hover:bg-palette-ink/90 focus:outline-none focus:ring-2 focus:ring-palette-sage focus:ring-offset-2 active:scale-[0.99]"
            >
              {forgetForm ? 'Enviar enlace' : loginForm ? 'Ingresar' : 'Crear cuenta'}
            </Button>

            {!forgetForm && (
              <p className="text-center text-sm text-palette-stone">
                {loginForm ? (
                  <>
                    ¿No tenés cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setLoginForm(false); setErrorMessage(null); }}
                      className="font-medium text-palette-sage hover:text-palette-ink underline"
                    >
                      Registrate
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tenés cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => { setLoginForm(true); setErrorMessage(null); }}
                      className="font-medium text-palette-sage hover:text-palette-ink underline"
                    >
                      Ingresá acá
                    </button>
                  </>
                )}
              </p>
            )}

            {!loginForm && !forgetForm && (
              <p className="text-xs text-palette-stone text-center leading-relaxed">
                Al registrarte aceptás{' '}
                <Link href="/privacy" target="_blank" className="text-palette-ink hover:underline">Privacidad</Link>
                {' y '}
                <a href="/documents/terms-and-conditions.pdf" download target="_blank" rel="noopener noreferrer" className="text-palette-ink hover:underline">Términos</a>.
              </p>
        )}
      </form>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {snap.loginForm && (
        <m.div
          key="login-modal"
          variants={overlayVariants}
          initial={false}
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[300] flex items-end justify-center bg-palette-ink/60 p-4 md:items-center md:p-6 font-montserrat"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <m.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-h-[90vh] overflow-y-auto flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {modalCard}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
