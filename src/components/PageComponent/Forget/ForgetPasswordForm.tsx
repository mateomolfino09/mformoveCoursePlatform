'use client';

import imageLoader from '../../../../imageLoader';
import { routes } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import ErrorComponent from '../../AlertComponent';
import { MiniLoadingSpinner } from '../../MiniLoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import './forgetStyle.css';
import { alertTypes } from '../../../constants/alertTypes';
import AlertComponent from '../../AlertComponent';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'react-toastify';
import LoginModalForm from '../Login/AccountForm';
import MainSideBar from '../../MainSidebar/MainSideBar';
import NewsletterF from '../Index/NewsletterForm';
import Footer from '../../Footer';

function ForgetForm() {
  const [message, setMessage] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const recaptchaRef = useRef<any>();
  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : '';
  const [capsLock, setCapsLock] = useState<boolean>(false);
  // const { executeRecaptcha } = useGoogleReCaptcha()

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

  // const onChange = () => {
  //   if (recaptchaRef.current.getValue()) {
  //     setCaptchaToken(recaptchaRef.current.getValue());
  //   } else {
  //     setCaptchaToken(null);
  //   }
  // };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
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

  const forget = async (data: FormData) => {
    setLoading(true);
    // const captcha = captchaToken;

    const email = data.get('email') as string;

    try {
      //const data = await auth.forgetPasswordSendNoCaptcha(email)
      const data = await auth.resetPasswordSendMailchamp(email);

      if (data?.error) {
        setMessage((current: any) => [
          ...current,
          {
            message: data.error,
            type: alertTypes.error.type
          }
        ]);
        setLoading(false);
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
  };

  return (
    <div>
        <MainSideBar where={"index"}>
          <div className='main-container background-gradient-right'>
            <div className='right-container'>
              <div className='right-card-container'>
              <Image
                  src='/images/image00029.jpeg'
                  // src={srcImg}
                  alt={'image'}
                  fill={true}
                  loader={imageLoader}
                  className='image-gradient-right max-h-screen'
                />

                  <LoginModalForm title={"Recuperar Contraseña"}  submitFunction={forget} buttonTitle={"Recuperar"} showEmail={true} showPassword={false} showForget={false} showLogIn={true}/>
              </div>
              {message?.map((mes: any) => (
                <AlertComponent type={mes.type} message={mes.message} />
              ))}
            </div>
          </div>
          <NewsletterF/>
          <Footer />
      </MainSideBar>

    </div>

  );
}

export default ForgetForm;
