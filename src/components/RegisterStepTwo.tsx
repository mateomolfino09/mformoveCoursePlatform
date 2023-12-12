import React, { useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import { AppDispatch } from '../redux/store';
import { useDispatch } from 'react-redux';
import { addStepTwo } from '../redux/features/register'

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
  step2ToStep3: any;
  setData: any;
}

const RegisterStepOne = ({ step2ToStep3, setData }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>()


  const handleClick = () => {
    if (password != confirmPassword) {
      toast.error('Las contraseñas no coinciden');
    } else if (password.length < 8) {
      toast.error('La contraseña debe contener almenos 8 caracteres');
    } else {
      dispatch(addStepTwo({ password, confirmPassword }))
      setData(password, confirmPassword);
      step2ToStep3();
    }
  };
  const keyDownHandler = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleClick();
    }
  };
  return (
    <div
      className={`h-full w-full relative flex flex-col md:items-center md:justify-center bg-white`}
    >
      {/* Logo position */}
      <div className='flex flex-col items-center justify-center relative mt-20 sm:mt-24 space-y-4 rounded py-12 '>
        <AiOutlineCheckCircle className='text-dark-gold w-12 h-12' />
        <p className='font-extralight text-black text-base'>PASO 2 DE 3</p>
        <h1 className='font-extrabold text-4xl text-center text-black'>
          Ya estamos por terminar!
        </h1>
        <h2 className='font-normal text-xl text-center text-black'>
          Crea una contraseña segura para tu cuenta
        </h2>
      </div>
      <div className='flex flex-col items-center justify-center relative space-y-8 rounded px-8 md:w-full'>
        <div className='space-x-4 flex'>
          <label className=''>
            <input
              type='password'
              placeholder='Contraseña'
              className='input transition duration-1000'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </label>
          <label className=''>
            <input
              type='password'
              placeholder='Confirmar Contraseña'
              className='input transition duration-1000'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </label>
        </div>
        <div className='space-x-4 flex' />
        <button
          onClick={() => handleClick()}
          className='w-40 bg-black/70 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold  '
        >
          Siguiente!{' '}
        </button>
      </div>
    </div>
  );
};

export default RegisterStepOne;
