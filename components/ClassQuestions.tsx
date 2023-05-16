import { Answer, ClassesDB, Question, User } from '../typings';
import {
  ChatBubbleBottomCenterIcon,
  CursorArrowRaysIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import React, { useState } from 'react';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsHeart } from 'react-icons/bs';

interface Props {
  user: User | null
  clase: ClassesDB
  questionsDB: Question[]
}

const ClassQuestions = ({ user, clase, questionsDB }: Props) => {
  const [question, setQuestion] = useState(false)
  const [content, setContent] = useState('')
  const [answerOn, setAnswerOn] = useState(0)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    ...questionsDB.reverse()
  ]);
  const [messageType, setMessageType] = useState('');

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
    const classId = clase?._id;
    const userEmail = user?.email;
    try {
      const { data } = await axios.post(
        '/api/question/createQuestion',
        { userEmail, classId, question: content },
        config
      );
      setQuestions([data.question, ...questions]);
      setMessage('Pregunta creada con éxito');
      setMessageType('mensaje');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.log(error);
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
      const index = questions.findIndex((q) => q.id == questionId);
      let q = [...questions];
      q[index] = data.question;
      setQuestions([...q]);
      setMessage('Respuesta creada con éxito');
      setMessageType('mensaje');
      setAnswerOn(0);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='p-8 lg:pr-4'>
      <div className='w-full h-full  flex flex-col mb-4 relative'>
        <label className='inline-block w-full shadow-2xl'>
          <textarea
            placeholder='Escribe tu pregunta'
            className='input'
            onFocus={() => setQuestion(!question)}
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />
        </label>
        {message !== '' && (
          <p
            className={` ${
              messageType === 'error' ? 'text-red-500' : 'text-green-500'
            } flex justify-start text-xs`}
          >
            {message}
          </p>
        )}
        <div className='w-full flex justify-end '>
          <button
            className='group bg-white text-black hover:text-white hover:border-white border hover:bg-black transition-all duration-200  px-2 py-0.5 rounded-md flex mt-1 '
            onClick={createQuestion}
          >
            <CursorArrowRaysIcon className='h-6 w-6' />
            <span>PUBLICAR</span>
          </button>
        </div>
      </div>
      <div>
        {questions.reverse().map((quest: Question) => (
          <div
            className='bg-dark-soft w-full h-auto p-1 rounded-md my-4'
            key={quest.id}
          >
            <div className='flex justify-start items-center space-x-2'>
              <UserCircleIcon className='h-8' />
              <div className='flex flex-col'>
                <p className='text-sm'> {quest.user.name}</p>
                <p className='text-xs text-gray-400'>
                  {' '}
                  {handleDateReturn(new Date(quest.createdAt))}
                </p>
              </div>
            </div>
            <div className='flex justify-start items-center space-x-2 mt-2'>
              <div className='h-12 w-8 flex flex-col justify-center items-center border rounded-md'>
                <BsHeart className='h-8' />
                <p className='text-xs pb-1'>0</p>
              </div>
              <p className='text-xs'> {quest.question}</p>
            </div>
            <div className='flex relative text-xs left-10 space-x-1 text-sky-400 hover:underline'>
              <ChatBubbleBottomCenterIcon className='w-4' />
              <button className='' onClick={() => setAnswerOn(quest.id)}>
                Responder
              </button>
            </div>
            <div className='answer'>
              {answerOn === quest.id ? (
                <div className='mt-4 px-8 relative h-full'>
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
                      onClick={() => createAnswer(quest.id)}
                    >
                      <span className='text-sm'>RESPONDER</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {quest.answers &&
                    quest.answers.length > 0 &&
                    quest?.answers.map((answer: Answer) => (
                      <React.Fragment key={answer.answeredAt.toString()}>
                        <div className='flex justify-start items-center space-x-2 mt-6 pl-12'>
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
                        <div className='flex justify-start items-center space-x-2 mt-2 pl-12 pb-2'>
                          <div className='h-12 w-8 flex flex-col justify-center items-center border rounded-md'>
                            <BsHeart className='h-8' />
                            <p className='text-xs pb-1'>0</p>
                          </div>
                          <p className='text-xs'> {answer.answer}</p>
                        </div>
                        {/* <div className='flex relative text-xs left-10 space-x-1 text-sky-400 hover:underline'>
                  <ChatBubbleBottomCenterIcon className='w-4'/>
                  <button className='' onClick={() => setAnswerOn(quest.id)}>
                    Responder
                  </button>
                  </div> */}
                      </React.Fragment>
                    ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassQuestions;
