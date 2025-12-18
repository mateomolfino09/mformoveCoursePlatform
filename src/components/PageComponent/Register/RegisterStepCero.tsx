import imageLoader from '../../../../imageLoader';
import { LoadingSpinner } from '../../LoadingSpinner';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import endpoints from '../../../services/api';
import { addEmail, addStepOne, addStepTwo } from '../../../redux/features/register'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../redux/store';
import './registerStyle.css';
import { useAppSelector } from '../../../redux/hooks';
import { Button, Description, Field, Input, Label } from '@headlessui/react';

interface Props {
  step0ToStep1: any;
  step0ToResend: any
}

const RegisterStepCero = ({ step0ToStep1, step0ToResend }: Props) => {
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>()

  const register = useAppSelector(
    (state) => state.registerReducer.value
  );

  const [email, setEmailStep] = useState(register.email);


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

  const handleClick = async () => {
    if (!email.includes('@')) {
      toast.error('Ingresa un email válido');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(endpoints.auth.verifyEmail(email), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if(data.resend) {
        let user = data.user;
        dispatch(addEmail(user.email))
        step0ToResend()
      }

      if(data.error) {
        toast.error(data.error)
        setLoading(false);
        return
      } 

      dispatch(addEmail(email))
      step0ToStep1();
    } catch (error: any) {
      const data = await error.json()

      toast.error(data.response.data.message);
    }

    setLoading(false);
  };

  const keyDownHandler = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleClick();
    }
  };

  return (
    <div className="w-full flex justify-center md:min-w-[500px]">
      {loading ? (
        <div className="py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="w-full max-w-lg mx-auto bg-[#0f1115]/85 text-white shadow-2xl px-4 rounded-3xl overflow-hidden backdrop-blur p-6 md:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs uppercase tracking-[0.2em]">
              <span>Crear cuenta</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">Empecemos por tu email</h1>
            <p className="text-sm md:text-lg text-white/70">
              Ingresá tu correo para verificar si ya existe o crear tu acceso.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              className="block w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm/6 text-white placeholder:text-white/60 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/30"
              placeholder='Correo electrónico'
              value={email}
              type='email'
              onChange={(e: any) => setEmailStep(e.target.value)}
              onKeyDown={keyDownHandler}
            />
            <Button
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-white/50"
              type='button'
              onClick={handleClick}
            >
              Empezar
            </Button>
            <p className={`text-xs text-amber-200 ${!capsLock && 'hidden'}`}>
              Bloq Mayús Activado
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterStepCero;
