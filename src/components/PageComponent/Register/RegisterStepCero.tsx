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
        console.log(user)
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
    <div
      className={``}
    >
      {/* Logo position */}
      {loading ? (
        <>
          <LoadingSpinner />
        </>
      ) : (
        <>
          <div className='sub-container font-montserrat mt-8 md:px-24'>
            <h1 className='px-12 font-bold md:px-80 text-2xl md:text-4xl shadow-2xl font-montserrat w-full md:text-center'>
              ¿Pronto para aprender? Ingresa tu email para crear tu cuenta.
            </h1>
          </div>
          <div className='main-input-container !px-12 md:!px-24'>
            <div className='secondary-input-container'>
            <Field>
            <Input
              className={
                'block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 placeholder:text-white placeholder:text-sm shadow-lg'
              }
              placeholder='Correo electrónico'
              value={email}
              type='email'
              onChange={(e: any) => setEmailStep(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </Field>
              {/* <label className='inline-block w-full'>
                <input
                  type='email'
                  id='email'
                  placeholder='Email'
                  className='input-email'
                  value={email}
                  onChange={(e) => setEmailStep(e.target.value)}
                  onKeyDown={keyDownHandler}
                  required
                />
              </label> */}
            </div>
                    <Button className="w-full md:w-80 text-center justify-center inline-flex items-center gap-2 rounded-md bg-white/5 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-white/10 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white" type='button' onClick={() => handleClick()}>
                    Empezar
                    </Button>
          </div>
          <div className='capslock-container'>
            <p className={`capslock ${!capsLock && 'hidden'}`}>
              Bloq Mayús Activado
            </p>
          </div>
          <div className='flex flex-col space-y-2 mt-12 md:px-24'>
          <p className='px-12 font-normal text-sm font-montserrat md:text-xl w-full text-center'>
            "El goce inmediato no da lugar a lo bello, puesto que la belleza de una cosa se manifiesta (mucho después), a la luz de otra, por la significatividad de una reminiscencia. Lo bello responde a la duración, a una síntesis contemplativa. Lo bello no es el resplandor o la atracción fugaz, sino una persistencia, una fosforescencia de las cosas. El aroma del tiempo es una manifestación de la duración.

            </p>
            <p className='px-12 w-full text-xs md:text-lg font-light italic font-montserrat text-center'>
           Byung Chul Han - El aroma del tiempo

            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterStepCero;
