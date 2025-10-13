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
            className="object-cover object-center select-none pointer-events-none opacity-50 w-full h-full"
            preserveTransformations
            loader={imageLoader}
          />
        </motion.div>
      </AnimatePresence>
      {/* Título y subtítulo centrados - Estilo moderno minimalista */}
      {!hideText && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 ${isMobile ? 'justify-start pb-32' : ''}`}>
          <motion.div 
            className="px-6 py-8 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Título con tipografía grande y moderna */}
            <h1 className="text-7xl leading-[4rem] md:text-8xl font-bold text-white mb-8 font-montserrat text-center tracking-tight">
              Mentoría Online
            </h1>
            
            {/* Subtítulo con mejor jerarquía visual */}
            <p className="text-xl md:text-3xl text-white/95 font-light max-w-3xl mx-auto font-montserrat text-center mb-12 leading-relaxed">
              Programa personalizado guiado por <span className="font-semibold">Mateo Molfino</span>
            </p>
            
            {/* Botón moderno con fondo gris transparente */}
            <div className="flex justify-center gap-4">
              <motion.button
                onClick={() => router.push('/mentorship/consulta')}
                className="bg-white/20 backdrop-blur-md text-white px-8 md:px-12 py-4 md:py-5 font-semibold text-base md:text-lg hover:bg-white hover:text-black transition-all duration-300 font-montserrat rounded-xl border border-white/30 shadow-2xl"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Agendar Consulta
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MentorshipBannerCarousel; 