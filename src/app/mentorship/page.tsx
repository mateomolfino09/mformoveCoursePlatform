'use client'
import { useEffect, useState } from 'react';
import Mentorship from '../../components/PageComponent/Mentorship/Mentorship';
import { MentorshipPlan } from '../../types/mentorship';
import MentorshipPlansLoading from '../../components/PageComponent/Mentorship/MentorshipPlansLoading';

export const revalidate = 0;
export const fetchCache = 'force-no-store'

export default function MentorshipPage() {
  const [plans, setPlans] = useState<MentorshipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMentorshipPlans() {
      try {
        setLoading(true);
        setError(null);
        
    
        
        const res = await fetch('/api/payments/getPlans?type=mentorship', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
        });
        

        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error en respuesta:', errorText);
          throw new Error(`Error al cargar los planes de mentoría (${res.status}): ${errorText}`);
        }
        
        const data = await res.json();

        
        if (!Array.isArray(data)) {
          console.error('❌ Los datos no son un array:', data);
          throw new Error('Formato de datos inválido');
        }
        
        // Filtrar solo planes activos
        const activePlans = data.filter((plan: MentorshipPlan) => plan.active);

        
        setPlans(activePlans);
      } catch (err) {
        console.error('❌ Error fetching mentorship plans:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchMentorshipPlans();
  }, []);

  if (loading) {
    return (
      <MentorshipPlansLoading show={true} />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-palette-cream flex flex-col items-center justify-center px-6 py-16 font-montserrat">
        <div className="w-full max-w-md rounded-2xl border border-palette-stone/25 bg-white/60 backdrop-blur-sm p-8 text-center shadow-[0_4px_24px_rgba(20,20,17,0.06)]">
          <p className="text-sm uppercase tracking-[0.2em] text-palette-stone/80 mb-2">Mentoría</p>
          <p className="text-palette-ink text-lg font-medium leading-snug">No pudimos cargar los planes.</p>
          <p className="mt-3 text-sm text-palette-stone font-light leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 w-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-6 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-skysteel hover:border-palette-skysteel hover:text-palette-ink transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Verificar si hay planes
  if (!plans || plans.length === 0) {
    return (
      <div className="min-h-screen bg-palette-cream flex items-center justify-center px-6 py-16 font-montserrat">
        <div className="w-full max-w-md rounded-2xl border border-palette-stone/25 bg-white/60 backdrop-blur-sm p-8 text-center text-palette-ink shadow-[0_4px_24px_rgba(20,20,17,0.06)]">
          <p className="text-sm uppercase tracking-[0.2em] text-palette-stone/80 mb-2">Mentoría</p>
          <p className="text-lg font-medium">No hay planes disponibles en este momento.</p>
          <p className="mt-3 text-sm text-palette-stone font-light">
            Volvé a intentar más tarde o escribinos a{' '}
            <a href="mailto:hola@mformove.com" className="text-palette-sage underline hover:text-palette-ink">
              hola@mformove.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return <Mentorship plans={plans} origin={typeof window !== 'undefined' ? window.location.origin : ''} />;
} 