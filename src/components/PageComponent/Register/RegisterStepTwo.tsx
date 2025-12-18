import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { addStepTwo } from '../../../redux/features/register';
import './registerStyle.css';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import { Field, Input, Label } from '@headlessui/react';

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
    <div className="w-full flex justify-center md:min-w-[500px]">
      <div className="w-full max-w-lg mx-auto bg-[#0f1115]/85 text-white shadow-2xl px-4 rounded-3xl overflow-hidden backdrop-blur p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs uppercase tracking-[0.2em]">
            <span>Paso 2 de 2</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">Crea tu clave</h1>
          <p className="text-sm md:text-lg text-white/70">Elige una contraseña segura y confirmala.</p>
        </div>

        <div className='space-y-4'>
          <Field>
            <Label className="text-xs font-medium text-white">Contraseña</Label>
            <Input
              value={password}
              type='password'
              placeholder='Contraseña'
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={keyDownHandler}
              className="mt-1 block w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
            />
          </Field>
          <Field>
            <Label className="text-xs font-medium text-white">Confirmar contraseña</Label>
            <Input
              value={confirmPassword}
              type='password'
              placeholder='Confirmar contraseña'
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={keyDownHandler}
              className="mt-1 block w-full rounded-lg border-0 bg-white/5 py-2 px-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2"
            />
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
            onClick={(e: any) => handleClick(e)}
            className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01]'
          >
            Registrarme <ArrowRightIcon className='w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterStepTwo;
