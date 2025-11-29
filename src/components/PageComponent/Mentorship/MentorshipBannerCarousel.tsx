'use client'
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useRouter } from 'next/navigation';

const MentorshipBannerCarousel = ({ hideText = false }: { hideText?: boolean }) => {
  const router = useRouter();

  return (
    <section className="relative w-full h-[100vh] md:h-screen flex items-center justify-center overflow-hidden">
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
      </div>

      {/* Título y subtítulo centrados - Estilo moderno minimalista */}
      {!hideText && (
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white font-montserrat">
          <motion.div 
            className="px-6 py-8 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Título con tipografía grande y moderna */}
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-7xl leading-[4rem] md:text-8xl font-bold text-white mb-8 font-montserrat text-center tracking-tight drop-shadow-2xl"
            >
              Mentoría Online
            </motion.h1>
            
            {/* Subtítulo con mejor jerarquía visual */}
            <motion.p 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-3xl text-white/95 font-light max-w-3xl mx-auto font-montserrat text-center mb-12 leading-relaxed drop-shadow-lg"
            >
              Programa personalizado guiado por <span className="font-semibold">Mateo Molfino</span>
            </motion.p>
            
            {/* Botón moderno con estilo crema y violeta */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center gap-4"
            >
              <motion.button
                onClick={() => router.push('/mentorship/consulta')}
                className="bg-gradient-to-r from-[#FAF8F3]/20 via-[#E8D5F0]/20 to-[#AF50E5]/20 backdrop-blur-md text-white px-8 md:px-12 py-4 md:py-5 font-semibold text-base md:text-lg hover:from-[#FAF8F3]/30 hover:via-[#E8D5F0]/30 hover:to-[#AF50E5]/30 hover:text-white transition-all duration-300 font-montserrat rounded-2xl border border-[#AF50E5]/40 shadow-2xl shadow-[#AF50E5]/10"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Agendar Consulta
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default MentorshipBannerCarousel; 