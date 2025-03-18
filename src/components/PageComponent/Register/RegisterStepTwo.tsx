import React, { useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { addStepTwo } from '../../../redux/features/register'
import './registerStyle.css';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import { Field, Input, Label } from '@headlessui/react';

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
  step2ToStep1: any
  signUp: any
}

const RegisterStepTwo = ({ step2ToStep3, step2ToStep1, signUp }: Props) => {
  const register = useAppSelector(
    (state) => state.registerReducer.value
  );

  const [password, setPassword] = useState(register.password);
  const [confirmPassword, setConfirmPassword] = useState(register.confirmPassword);
  const dispatch = useDispatch<AppDispatch>()


  const handleClick = (e: any) => {
    if (password != confirmPassword) {
      toast.error('Las contraseñas no coinciden');
    } else if (password.length < 8) {
      toast.error('La contraseña debe contener almenos 8 caracteres');
    } else {
      dispatch(addStepTwo({ password, confirmPassword }))
      signUp(e, password, confirmPassword)
    }
  };

  const handleClickBack = () => {
      dispatch(addStepTwo({ password, confirmPassword }))
      step2ToStep1();
  };

  const keyDownHandler = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleClick(event);
    }
  };
  return (
    <div
      className='w-[100vw] h-full px-1'
    >
      {/* Logo position */}
      <div className='flex flex-col items-center justify-center relative mt-0 sm:mt-24 space-y-4 rounded py-2 '>
        <AiOutlineCheckCircle className='check-icon' />
        <p className='step'>PASO 2 DE 2</p>
        <h1 className='title-step-one font-montserrat'>
          ¡Ya estamos por terminar!
        </h1>
      </div>
      <div className='flex flex-col items-center justify-center relative space-y-4 rounded px-8 w-full'>
        <div className=' w-full md:w-96 space-y-3 md:space-y-0 flex flex-col'>
          <Field>
          <Label className="text-xs font-medium text-white">Contraseña</Label>
          <Input
            value={password}
            type='password'
            placeholder='Contraseña'
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={keyDownHandler}
            className="mt-1 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
          />
        </Field>
        <Field>
          <Label className="text-xs font-medium text-white">Confirmar Contraseña</Label>
          <Input
            value={confirmPassword}
            type='password'
            placeholder='Confirmar Contraseña'
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={keyDownHandler}
            className="mt-1 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
          />
        </Field>
        </div>
        <div className='space-x-4 flex' />
        <div className='w-full flex justify-center items-center space-x-4 mt-3 pb-12'>
        <div onClick={() =>  handleClickBack()} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Volver</p>

              </div>
        <div onClick={(e: any) =>  handleClick(e)} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Registrarme</p>
                  <ArrowRightIcon className='w-4 group-hover:text-black ml-2 group-hover:translate-x-1 transition-all duration-500'/>

              </div>
        </div>
        {/* <div className='w-full flex flex-col justify-center items-center space-y-2 md:space-y-0 md:space-x-4 md:mt-3'>
        <div onClick={() =>  handleClickBack()} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Volver</p>

              </div>
        <div onClick={(e: any) =>  handleClick(e)} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Registrarme</p>
                  <ArrowRightIcon className='w-4 group-hover:text-black ml-2 group-hover:translate-x-1 transition-all duration-500'/>
              </div>
        </div> */}
      </div>
    </div>
  );
};

export default RegisterStepTwo;
