'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface CoherenceCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ucsOtorgadas: number;
  totalUnits: number;
  currentStreak: number;
  esSemanaAdicional?: boolean;
  levelUp?: boolean;
  newLevel?: number;
  evolution?: boolean;
  gorillaIcon?: string;
  isFirstTime?: boolean;
}

const CoherenceCelebrationModal = ({
  isOpen,
  onClose,
  ucsOtorgadas,
  totalUnits,
  currentStreak,
  esSemanaAdicional = false,
  levelUp = false,
  newLevel,
  evolution = false,
  gorillaIcon,
  isFirstTime = false
}: CoherenceCelebrationModalProps) => {
  const noUcGranted = ucsOtorgadas === 0;

  useEffect(() => {
    if (isOpen && !isFirstTime) {
      const timer = setTimeout(onClose, 4500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, isFirstTime]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[200] bg-palette-ink/90 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[201] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="pointer-events-auto w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl border border-palette-stone/20 bg-palette-cream shadow-2xl overflow-hidden">
                {/* Barra superior sage — marca Move Crew */}
                <div className="h-1.5 w-full bg-palette-sage" />

                <div className="p-6 md:p-8 text-center font-montserrat">
                  {/* Icono minimalista */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.08 }}
                    className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-5 rounded-full bg-palette-sage/15 border border-palette-sage/30 flex items-center justify-center"
                  >
                    <span className="text-xl md:text-2xl font-bold font-montserrat tracking-tight text-palette-sage" aria-hidden>
                      {noUcGranted ? '✓' : 'U.C.'}
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-[10px] md:text-xs font-montserrat uppercase tracking-[0.22em] text-palette-stone mb-1.5"
                  >
                    {noUcGranted ? 'Semana completada' : isFirstTime ? 'Tu primera U.C.' : 'Unidad de coherencia'}
                  </motion.p>

                  <motion.h2
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="text-xl md:text-2xl font-semibold font-montserrat tracking-tight text-palette-ink mb-1.5"
                  >
                    {noUcGranted
                      ? '¡Seguí así!'
                      : isFirstTime
                        ? '¡Bienvenido al camino!'
                        : levelUp
                          ? (evolution ? `Evolución · Nivel ${newLevel}` : `Nivel ${newLevel}`)
                          : 'Completaste la semana'}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-light font-montserrat text-palette-stone mb-5"
                  >
                    {noUcGranted
                      ? 'Ya tenías todo esta semana completado.'
                      : isFirstTime
                        ? 'Una semana completada = 1 U.C. Acumulalas y canjealas.'
                        : 'Cultivada con constancia.'}
                  </motion.p>

                  {!noUcGranted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.38, type: 'spring', stiffness: 260 }}
                      className="inline-flex items-baseline gap-2 px-5 py-2.5 rounded-full bg-palette-sage/10 border border-palette-sage/25 mb-5"
                    >
                      <span className="text-2xl font-semibold font-montserrat text-palette-sage">+{ucsOtorgadas}</span>
                      <span className="text-sm font-medium font-montserrat text-palette-ink">U.C.</span>
                    </motion.div>
                  )}

                  {/* Total y racha — una línea */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center justify-center gap-3 flex-wrap text-xs font-light font-montserrat text-palette-stone mb-6"
                  >
                    <span>Total: <strong className="text-palette-ink font-medium">{totalUnits} U.C.</strong></span>
                    {currentStreak > 0 && (
                      <>
                        <span className="text-palette-sage/70">·</span>
                        <span>Racha: <strong className="text-palette-ink font-medium">{currentStreak}</strong></span>
                      </>
                    )}
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={onClose}
                    className="w-full font-montserrat font-medium text-sm uppercase tracking-[0.18em] py-3 px-6 rounded-full bg-palette-ink text-palette-cream hover:bg-palette-ink/90 transition-colors"
                  >
                    Continuar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CoherenceCelebrationModal;
