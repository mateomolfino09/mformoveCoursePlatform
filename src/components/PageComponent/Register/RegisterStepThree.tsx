import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import './registerStyle.css';

interface Props {
  signUp: any;
  recaptchaRef: any;
  step3ToStep2: any;
}

const RegisterStepThree = ({ signUp, recaptchaRef, step3ToStep2 }: Props) => {
  const user = useAppSelector(
    (state) => state.registerReducer.value
  );

  const handleClickBack = () => {
    step3ToStep2();
  };

  function onChangeCaptcha(value: any) {
    if (recaptchaRef && recaptchaRef.current && recaptchaRef.current.reset) {
      recaptchaRef.current.reset();
    }
  }

  const rows = [
    { label: 'Email', value: user.email },
    { label: 'Nombre', value: user.firstname },
    { label: 'Apellido', value: user.lastname },
    { label: 'Género', value: user.gender },
    { label: 'País', value: user.country },
    { label: 'Password', value: user.password },
  ];

  return (
    <div className="w-full flex justify-center md:min-w-[500px]">
      <div className="w-full max-w-lg mx-auto bg-[#0f1115]/85 text-white shadow-2xl px-4 rounded-3xl overflow-hidden backdrop-blur p-6 md:p-8 space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs uppercase tracking-[0.2em]">
            <span>Paso 3 de 3</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">Confirma tus datos</h1>
          <p className="text-sm md:text-lg text-white/70">Revisa que todo esté correcto antes de enviar.</p>
        </div>

        <div className="space-y-3">
          {rows.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:px-5 md:py-4">
              <span className="text-xs md:text-sm uppercase tracking-wide text-white/60">{item.label}</span>
              <span className="text-sm md:text-base text-white break-words">{item.value}</span>
            </div>
          ))}
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
            onClick={(e) => signUp(e)}
            className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01]'
          >
            Registrarme <ArrowRightIcon className='w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterStepThree;
