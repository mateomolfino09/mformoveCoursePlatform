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
          <div className='sub-container font-montserrat'>
            <h1 className='title font-boldFont'>
              Es hora de moverse...
            </h1>
            <h2 className='subtitle font-boldFont'>
              ¿Pronto para aprender? Ingresa tu email para crear tu cuenta.
            </h2>
          </div>
          <div className='main-input-container'>
            <div className='secondary-input-container'>
              <label className='inline-block w-full'>
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
              </label>
            </div>
            <button
              onClick={() => handleClick()}
              className='empezar-btn'
            >
              Empezar!{' '}
            </button>
          </div>
          <div className='capslock-container'>
            <p className={`capslock ${!capsLock && 'hidden'}`}>
              Bloq Mayús Activado
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterStepCero;
