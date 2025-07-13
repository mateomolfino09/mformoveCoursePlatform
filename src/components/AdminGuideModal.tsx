import { XCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect } from 'react'
import { motion as m, useAnimation } from 'framer-motion';


interface Props {
    title: string
    textArr: string[]
    visible: boolean
    handleVisiblity: any
}

const AdminGuideModal = ({ title, textArr, visible, handleVisiblity }: Props) => {
    const animation = useAnimation();

    useEffect(() => {
        if (visible) {
          animation.start({
            x: '-50%',
            y: '-50%',
            opacity: 100,
            transition: {
              delay: 0,
              ease: 'linear',
              duration: 0.4,
              stiffness: 0
            }
          });
        } else {
          animation.start({
            x: '50%',
            y: '-50%',
            opacity: 0,
            transition: {
              delay: 0,
              ease: 'linear',
              duration: 0.4,
              stiffness: 0
            }
          });
        }
      }, [visible]);

  return (
    <m.div initial={{ x: '80%', y:'-50%', opacity: 0 }}
    animate={animation} className={`absolute bg-gray-200 w-full h-auto pb-12 z-10 left-1/2 translate-x-[-50%] translate-y-[-50%] rounded-md shadow-2xl`}>
    <button
    onClick={handleVisiblity}
    className='modalButton !text-black absolute -right-2 !z-40 h-9 w-9 border-none'
    >
    <XCircleIcon className='h-6 w-6' />
    </button>
        <h3 className='text-black w-full text-center mt-2 text-xl'>{title}</h3>
        <div className='px-2 text-black mt-4' >
            {textArr.map((txt: string) => (
                <div key={txt}>
                    <p className='mb-2'>
                        {txt}   
                    </p> 
                </div>
            ))}
        </div>
    </m.div>
  )
}

export default AdminGuideModal