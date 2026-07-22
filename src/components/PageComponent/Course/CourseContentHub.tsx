'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import ModuleLibrarySkeleton from '../../ModuleLibrarySkeleton';
import { routes } from '../../../constants/routes';
import CourseContentHubView, {
  type CourseContentHubData,
} from './CourseContentHubView';

type Props = {
  slug: string;
};

function hubHasHeroVideo(data: CourseContentHubData | null): boolean {
  if (!data?.hub?.heroVideoId) return false;
  return Boolean(data.hub.heroVideoId.trim());
}

export default function CourseContentHub({ slug }: Props) {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<CourseContentHubData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const handleVideoReady = useCallback(() => setVideoReady(true), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/curso/${slug}/contenido`, { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'No se pudo cargar el contenido');
        return json as CourseContentHubData;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setVideoReady(!hubHasHeroVideo(payload));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!error) return;
    dispatch(toggleScroll(true));
    return () => {
      dispatch(toggleScroll(false));
    };
  }, [dispatch, error]);

  const landingPath = routes.navegation.membership.curso(slug);

  if (loading) {
    return <ModuleLibrarySkeleton />;
  }

  if (error) {
    return (
      <MainSideBar where="membership" flowLayout>
        <div className="min-h-screen bg-palette-cream font-montserrat text-palette-ink">
          <motion.div className="mx-auto w-[90%] max-w-4xl px-4 py-10 md:py-14">
            <Link
              href={routes.user.perfil}
              className="inline-flex items-center gap-2 text-sm text-palette-stone hover:text-palette-ink mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Mis cursos
            </Link>
            <div className="rounded-2xl border border-palette-stone/25 bg-white p-6 space-y-4">
              <p className="text-palette-ink">{error}</p>
              <Link
                href={landingPath}
                className="inline-flex rounded-full border-2 border-palette-ink px-5 py-2 text-sm font-semibold uppercase tracking-wide"
              >
                Ver página del curso
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </MainSideBar>
    );
  }

  if (!data) return null;

  const showSkeletonOverlay = hubHasHeroVideo(data) && !videoReady;

  return (
    <div className="relative">
      <CourseContentHubView data={data} onVideoReady={handleVideoReady} />
      {showSkeletonOverlay && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <ModuleLibrarySkeleton />
        </div>
      )}
    </div>
  );
}
