'use client'
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MoveCrew from '../../components/PageComponent/MoveCrew/MoveCrew';
import MoveCrewLoading from '../../components/PageComponent/MoveCrew/MoveCrewLoading';
import { Plan } from '../../../typings';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function MoveCrewPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/payments/getPlans?type=membership', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
          }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Error al obtener los planes');
        }

        const data = await response.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error obteniendo planes de Move Crew', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        // Pequeño delay para asegurar que todo esté listo
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <MoveCrewLoading show={true} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-montserrat px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tuvimos un problema</h1>
        <p className="text-base md:text-lg text-white/70 max-w-xl mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black rounded-xl font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <MoveCrew plans={plans} />
    </motion.div>
  );
}
