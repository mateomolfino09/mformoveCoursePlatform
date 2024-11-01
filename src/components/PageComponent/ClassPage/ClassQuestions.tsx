import { Answer, ClassesDB, IndividualClass, Question, User } from '../../../../typings';
import {
  ChatBubbleBottomCenterIcon,
  CursorArrowRaysIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsHeart, BsBoxArrowUpRight } from 'react-icons/bs';
import DeleteQuestion from '../../DeleteQuestion';
import DeleteAnswer from '../../DeleteAnswer';
import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';

interface Props {
  user: User | null
  clase: IndividualClass
  questionsDB: Question[]
}

const ClassQuestions = ({ user, clase, questionsDB }: Props) => {
  const [question, setQuestion] = useState(false)
  const [content, setContent] = useState('')
  const [answerOn, setAnswerOn] = useState(0)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messageType, setMessageType] = useState('');
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  const [questionSelected, setQuestionSelected] = useState<Question | null>(null);
  let [isOpenDeleteAnswer, setIsOpenDeleteAnswer] = useState(false);
  let [openEdit, setOpenEdit] = useState<Question | null>(null);
  let [openEditAnswer, setOpenEditAnswer] = useState<number>(-1);
  const auth = useAuth()

  const [answerSelected, setAnswerSelected] = useState<number>(0);
const pathname = usePathname()

  useEffect(() => {
    setQuestions([...questionsDB?.reverse()])
  }, [questionsDB])

  useEffect(() => {

  }, [questions])

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

    if(!auth.user) {
      state.loginForm = true;
      return
    }

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
    const classId = clase?.id;
    const userEmail = auth.user?.email;
    console.log(userEmail)
    const link = window.location.href;
    try {
      const { data } = await axios.post(
        '/api/individualClass/addQuestion',
        { userEmail, classId, question: content, link },
        config
      );
      console.log(data)
      setQuestions([data.newQuestion, ...questions]);
      setMessage('Pregunta creada con éxito');
      setMessageType('mensaje');
      setContent('')
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const createAnswer = async (questionId: number) => {

    if(!auth.user) {
      state.loginForm = true;
      return
    }
    
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
    const email = auth?.user.email
    try {
      const { data } = await axios.post(
        '/api/question/createAnswer',
        { answer, questionId, userEmail: email },
        config
      );
      const index = questions.findIndex((q) => q.id == questionId);
      let q = [...questions];
      q[index] = data.question;
      setQuestions([...q]);
      setMessage('Respuesta creada con éxito');
      setMessageType('mensaje');
      setAnswerOn(0);
      setAnswer('')
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  function openModalDelete(question: Question) {
    setQuestionSelected(question);
    setIsOpenDelete(true);
  }

  function openModalDeleteAnswer(index: number, question: Question) {
    setQuestionSelected(question);
    setAnswerSelected(index);
    setIsOpenDeleteAnswer(true);
  }

  const deleteQuestion = async () => {
    if(questionSelected) {

      const questionId = questionSelected?.id;
  
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      const response = await axios.delete(`/api/question/delete/${questionId}`, config);
      const updatedQuestions = questions.filter(
        (quest: Question) => quest.id !== questionSelected.id
      );
      setQuestions(updatedQuestions);
      if (response) {
        setMessage(`${questionSelected.id} fue eliminada correctamente`);
        setMessageType('mensaje');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
  
      setIsOpenDelete(false);
    }
  };
  const deleteAnswer = async (index: number) => {
    if(questionSelected) {

      const questionId = questionSelected?.id;
  
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      const response = await axios.delete(`/api/question/delete/${questionId}/${index}`, config);
      const updatedQuestion = response.data.question
      const updatedQuestions = [...questions]
      const indexQuest = updatedQuestions.findIndex((value: Question) => value.id == questionId)
      updatedQuestions[indexQuest] = updatedQuestion
      setQuestions(updatedQuestions);
      if (response) {
        setMessage(`${questionSelected.id} fue eliminada correctamente`);
        setMessageType('mensaje');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
  
      setIsOpenDelete(false);
    }
  };


  return (
    <div className='p-8 lg:pl-12 lg:pr-6'>
      <div className='w-full h-full  flex flex-col mb-4 relative'>
        <label className='inline-block w-full shadow-2xl'>
          <textarea
            placeholder='Añade un comentario...'
            className='input font-montserrat text-sm'
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
            className='group bg-white text-black border hover:scale-105 transition-all duration-200  px-2 py-0.5 rounded-md flex mt-1 '
            onClick={createQuestion}
          >
            <span className='font-light'>Publicar</span>
          </button>
        </div>
      </div>
      <div className=' rounded-md'>
      {openEdit != null && openEditAnswer === -1 ? (
            <>
              <div>
                Hola
              </div>
            </>
          ) : (
            <>
              {Array.isArray(questions) && questions.slice().reverse().map((quest: Question) => (
                <div
                  className=' w-full h-auto p-1  my-4 ml-2 bg-dark-soft rounded-md'
                  key={quest.id}
                >
                  <div className='flex justify-start items-center space-x-2 '>
                    <UserCircleIcon className='h-8' />
                    <div className='flex flex-col'>
                      <p className='text-sm'> {quest?.user?.name}</p>
                      <p className='text-xs text-gray-400'>
                        {' '}
                        {handleDateReturn(new Date(quest.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className={`relative -left-2 pl-8 ml-6 mt-4  ${quest.answers.length != 0 ? 'border-l border-[#40587c]' : ''}`}>  
                    <div className='flex justify-start items-start space-x-2 relative -left-12'>
                      <div className='h-12 w-8 flex flex-col justify-center items-center border rounded-md bg-dark-soft '>
                        <BsHeart className='h-8' />
                        <p className='text-xs pb-1'>0</p>
                      </div>
                      <p className='text-xs justify-start items-start '> {quest.question}</p>
                      {(user?.rol === 'Admin' || user?._id === quest?.user?._id) && (
                        <>
                        <div className='flex item-center justify-center border-solid border-transparent border border-collapse text-base !ml-12'>
                          <div className='w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer'>
                            {/* <PencilIcon onClick={() => setOpenEdit(quest)}/> */}
                          </div>
                          <div className={`w-4 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse ${auth?.user?.rol === "Admin" || auth.user.id === quest.user.id ? "" : "hidden"}`}>
                            <TrashIcon onClick={() => openModalDelete(quest)}/>
                          </div>
                        </div>
                        </>
                      )}
                    </div>
                    <div className='flex  text-xs  space-x-1 text-sky-400 hover:underline relative -left-2'>
                      <ChatBubbleBottomCenterIcon className='w-4' />
                      <button className='' onClick={() => setAnswerOn(quest.id)}>
                        Responder
                      </button>
                    </div>
                  </div>
                      {answerOn === quest.id ? (
                        <div className='mt-4 px-8 relative h-full'>
                          <label className='inline-block w-full shadow-2xl'>
                            <textarea
                              placeholder='Añade tu respuesta'
                              className='inputAnswer text-xs placeholder:text-sm'
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
                              className='group bg-white text-black border hover:scale-105 transition-all duration-200 px-2 mb-2 rounded-md flex mt-1 '
                              onClick={() => createAnswer(quest.id)}
                            >
                              <span className='text-sm font-light'>Responder</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {openEdit != null && openEditAnswer !== -1 ? (
                            <>
                              <div>Hola</div>
                            </>
                          ) : (
                            <>
                            {Array.isArray(quest?.answers) && quest.answers.length > 0 &&
                              quest?.answers?.map((answer: Answer, index: number) => (
                                <>
                                {index < 2 && (
                                <div key={answer.answeredAt.toString()} className={`relative -left-2 pl-8 py-3  ml-6  ${(index === 1 || quest.answers.length - 1 === index) ? 'border-none' : 'border-l border-[#40587c]'}`}>
                                  <div className={`content-author flex justify-start items-center space-x-2 relative -left-3 ${(index === 1 || quest.answers.length - 1 === index) ? 'before:left-[-20px]' : 'before:left-[-21px]'}` }>
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
                                    {(user?.rol === 'Admin' || user?._id === answer.answerAdmin._id) && (
                          <>
                          <div className='flex items-center justify-center border-solid border-transparent border border-collapse text-base !ml-12'>
                            <div className='w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer'>
                              {/* <PencilIcon onClick={() => {
                                setOpenEdit(quest)
                                setOpenEditAnswer(index)
                              }}
        /> */}
                            </div>
                            <div className='w-4 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse '>
                              <TrashIcon onClick={() => openModalDeleteAnswer(index, quest)}
        />
                            </div>
                          </div>
                          </>
                        )}
                                  </div>
                                </div>
                                )}
                                </>
                              ))}
                              {quest.answers.length > 2 && (
                                <Link href={`/courses/questions/${quest.id}`} target="_blank"> 
                                  <div className='w-full h-auto flex space-x-2 justify-start items-center text-sky-400 group'>
                                    <BsBoxArrowUpRight className='h-4 w-4 group-hover:underline cursor-pointer'/>
                                    <p className='group-hover:underline text-sm cursor-pointer'>{quest.answers.length} RESPUESTAS</p>
                                  </div>
                                </Link>
                                )}                            
                            </>
                          )}
                        </>
                      )}
                  </div>
              ))}
            </>
          )}
      </div>
      <DeleteQuestion
            isOpen={isOpenDelete}
            setIsOpen={setIsOpenDelete}
            question={questionSelected}
            deleteQuestion={deleteQuestion}
          />
      <DeleteAnswer
            isOpen={isOpenDeleteAnswer}
            setIsOpen={setIsOpenDeleteAnswer}
            answer={answerSelected}
            deleteAnswer={deleteAnswer}
            question={questionSelected}
          />


    </div>
  );
};

export default ClassQuestions;
