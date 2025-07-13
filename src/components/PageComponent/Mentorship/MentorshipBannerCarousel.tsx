import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useRouter } from 'next/navigation';

const imagesDesktop = [
  'my_uploads/plaza/DSC03370_l1kh3e',
  'my_uploads/plaza/DSC03365_y5bgqb',
  'my_uploads/plaza/DSC03366_ctiejt',
  'my_uploads/plaza/DSC03350_vgjrrh',
];

const imagesMobile = [
  'my_uploads/plaza/IMG_0354_flcgrh',
  'my_uploads/plaza/IMG_0335_b2cptb',
  'my_uploads/plaza/IMG_0311_ytnskw',
];

const AUTO_PLAY_INTERVAL = 5000;

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);
  return isMobile;
}

const MentorshipBannerCarousel = ({ hideText = false }: { hideText?: boolean }) => {
  const isMobile = useIsMobile();
  const images = isMobile ? imagesMobile : imagesDesktop;
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setCurrent(0);
  }, [isMobile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={images[current]}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <CldImage
            src={images[current]}
            width={1920}
            height={1080}
            alt={`Mentoría banner ${current + 1}`}
            className="object-cover object-center select-none pointer-events-none opacity-70 w-full h-full"
            preserveTransformations
            loader={imageLoader}
          />
        </motion.div>
      </AnimatePresence>
      {/* Título y subtítulo centrados */}
      {!hideText && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 ${isMobile ? 'justify-start pb-32' : ''}`}>
          <div className="px-6 py-8 rounded-xl to-transparent">
            {/* Contenedor relativo para el título y el subrayado */}
            <div className="relative inline-block w-full">
              <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl mb-6 font-montserrat text-center relative z-10">
                Mentoría Online
              </h1>
            </div>
            <p className="text-xl md:text-3xl text-white font-light drop-shadow-xl max-w-2xl mx-auto font-montserrat text-center mb-8">
              Programa personalizado guiado por <span className="font-semibold">Mateo Molfino</span>
            </p>
            
            {/* Botón de Agendar Consulta */}
            <div className="flex justify-center">
              <motion.button
                onClick={() => router.push('/mentorship/consulta')}
                className="relative bg-gradient-to-r from-[#234C8C] to-[#1a3763] text-white px-8 py-3 rounded-full font-bold text-base md:text-lg hover:from-[#1a3763] hover:to-[#234C8C] transition-all duration-500 transform hover:scale-105 shadow-2xl font-montserrat border-2 border-white/20 backdrop-blur-sm overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {/* Contenido del botón */}
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendar Consulta
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipBannerCarousel; 