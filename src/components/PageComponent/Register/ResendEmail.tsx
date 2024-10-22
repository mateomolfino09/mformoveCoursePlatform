import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { useAppSelector } from '../../../redux/hooks';
import './registerStyle.css';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const colourStyles: StylesConfig<any> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: '#333',
    height: 55,
    borderRadius: 6,
    padding: 0
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return { ...styles, color: '#808080' };
  },
  input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
  placeholder: (styles) => ({ ...styles, color: '#fff' }),
  singleValue: (styles, { data }) => ({ ...styles, color: '#808080' })
};

interface Props {
  resendEmail: any;
  recaptchaRef: any;
  step3ToStep2: any
}

const ResendEmail = ({ resendEmail, recaptchaRef, step3ToStep2 }: Props) => {
  const router = useRouter();
  const user = useAppSelector(
    (state) => state.registerReducer.value
  );

  useEffect(() => {
    console.log(recaptchaRef)
    recaptchaRef.re
  }, [])
  

  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : '';

  const handleClickBack = () => {
    step3ToStep2();
  };

  function onChangeCaptcha(value: any) {
    //custom fetch and at the end do a reset
   if (recaptchaRef && recaptchaRef.current && recaptchaRef.current.reset) {
        recaptchaRef.current.reset()
    }
}

  return (
    <div>
      {/* Logo position */}
      <div className='flex flex-col items-center justify-center relative mt-24 sm:mt-24 space-y-4 rounded py-12'>
        <AiOutlineCheckCircle className='text-light-red w-12 h-12' />
        <p className='step'>¡Último paso!</p>
        <h1 className='title-step-one'>
          Solo resta que confirmes tus datos!
        </h1>
      </div>
      <div className='w-full flex justify-center items-center space-x-4 mt-3 pb-12'>
      <div onClick={() =>  router.push('/login')} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                <p className='text-white group-hover:text-black'>Volver</p>

        </div>
        <div onClick={(e) => resendEmail(e)} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
            <p className='text-white group-hover:text-black'>Reenviar Email</p>
            <ArrowRightIcon className='w-4 group-hover:text-black ml-2 group-hover:translate-x-1 transition-all duration-500'/>

            </div>
      </div>
    </div>
  );
};

export default ResendEmail;
