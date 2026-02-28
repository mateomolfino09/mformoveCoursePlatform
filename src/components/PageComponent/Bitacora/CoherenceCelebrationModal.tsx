'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const shapeIcon = (seed: string | number) => {
  const shapes = ['▲', '■', '●', '◆', '▴', '▢'];
  const code = typeof seed === 'number' ? seed : seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return shapes[code % shapes.length];
};

interface CoherenceCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ucsOtorgadas: number;
  totalUnits: number;
  currentStreak: number;
  esSemanaAdicional?: boolean;
  newAchievements?: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
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
  newAchievements = [],
  levelUp = false,
  newLevel,
  evolution = false,
  gorillaIcon,
  isFirstTime = false
}: CoherenceCelebrationModalProps) => {
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowAchievements(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowAchievements(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isFirstTime) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, isFirstTime]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay — estilo Move Crew (deep-teal/ink) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] bg-palette-ink/80 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[201] pointer-events-none p-4 pt-20 md:pt-28 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                duration: 0.6
              }}
              className="pointer-events-auto relative w-full max-w-md mx-auto my-auto max-h-[85vh] md:max-h-[calc(100vh-8rem)] overflow-y-auto"
            >
              {/* Contenedor — cream + bordes paleta como Move Crew */}
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-palette-stone/20 bg-palette-cream shadow-[0_12px_40px_rgba(20,20,17,0.12)]">
                {/* Efectos de fondo sutiles — sage paleta */}
                <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-palette-sage/25 w-2 h-2"
                      style={{
                        left: `${15 + (i * 7) % 80}%`,
                        top: `${10 + (i * 11) % 75}%`
                      }}
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0.6, 0.9, 0.6]
                      }}
                      transition={{
                        duration: 4 + (i % 3),
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </div>

                <div className="relative p-4 md:p-8 text-center font-montserrat">
                  {/* Icono */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 20,
                      delay: 0.2
                    }}
                    className="flex justify-center mb-4 md:mb-6"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border border-palette-sage/40 bg-palette-sage/25"
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-lg md:text-xl font-bold font-montserrat tracking-tight text-palette-sage"
                        >
                          U.C.
                        </motion.div>
                      </motion.div>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-palette-sage/70"
                          style={{
                            left: '50%',
                            top: '50%',
                            x: '-50%',
                            y: '-50%',
                            marginLeft: Math.cos((i * Math.PI) / 3) * 48 - 3,
                            marginTop: Math.sin((i * Math.PI) / 3) * 48 - 3
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 0.7, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            delay: 0.5 + i * 0.15,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Label superior — estilo Move Crew (uppercase tracking) */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone mb-2"
                  >
                    {isFirstTime ? 'Primera U.C.' : (levelUp ? (evolution ? 'Evolución' : 'Nivel') : 'Coherencia')}
                  </motion.p>

                  {/* Título */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-semibold font-montserrat tracking-tight text-palette-ink mb-2 md:mb-3"
                  >
                    {isFirstTime ? '¡Tu Primera U.C.!' : (levelUp ? (evolution ? '¡Evolución del Gorila!' : '¡Subiste de Nivel!') : 'Unidad de Coherencia')}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs md:text-sm font-light font-montserrat text-palette-stone mb-3 md:mb-4"
                  >
                    {isFirstTime ? '¡Felicidades por empezar tu camino!' : (levelUp ? (evolution ? `Tu gorila evoluciona al nivel ${newLevel}` : `Ahora eres nivel ${newLevel}`) : 'Cultivada con constancia')}
                  </motion.p>

                  {/* Badge +N U.C. — acento teal paleta */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    className="mb-4 md:mb-6"
                  >
                    <div className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full bg-palette-sage/10 border border-palette-sage/30">
                      <span className="text-2xl md:text-3xl font-semibold font-montserrat text-palette-sage">
                        +{ucsOtorgadas}
                      </span>
                      <span className="text-base md:text-lg font-medium font-montserrat tracking-tight text-palette-ink">
                        U.C.
                      </span>
                    </div>
                  </motion.div>

                  {/* Información adicional */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-2 md:space-y-3 mb-4 md:mb-5"
                  >
                    {isFirstTime ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-4"
                      >
                        <div className="p-5 rounded-xl border border-palette-stone/15 bg-palette-sage/5">
                          <h3 className="text-base font-semibold font-montserrat mb-3 text-center text-palette-ink uppercase tracking-[0.12em]">
                            ¿Qué es una U.C.?
                          </h3>
                          <div className="space-y-3 text-sm font-light font-montserrat leading-relaxed text-palette-ink">
                            <p>
                              <strong className="text-palette-stone font-medium">U.C.</strong> = <strong className="text-palette-stone font-medium">Unidad de Coherencia</strong>. Una semana completada del Camino = 1 U.C.
                            </p>
                            <p>
                              Acumulalas y canjealas por programas, material o lo que vayamos creando.
                            </p>
                            <p className="text-center mt-4 pt-3 border-t border-palette-stone/15">
                              <span className="font-medium text-palette-stone">Total actual: {totalUnits} U.C.</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                          <p className="text-sm md:text-base font-light font-montserrat text-palette-ink">
                            Total: <span className="font-medium text-palette-stone">{totalUnits} U.C.</span>
                          </p>
                          {currentStreak > 0 && (
                            <>
                              <span className="text-xs md:text-sm text-palette-sage">•</span>
                              <p className="text-sm md:text-base font-light font-montserrat text-palette-ink">
                                Racha: <span className="font-medium text-palette-stone">{currentStreak}</span>
                              </p>
                            </>
                          )}
                        </div>
                        {esSemanaAdicional && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="mt-4 p-4 rounded-xl border border-palette-stone/15 bg-palette-sage/10"
                          >
                            <p className="text-xs font-montserrat font-light leading-relaxed text-center text-palette-ink">
                              Una semana completada = 1 U.C.
                            </p>
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>

                  {/* Logros nuevos */}
                  <AnimatePresence>
                    {showAchievements && newAchievements.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.2 }}
                        className="mt-5 pt-5 border-t border-palette-stone/15"
                      >
                        <p className="font-montserrat uppercase tracking-[0.2em] text-xs text-palette-stone mb-3 text-center">
                          Nuevo Logro
                        </p>
                        {newAchievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex flex-col items-center gap-2 mb-3 p-3 rounded-xl bg-palette-sage/10 border border-palette-stone/10"
                          >
                            <span className="text-3xl text-palette-sage">{shapeIcon(achievement.name || index)}</span>
                            <div className="text-center">
                              <p className="text-sm font-medium font-montserrat mb-1 text-palette-ink">
                                {achievement.name}
                              </p>
                              <p className="text-xs font-light font-montserrat leading-relaxed text-palette-stone">
                                {achievement.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botón CTA — mismo estilo Move Crew (ink + cream, rounded-full, uppercase) */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={onClose}
                    className="mt-4 md:mt-6 w-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] py-3 md:py-3.5 px-6 rounded-full bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-ink/90 hover:border-palette-ink/90 transition-all duration-200"
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
