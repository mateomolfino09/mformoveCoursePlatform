import { Answer, ClassesDB, Question, User } from '../../typings';
import {
  ChatBubbleBottomCenterIcon,
  CursorArrowRaysIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsHeart, BsBoxArrowUpRight } from 'react-icons/bs';

interface Props {
  user: User | null
  question: Question
}

const OneQuestion = ({ user, question }: Props) => {
  const [content, setContent] = useState('')
  const [answerOn, setAnswerOn] = useState(0)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter()

  const handleDateReturn = (fecha: Date) => {
    const dias =
      (new Date().getTime() - new Date(fecha).getTime()) / 1000 / 60 / 60 / 24;
    if (dias < 1) {
      const horas = dias * 24;
      if (horas < 1) {
        const min = horas * 60;
        return `hace ${Math.floor(min)} minutos`;
      } else return `hace ${Math.floor(horas)} horas`;
    } else return `hace ${Math.floor(dias)} dias`;
  };

  const createQuestion = async () => {
    setMessage('');
    setMessageType('');
    if (content == '' || content.length < 10) {
      setMessage('Debes escribir una pregunta válida');
      setMessageType('error');
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const classId = question.class?._id;
    const userEmail = user?.email;
    try {
      const { data } = await axios.post(
        '/api/question/createQuestion',
        { userEmail, classId, question: content },
        config
      );
      setMessage('Pregunta creada con éxito');
      setMessageType('mensaje');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      }
  };

  const createAnswer = async (questionId: number) => {
    setMessage('');
    setMessageType('');
    if (answer == '' || answer.length < 1) {
      setMessage('Debes escribir una pregunta válida');
      setMessageType('error');
      return;
    }
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const userId = user?.id;
    try {
      const { data } = await axios.post(
        '/api/question/createAnswer',
        { answer, questionId, userId },
        config
      );
      setMessage('Respuesta creada con éxito');
      setMessageType('mensaje');
      setAnswerOn(0);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      }
  };

  return (
    <div className='p-8 lg:px-4 h-full w-full min-h-screen bg-dark mt-8'>
      <div className='bg-dark-soft rounded-md '>
        
          <div
            className=' w-full h-auto p-1  my-4 ml-2 flex flex-col justify-center items-center px-32'
            key={question.id}
          >
            <div className='max-w-[90vh] h-auto bg-blue-600/20 rounded-md mb-12 mt-4 p-1 flex flex-col md:flex-row justify-start items-start md:items-center'>
                <p className='text-xs whitespace-nowrap'>Respuesta a:</p>
                <h2 className='ml-2'>{question.class.name}</h2>
            </div>
            <div className='flex justify-start items-center space-x-2 w-full'>
              <UserCircleIcon className='h-8' />
              <div className='flex flex-col'>
                <p className='text-sm'> {question.user.name}</p>
                <p className='text-xs text-gray-400'>
                  {' '}
                  {handleDateReturn(new Date(question.createdAt))}
                </p>
              </div>
            </div>
            <div className='relative -left-2 pl-8 ml-6 mt-4 border-l border-[#40587c] w-full'>  
              <div className='flex justify-start items-start space-x-2 relative -left-12'>
                <div className='h-12 w-8 flex flex-col justify-center items-center border rounded-md bg-dark-soft '>
                  <BsHeart className='h-8' />
                  <p className='text-xs pb-1'>0</p>
                </div>
                <p className='text-lg justify-start items-start '> {question.question}</p>
              </div>
              <div className='flex justify-start  text-xs  space-x-1 text-sky-400 hover:underline relative -left-2 w-full'>
                <ChatBubbleBottomCenterIcon className='w-4' />
                <button className='' onClick={() => setAnswerOn(question.id)}>
                  Responder
                </button>
              </div>
            </div>
                {answerOn === question.id ? (
                  <div className='mt-4 px-8 relative h-full w-full'>
                    <label className='inline-block w-full shadow-2xl'>
                      <textarea
                        placeholder='Escribe tu respuesta'
                        className='inputAnswer'
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                      />
                    </label>
                    <div className='w-full absolute flex justify-end -top-4 mt-4 px-8 left-0'>
                      <AiOutlineCloseCircle
                        className='h-4 w-4'
                        onClick={() => setAnswerOn(0)}
                      />
                    </div>
                    <div className='w-full flex justify-end items-center'>
                      <button
                        className='group bg-white text-black hover:text-white hover:border-white border hover:bg-black transition-all duration-200 px-2 mb-2 rounded-md flex mt-1 '
                        onClick={() => createAnswer(question.id)}
                      >
                        <span className='text-sm'>RESPONDER</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {question.answers &&
                      question.answers.length > 0 &&
                      question?.answers.map((answer: Answer, index: number) => (
                        <>
                        <div key={answer.answeredAt.toString()} className={`relative -left-2 pl-8 py-3  ml-6  ${index === question.answers.length - 1 ? 'border-none' : 'border-l border-[#40587c]'} w-full`}>
                          <div className={`content-author flex justify-start items-center space-x-2 relative -left-3 ${index === question.answers.length - 1 ? 'before:left-[-20px]' : 'before:left-[-21px]'}` }>
                            <UserCircleIcon className='h-8' />
                            <div className='flex flex-col'>
                              <p className='text-sm'>
                                {' '}
                                {answer.answerAdmin.name}
                              </p>
                              <p className='text-xs text-gray-400'>
                                {' '}
                                {handleDateReturn(new Date(answer.answeredAt))}
                              </p>
                            </div>
                          </div>
                          <div className='flex justify-start items-center space-x-2 mt-2 pb-2 relative -left-3'>
                            <div className='h-12 w-8 flex flex-col justify-center items-center border rounded-md'>
                              <BsHeart className='h-8' />
                              <p className='text-xs pb-1'>0</p>
                            </div>
                            <p className='text-xs'> {answer.answer}</p>
                          </div>
                        </div>
                        </>
                      ))}
                  </>
                )}
            </div>
      </div>
    </div>
  );
};

export default OneQuestion;
