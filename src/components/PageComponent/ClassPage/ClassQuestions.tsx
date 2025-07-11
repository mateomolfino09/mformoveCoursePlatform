import {
  Answer,
  ClassesDB,
  IndividualClass,
  Question,
  User
} from '../../../../typings';
import { commentsFunction } from '../../../constants/comment';
import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import DeleteAnswer from '../../DeleteAnswer';
import DeleteQuestion from '../../DeleteQuestion';
import {
  ChatBubbleBottomCenterIcon,
  CursorArrowRaysIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsBoxArrowUpRight, BsHeart } from 'react-icons/bs';

interface Props {
  user: User | null;
  clase: IndividualClass;
  questionsDB: Question[];
}

const ClassQuestions = ({ user, clase, questionsDB }: Props) => {
  const [question, setQuestion] = useState(false);
  const [content, setContent] = useState('');
  const [answerOn, setAnswerOn] = useState(0);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messageType, setMessageType] = useState('');
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  const [questionSelected, setQuestionSelected] = useState<Question | null>(
    null
  );
  let [isOpenDeleteAnswer, setIsOpenDeleteAnswer] = useState(false);
  let [openEdit, setOpenEdit] = useState<Question | null>(null);
  let [openEditAnswer, setOpenEditAnswer] = useState<number>(-1);
  const auth = useAuth();

  const [answerSelected, setAnswerSelected] = useState<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    const comments: any = commentsFunction(clase, clase.isFree ? 1 : 0);

    const sortedComments = [
      ...comments,
      ...(questionsDB?.reverse() || [])
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime(); // Obtener el tiempo en milisegundos
      const dateB = new Date(b.createdAt).getTime(); // Obtener el tiempo en milisegundos
      return dateA - dateB; // Ordenar de más antiguo a más reciente
    });

    setQuestions(sortedComments);
  }, [questionsDB]);

  useEffect(() => {}, [questions]);

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
    if (!auth.user) {
      state.loginForm = true;
      return;
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
    const link = window.location.href;
    try {
      const { data } = await axios.post(
        '/api/individualClass/addQuestion',
        { userEmail, classId, question: content, link },
        config
      );
      setQuestions([data.newQuestion, ...questions]);
      setMessage('Pregunta creada con éxito');
      setMessageType('mensaje');
      setContent('');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      }
  };

  const createAnswer = async (questionId: number) => {
    if (!auth.user) {
      state.loginForm = true;
      return;
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
    const email = auth?.user.email;
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
      setAnswer('');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
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
    if (questionSelected) {
      const questionId = questionSelected?.id;

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.delete(
        `/api/question/delete/${questionId}`,
        config
      );
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
    if (questionSelected) {
      const questionId = questionSelected?.id;

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.delete(
        `/api/question/delete/${questionId}/${index}`,
        config
      );
      const updatedQuestion = response.data.question;
      const updatedQuestions = [...questions];
      const indexQuest = updatedQuestions.findIndex(
        (value: Question) => value.id == questionId
      );
      updatedQuestions[indexQuest] = updatedQuestion;
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
    <div className="p-8 lg:pl-12 lg:pr-6">
      <div className="w-full h-full flex flex-col mb-4 relative">
        <label className="inline-block w-full shadow-2xl">
          <textarea
            placeholder="Añade un comentario..."
            className="input font-montserrat text-sm"
            onFocus={() => setQuestion(!question)}
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />
        </label>
        {message !== '' && (
          <p
            className={`${
              messageType === 'error' ? 'text-red-500' : 'text-green-500'
            } flex justify-start text-xs mt-2`}
          >
            {message}
          </p>
        )}
        <div className="w-full flex justify-end">
          <button
            className="group bg-white text-black border hover:scale-105 transition-all duration-200 px-4 py-1 rounded-md flex mt-2"
            onClick={createQuestion}
          >
            <span className="font-light">Publicar</span>
          </button>
        </div>
      </div>
  
      {/* Contenedor desplazable para preguntas */}
      <div className="rounded-md max-h-[500px] overflow-y-auto space-y-4">
        {Array.isArray(questions) &&
          questions
            .slice()
            .reverse()
            .map((quest: Question) => (
              <div
                className="w-full h-auto p-4 bg-dark-soft rounded-md shadow-md"
                key={quest.id}
              >
                <div className="flex items-center space-x-4">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-white">
                      {quest?.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {handleDateReturn(new Date(quest.createdAt))}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-300">{quest.question}</p>
  
                {/* Botones de editar/eliminar con íconos */}
                {(user?.rol === 'Admin' || user?._id === quest?.user?._id) && (
                  <div className="flex justify-end space-x-2 mt-2">
                    <div
                      className="w-4 transform hover:text-blue-500 hover:scale-110 cursor-pointer"
                      onClick={() => setOpenEdit(quest)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </div>
                    <div
                      className="w-4 transform hover:text-red-500 hover:scale-110 cursor-pointer"
                      onClick={() => openModalDelete(quest)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </div>
                  </div>
                )}
  
                {/* Contenedor desplazable para respuestas */}
                {quest.answers.length > 0 && (
                  <div className="mt-4 border-t border-gray-700 pt-4 max-h-[300px] overflow-y-auto space-y-4">
                    {quest.answers.map((answer: Answer, index: number) => (
                      <div
                        key={answer.answeredAt.toString()}
                        className="flex items-start space-x-4"
                      >
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-semibold text-white">
                              {answer?.answerAdmin?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {handleDateReturn(new Date(answer?.answeredAt))}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-300">
                            {answer?.answer}
                          </p>
  
                          {/* Botones de editar/eliminar respuestas con íconos */}
                          {(user?.rol === 'Admin' ||
                            user?._id === answer?.answerAdmin?._id) && (
                            <div className="flex justify-end space-x-2 mt-2">
                              <div
                                className="w-4 transform hover:text-blue-500 hover:scale-110 cursor-pointer"
                                onClick={() => {
                                  setOpenEdit(quest);
                                  setOpenEditAnswer(index);
                                }}
                              >
                                <PencilIcon className="w-5 h-5" />
                              </div>
                              <div
                                className="w-4 transform hover:text-red-500 hover:scale-110 cursor-pointer"
                                onClick={() =>
                                  openModalDeleteAnswer(index, quest)
                                }
                              >
                                <TrashIcon className="w-5 h-5" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
      </div>
  
      {/* Modales para eliminar */}
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
