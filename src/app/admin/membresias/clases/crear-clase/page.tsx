'use client';
import { useEffect, useState } from 'react';
import CreateClass from '../../../../../components/PageComponent/CreateClass/CreateClass';
import { MiniLoadingSpinner } from '../../../../../components/PageComponent/Products/MiniSpinner';
import { ClassTypes, ClassModule } from '../../../../../typings';

let filters: ClassTypes[] = [];
let classModules: ClassModule[] = [];

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [filtersRes, modulesRes] = await Promise.all([
          fetch('/api/individualClass/getClassTypes', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0' },
            next: { tags: ['classFilters'] },
          }),
          fetch('/api/class-modules?all=1', { credentials: 'include', cache: 'no-store' }),
        ]);
        const classTypesData = await filtersRes.json();
        const modulesData = await modulesRes.json();
        filters = Array.isArray(classTypesData) ? classTypesData : [];
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
    return <div><MiniLoadingSpinner /></div>;
  }

  return <CreateClass classTypes={filters} classModules={classModules} />;
}
