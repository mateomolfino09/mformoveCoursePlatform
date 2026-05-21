'use client';
import { useEffect, useState } from 'react';
import { ClassTypes, IndividualClass, ClassModule } from '../../../typings';
import Library from '../../components/PageComponent/Library';
import OnboardingGuard from '../../components/OnboardingGuard';
import LibrarySkeleton from '../../components/LibrarySkeleton';

let filters: ClassTypes[] = [];
let classes: IndividualClass[] = [];
let classModules: ClassModule[] = [];

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [filtersRes, classesRes, modulesRes] = await Promise.all([
          fetch('/api/individualClass/getClassTypes', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
            next: { tags: ['classFilters'] },
          }),
          fetch('/api/individualClass/getClasses?populateModule=1', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
            next: { tags: ['classes'] },
          }),
          fetch('/api/class-modules', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
          }),
        ]);

        const filtersData = await filtersRes.json();
        const classesData = await classesRes.json();
        const modulesData = await modulesRes.json();

        filters = Array.isArray(filtersData) ? filtersData : [];
        classes = Array.isArray(classesData) ? classesData : [];
        classModules = Array.isArray(modulesData) ? modulesData : [];

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <LibrarySkeleton />;
  }

  return (
    <OnboardingGuard>
      <Library filters={filters} classesDB={classes} classModules={classModules} />
    </OnboardingGuard>
  );
}
