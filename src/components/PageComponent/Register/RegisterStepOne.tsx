import { countries } from '../../../constants/countries';
import { genders } from '../../../constants/genders';
import imageLoader from '../../../../imageLoader';
import { ConsoleConstructorOptions } from 'console';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { addStepOne } from '../../../redux/features/register'
import './registerStyle.css';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import { Description, Field, Input, Label, Select } from '@headlessui/react';
import { StylesConfig } from 'react-select';

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
  const [gender, setGender] = useState(register.gender != "" ? register.gender : genders[0].label);
  const [country, setCountry] = useState(register.country != "" ? register.country : countries[0].label);
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
    <div className='w-[100vw] h-full px-6'>
      <div className='stepone-container md:mb-12'>
        <AiOutlineCheckCircle className='check-icon' />
        <p className='step'>PASO 1 DE 2</p>
        <h1 className='title-step-one  font-montserrat'>
          Completa tu Nombre, Apellidos, Pais y Género
        </h1>
      </div>
      <div className='container-form-stepone'>
        <div className='space-y-4 mb-3 flex flex-col w-full md:w-96'>
          <Field>
          <Label className="text-xs font-medium text-white">Nombre</Label>
          <Input
            className="mt-1 block w-full  rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
            type='text'
            placeholder='Nombre'
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            onKeyDown={keyDownHandler}
          />
        </Field>
          <Field>
          <Label className="text-xs font-medium text-white">Apellido</Label>
          <Input
            value={lastname}
            type='apellido'
            placeholder='Apellido'
            onChange={(e) => setLastname(e.target.value)}
            onKeyDown={keyDownHandler}
            className="mt-1 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
          />
        </Field>
        </div>
        <div className='w-full md:w-96 space-y-4 mb-7 flex flex-col justify-center'>
        <Field>
        <Label className="text-xs font-medium text-white">Género</Label>
        <div className="relative">
        <Select
            className="mt-1 block w-full appearance-none rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 *:text-black"
            placeholder={gender || 'Género'}
            value={gender}
            onChange={(e) => {
              return setGender(e.target.value);
            }}
          >
            {genders.map(x => (
              <>
                <option className='text-black' value={x.label}>{x.label}</option>
              </>
            ))}
          </Select>
          <ChevronDownIcon
            className="group pointer-events-none absolute top-2.5 right-2.5 w-4 h-4 fill-white/60"
            aria-hidden="true"
          />
        </div>
      </Field>
      <Field>
        <Label className="text-xs font-medium text-white">País</Label>
        <div className="relative">
        <Select
            className="mt-1 block w-full appearance-none rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 *:text-black"
            placeholder={country || 'País'}
            value={country}
            onChange={(e) => {
              return setCountry(e.target.value);
            }}
          >
            {countries.map(x => (
              <>
                <option className='text-black' value={x.label}>{x.label}</option>
              </>
            ))}
          </Select>
          <ChevronDownIcon
            className="group pointer-events-none absolute top-2.5 right-2.5 w-4 h-4 fill-white/60"
            aria-hidden="true"
          />
        </div>
      </Field>
          {/* <Select
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
          /> */}
        </div>
        <div className='space-x-4 flex ' />
        <div className='w-full flex justify-center items-center space-x-4 mt-3 pb-12'>
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
