'use client'
import React, { useEffect } from 'react'
import { Question } from '../../../typings';
import OneQuestion from '../../components/Question';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import { AiOutlineUser } from 'react-icons/ai';
import { routes } from '../../constants/routes';

interface Props {
  question: Question
}

const QuestionPage = ({ question }: Props) => {
  const router = useRouter();
  const auth = useAuth()

  const handleRouteChange = async (route: string) => {
    router.push(route);
  };

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/iniciar-sesion');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);

  return (
    <div>
      <header className={`bg-dark`}>
        <div onClick={() => handleRouteChange('/mentoria')}>
          <img
            alt='Logo Video Stream'
            src='/images/logoWhite.png'
            width={80}
            height={80}
            className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-70 hover:opacity-90'
          />
        </div>
        <AiOutlineUser className='h-6 w-6 cursor-pointer' />
      </header>
      <OneQuestion user={auth.user} question={question} />
  </div>
  )
}

export default QuestionPage

