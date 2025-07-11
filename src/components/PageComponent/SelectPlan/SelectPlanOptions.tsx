import { ClipboardDocumentCheckIcon, CloudArrowDownIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import React from 'react'

const SelectPlanOptions = () => {
  return (
    <div className='w-full bg-tertiary font-montserrat'>
    <div className='w-full md:pt-0 pt-2 flex flex-col md:space-y-12 md:space-x-18 justify-center items-center px-4  pb-16 md:pb-20'> 
    <div className='flex space-y-3 flex-col !mt-10 md:!mt-28 items-start justify-start md:max-w-[900px]' >
    <div className='!text-3xl md:!text-4xl font-montserrat font-normal align-middle w-full  text-center text-white'>
      <h2 className=''>¿Qué incluye <strong>MOVE CREW</strong>?
      </h2>
    </div>
  </div>
  <div className='md:w-2/3 w-full justify-center h-full flex !mt-12 md:flex-row flex-col  space-y-10 md:space-y-0'>
      <div className='md:w-1/2 w-full flex flex-col space-y-2 justify-center items-center px-12'>
      <ClipboardDocumentCheckIcon className='w-16 h-16 md:!mb-2 secondary-text-color '/>
        <h3 className='text-xl md:text-2xl font-normal text-white text-center'>Programas Trimestrales </h3>
        <p className='text-center text-gray-300'>Recibí cada trimestre una planificación completa de fuerza orgánica, movilidad y movimiento, dividida por niveles y con estructura clara.</p>
      </div>
      <div className='md:w-1/2 w-full flex flex-col space-y-2 justify-center items-center px-12'>
      <UserGroupIcon className='w-16 h-16 md:!mb-2 secondary-text-color '/>
        <h3 className='text-xl md:text-2xl font-normal text-center text-white'>Comunidad Activa </h3>
        <p className='text-center text-gray-300'>Accedé a un grupo exclusivo donde compartimos avances, respondemos dudas y nos motivamos entre todos a seguir practicando.</p>
      </div>

    </div>
    <div className='md:w-2/3 md:flex-row flex-col justify-center h-full flex !mt-10 md:mt-0 md:space-y-0 space-y-10'>
      <div className='md:w-1/2 w-full flex flex-col space-y-2 justify-center items-center  px-12'>
      <CloudArrowDownIcon className='w-16 h-16 md:!mb-2 secondary-text-color '/>
        <h3 className='text-xl md:text-2xl font-normal text-center text-white'>Biblioteca de Recursos en Video </h3>
        <p className='text-center text-gray-300'>Más de 50 videos explicativos, guías y rutinas organizadas por bloque, nivel y objetivo, para que entrenes con autonomía y claridad.</p>
      </div>
      <div className='md:w-1/2 w-full flex flex-col space-y-2 justify-center items-center px-12'>
      <VideoCameraIcon className='w-16 h-16 md:!mb-2 secondary-text-color '/>
        <h3 className='text-xl md:text-2xl font-normal text-center text-white'>Encuentros en Vivo Mensuales </h3>
        <p className='text-center text-gray-300'>Participá de foros grupales de dudas y respuestas donde profundizamos en la práctica, compartimos experiencias y afinamos el rumbo.</p>
      </div>

    </div>



{/* 
      <div className='w-full md:pt-6 flex justify-center flex-col items-center hover:scale-105 transition-all duration-500 cursor-pointer pt-8'>
            <ChevronDownIcon className='w-12 h-12'/>
          </div> */}
        </div>  
    </div>
)
}

export default SelectPlanOptions