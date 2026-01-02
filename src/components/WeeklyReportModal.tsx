'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function WeeklyReportModal({ isOpen, onClose, onComplete }: WeeklyReportModalProps) {
  const [feedbackSensorial, setFeedbackSensorial] = useState('');
  const [feedbackTecnico, setFeedbackTecnico] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackSensorial.trim() || !feedbackTecnico.trim()) {
      alert('Por favor completa ambos campos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/weekly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          feedbackSensorial,
          feedbackTecnico
        })
      });

      if (response.ok) {
        onComplete();
        onClose();
        // Reset form
        setFeedbackSensorial('');
        setFeedbackTecnico('');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar el reporte');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Reporte de Cosecha
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-300 mb-6">
                Has completado 2 prácticas esta semana. Compartí tu experiencia para 
                seguir creciendo juntos.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Sensorial */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Feedback Sensorial
                  </label>
                  <p className="text-sm text-gray-400 mb-3">
                    ¿Cómo te sentiste durante las prácticas? ¿Qué sensaciones notaste 
                    en tu cuerpo? ¿Hubo algún momento de conexión o descubrimiento?
                  </p>
                  <textarea
                    value={feedbackSensorial}
                    onChange={(e) => setFeedbackSensorial(e.target.value)}
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Describe tus sensaciones, emociones y descubrimientos..."
                    required
                  />
                </div>

                {/* Feedback Técnico */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Feedback Técnico
                  </label>
                  <p className="text-sm text-gray-400 mb-3">
                    ¿Qué aspectos técnicos notaste? ¿Hubo movimientos que te costaron 
                    más? ¿Qué progresos observaste en tu ejecución?
                  </p>
                  <textarea
                    value={feedbackTecnico}
                    onChange={(e) => setFeedbackTecnico(e.target.value)}
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                    placeholder="Describe aspectos técnicos, dificultades y progresos..."
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

