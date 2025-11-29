'use client'
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const MoveCrewHero = () => {
  const scrollToPlans = () => {
    const target = document.getElementById('move-crew-plans');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full h-[100vh] md:h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <CldImage
          src="my_uploads/fondos/DSC01526_hcas98"
          alt="Move Crew"
          fill
          priority
          className="hidden md:block object-cover  opacity-60"
          style={{ objectPosition: 'center top' }}
          preserveTransformations
          loader={imageLoader}
        />
        <CldImage
          src="my_uploads/fondos/fondo3_jwv9x4"
          alt="Move Crew"
          fill
          priority
          className="md:hidden object-cover opacity-60"
          style={{ objectPosition: 'center top' }}
          preserveTransformations
          loader={imageLoader}
        />
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/50" /> */}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white font-montserrat">

        <motion.h1           initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}  className="text-7xl leading-[4rem] md:text-8xl font-bold text-white font-montserrat mb-8 tracking-tight drop-shadow-2xl">
                Move Crew
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-light max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-lg">
            Este es mi espacio para que <strong className="font-semibold text-white">dejes de sentirte rígido/a</strong>, 
            <strong className="font-semibold text-white"> desarrolles fuerza real</strong>, 
            <strong className="font-semibold text-white"> domines tu movilidad</strong> y te muevas con mayor libertad 
            <strong className="font-semibold text-white"> (¡y sin dolor!)</strong>.
          </p>
          <p className="text-lg md:text-xl lg:text-2xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Simple, claro y sostenible. <span className="font-semibold">Al servicio de tu vida.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={scrollToPlans}
            className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md text-white px-8 md:px-12 py-4 md:py-5 font-semibold text-base md:text-lg hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 hover:text-white transition-all duration-300 font-montserrat rounded-2xl border border-amber-300/40 shadow-2xl shadow-amber-500/10"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Ver planes disponibles
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewHero;
