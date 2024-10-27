'use client';

import { useAuth } from '../../../hooks/useAuth';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CreateFAQ = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const auth = useAuth();
  const config = {
    cache: 'no-store',
    headers: {
      'Cache-Control':
        'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    },
    next: { tags: ['faqs'] }
  };

  const handleCreateFAQ = async (e: any) => {
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
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div
        className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
      >
        <div className='w-full flex pt-12 justify-between items-center'>
          <h1 className='text-4xl font-light '>Crear una FAQ</h1>
        </div>
        <form
          className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
          autoComplete='nope'
          //  onSubmit={handleSubmi()}
        >
          <div className='space-y-8'>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Escribe la pregunta</p>

              <input
                type='name'
                placeholder='Nombre'
                value={question}
                className='input'
                onChange={(e) => {
                  setQuestion(e.target.value);
                }}
              />
            </label>
          </div>

          <div className='flex flex-col justify-center items-start'>
            <label className='inline-block w-full'>
              <p>Escribe la respuesta</p>
              <textarea
                placeholder='Respuesta'
                className='input'
                onChange={(e) => {
                  setAnswer(e.target.value);
                }}
                value={answer}
              />
            </label>
          </div>
          <button
            onClick={(e) => handleCreateFAQ(e)}
            className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
          >
            Crear{' '}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFAQ;
