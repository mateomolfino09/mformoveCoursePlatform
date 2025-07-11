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
        
        console.log('🔄 Intentando cargar planes de mentoría...');
        
        const res = await fetch('/api/payments/getPlans?type=mentorship', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
        });
        
        console.log('📡 Status de respuesta:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error en respuesta:', errorText);
          throw new Error(`Error al cargar los planes de mentoría (${res.status}): ${errorText}`);
        }
        
        const data = await res.json();
        console.log('📊 Datos recibidos:', data);
        
        if (!Array.isArray(data)) {
          console.error('❌ Los datos no son un array:', data);
          throw new Error('Formato de datos inválido');
        }
        
        // Filtrar solo planes activos
        const activePlans = data.filter((plan: MentorshipPlan) => plan.active);
        console.log('✅ Planes activos encontrados:', activePlans.length);
        
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
        <div className="text-white text-sm mt-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">No se encontraron planes de mentoría disponibles.</div>
      </div>
    );
  }

  return <Mentorship plans={plans} origin={typeof window !== 'undefined' ? window.location.origin : ''} />;
} 