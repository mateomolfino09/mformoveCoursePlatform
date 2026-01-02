'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Colores naturales Move Crew - Crema y Salmón
const CREAM = '#FFFDFD';
const CREAM_LIGHT = '#FEFCF8';
const CREAM_DARK = '#F5F1E8';
const SALMON = '#F97316'; // Salmón/naranja cálido
const SALMON_LIGHT = '#FB923C';
const SALMON_DARK = '#EA580C';
const SALMON_SOFT = '#FED7AA'; // Salmón suave para fondos
const EARTH_BROWN = '#8B4513'; // Marrón tierra para textos
const NATURAL_GRAY = '#6B7280'; // Gris natural

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
  isFirstTime?: boolean; // Nueva prop para primera vez
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
      // Mostrar achievements después de 1.5 segundos
      const timer = setTimeout(() => {
        setShowAchievements(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowAchievements(false);
    }
  }, [isOpen]);

  // Auto-cerrar después de 5 segundos (solo si NO es primera vez)
  useEffect(() => {
    if (isOpen && !isFirstTime) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, isFirstTime]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay suave y natural */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200]"
            style={{
              background: `linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(249, 115, 22, 0.2) 100%)`,
              backdropFilter: 'blur(8px)'
            }}
            onClick={onClose}
          />

          {/* Modal principal */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] pointer-events-none p-4 overflow-y-auto">
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
              className="pointer-events-auto relative w-full max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Contenedor principal minimalista y natural */}
              <div 
                className="relative rounded-3xl shadow-2xl overflow-hidden border"
                style={{
                  background: `linear-gradient(135deg, ${CREAM} 0%, ${CREAM_LIGHT} 50%, ${CREAM_DARK} 100%)`,
                  borderColor: `${SALMON}30`,
                  borderWidth: '1px'
                }}
              >
                {/* Efectos de fondo sutiles y naturales - partículas orgánicas */}
                <div className="absolute inset-0 overflow-hidden opacity-40">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: `${4 + Math.random() * 6}px`,
                        height: `${4 + Math.random() * 6}px`,
                        backgroundColor: i % 2 === 0 
                          ? `${SALMON}20` 
                          : `${SALMON_SOFT}30`
                      }}
                      initial={{
                        x: Math.random() * 400,
                        y: Math.random() * 400,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{
                        scale: [0, 1.2, 0],
                        rotate: [0, 180, 360],
                        x: Math.random() * 400,
                        y: Math.random() * 400,
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: 'easeInOut'
                      }}
                    />
                  ))}
                </div>

                {/* Contenido */}
                        <div className="relative p-4 md:p-8 text-center">
                  {/* Icono natural y orgánico - semilla/hoja */}
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
                      {/* Círculo orgánico con gradiente análogo a Completados/U.C */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center backdrop-blur-sm border"
                        style={{
                          background: `linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(225, 29, 72, 0.3) 100%)`,
                          borderColor: 'rgba(251, 191, 36, 0.4)',
                          borderWidth: '1px',
                          boxShadow: `0 8px 24px rgba(245, 158, 11, 0.2)`
                        }}
                      >
                        {/* Icono de semilla/hoja - usando emoji o símbolo natural */}
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                                  className="text-3xl md:text-4xl"
                        >
                          🌱
                        </motion.div>
                      </motion.div>
                      {/* Partículas orgánicas alrededor */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: SALMON_SOFT,
                            left: '50%',
                            top: '50%'
                          }}
                          initial={{
                            x: 0,
                            y: 0,
                            scale: 0,
                            opacity: 0
                          }}
                          animate={{
                            x: Math.cos((i * Math.PI) / 3) * 50,
                            y: Math.sin((i * Math.PI) / 3) * 50,
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: 0.5 + i * 0.15,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Título minimalista y natural */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-light font-montserrat tracking-wide mb-2 md:mb-3"
                    style={{ color: EARTH_BROWN }}
                  >
                    {isFirstTime ? '¡Tu Primera U.C.!' : (levelUp ? (evolution ? '¡Evolución del Gorila!' : '¡Subiste de Nivel!') : 'Unidad de Coherencia')}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs md:text-sm font-montserrat font-light mb-3 md:mb-4"
                    style={{ color: NATURAL_GRAY }}
                  >
                    {isFirstTime ? '¡Felicidades por empezar tu camino!' : (levelUp ? (evolution ? `Tu gorila evoluciona al nivel ${newLevel}` : `Ahora eres nivel ${newLevel}`) : 'Cultivada con constancia')}
                  </motion.p>

                  {/* Mostrar icono del gorila si hay evolución */}
                  {evolution && gorillaIcon && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 150,
                        damping: 20,
                        delay: 0.6
                      }}
                      className="mb-4"
                    >
                      <div className="text-6xl">{gorillaIcon}</div>
                    </motion.div>
                  )}

                  {/* Mensaje de U.C. otorgadas - minimalista */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    className="mb-4 md:mb-6"
                  >
                    <div 
                      className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${SALMON_SOFT} 0%, ${SALMON_SOFT}80 100%)`,
                        border: `1px solid ${SALMON}30`
                      }}
                    >
                      <span className="text-2xl md:text-3xl font-light font-montserrat" style={{ color: SALMON_DARK }}>
                        +{ucsOtorgadas}
                      </span>
                      <span className="text-base md:text-lg font-light font-montserrat tracking-wide" style={{ color: EARTH_BROWN }}>
                        U.C.
                      </span>
                    </div>
                  </motion.div>

                  {/* Información adicional - minimalista */}
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
                        <div className="p-5 rounded-lg border" style={{
                          backgroundColor: `${SALMON_SOFT}20`,
                          borderColor: `${SALMON}30`
                        }}>
                          <h3 className="text-lg font-medium font-montserrat mb-3 text-center" style={{ color: EARTH_BROWN }}>
                            ¿Qué es una U.C.?
                          </h3>
                          <div className="space-y-3 text-sm font-light font-montserrat leading-relaxed" style={{ color: EARTH_BROWN }}>
                            <p>
                              <strong style={{ color: SALMON_DARK }}>U.C.</strong> significa <strong style={{ color: SALMON_DARK }}>Unidad de Coherencia</strong>. Es tu sistema de puntos en Move Crew.
                            </p>
                            <p>
                              <strong style={{ color: SALMON_DARK }}>¿Cuándo se te da?</strong> Cada vez que completás una práctica del Camino del Gorila. Idealmente, ganás 2 U.C. por semana: 1 por completar el video y 1 por completar el audio.
                            </p>
                            <p>
                              <strong style={{ color: SALMON_DARK }}>¿Para qué sirve?</strong> Acumulás U.C. para canjearlas por programas especiales, elementos, material o ropa que vamos creando. También subís de nivel y desbloqueás logros.
                            </p>
                            <p className="text-center mt-4 pt-3 border-t" style={{ borderColor: `${SALMON}20` }}>
                              <span className="font-medium" style={{ color: SALMON_DARK }}>Total actual: {totalUnits} U.C.</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                          <p className="text-sm md:text-base font-light font-montserrat" style={{ color: EARTH_BROWN }}>
                        Total: <span className="font-medium" style={{ color: SALMON_DARK }}>{totalUnits} U.C.</span>
                      </p>
                      {currentStreak > 0 && (
                        <>
                              <span className="text-xs md:text-sm" style={{ color: SALMON_SOFT }}>•</span>
                              <p className="text-sm md:text-base font-light font-montserrat" style={{ color: EARTH_BROWN }}>
                            Racha: <span className="font-medium" style={{ color: SALMON_DARK }}>{currentStreak}</span>
                          </p>
                        </>
                      )}
                    </div>
                    {esSemanaAdicional && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="mt-4 p-4 rounded-lg border"
                        style={{
                          backgroundColor: `${SALMON_SOFT}30`,
                          borderColor: `${SALMON}20`
                        }}
                      >
                        <p className="text-xs font-montserrat font-light leading-relaxed text-center" style={{ color: EARTH_BROWN }}>
                          Semana adicional: Cada semana adicional otorga 1 U.C. en total. 
                          Completa 2 U.C. por semana (1 video + 1 audio) para maximizar tus puntos.
                        </p>
                      </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>

                  {/* Logros nuevos - estilo natural */}
                  <AnimatePresence>
                    {showAchievements && newAchievements.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.2 }}
                        className="mt-5 pt-5"
                        style={{ borderTop: `1px solid ${SALMON}20` }}
                      >
                        <p className="text-xs font-light font-montserrat mb-3 tracking-wide uppercase text-center" style={{ color: NATURAL_GRAY }}>
                          Nuevo Logro
                        </p>
                        {newAchievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex flex-col items-center gap-2 mb-3 p-3 rounded-lg"
                            style={{
                              backgroundColor: `${SALMON_SOFT}20`
                            }}
                          >
                            <span className="text-3xl">{shapeIcon(achievement.name || index)}</span>
                            <div className="text-center">
                              <p className="text-sm font-medium font-montserrat mb-1" style={{ color: EARTH_BROWN }}>
                                {achievement.name}
                              </p>
                              <p className="text-xs font-light font-montserrat leading-relaxed" style={{ color: NATURAL_GRAY }}>
                                {achievement.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botón de cerrar - con gradiente análogo a Completados/U.C */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={onClose}
                            className="mt-4 md:mt-6 w-full font-light font-montserrat py-2.5 md:py-3 px-4 md:px-6 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm border text-sm md:text-base"
                    style={{
                      background: `linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(225, 29, 72, 0.3) 100%)`,
                      borderColor: 'rgba(251, 191, 36, 0.4)',
                      borderWidth: '1px',
                      color: EARTH_BROWN,
                      boxShadow: `0 4px 12px rgba(245, 158, 11, 0.15)`
                    }}
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

