import { useRouter } from 'next/navigation';
import React from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { useAppSelector } from '../../../redux/hooks';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import {
  authBtnGhostClass,
  authBtnPrimaryClass,
  authFormEyebrowClass,
  authFormSubtitleClass,
  authFormTitleClass,
} from '../../../constants/authFormDesign';

interface Props {
  resendEmail: any;
  recaptchaRef: any;
  step3ToStep2: any;
}

const ResendEmail = ({ resendEmail }: Props) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.registerReducer.value);

  return (
    <div className="w-full space-y-7 md:space-y-8">
      <div className="space-y-2 text-center">
        <AiOutlineCheckCircle className="mx-auto h-12 w-12 text-palette-sage" />
        <div className={authFormEyebrowClass}>
          <span>Último paso</span>
        </div>
        <h1 className={authFormTitleClass}>Confirmá tus datos</h1>
        <p className={authFormSubtitleClass}>
          Tu cuenta con <strong className="text-palette-cream">{user.email}</strong> ya existe pero
          falta verificar el correo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="button" onClick={() => router.push('/iniciar-sesion')} className={authBtnGhostClass}>
          Volver
        </button>
        <button type="button" onClick={(e) => resendEmail(e)} className={authBtnPrimaryClass}>
          Reenviar email <ArrowRightIcon className="w-4" />
        </button>
      </div>
    </div>
  );
};

export default ResendEmail;
