'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import Footer from '../../Footer';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {}

const Success = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Actualizar usuario para reflejar cambios del webhook
    if (auth.user) {
      auth.fetchUser();
    }
  }, [auth]);

  useEffect(() => {
    // Resetear el estado de scroll al montar el componente
    dispatch(toggleScroll(false));

    const handleScroll = () => {
      if (window.scrollY === 0) {
        dispatch(toggleScroll(false));
      } else {
        dispatch(toggleScroll(true));
      }
    };

    // Verificar el estado inicial del scroll
    if (window.scrollY === 0) {
      dispatch(toggleScroll(false));
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Resetear al desmontar también
      dispatch(toggleScroll(false));
    };
  }, [dispatch]);

  return (
    <MainSideBar where={''}>
      <section className="relative w-full h-[100vh] md:h-screen flex items-center justify-center overflow-hidden">
        {/* Imágenes de fondo - mismo estilo que MoveCrewHero */}
        <div className="absolute inset-0">
          <CldImage
            src="my_uploads/fondos/DSC01526_hcas98"
            alt="Move Crew Success"
            fill
            priority
            className="hidden md:block object-cover opacity-60"
            style={{ objectPosition: 'center top' }}
            preserveTransformations
            loader={imageLoader}
          />
          <CldImage
            src="my_uploads/fondos/fondo3_jwv9x4"
            alt="Move Crew Success"
            fill
            priority
            className="md:hidden object-cover opacity-60"
            style={{ objectPosition: 'center top' }}
            preserveTransformations
            loader={imageLoader}
          />
          {/* Overlay sutil para mejor legibilidad */}
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white font-montserrat">
          {/* Icono de éxito animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="flex justify-center mb-2"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"
              />
              <CheckCircleIcon className="relative h-24 w-24 md:h-32 md:w-32 text-green-400 drop-shadow-2xl" />
            </div>
          </motion.div>

          {/* Título principal */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-montserrat mb-6 tracking-tight drop-shadow-2xl"
          >
            ¡Bienvenido a la Move Crew!
          </motion.h1>

          {/* Mensaje principal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-white font-light max-w-3xl mx-auto mb-6 leading-relaxed drop-shadow-lg">
              Tu pago se ha procesado correctamente. Tu membresía está siendo activada y recibirás un email de confirmación en breve.
            </p>

          </motion.div>

          {/* Mensaje secundario */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <p className="text-base md:text-lg text-white/80 font-light italic leading-relaxed drop-shadow-md">
              Simple, claro y sostenible. <span className="font-semibold text-white">Hecho para acompañar tu día a día.</span>
            </p>
            <p className="text-sm md:text-base text-white/70 font-light mt-4">
              — Mateo Molfino
            </p>
          </motion.div>

          {/* Botón CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={() => router.push('/home')}
              className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md text-white px-8 md:px-12 py-4 md:py-5 font-semibold text-base md:text-lg hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 hover:text-white transition-all duration-300 font-montserrat rounded-2xl border border-amber-300/40 shadow-2xl shadow-amber-500/10 flex items-center gap-3 group"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Empezar ahora
              <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>

          {/* Indicador de carga sutil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-8"
          >
            <p className="text-sm text-white/60 font-light">
              Tu membresía se activará automáticamente en los próximos minutos
            </p>
          </motion.div>
      </div>
      </section>
      <Footer />
    </MainSideBar>
  );
};

export default Success;
