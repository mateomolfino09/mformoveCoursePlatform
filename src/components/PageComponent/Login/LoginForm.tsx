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
import './loginStyle.css';
import AlertComponent from '../../AlertComponent';
import { alertTypes } from '../../../constants/alertTypes';

function LoginForm() {
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


  const signinUser = async (data: FormData) => {
    
    setLoading(true);

    const email = data.get('email') as string
    const password = data.get('password') as string

    auth.signIn(email, password).then((res: any) => {
      if(res.type != 'error') {
        router.push('/home');
      } 
      else {
        setMessage((current: any) => [...current, {
          message: res.message,
          type: alertTypes.error.type
        }]);
        setLoading(false);
      } 
    })
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
          <h1 className="title">MForMove Platform</h1>
          <p className="text">Moverse es el medio para reconocerse</p>
          <div className="about-us-btn-container">
            <a href="#" className="about-us-btn">Sobre Nosotros</a>
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="right-card-container">
          <form className="form-container" action={signinUser}>
            <h1 className="sub-title">Sign In</h1>
            <p className="sub-p">Te damos la bienvenida al mundo del movimiento :)</p>
            <div className="input-container mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <input id="email" className="input-login" type="email" name="email" placeholder="Email Address" />
            </div>
            <div className="input-container mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <input className="input-login" type="password" name="password" id="password" placeholder="Password" />
            </div>
            <p
              className={`capslock ${
                !capsLock && 'hidden'
              }`}
            >
              Bloq Mayús Activado
            </p>
            <div className='relative'>
              <button type="submit" className="login-btn">Login </button>
              {loading && <MiniLoadingSpinner />}
            </div>
            <div className="flex justify-between mt-4">
            <Link href={routes.user.forget}>
              <span className="links">¿Olvidaste tu contraseña?</span>
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

export default LoginForm;
