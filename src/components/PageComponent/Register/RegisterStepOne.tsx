import { countries } from '../../../constants/countries';
import { genders } from '../../../constants/genders';
import imageLoader from '../../../../imageLoader';
import { ConsoleConstructorOptions } from 'console';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { addStepOne } from '../../../redux/features/register'
import './registerStyle.css';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';

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
  step1ToStep2: any;
  step1ToStep0: any;
}

const RegisterStepOne = ({ step1ToStep2, step1ToStep0 }: Props) => {

  const register = useAppSelector(
    (state) => state.registerReducer.value
  );

  const [firstname, setFirstname] = useState(register.firstname);
  const [lastname, setLastname] = useState(register.lastname);
  const [gender, setGender] = useState(register.gender);
  const [country, setCountry] = useState(register.country);
  const [capsLock, setCapsLock] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>()

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

  const handleClick = () => {
    if (
      firstname == '' ||
      lastname == '' ||
      gender == '' ||
      country == '' ||
      firstname.length <= 2 ||
      lastname.length <= 2
    ) {
      toast.error(
        'Hay un error en los datos que ingresó, rellene todos los campos o vuelva a intentar'
      );
    } else {
      dispatch(addStepOne({ firstname, lastname, gender, country }))
      step1ToStep2();
    }
  };

  const handleClickBack = () => {
      dispatch(addStepOne({ firstname, lastname, gender, country }))
      step1ToStep0();
  };

  const keyDownHandler = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleClick();
    }
  };

  return (
    <div>
      <div className='stepone-container'>
        <AiOutlineCheckCircle className='check-icon' />
        <p className='step'>PASO 1 DE 2</p>
        <h1 className='title-step-one font-boldFont'>
          Completa tu Nombre, Apellidos, Pais y Género
        </h1>
        <h2 className='subtitle-step-one'>
          Pronto para aprender? Ingresa los datos para crear tu cuenta.
        </h2>
      </div>
      <div className='container-form-stepone'>
        <div className='space-x-4 mb-8 flex'>
          <label className=''>
            <input
              type='nombre'
              placeholder='Nombre'
              className='input transition duration-1000 placeholder:text-light-white'
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </label>
          <label className=''>
            <input
              type='apellido'
              placeholder='Apellidos'
              className='input transition duration-1000 placeholder:text-light-white'
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </label>
        </div>
        <div className='w-full space-x-4 mb-8 flex justify-center'>
          <Select
            options={genders}
            styles={colourStyles}
            placeholder={gender || 'Género'}
            className='w-full sm:w-52'
            value={gender}
            onChange={(e) => {
              return setGender(e.label);
            }}
            onKeyDown={keyDownHandler}
          />
          <Select
            options={countries}
            styles={colourStyles}
            className='w-full sm:w-52'
            placeholder={country || 'País'}
            value={country}
            onChange={(e) => {
              return setCountry(e.label);
            }}
            onKeyDown={keyDownHandler}
          />
        </div>
        <div className='space-x-4 flex ' />
        <div className='w-full flex justify-center items-center space-x-4 mt-3'>
        <div onClick={() =>  handleClickBack()} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Volver</p>

              </div>
        <div onClick={() =>  handleClick()} className='bg-transparent border group hover:bg-light-cream flex justify-center space-x-2 items-center py-2 px-6 w-48 rounded-full cursor-pointer'>
                  <p className='text-white group-hover:text-black'>Siguiente</p>
                  <ArrowRightIcon className='w-4 group-hover:text-black ml-2 group-hover:translate-x-1 transition-all duration-500'/>

              </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStepOne;
