import { ClipboardDocumentCheckIcon, CloudArrowDownIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { CldImage } from 'next-cloudinary'
import React from 'react'
import imageLoader from '../../../../imageLoader'

const FrequentQuestions = () => {
  return (
    <div className='w-full bg-tertiary font-montserrat relative'>
    <div className='w-full md:pt-0 pt-2 flex flex-col md:space-y-12 md:space-x-18 justify-center items-center px-4  pb-16 md:pb-20'> 
    <div className='flex space-y-3 flex-col md:flex-row items-start justify-start pt-4' >

    <div className=' font-montserrat font-normal  w-full  text-left text-white'>

      <h2 className='!text-3xl md:!text-4xl mb-1'>Preguntas <strong>Frecuentes</strong>
      </h2>
    </div>

  </div>



{/* 
      <div className='w-full md:pt-6 flex justify-center flex-col items-center hover:scale-105 transition-all duration-500 cursor-pointer pt-8'>
            <ChevronDownIcon className='w-12 h-12'/>
          </div> */}
        </div>  
        <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
          {/* <video src={'/video/videoTest3.mp4'} autoPlay loop muted={!snap.volumeIndex} className='object-cover h-full w-full'>

            </video> */}

        </div>
    </div>
)
}

export default FrequentQuestions