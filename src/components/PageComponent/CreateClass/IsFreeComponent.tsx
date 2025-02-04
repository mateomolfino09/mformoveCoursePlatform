import React, { useState } from 'react';

interface Props {
  handleIsFree: (isFree: boolean) => void;
  isFree: boolean;
}

const IsFreeComponent = ({ handleIsFree, isFree }: Props) => {
  const [notFreeCheck, setNotFreeCheck] = useState(true);

  return (
    <div className='flex flex-col justify-center items-start space-y-4'>
      <label className='flex flex-col space-y-3 w-full'>
        <p>¿Esta clase es Gratis?</p>
      </label>
      <ul className='grid w-full gap-6 md:grid-cols-2'>
        <li>
          <input
            type='radio'
            id='free-option'
            name='isFree'
            checked={!notFreeCheck} // Asegúrate de que esté seleccionado si isFree es true
            onChange={() => {
              handleIsFree(true);
              setNotFreeCheck(false);
            }} // Llama a handleIsFree con true
            className='hidden peer'
          />
          <label
            htmlFor='free-option'
            className='inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'
          >
            <div className='block'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='mb-2 w-7 h-7 text-blue-200'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
                />
              </svg>

              <div className='w-full text-lg font-semibold font-boldFont'>
                SI
              </div>
              <div className='w-full text-sm font-montserrat'>
                Esta clase la puede ver todo el público
              </div>
            </div>
          </label>
        </li>
        <li>
          <input
            type='radio'
            id='paid-option'
            name='isFree'
            checked={notFreeCheck} // Asegúrate de que esté seleccionado si isFree es false
            onChange={() => {
              handleIsFree(false);
              setNotFreeCheck(true);
            }} // Llama a handleIsFree con false
            className='hidden peer'
          />
          <label
            htmlFor='paid-option'
            className='inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'
          >
            <div className='block'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='mb-2 text-green-400 w-7 h-7'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                />
              </svg>

              <div className='w-full text-lg font-semibold font-boldFont'>
                NO
              </div>
              <div className='w-full text-sm font-montserrat'>
                Esta clase es sólo para quienes pagan la membresía
              </div>
            </div>
          </label>
        </li>
      </ul>
    </div>
  );
};

export default IsFreeComponent;
