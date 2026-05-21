'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MainSideBar from '../../../../../components/MainSidebar/MainSideBar';
import FooterProfile from '../../../../../components/PageComponent/Profile/FooterProfile';
import CourseCheckoutStart from '../../../../../components/PageComponent/Course/CourseCheckoutStart';
import CourseCheckoutSkeleton from '../../../../../components/PageComponent/Course/CourseCheckoutSkeleton';
import { CursoLandingProvider } from '../../../../../components/PageComponent/Course/CursoLandingContext';
import { CursoLandingConfig, CursoPlanPago } from '../../../../../types/cursoLanding';

interface CursoEmpezarPageProps {
  params: {
    cursoNombre: string;
  };
}

type CursoCheckoutPayload = {
  product: {
    _id?: string;
    nombre: string;
    portada?: string;
  };
  cursoConfig: CursoLandingConfig;
  opcionesPago: CursoPlanPago[];
  pricingModo?: 'preventa' | 'lanzamiento';
  preventaTierIndex?: number | null;
};

export default function CursoEmpezarPage({ params }: CursoEmpezarPageProps) {
  const [landing, setLanding] = useState<CursoCheckoutPayload | null>(null);
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

        const data = JSON.parse(text) as CursoCheckoutPayload;
        setLanding({
          product: data.product,
          cursoConfig: data.cursoConfig,
          opcionesPago: Array.isArray(data.opcionesPago) ? data.opcionesPago : [],
          pricingModo: data.pricingModo,
          preventaTierIndex: data.preventaTierIndex ?? null,
        });
      } catch (err) {
        console.error(`Error obteniendo checkout /curso/${params.cursoNombre}/empezar`, err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    fetchCurso();
  }, [params.cursoNombre]);

  if (error) {
    return (
      <motion.div className="min-h-screen bg-palette-cream flex flex-col items-center justify-center text-palette-ink font-montserrat px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tuvimos un problema</h1>
        <p className="text-base md:text-lg text-palette-stone max-w-xl mb-6">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink rounded-xl font-semibold transition-all duration-200"
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  if (!landing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative min-h-screen"
      >
        <CourseCheckoutSkeleton />
      </motion.div>
    );
  }

  const checkoutPlans = landing.opcionesPago;
  const checkoutImagePublicId =
    landing.cursoConfig.imagenCheckoutPublicId || landing.product?.portada || '';

  return (
    <CursoLandingProvider
      cursoConfig={landing.cursoConfig}
      productName={landing.product?.nombre || landing.cursoConfig.introHighlights.titulo}
      slug={params.cursoNombre}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative min-h-screen overflow-x-hidden bg-palette-cream"
      >
        <MainSideBar where="membership" forceStandardHeader>
          <CourseCheckoutStart
            checkoutPlans={checkoutPlans}
            checkoutImagePublicId={checkoutImagePublicId}
            productId={
              landing.product?._id != null ? String(landing.product._id) : undefined
            }
            pricingModo={landing.pricingModo}
            preventaTierIndex={landing.preventaTierIndex}
          />
          <FooterProfile />
        </MainSideBar>
      </motion.div>
    </CursoLandingProvider>
  );
}
