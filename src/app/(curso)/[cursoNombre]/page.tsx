'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Course from '../../../components/PageComponent/Course/Course';
import CourseLandingSkeleton from '../../../components/PageComponent/Course/CourseLandingSkeleton';
import { CursoLandingProvider } from '../../../components/PageComponent/Course/CursoLandingContext';
import { CursoLandingConfig, CursoPlanPago } from '../../../types/cursoLanding';
import state from '../../../valtio';
import { formatTitleCaseWords } from '../../../lib/formatDisplayTitle';

interface CursoNombrePageProps {
  params: {
    cursoNombre: string;
  };
}

type CursoLandingPayload = {
  product: {
    nombre: string;
  };
  cursoConfig: CursoLandingConfig;
  opcionesPago: CursoPlanPago[];
};

export default function CursoNombrePage({ params }: CursoNombrePageProps) {
  const [landing, setLanding] = useState<CursoLandingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/product/curso/${params.cursoNombre}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
        });

        const text = await response.text();
        if (!response.ok) {
          let message = 'Error al obtener el curso';
          if (text) {
            try {
              const payload = JSON.parse(text);
              if (payload?.error) {
                message = payload.error;
              } else {
                message = text;
              }
            } catch {
              message = text;
            }
          }
          throw new Error(message);
        }

        const data = JSON.parse(text) as CursoLandingPayload;
        setLanding({
          product: data.product,
          cursoConfig: data.cursoConfig,
          opcionesPago: Array.isArray(data.opcionesPago) ? data.opcionesPago : [],
        });
      } catch (err) {
        console.error(`Error obteniendo curso /${params.cursoNombre}`, err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    fetchCurso();
  }, [params.cursoNombre]);

  useEffect(() => {
    if (!landing) return;
    const raw =
      landing.product?.nombre?.trim() || landing.cursoConfig.introHighlights.titulo?.trim() || '';
    state.cursoHeaderTitle = raw ? formatTitleCaseWords(raw) : null;
  }, [landing]);

  useEffect(() => {
    return () => {
      state.cursoHeaderTitle = null;
    };
  }, []);

  if (error) {
    return (
      <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-montserrat px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tuvimos un problema</h1>
        <p className="text-base md:text-lg text-white/70 max-w-xl mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black rounded-xl font-semibold"
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  if (!landing) {
    return <CourseLandingSkeleton />;
  }

  const checkoutPlans = landing.opcionesPago.filter(
    (plan) =>
      plan.activo &&
      (Boolean(plan.paymentLink?.trim()) ||
        plan.proveedor === 'mercadopago' ||
        Boolean(plan.mercadoPagoPreferenceId))
  );

  return (
    <CursoLandingProvider
      cursoConfig={landing.cursoConfig}
      productName={landing.product?.nombre || landing.cursoConfig.introHighlights.titulo}
      slug={params.cursoNombre}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Course checkoutPlans={checkoutPlans} />
      </motion.div>
    </CursoLandingProvider>
  );
}
