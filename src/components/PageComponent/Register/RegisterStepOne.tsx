import { countries } from '../../../constants/countries';
import { genders } from '../../../constants/genders';
import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { toast } from '../../../hooks/useToast';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { addStepOne } from '../../../redux/features/register';
import './registerStyle.css';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import { Field, Input, Label, Select } from '@headlessui/react';

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
    <div className="w-full flex justify-center md:min-w-[500px] min-w-[350px]">
      <div className="w-full max-w-lg mx-auto bg-[#0f1115]/85 text-white shadow-2xl px-4 rounded-3xl overflow-hidden backdrop-blur p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs uppercase tracking-[0.2em]">
            <span>Paso 1 de 2</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">Tu perfil</h1>
          <p className="text-sm md:text-lg text-white/70">Completa tus datos personales.</p>
        </div>

        <div className='space-y-4'>
          <Field>
            <Label className="text-xs md:text-sm font-medium text-white">Nombre</Label>
            <Input
              className="mt-1 block w-full rounded-lg border-0 bg-white/5 py-3 px-4 md:py-4 md:px-5 text-sm md:text-base text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
              type='text'
              placeholder='Nombre'
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </Field>
          <Field>
            <Label className="text-xs md:text-sm font-medium text-white">Apellido</Label>
            <Input
              value={lastname}
              type='text'
              placeholder='Apellido'
              onChange={(e) => setLastname(e.target.value)}
              onKeyDown={keyDownHandler}
              className="mt-1 block w-full rounded-lg border-0 bg-white/5 py-3 px-4 md:py-4 md:px-5 text-sm md:text-base text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
            />
          </Field>
          <Field>
            <Label className="text-xs md:text-sm font-medium text-white">Género</Label>
            <div className="relative">
              <Select
                className="mt-1 block w-full appearance-none rounded-lg border-0 bg-white/5 py-3 px-4 md:py-4 md:px-5 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 *:text-black"
                placeholder={gender || 'Género'}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                {genders.map(x => (
                  <option key={x.label} className='text-black' value={x.label}>{x.label}</option>
                ))}
              </Select>
              <ChevronDownIcon
                className="group pointer-events-none absolute top-3 md:top-4 right-3 md:right-4 w-4 h-4 md:w-5 md:h-5 fill-white/60"
                aria-hidden="true"
              />
            </div>
          </Field>
          <Field>
            <Label className="text-xs md:text-sm font-medium text-white">País</Label>
            <div className="relative">
              <Select
                className="mt-1 block w-full appearance-none rounded-lg border-0 bg-white/5 py-3 px-4 md:py-4 md:px-5 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 *:text-black"
                placeholder={country || 'País'}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map(x => (
                  <option key={x.label} className='text-black' value={x.label}>{x.label}</option>
                ))}
              </Select>
              <ChevronDownIcon
                className="group pointer-events-none absolute top-3 md:top-4 right-3 md:right-4 w-4 h-4 md:w-5 md:h-5 fill-white/60"
                aria-hidden="true"
              />
            </div>
          </Field>
        </div>

        <div className='flex flex-col sm:flex-row sm:justify-between gap-3 pt-2'>
          <button
            type='button'
            onClick={handleClickBack}
            className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 text-white py-3 px-6 text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all'
          >
            Volver
          </button>
          <button
            type='button'
            onClick={handleClick}
            className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01]'
          >
            Siguiente <ArrowRightIcon className='w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterStepOne;
