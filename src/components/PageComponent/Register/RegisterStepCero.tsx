import imageLoader from '../../../../imageLoader';
import { LoadingSpinner } from '../../LoadingSpinner';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from '../../../hooks/useToast';
import endpoints from '../../../services/api';
import { addEmail, addStepOne, addStepTwo } from '../../../redux/features/register'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../redux/store';
import './registerStyle.css';
import { useAppSelector } from '../../../redux/hooks';
import { Button, Input } from '@headlessui/react';
import {
  authBtnPrimaryClass,
  authFormEyebrowClass,
  authFormInputClass,
  authFormSubtitleClass,
  authFormTitleClass,
} from '../../../constants/authFormDesign';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col space-y-6 md:flex-none md:space-y-7">
      <div className="space-y-2 text-center">
        <div className={authFormEyebrowClass}>
          <span>Crear cuenta</span>
        </div>
        <h1 className={authFormTitleClass}>Empecemos por tu email</h1>
        <p className={authFormSubtitleClass}>
          Ingresá tu correo para verificar si ya existe o crear tu acceso.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          className={authFormInputClass}
          placeholder="Correo electrónico"
          value={email}
          type="email"
          onChange={(e: any) => setEmailStep(e.target.value)}
          onKeyDown={keyDownHandler}
        />
        <Button className={authBtnPrimaryClass} type="button" onClick={handleClick}>
          Empezar
        </Button>
        <p className={`text-xs text-amber-200 ${!capsLock && 'hidden'}`}>
          Bloq Mayús Activado
        </p>
      </div>

      <div className="space-y-3 border-t border-palette-cream/10 pt-5">
        <p className="text-center text-sm text-palette-cream/75">
          ¿Ya tenés cuenta?{' '}
          <Link href="/iniciar-sesion" className="font-medium text-palette-sage hover:underline">
            Iniciar sesión
          </Link>
        </p>
        <p className="text-center text-xs text-palette-cream/55 leading-relaxed">
          Al registrarte aceptás{' '}
          <Link href="/privacidad" className="text-palette-cream/70 hover:text-palette-sage hover:underline">
            Privacidad
          </Link>
          {' y '}
          <Link href="/terminos" className="text-palette-cream/70 hover:text-palette-sage hover:underline">
            Términos
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default RegisterStepCero;
