'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IndividualClass } from '../../../../../typings';
import type { ModuleForLibrary } from '../../../../components/PageComponent/ClassPage/LibraryModuleView';
import OnboardingGuard from '../../../../components/OnboardingGuard';
import LibraryModuleView from '../../../../components/PageComponent/ClassPage/LibraryModuleView';
import ModuleLibrarySkeleton from '../../../../components/ModuleLibrarySkeleton';
import { routes } from '../../../../constants/routes';

export default function LibraryModulePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [module, setModule] = useState<ModuleForLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      try {
        const [moduleRes, classesRes] = await Promise.all([
          fetch(`/api/class-modules/by-slug/${slug}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
          }),
          fetch(`/api/individualClass/getClassesByType/${slug}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
          }),
        ]);

        if (!moduleRes.ok) {
          if (moduleRes.status === 404) setNotFound(true);
          setLoading(false);
          return;
        }

        const moduleData = await moduleRes.json();
        const classesData = await classesRes.json();

        setModule({
          name: moduleData.name,
          slug: moduleData.slug,
          description: moduleData.description ?? null,
          aboutDescription: moduleData.aboutDescription ?? null,
          howToUse: Array.isArray(moduleData.howToUse) ? moduleData.howToUse : [],
          videoUrl: moduleData.videoUrl ?? null,
          videoId: moduleData.videoId ?? null,
          videoThumbnail: moduleData.videoThumbnail ?? null,
          submodules: moduleData.submodules ?? [],
        });
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (err) {
        console.error('Error fetching module data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <OnboardingGuard>
        <ModuleLibrarySkeleton />
      </OnboardingGuard>
    );
  }

  if (notFound || !module) {
    return (
      <OnboardingGuard>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6">
          <p className="text-palette-ink text-lg">Módulo no encontrado.</p>
          <button
            type="button"
            onClick={() => router.push(routes.navegation.membership.library)}
            className="text-palette-sage hover:underline"
          >
            Volver a Biblioteca
          </button>
        </div>
      </OnboardingGuard>
    );
  }

  return (
    <OnboardingGuard>
      <LibraryModuleView module={module} classes={classes} />
    </OnboardingGuard>
  );
}
