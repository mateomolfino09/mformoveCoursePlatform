import React from 'react'

interface Props {
    quantity: number
}

const AddQuestions = ({ quantity }: Props ) => {
  const arr = [];
  const current = 0

  return (
    <div className='w-full h-full text-black'>
        <h2 className='w-full text-center text-black mt-3 pb-3 text-2xl'>Pregunta {current + 1}</h2>
        <div className='space-y-8'>
          <label className='flex flex-col space-y-3 w-full'>
            <input
              type='nombre'
              placeholder='Pregunta'
              className='input bg-white/70'
            />
          </label>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Introduce el Id de la Playlist que vas a utilizar</p>
            <input
              type='playlistId'
              placeholder='Playlist Id'
              className='input'

            />
          </label>
          <p>Selecciona la Portada para el curso</p>




        </div>
    </div>
  )
}

export default AddQuestions