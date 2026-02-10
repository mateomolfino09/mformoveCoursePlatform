'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Footer from '../../Footer';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { routes } from '../../../constants/routes';
import { ArrowRightIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {}

const Success = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleNavigateToLibrary = () => {
    setIsLoading(true);
    router.push(routes.navegation.membership.library);
  };

  return (
    <MainSideBar where={''}>
      <section className="relative w-full min-h-[100vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-palette-deep-teal">
        {/* Imagen de fondo web */}
        <div className="absolute inset-0">
          <CldImage
            src="my_uploads/fondos/DSC01753_qdv9o0"
            alt="Move Crew Success"
            fill
            priority
            className="object-cover opacity-40"
            style={{ objectPosition: 'center top' }}
            preserveTransformations
            loader={imageLoader}
          />
          {/* Overlay paleta para coherencia Move Crew */}
          <div className="absolute inset-0 bg-palette-deep-teal/50" />
        </div>

        {/* Contenido principal — tipografía y jerarquía como Move Crew */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center font-montserrat text-palette-cream">
          {/* Label superior (estilo Move Crew) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-cream/60 mb-4"
          >
            Pago confirmado
          </motion.p>

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
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute inset-0 rounded-full blur-2xl bg-palette-sage/25"
              />
              <CheckCircleIcon 
                className="relative h-20 w-20 md:h-28 md:w-28 drop-shadow-2xl text-palette-sage" 
              />
            </div>
          </motion.div>

          {/* Título principal (estilo Move Crew: font-semibold tracking-tight) */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-semibold font-montserrat mb-6 tracking-tight text-palette-cream"
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
            <p className="text-lg md:text-xl lg:text-2xl font-light max-w-3xl mx-auto mb-6 leading-relaxed text-palette-cream/90">
              Tu pago se ha procesado correctamente. Tu membresía está siendo activada y recibirás un email de confirmación en breve.
            </p>
          </motion.div>

          {/* Mensaje secundario — font-raleway italic como Move Crew */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <p className="font-raleway italic text-palette-cream/85 text-base md:text-lg leading-relaxed">
              Simple, claro y sostenible. <span className="font-semibold not-italic text-palette-cream">Hecho para acompañar tu día a día.</span>
            </p>
            <p className="text-palette-cream/70 text-sm md:text-base font-light mt-4 font-montserrat">
              — Mateo Molfino
            </p>
          </motion.div>

          {/* Botón CTA — mismo estilo que MoveCrewCTA (cream + ink, rounded-full, uppercase) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={handleNavigateToLibrary}
              disabled={isLoading}
              className="font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-8 py-4 md:px-10 md:py-4 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-white hover:border-white transition-all duration-200 flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-palette-cream disabled:hover:border-palette-cream/80"
              whileHover={!isLoading ? { y: -2, scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <>
                  Cargando...
                  <ArrowPathIcon className="w-5 h-5 md:w-6 md:h-6 animate-spin text-palette-ink" />
                </>
              ) : (
                <>
                  Empezar ahora
                  <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 text-palette-ink group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Indicador sutil (texto secundario como Move Crew) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-8"
          >
            <p className="text-xs md:text-sm font-light text-palette-cream/60 font-montserrat">
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
