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
  const isError = type === alertTypes.error.type;
  const bg = isError ? 'bg-amber-500/10' : 'bg-emerald-500/10';
  const border = isError ? 'border-amber-300/40' : 'border-emerald-300/40';
  const text = isError ? 'text-amber-50' : 'text-emerald-50';

  return (
    <motion.div
      animate={{ opacity: message?.length > 0 ? 1 : 0 }}
      initial={{ opacity: 0 }}
      transition={transition}
      className="w-full md:px-16 lg:px-12"
    >
      <div className={`my-4 rounded-2xl ${bg} border ${border} shadow-2xl p-4 sm:p-5`}>
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isError ? 'bg-amber-500/20 border-amber-300/60' : 'bg-emerald-500/20 border-emerald-300/60'} border text-sm font-bold ${text}`}
          >
            {isError ? '!' : '✓'}
          </span>
          <p className={`font-medium text-sm leading-snug ${text}`}>{message}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default AlertComponent