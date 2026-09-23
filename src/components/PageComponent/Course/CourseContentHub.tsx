'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Link from 'next/link';
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

export default function CourseContentHub({ slug }: Props) {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<CourseContentHubData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/curso/${slug}/contenido`, { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'No se pudo cargar el contenido');
        return json as CourseContentHubData;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
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
          <div className="mx-auto w-full max-w-lg px-5 py-12 md:px-8 md:py-16">
            <Link
              href={routes.user.perfil}
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-palette-stone transition-colors hover:text-palette-ink"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Mis cursos
            </Link>
            <div className="rounded-lg border border-palette-stone/20 bg-white/70 p-5 space-y-4">
              <p className="text-[14px] text-palette-ink">{error}</p>
              <Link
                href={landingPath}
                className="inline-flex rounded-full border-2 border-palette-ink px-5 py-2 text-sm font-semibold uppercase tracking-wide"
              >
                Ver página del curso
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </MainSideBar>
    );
  }

  if (!data) return null;

  return <CourseContentHubView data={data} />;
}
