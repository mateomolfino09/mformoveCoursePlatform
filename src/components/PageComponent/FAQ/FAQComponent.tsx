'use client';
import { useState } from 'react';
import { FAQ } from '../../../../typings';
import MainSideBar from '../../MainSidebar/MainSideBar';
import React from 'react';
import Footer from '../../Footer';
import { Card, Badge } from '../../ui';
import { colors } from '../../../constants/colors';
import { 
  ChevronDownIcon, 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CreditCardIcon,
  UserGroupIcon,
  CogIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure, Transition } from '@headlessui/react';

interface Props {
  questions: FAQ[];
}

const FAQComponent = ({ questions }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<FAQ | null>(null);

  // Filtrar preguntas por categoría
  const filteredQuestions = selectedCategory === 'all' 
    ? questions.sort((a, b) => (a.order || 0) - (b.order || 0))
    : questions.filter(q => q.category === selectedCategory).sort((a, b) => (a.order || 0) - (b.order || 0));

  const categories = [
    { id: 'all', name: 'Todas', icon: QuestionMarkCircleIcon },
    { id: 'membresia', name: 'Membresía', icon: UserGroupIcon },
    { id: 'mentoria', name: 'Mentoría', icon: AcademicCapIcon },
    { id: 'pagos', name: 'Pagos', icon: CreditCardIcon },
    { id: 'tecnico', name: 'Técnico', icon: CogIcon },
    { id: 'general', name: 'General', icon: ChatBubbleLeftRightIcon }
  ];

  const formatAnswer = (answer: string) => {
    return answer
      .split(/(?:\.\s+|\n\n)/)
      .filter(paragraph => paragraph.trim() !== "")
      .map((paragraph, index) => (
        <p key={index} className="mb-4 text-gray-600 leading-relaxed">
          {paragraph.trim()}
        </p>
      ));
  };

  return (
    <MainSideBar where={'faq'}>
      <div className="min-h-screen absolute w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 bg-white text-gray-800">
        <main className="relative lg:space-y-12 space-y-8 mt-32">
          <section className="!mt-0 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#234C8C]/10 rounded-full mb-6">
                <QuestionMarkCircleIcon className="w-8 h-8 text-[#234C8C]" />
              </div>
              <h1 className="text-[#234C8C] text-3xl md:text-4xl lg:text-5xl mb-4 font-bold font-montserrat">
                Preguntas Frecuentes
              </h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-4">
                Encuentra respuestas rápidas a las preguntas más comunes sobre nuestros servicios, 
                membresías y mentorías. Si no encuentras lo que buscas, nuestro equipo está aquí para ayudarte.
              </p>
            </motion.div>

            <div className="flex flex-col xl:flex-row gap-8">
              {/* Sidebar con categorías */}
              <div className="xl:w-1/3">
                <Card className="p-6 xl:sticky xl:top-32">
                  <h2 className="text-[#234C8C] text-xl font-semibold mb-6 font-montserrat">
                    Categorías
                  </h2>
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      const questionCount = category.id === 'all' 
                        ? questions.length 
                        : questions.filter(q => q.category === category.id).length;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-[#234C8C] text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            selectedCategory === category.id
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {questionCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-[#234C8C]/10 rounded-full mb-4">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-[#234C8C]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Preguntas Frecuentes
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {filteredQuestions.length} preguntas en esta categoría
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contenido principal */}
              <div className="xl:w-2/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((question, index) => (
                        <motion.div
                          key={question._id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Disclosure>
                            {({ open }) => (
                              <Card className="overflow-hidden">
                                <Disclosure.Button className="w-full px-4 md:px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-[#234C8C] text-base md:text-lg font-semibold font-montserrat pr-4">
                                      {question.question}
                                    </h3>
                                    <ChevronDownIcon
                                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                        open ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>
                                </Disclosure.Button>
                                <Transition
                                  enter="transition duration-200 ease-out"
                                  enterFrom="transform scale-95 opacity-0"
                                  enterTo="transform scale-100 opacity-100"
                                  leave="transition duration-150 ease-in"
                                  leaveFrom="transform scale-100 opacity-100"
                                  leaveTo="transform scale-95 opacity-0"
                                >
                                  <Disclosure.Panel className="px-4 md:px-6 pb-4">
                                    <div className="prose prose-gray max-w-none border-t pt-4">
                                      {formatAnswer(question.answer)}
                                    </div>
                                  </Disclosure.Panel>
                                </Transition>
                              </Card>
                            )}
                          </Disclosure>
                        </motion.div>
                      ))
                    ) : (
                      <Card className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <QuestionMarkCircleIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No hay preguntas disponibles
                        </h3>
                        <p className="text-gray-600">
                          Contacta con nuestro equipo para obtener ayuda.
                        </p>
                      </Card>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA Premium */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16"
            >
              <Card className="p-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 font-montserrat">
                    ¿No encontraste lo que buscabas?
                  </h2>
                  <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                    Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos 
                    en menos de 24 horas con una solución personalizada.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="/contact" 
                      className="bg-white text-[#234C8C] px-4 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <EnvelopeIcon className="w-5 h-5" />
                      Contactar Soporte
                    </a>
                    <a 
                      href="/mentorship" 
                      className="border-2 border-white text-white px-4 md:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#234C8C] transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      Agendar Consulta
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>
        </main>
        <Footer />
      </div>
    </MainSideBar>
  );
};

export default FAQComponent;
