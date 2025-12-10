'use client';

import { motion, AnimatePresence } from 'framer-motion';

// Colores naturales Move Crew - Crema y Salmón
const CREAM = '#FFFDFD';
const CREAM_LIGHT = '#FEFCF8';
const CREAM_DARK = '#F5F1E8';
const SALMON = '#F97316';
const SALMON_LIGHT = '#FB923C';
const SALMON_DARK = '#EA580C';
const SALMON_SOFT = '#FED7AA';
const EARTH_BROWN = '#8B4513';
const NATURAL_GRAY = '#6B7280';

interface CoherenceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  tip?: string;
  reason?: string;
  weekNumber?: number;
  contentType?: string;
}

const CoherenceInfoModal = ({
  isOpen,
  onClose,
  message,
  tip,
  reason,
  weekNumber,
  contentType
}: CoherenceInfoModalProps) => {
  // Determinar el tipo de mensaje según el reason con colores naturales
  const getMessageType = () => {
    if (reason === 'VIDEO_ALREADY_COMPLETED' || reason === 'AUDIO_ALREADY_COMPLETED') {
      return {
        icon: '✓',
        iconColor: SALMON,
        iconBg: `${SALMON_SOFT}40`
      };
    }
    if (reason === 'ADDITIONAL_WEEK_LIMIT_REACHED') {
      return {
        icon: 'ℹ',
        iconColor: SALMON_LIGHT,
        iconBg: `${SALMON_SOFT}40`
      };
    }
    return {
      icon: '⚠',
      iconColor: SALMON_DARK,
      iconBg: `${SALMON_SOFT}40`
    };
  };

  const messageType = getMessageType();

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

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              className="pointer-events-auto relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${CREAM} 0%, ${CREAM_LIGHT} 50%, ${CREAM_DARK} 100%)`,
                borderColor: `${SALMON}30`,
                borderWidth: '1px'
              }}
            >
              {/* Contenido */}
              <div className="p-6">
                {/* Icono natural y minimalista */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 20
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
                  style={{
                    backgroundColor: messageType.iconBg
                  }}
                >
                  <span className="text-3xl" style={{ color: messageType.iconColor }}>
                    {messageType.icon}
                  </span>
                </motion.div>

                {/* Mensaje principal - minimalista */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-light font-montserrat tracking-wide mb-4 text-center"
                  style={{ color: EARTH_BROWN }}
                >
                  {message}
                </motion.h3>

                {/* Información adicional - minimalista */}
                {weekNumber && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4 p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${SALMON_SOFT}20`,
                      borderColor: `${SALMON}20`
                    }}
                  >
                    <p className="text-sm font-light font-montserrat text-center" style={{ color: EARTH_BROWN }}>
                      <span className="font-medium">Semana {weekNumber}</span>
                      {contentType && (
                        <span className="mx-2">•</span>
                      )}
                      {contentType && (
                        <span>
                          {contentType === 'visual' ? 'Video' : contentType === 'audio' || contentType === 'audioText' ? 'Audio' : contentType}
                        </span>
                      )}
                    </p>
                  </motion.div>
                )}

                {/* Tip - estilo natural */}
                {tip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-4 p-4 rounded-lg border-l-2"
                    style={{
                      backgroundColor: `${SALMON_SOFT}30`,
                      borderLeftColor: SALMON
                    }}
                  >
                    <p className="text-xs font-light font-montserrat leading-relaxed text-center" style={{ color: EARTH_BROWN }}>
                      {tip}
                    </p>
                  </motion.div>
                )}

                {/* Explicación según el reason - estilo natural */}
                {reason === 'ADDITIONAL_WEEK_LIMIT_REACHED' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4 p-4 rounded-lg border"
                    style={{
                      backgroundColor: `${SALMON_SOFT}20`,
                      borderColor: `${SALMON}20`
                    }}
                  >
                    <p className="text-xs font-light font-montserrat leading-relaxed text-center" style={{ color: EARTH_BROWN }}>
                      <span className="font-medium">Sistema de Constancia:</span> Para fomentar la constancia semanal, 
                      cada semana adicional del programa completada en la misma semana calendario 
                      solo otorga 1 U.C. en total (aunque completes video y audio). 
                      La primera semana del programa en cada semana calendario puede otorgar hasta 2 U.C. (1 video + 1 audio).
                    </p>
                  </motion.div>
                )}

                {/* Botón de cerrar - con gradiente análogo a Completados/U.C */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="w-full font-light font-montserrat py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm border"
                  style={{
                    background: `linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(225, 29, 72, 0.3) 100%)`,
                    borderColor: 'rgba(251, 191, 36, 0.4)',
                    borderWidth: '1px',
                    color: EARTH_BROWN,
                    boxShadow: `0 4px 12px rgba(245, 158, 11, 0.15)`
                  }}
                >
                  Entendido
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CoherenceInfoModal;

