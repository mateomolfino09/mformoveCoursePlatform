import state from '../valtio'
import React from 'react'
import { TfiHeadphone } from 'react-icons/tfi'
import { useSnapshot } from 'valtio'

const VolumeModal = () => {
  const snap = useSnapshot(state)

  return (
    <div
      className={` z-[100] bg-almost-black  w-full h-screen top-0 ${
        snap.volumeModal ? 'absolute' : 'hidden'
      }`}
    >
      <div className='flex justify-center w-full h-full items-center flex-col  relative bottom-6'>
        <h1 className='text-white text-4xl font-medium mb-6'>ATENCIÓN</h1>
        <div className='flex flex-col justify-center items-center'>
          <TfiHeadphone className='w-7 h-7 ' />
          <p className='text-lg font-light'>Este Website usa sonidos</p>
        </div>
        <div className='flex flex-row justify-center items-center space-x-4 mt-8 px-4'>
          <div className='h-12 w-36 md:w-48 border border-1 border-white flex justify-center font-light items-center px-2 py-2 rounded-md hover:bg-white hover:text-black transition duration-200'>
            <button
              className=''
              onClick={() => {
                state.volumeIndex = true
                state.volumeModal = false
              }}
            >
              Continuar
            </button>
          </div>
          <div className='h-12 border border-1 border-white w-36 md:w-48 flex justify-center font-light items-center px-2 py-2 rounded-md hover:bg-white hover:text-black transition duration-200'>
            <button
              className=''
              onClick={() => {
                state.volumeIndex = false
                state.volumeModal = false
              }}
            >
              Apagar sonidos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolumeModal
