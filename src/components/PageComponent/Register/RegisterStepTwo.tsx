import React, { useState } from 'react';
import { toast } from '../../../hooks/useToast';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { addStepTwo } from '../../../redux/features/register';
import './registerStyle.css';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import { Field, Input, Label } from '@headlessui/react';
import {
  authBtnGhostClass,
  authBtnPrimaryClass,
  authFormEyebrowClass,
  authFormInputClass,
  authFormLabelClass,
  authFormSubtitleClass,
  authFormTitleClass,
} from '../../../constants/authFormDesign';

interface Props {
  step2ToStep3: any;
  step2ToStep1: any;
  signUp: any;
}

const RegisterStepTwo = ({ step2ToStep3, step2ToStep1, signUp }: Props) => {
  const register = useAppSelector(
    (state) => state.registerReducer.value
  );

  const [password, setPassword] = useState(register.password);
  const [confirmPassword, setConfirmPassword] = useState(register.confirmPassword);
  const dispatch = useDispatch<AppDispatch>();


  const handleClick = (e: any) => {
    if (password != confirmPassword) {
      toast.error('Las contraseñas no coinciden');
    } else if (password.length < 8) {
      toast.error('La contraseña debe contener almenos 8 caracteres');
    } else {
      dispatch(addStepTwo({ password, confirmPassword }));
      signUp(e, password, confirmPassword);
    }
  };

  const handleClickBack = () => {
      dispatch(addStepTwo({ password, confirmPassword }));
      step2ToStep1();
  };

  const keyDownHandler = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleClick(event);
    }
  };
  return (
    <div className="w-full space-y-7 md:space-y-8">
      <div className="space-y-2 text-center">
        <div className={authFormEyebrowClass}>
          <span>Paso 2 de 2</span>
        </div>
        <h1 className={authFormTitleClass}>Crea tu clave</h1>
        <p className={authFormSubtitleClass}>Elige una contraseña segura y confirmala.</p>
      </div>

      <div className="space-y-4">
          <Field>
            <Label className={authFormLabelClass}>Contraseña</Label>
            <Input
              value={password}
              type='password'
              placeholder='Contraseña'
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={keyDownHandler}
              className={authFormInputClass}
            />
          </Field>
          <Field>
            <Label className={authFormLabelClass}>Confirmar contraseña</Label>
            <Input
              value={confirmPassword}
              type='password'
              placeholder='Confirmar contraseña'
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={keyDownHandler}
              className={authFormInputClass}
            />
          </Field>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
          <button type="button" onClick={handleClickBack} className={authBtnGhostClass}>
            Volver
          </button>
          <button type="button" onClick={(e: any) => handleClick(e)} className={authBtnPrimaryClass}>
            Registrarme <ArrowRightIcon className="w-4" />
          </button>
        </div>
    </div>
  );
};

export default RegisterStepTwo;
