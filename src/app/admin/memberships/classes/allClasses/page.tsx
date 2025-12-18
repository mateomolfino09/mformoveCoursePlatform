'use client';
import { useEffect, useState } from 'react';
import { IndividualClass } from '../../../../../../typings';
import AllClasses from '../../../../../components/AllClasses';
import { MiniLoadingSpinner } from '../../../../../components/PageComponent/Products/MiniSpinner';
import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';

export default function Page() {
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/individualClass/getClasses', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
          next: { tags: ['classes'] },
        });

        if (!res.ok) {
          throw new Error('Error fetching classes');
        }

        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <AdmimDashboardLayout>
        <div className='w-full min-h-screen flex items-center justify-center'>
          <MiniLoadingSpinner />
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <AllClasses classes={classes as IndividualClass[]} />
    </AdmimDashboardLayout>
  );
}
