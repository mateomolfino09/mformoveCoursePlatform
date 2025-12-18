'use client';

import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CreateFAQ = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const config = {
    cache: 'no-store',
    headers: {
      'Cache-Control':
        'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    },
    next: { tags: ['faqs'] }
  };

  const handleCreateFAQ = async (e:any) => {
    e.preventDefault();

    const { data } = await axios.post(
      '/api/faq/createFAQ',
      {
        question,
        answer
      },
      config
    );

    auth.fetchUser();
    toast.success(data.message);
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center'>
      <div className='h-full w-full relative flex flex-col md:items-center md:justify-center py-8'>
        <div className='w-full flex justify-between items-center mb-8 px-8'>
          <div>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-montserrat'>Crear una FAQ</h1>
            <p className='text-gray-600 text-lg font-montserrat'>Completa la información para crear una nueva pregunta frecuente</p>
          </div>
          <div className='flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm'>
            <div className='w-3 h-3 bg-[#4F7CCF] rounded-full' />
            <span className='text-gray-700 font-medium font-montserrat'>Formulario único</span>
          </div>
        </div>
        <form
          className='relative space-y-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-xl px-8 py-8 md:min-w-[40rem] md:px-12 md:py-10 font-montserrat mb-8'
          autoComplete='off'
          onSubmit={handleCreateFAQ}
        >
          <div className='space-y-6'>
            <label className='flex flex-col space-y-2 w-full'>
              <p className='text-sm font-medium text-gray-700'>Pregunta *</p>
              <input
                type='text'
                placeholder='Escribe la pregunta'
                value={question}
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat'
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </label>
          </div>

          <div className='space-y-6'>
            <label className='flex flex-col space-y-2 w-full'>
              <p className='text-sm font-medium text-gray-700'>Respuesta *</p>
              <textarea
                placeholder='Escribe la respuesta'
                className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F7CCF]/20 focus:border-[#4F7CCF] transition-all duration-300 font-montserrat min-h-[120px]'
                onChange={(e) => setAnswer(e.target.value)}
                value={answer}
                required
              />
            </label>
          </div>
          <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={() => router.push('/admin/faq')}
              className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 font-montserrat border border-gray-200'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='px-8 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg font-montserrat'
            >
              Crear FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFAQ;
