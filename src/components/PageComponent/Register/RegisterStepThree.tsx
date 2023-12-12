import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { useAppSelector } from '../../../redux/hooks';
import './registerStyle.css';

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
  signUp: any;
  onChange: any;
  recaptchaRef: any;
}

const RegisterStepThree = ({ signUp, onChange, recaptchaRef }: Props) => {
  const router = useRouter();
  const user = useAppSelector(
    (state) => state.registerReducer.value
  );

  console.log(user)
  

  const key =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY != undefined
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      : '';

  const handleClick = () => {
    router.push('/login');
  };

  return (
    <div>
      {/* Logo position */}
      <div className='flex flex-col items-center justify-center relative mt-24 sm:mt-24 space-y-4 rounded py-12'>
        <AiOutlineCheckCircle className='text-light-red w-12 h-12' />
        <p className='step'>PASO 3 DE 3</p>
        <h1 className='title-step-one'>
          Solo resta que confirmes tus datos!
        </h1>
      </div>
      <div className='inputs-container'>
        <div className='input-container overflow-visible'>
          <label className='text-white text-base text-start w-24 '>
            Email:
          </label>
          <input
            className='input-step-three'
            type='text'
            value={user.email}
            readOnly
          />
        </div>
        <div className='input-container'>
          <label className='label-step-three'>
            Nombre:
          </label>
          <input
            className='input-step-three'
            type='text'
            value={user.firstname}
            readOnly
          />
        </div>
        <div className='input-container'>
          <label className='label-step-three'>
            Apellido:
          </label>
          <input
            className='input-step-three'
            type='text'
            value={user.lastname}
            readOnly
          />
        </div>
        <div className='input-container'>
          <label className='label-step-three'>
            Género:
          </label>
          <input
            className='input-step-three'
            type='text'
            value={user.gender}
            readOnly
          />
        </div>
        <div className='input-container'>
          <label className='label-step-three'>País:</label>
          <input
            className='input-step-three'
            type='text'
            value={user.country}
            readOnly
          />
        </div>
        <div className='input-container'>
          <label className='label-step-three'>
            Password:
          </label>
          <input
            className='input-step-three'
            type='text'
            value={user.password}
            readOnly
          />
        </div>
      </div>
      <ReCAPTCHA
        onChange={onChange}
        ref={recaptchaRef}
        sitekey={key}
        className='mt-8 mb-6 my-auto relative flex justify-center'
      />
      <div className='flex flex-row items-center justify-evenly relative space-x-8 rounded px-8 md:w-full mb-10'>
        <button
          onClick={() => handleClick()}
          className='siguiente-btn'
        >
          Volver{' '}
        </button>

        <button
          onClick={(e) => signUp(e)}
          className='siguiente-btn'
        >
          Crear Cuenta{' '}
        </button>
      </div>
    </div>
  );
};

export default RegisterStepThree;
