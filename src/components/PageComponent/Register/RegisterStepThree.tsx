import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../../../redux/hooks';
import {
  authBtnGhostClass,
  authBtnPrimaryClass,
  authFormEyebrowClass,
  authFormSubtitleClass,
  authFormTitleClass,
} from '../../../constants/authFormDesign';

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
    <div className="w-full space-y-7 md:space-y-8">
      <div className="space-y-2 text-center">
        <div className={authFormEyebrowClass}>
          <span>Paso 3 de 3</span>
        </div>
        <h1 className={authFormTitleClass}>Confirma tus datos</h1>
        <p className={authFormSubtitleClass}>Revisa que todo esté correcto antes de enviar.</p>
      </div>

      <div className="space-y-3">
          {rows.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 rounded-2xl border border-palette-cream/15 bg-palette-cream/5 px-4 py-3 md:px-5 md:py-4">
              <span className="text-xs md:text-sm uppercase tracking-wide text-palette-cream/55">{item.label}</span>
              <span className="text-sm md:text-base text-palette-cream break-words">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
          <button type="button" onClick={handleClickBack} className={authBtnGhostClass}>
            Volver
          </button>
          <button type="button" onClick={(e) => signUp(e)} className={authBtnPrimaryClass}>
            Registrarme <ArrowRightIcon className="w-4" />
          </button>
        </div>
    </div>
  );
};

export default RegisterStepThree;
