'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MiniLoadingSpinner } from '../../MiniLoadingSpinner';
import { routes } from '../../../constants/routes';
import Link from 'next/link';
import ErrorComponent from '../../AlertComponent';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import './resetStyle.css';
import AlertComponent from '../../AlertComponent';
import { alertTypes } from '../../../constants/alertTypes';

interface Props {
  token: string
}

function ResetForm({ token }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<any>([])
  const auth = useAuth();
  const router = useRouter()
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
      message.some((mes: any) => mes.type === alertTypes.success.type) && router.push('/login');
    }, 3000)
    setTimeout(() => {
      const copy = [...message]
      if(message.some((mes: any) => mes.type === alertTypes.error.type)) {
        setMessage((c: any) => copy.filter(mes => mes.type != alertTypes.error.type));
      }
    }, 5000)
  }, [message])

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
          }]);
          return
        }
        setMessage((current: any) => [...current, {
          message: data?.message,
          type: alertTypes.success.type
        }]);
      } catch (error: any) {
        setMessage((current: any) => [...current, {
          message: error?.response?.data?.error,
          type: alertTypes.error.type
        }]);
      }

      
  };

  return (
    <div className="main-container">
      <div className="background-image background-gradient">
          <Image
            src='/images/image00029.jpeg'
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='image-gradient'
          />
        <div className="left-container">
        <h1 className="title font-boldFont">MForMove Platform</h1>
        <p className="text !mt-0">Moverse es el medio para reconocerse</p>
          <div className="about-us-btn-container">
          <a href="/select-plan" className="about-us-btn !py-3 rounded-full !px-3">Membresias</a>          
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="right-card-container">
          <form className="form-container" action={changePassword}>
            <h1 className="sub-title">Cambiar contraseña</h1>
            <p className="sub-p">Elige tus nuevas credenciales.</p>
            <div className="input-container mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <input id="password" className="input-login" type="password" name="password" placeholder="Contraseña" />
            </div>
            <div className="input-container mb-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <input className="input-login" type="password" name="passwordCheck" id="passwordCheck" placeholder="Confirmar contraseña" />
            </div>
            <p
              className={`capslock ${
                !capsLock && 'hidden'
              }`}
            >
              Bloq Mayús Activado
            </p>
            <div className='relative'>
              <button type="submit" className="login-btn">Enviar </button>
              {loading && <MiniLoadingSpinner />}
            </div>
            <div className="flex justify-between mt-4">
            <Link href={routes.user.login}>
              <span className="links">Ingresar a mi cuenta</span>
            </Link>
            <Link href={routes.user.register}>
              <span className="links">¿No tienes una cuenta todavía?</span>
              </Link>
            </div>
          </form>
        </div>
        {message?.map((mes: any) => (
          <AlertComponent type={mes.type} message={mes.message}/>
        ))} 
      </div>
    </div>
  );
}

export default ResetForm;
