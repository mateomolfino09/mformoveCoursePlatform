import React from 'react'
import { motion, useDomEvent } from "framer-motion";
import { alertTypes } from '../constants/alertTypes';

const transition = {
    type: "spring",
    damping: 25,
    stiffness: 120
  };

interface Props {
    message: string
    type: string
}

const AlertComponent = ({ message, type }: Props) => {
  console.log(message, type)
  return (
    <motion.div animate={{ opacity: message?.length > 0 ? 1 : 0 }} initial={{opacity: 0}} transition={transition} className="w-full px-8 md:px-32 lg:px-24 ">
        <div className={`${type === alertTypes.error.type ? 'bg-soft-error' : 'bg-soft-success'} rounded-md shadow-2xl p-5`}> 
           <p className='font-normal text-sm'>{message}</p> 
        </div>
    </motion.div>
  )
}

export default AlertComponent