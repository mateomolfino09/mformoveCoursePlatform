import { ClipboardDocumentCheckIcon, CloudArrowDownIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { CldImage } from 'next-cloudinary'
import React from 'react'
import imageLoader from '../../../../imageLoader'

const Philosophy = () => {
  return (
    <div className='w-full bg-tertiary font-montserrat relative'>
    <div className='w-full md:pt-0 pt-2 flex flex-col md:space-y-12 md:space-x-18 justify-center items-center px-4  pb-16 md:pb-20'> 
    <div className='flex space-y-3 flex-col md:flex-row items-start justify-start pt-4' >
      <div className='w-full h-full md:px-24'>
      <CldImage
            src={'my_uploads/plaza/DSC09529_gqtr5s'}
            preserveTransformations
            width={1000}
            height={1000}
            className={`object-cover rounded-md h-full w-full max`}
            alt={'Rutina Imagen'}
            loader={imageLoader}
          />
      </div>

    <div className=' font-montserrat font-normal  w-full  text-left text-white'>

      <h2 className='!text-3xl md:!text-4xl mb-1'>Nuestra <strong>FILOSOFÍA</strong>
      </h2>
      <p className='text-start text-gray-300'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aut, inventore aliquam? Tempora accusantium alias asperiores magnam, veritatis corrupti animi laudantium delectus perferendis corporis, iste ipsum nihil adipisci nostrum sint modi?
          <br/><br/>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita commodi, molestias quidem amet aliquam modi adipisci velit odit? Aliquid atque reprehenderit eum iusto perspiciatis recusandae doloribus eius porro facere. Doloribus. 
          <br/><br/>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dignissimos neque sapiente ab cum corrupti eius id consequuntur. Nulla nisi, facilis minus ullam nam beatae aut eos maxime at repudiandae sit.</p>
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

export default Philosophy