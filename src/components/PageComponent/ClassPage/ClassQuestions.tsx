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
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsBoxArrowUpRight, BsHeart } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

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
  const router = useRouter();

  const [answerSelected, setAnswerSelected] = useState<number>(0);
  const pathname = usePathname();

  // Optimizar el cálculo de preguntas con useMemo
  const sortedQuestions = useMemo(() => {
    const comments: any = commentsFunction(clase, clase.isFree ? 1 : 0);
    const allQuestions = [
      ...comments,
      ...(questionsDB || [])
    ];
    
    return allQuestions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
  }, [clase, questionsDB]);

  useEffect(() => {
    setQuestions(sortedQuestions);
  }, [sortedQuestions]);

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

  const createQuestion = useCallback(async () => {
    if (!auth.user) {
      router.push('/move-crew');
      return;
    }

    setMessage('');
    setMessageType('');
    if (!content.trim() || content.trim().length < 10) {
      setMessage('Debes escribir una pregunta válida (mínimo 10 caracteres)');
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
        { userEmail, classId, question: content.trim(), link },
        config
      );
      setQuestions((prev) => [data.newQuestion, ...prev]);
      setMessage('Pregunta creada con éxito');
      setMessageType('mensaje');
      setContent('');
      setQuestion(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      toast.success('Pregunta publicada');
    } catch (error) {
      setMessage('Error al crear la pregunta. Intenta nuevamente.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  }, [auth.user, content, clase?.id]);

  const createAnswer = useCallback(async (questionId: number) => {
    if (!auth.user) {
      router.push('/move-crew');
      return;
    }

    setMessage('');
    setMessageType('');
    if (!answer.trim() || answer.trim().length < 1) {
      setMessage('Debes escribir una respuesta válida');
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
        { answer: answer.trim(), questionId, userEmail: email },
        config
      );
      setQuestions((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((q) => q.id == questionId);
        if (index !== -1) {
          updated[index] = data.question;
        }
        return updated;
      });
      setMessage('Respuesta creada con éxito');
      setMessageType('mensaje');
      setAnswerOn(0);
      setAnswer('');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      toast.success('Respuesta publicada');
    } catch (error) {
      setMessage('Error al crear la respuesta. Intenta nuevamente.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  }, [auth.user, answer]);

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

  // Preguntas ordenadas (más recientes primero)
  const reversedQuestions = useMemo(() => {
    return [...questions].reverse();
  }, [questions]);

  return (
    <div className="w-full">
      {/* Formulario para nueva pregunta */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="relative rounded-2xl border border-amber-300/20 bg-gradient-to-br from-white/5 via-amber-500/5 to-orange-500/5 backdrop-blur-md p-6 overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <label className="block w-full">
              <textarea
                placeholder="Escribe tu pregunta o comentario..."
                className="w-full min-h-[100px] bg-black/40 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 font-montserrat text-sm focus:outline-none focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 transition-all duration-300 resize-none"
                onFocus={() => setQuestion(true)}
                onChange={(e) => setContent(e.target.value)}
                value={content}
              />
            </label>
            
            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-3 text-sm font-montserrat ${
                    messageType === 'error' 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {(question || content) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex justify-end gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setQuestion(false);
                    setContent('');
                    setMessage('');
                  }}
                  className="px-6 py-2 bg-black/60 border border-gray-700/50 text-white rounded-full font-montserrat font-medium hover:border-gray-600/70 transition-all duration-300"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createQuestion}
                  disabled={!content.trim() || content.trim().length < 10}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 text-white rounded-full font-montserrat font-medium hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lista de preguntas */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
        <AnimatePresence mode="popLayout">
          {reversedQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ChatBubbleBottomCenterIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-montserrat">No hay preguntas aún. ¡Sé el primero en preguntar!</p>
            </motion.div>
          ) : (
            reversedQuestions.map((quest: Question, index: number) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative rounded-2xl border border-gray-800/50 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-sm p-6 overflow-hidden"
              >
                {/* Decoración sutil */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  {/* Header de la pregunta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-300/30 flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-white/80" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white font-montserrat">
                          {quest?.user?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-400 font-montserrat">
                          {handleDateReturn(new Date(quest.createdAt))}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    {(user?.rol === 'Admin' || user?._id === quest?.user?._id) && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setOpenEdit(quest)}
                          className="p-2 rounded-lg bg-gray-800/50 hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 transition-all duration-200"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openModalDelete(quest)}
                          className="p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Contenido de la pregunta */}
                  <p className="text-white/90 text-sm md:text-base font-montserrat font-light leading-relaxed mb-4">
                    {quest.question}
                  </p>

                  {/* Respuestas */}
                  {quest.answers && quest.answers.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-800/50 space-y-4">
                      <p className="text-xs text-gray-500 font-montserrat font-medium mb-3">
                        {quest.answers.length} {quest.answers.length === 1 ? 'Respuesta' : 'Respuestas'}
                      </p>
                      {quest.answers.map((answer: Answer, index: number) => (
                        <motion.div
                          key={`${answer.answeredAt}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="pl-4 border-l-2 border-amber-500/20 bg-black/30 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-300/40 flex items-center justify-center">
                                <UserCircleIcon className="h-5 w-5 text-white/90" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-white font-montserrat">
                                  {answer?.answerAdmin?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 font-montserrat">
                                  {handleDateReturn(new Date(answer?.answeredAt))}
                                </p>
                              </div>
                            </div>

                            {(user?.rol === 'Admin' ||
                              user?._id === answer?.answerAdmin?._id) && (
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setOpenEdit(quest);
                                    setOpenEditAnswer(index);
                                  }}
                                  className="p-1.5 rounded bg-gray-800/50 hover:bg-amber-500/20 text-gray-500 hover:text-amber-300 transition-all duration-200"
                                >
                                  <PencilIcon className="h-3.5 w-3.5" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openModalDeleteAnswer(index, quest)}
                                  className="p-1.5 rounded bg-gray-800/50 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all duration-200"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </motion.button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-white/80 font-montserrat font-light leading-relaxed ml-10">
                            {answer?.answer}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Botón para responder */}
                  {answerOn !== quest.id && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAnswerOn(quest.id);
                        setAnswer('');
                      }}
                      className="mt-4 text-xs text-amber-300/80 hover:text-amber-300 font-montserrat font-medium flex items-center gap-1 transition-colors"
                    >
                      <ChatBubbleBottomCenterIcon className="h-4 w-4" />
                      Responder
                    </motion.button>
                  )}

                  {/* Formulario de respuesta */}
                  {answerOn === quest.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-black/40 border border-gray-800/50 rounded-xl"
                    >
                      <textarea
                        placeholder="Escribe tu respuesta..."
                        className="w-full min-h-[80px] bg-black/40 border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 font-montserrat text-sm focus:outline-none focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20 transition-all duration-300 resize-none"
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setAnswerOn(0);
                            setAnswer('');
                          }}
                          className="px-4 py-1.5 text-xs bg-black/60 border border-gray-700/50 text-white rounded-full font-montserrat hover:border-gray-600/70 transition-all duration-300"
                        >
                          Cancelar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => createAnswer(quest.id)}
                          disabled={!answer.trim()}
                          className="px-4 py-1.5 text-xs bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 text-white rounded-full font-montserrat font-medium hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Publicar respuesta
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
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
