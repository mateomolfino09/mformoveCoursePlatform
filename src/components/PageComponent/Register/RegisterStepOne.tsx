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
import {
  authBtnGhostClass,
  authBtnPrimaryClass,
  authFormEyebrowClass,
  authFormInputClass,
  authFormLabelClass,
  authFormSelectClass,
  authFormSubtitleClass,
  authFormTitleClass,
} from '../../../constants/authFormDesign';

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
    <div className="w-full space-y-7 md:space-y-8">
      <div className="space-y-2 text-center">
        <div className={authFormEyebrowClass}>
          <span>Paso 1 de 2</span>
        </div>
        <h1 className={authFormTitleClass}>Tu perfil</h1>
        <p className={authFormSubtitleClass}>Completa tus datos personales.</p>
      </div>

      <div className="space-y-4">
          <Field>
            <Label className={authFormLabelClass}>Nombre</Label>
            <Input
              className={authFormInputClass}
              type='text'
              placeholder='Nombre'
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              onKeyDown={keyDownHandler}
            />
          </Field>
          <Field>
            <Label className={authFormLabelClass}>Apellido</Label>
            <Input
              value={lastname}
              type='text'
              placeholder='Apellido'
              onChange={(e) => setLastname(e.target.value)}
              onKeyDown={keyDownHandler}
              className={authFormInputClass}
            />
          </Field>
          <Field>
            <Label className={authFormLabelClass}>Género</Label>
            <div className="relative">
              <Select
                className={`${authFormSelectClass} *:text-gray-900 *:bg-white`}
                placeholder={gender || 'Género'}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                {genders.map(x => (
                  <option key={x.label} className='text-gray-900 bg-white' value={x.label}>{x.label}</option>
                ))}
              </Select>
              <ChevronDownIcon
                className="group pointer-events-none absolute top-3 md:top-4 right-4 w-4 h-4 md:w-5 md:h-5 text-palette-cream/60"
                aria-hidden="true"
              />
            </div>
          </Field>
          <Field>
            <Label className={authFormLabelClass}>País</Label>
            <div className="relative">
              <Select
                className={`${authFormSelectClass} *:text-gray-900 *:bg-white`}
                placeholder={country || 'País'}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {countries.map(x => (
                  <option key={x.label} className='text-gray-900 bg-white' value={x.label}>{x.label}</option>
                ))}
              </Select>
              <ChevronDownIcon
                className="group pointer-events-none absolute top-3 md:top-4 right-4 w-4 h-4 md:w-5 md:h-5 text-palette-cream/60"
                aria-hidden="true"
              />
            </div>
          </Field>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
          <button type="button" onClick={handleClickBack} className={authBtnGhostClass}>
            Volver
          </button>
          <button type="button" onClick={handleClick} className={authBtnPrimaryClass}>
            Siguiente <ArrowRightIcon className="w-4" />
          </button>
        </div>
    </div>
  );
};

export default RegisterStepOne;
