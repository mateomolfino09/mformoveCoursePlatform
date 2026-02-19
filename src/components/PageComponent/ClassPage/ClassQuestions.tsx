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
      {/* Formulario para nueva pregunta - sin caja */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 md:mb-8"
      >
        <label className="block w-full">
          <textarea
            placeholder="Escribe tu pregunta o comentario..."
            className="w-full min-h-[100px] bg-transparent border-b border-palette-stone/20 px-0 py-3 text-[15px] sm:text-base text-palette-ink placeholder-palette-stone font-montserrat focus:outline-none focus:border-palette-stone resize-none"
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
              className={`mt-2 text-sm font-montserrat ${
                messageType === 'error' ? 'text-red-600' : 'text-palette-sage'
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
            className="mt-4 flex flex-wrap justify-end gap-3"
          >
            <button
              type="button"
              onClick={() => {
                setQuestion(false);
                setContent('');
                setMessage('');
              }}
              className="px-4 py-2 text-sm font-medium text-palette-stone hover:text-palette-ink font-montserrat transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={createQuestion}
              disabled={!content.trim() || content.trim().length < 10}
              className="px-4 py-2 text-sm font-medium text-palette-ink hover:text-palette-sage font-montserrat transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publicar
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Lista de preguntas */}
      <div className="space-y-4 max-h-[480px] md:max-h-[600px] overflow-y-auto pr-2 [scrollbar-color:var(--palette-stone)_transparent]">
        <AnimatePresence mode="popLayout">
          {reversedQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 md:py-12"
            >
              <ChatBubbleBottomCenterIcon className="h-10 w-10 md:h-12 md:w-12 text-palette-stone/40 mx-auto mb-3" />
              <p className="text-palette-stone font-montserrat text-[15px] sm:text-base">No hay preguntas aún. ¡Sé el primero en preguntar!</p>
            </motion.div>
          ) : (
            reversedQuestions.map((quest: Question, index: number) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="py-4 md:py-5 border-b border-palette-stone/10 last:border-b-0"
              >
                {/* Header de la pregunta */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-palette-stone/10 flex items-center justify-center flex-shrink-0">
                      <UserCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-palette-stone" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] sm:text-sm font-medium text-palette-ink font-montserrat truncate">
                        {quest?.user?.name || 'Usuario'}
                      </p>
                      <p className="text-xs text-palette-stone font-montserrat">
                        {handleDateReturn(new Date(quest.createdAt))}
                      </p>
                    </div>
                  </div>
                  {(user?.rol === 'Admin' || user?._id === quest?.user?._id) && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenEdit(quest)}
                        className="p-1.5 text-palette-stone hover:text-palette-ink transition-colors"
                        aria-label="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openModalDelete(quest)}
                        className="p-1.5 text-palette-stone hover:text-red-600 transition-colors"
                        aria-label="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenido de la pregunta */}
                <p className="text-palette-ink/90 text-[15px] sm:text-base font-montserrat font-light leading-relaxed mb-3 md:mb-4">
                  {quest.question}
                </p>

                {/* Respuestas */}
                {quest.answers && quest.answers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-palette-stone/10 space-y-3">
                    <p className="text-xs text-palette-stone font-montserrat mb-2">
                      {quest.answers.length} {quest.answers.length === 1 ? 'Respuesta' : 'Respuestas'}
                    </p>
                    {quest.answers.map((answer: Answer, index: number) => (
                      <motion.div
                        key={`${answer.answeredAt}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-3 border-l-2 border-palette-stone/20 py-2"
                      >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 rounded-full bg-palette-stone/10 flex items-center justify-center flex-shrink-0">
                                <UserCircleIcon className="h-3.5 w-3.5 text-palette-stone" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-palette-ink font-montserrat truncate">
                                  {answer?.answerAdmin?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-palette-stone font-montserrat">
                                  {handleDateReturn(new Date(answer?.answeredAt))}
                                </p>
                              </div>
                            </div>
                            {(user?.rol === 'Admin' || user?._id === answer?.answerAdmin?._id) && (
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => { setOpenEdit(quest); setOpenEditAnswer(index); }}
                                  className="p-1 text-palette-stone hover:text-palette-ink"
                                  aria-label="Editar"
                                >
                                  <PencilIcon className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openModalDeleteAnswer(index, quest)}
                                  className="p-1 text-palette-stone hover:text-red-600"
                                  aria-label="Eliminar"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[15px] sm:text-sm text-palette-ink/90 font-montserrat font-light leading-relaxed mt-1">
                            {answer?.answer}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {answerOn !== quest.id && (
                    <button
                      type="button"
                      onClick={() => { setAnswerOn(quest.id); setAnswer(''); }}
                      className="mt-3 text-xs text-palette-stone hover:text-palette-ink font-montserrat font-medium flex items-center gap-1 transition-colors"
                    >
                      <ChatBubbleBottomCenterIcon className="h-4 w-4" />
                      Responder
                    </button>
                  )}

                  {answerOn === quest.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <textarea
                        placeholder="Escribe tu respuesta..."
                        className="w-full min-h-[80px] bg-transparent border-b border-palette-stone/20 px-0 py-2 text-[15px] sm:text-sm text-palette-ink placeholder-palette-stone font-montserrat focus:outline-none focus:border-palette-stone resize-none"
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                      />
                      <div className="flex flex-wrap justify-end gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => { setAnswerOn(0); setAnswer(''); }}
                          className="px-3 py-1.5 text-xs font-medium text-palette-stone hover:text-palette-ink font-montserrat transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => createAnswer(quest.id)}
                          disabled={!answer.trim()}
                          className="px-3 py-1.5 text-xs font-medium text-palette-ink hover:text-palette-sage font-montserrat transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Publicar respuesta
                        </button>
                      </div>
                    </motion.div>
                  )}
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
