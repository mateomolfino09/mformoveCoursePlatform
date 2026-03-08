'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface NextContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  nextTitle?: string;
}

export default function NextContentModal({
  isOpen,
  onClose,
  onNext,
  nextTitle
}: NextContentModalProps) {
  const handleNext = () => {
    onNext();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-palette-ink/80 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[201] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="pointer-events-auto w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl border border-palette-stone/20 bg-palette-cream shadow-xl overflow-hidden">
                <div className="p-6 text-center font-montserrat">
                  <div className="w-14 h-14 rounded-full bg-palette-sage/20 flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="w-7 h-7 text-palette-sage" />
                  </div>
                  <h3 className="text-lg font-semibold text-palette-ink mb-1">
                    Contenido completado
                  </h3>
                  <p className="text-sm text-palette-stone mb-6">
                    {nextTitle
                      ? `Siguiente: ${nextTitle}`
                      : 'Hay más contenido en esta semana.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-palette-sage text-palette-cream font-medium text-sm hover:bg-palette-sage/90 transition-colors"
                    >
                      Ir al siguiente
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-palette-stone/30 text-palette-stone font-medium text-sm hover:bg-palette-stone/10 transition-colors"
                    >
                      Seguir aquí
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
