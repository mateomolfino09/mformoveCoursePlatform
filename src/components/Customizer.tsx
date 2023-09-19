import {
  fadeAnimation,
  slideAnimation,
  slideAnimationTabs
} from '../config/motion';
import { CoursesDB, User } from '../../typings';
import state from '../valtio';
import CustomButton from './CustomButton';
import axios from 'axios';
import { AnimatePresence, motion as m } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

interface Props {
  course: CoursesDB;
  user: User | null;
}

const Customizer = ({ user, course }: Props) => {
  const snap = useSnapshot(state);
  const email = user?.email;
  const courseId = course.id;
  const FORM_ID = 'payment-form';
  const [preferenceId, setPreferenceId] = useState(null);
  const [initPoint, setInitPoint] = useState('');
  const router = useRouter();

  const handleClick = () => {
    state.intro = false;
  };
  //obtengo el preferenceId
  useEffect(() => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    axios
      .post('/api/course/payments/userPurchase', { email, courseId }, config)
      .then((data: any) => {
        setInitPoint(data.data.data.init_point);
        // setPreferenceId(data.data.id)
      });
  }, [courseId]);

  useEffect(() => {
    if (preferenceId) {
      handlScriptAdd(preferenceId);
    }
  }, [preferenceId]);

  const handleRouteChange = async (route: string) => {
    router.push(route);
  };

  const handlScriptAdd = (preferenceId: any) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://www.mercadopago.cl/integrations/v1/web-payment-checkout.js';
    script.setAttribute('data-preference-id', preferenceId);
    const form = document.getElementById(FORM_ID);
    form?.appendChild(script);
  };
  return (
    <>
      {!snap.intro && (
        <>
          <m.div className='absolute z-10 top-0 right-5' {...fadeAnimation}>
            <CustomButton
              title='Volver'
              handleClick={() => (state.intro = true)}
              customStyles='h-10 w-20 mt-0 font-bold text-sm'
            />
          </m.div>
          <div className='absolute z-10 top-1/2 left-1/2 right-5 w-32'>
            <div className='h-10 w-20 mt-0 font-bold text-sm bg-white' />
          </div>
        </>
      )}
    </>
  );
};

export default Customizer;
