'use client';

import { useEffect, useState } from 'react';
import { ClassTypes, IndividualClass } from '../../../../../typings';
import ClassesCategory from '../../../../components/PageComponent/ClassCategory/ClassCategory';
import OnboardingGuard from '../../../../components/OnboardingGuard';

export default function LibraryModulePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [filters, setFilters] = useState<ClassTypes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, filtersRes] = await Promise.all([
          fetch(`/api/individualClass/getClassesByType/${slug}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
            next: { tags: ['classes'] },
          }),
          fetch('/api/individualClass/getClassTypes', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
            next: { tags: ['classFilters'] },
          }),
        ]);
        const classesData = await classesRes.json();
        const filtersData = await filtersRes.json();
        setClasses(Array.isArray(classesData) ? classesData : []);
        setFilters(Array.isArray(filtersData) ? filtersData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <OnboardingGuard>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F7CCF]" />
        </div>
      </OnboardingGuard>
    );
  }

  return (
    <OnboardingGuard>
      <ClassesCategory classesDB={classes} filters={filters} filter={slug} />
    </OnboardingGuard>
  );
}
