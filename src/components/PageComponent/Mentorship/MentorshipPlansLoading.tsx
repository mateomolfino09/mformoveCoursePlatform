'use client'
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const MentorshipPlansLoading = ({ show }: { show: boolean }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!show && !isExiting) {
      setIsExiting(true);
    }
    if (show) {
      setIsExiting(false);
    }
  }, [show, isExiting]);

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsExiting(false)}>
      {show && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 bg-black z-[9999]"
        >
          <div className="absolute inset-0">
            <CldImage
              src="my_uploads/fondos/DSC01437_ds4vxz"
              alt="Mentoría Online"
              fill
              priority
              className="hidden md:block object-cover opacity-50"
              style={{ objectPosition: 'center top' }}
              preserveTransformations
              loader={imageLoader}
            />
            <CldImage
              src="my_uploads/fondos/DSC01559_elui2h"
              alt="Mentoría Online"
              fill
              priority
              className="md:hidden object-cover opacity-50"
              style={{ objectPosition: 'center top' }}
              preserveTransformations
              loader={imageLoader}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-montserrat">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm uppercase tracking-[0.4em] text-white/70 mb-4"
            >
              cargando
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Mentoría Online
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="h-10 w-10 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MentorshipPlansLoading; 