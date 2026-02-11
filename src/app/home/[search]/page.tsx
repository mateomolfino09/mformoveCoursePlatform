'use client';
import { useEffect, useState } from 'react';
import { IndividualClass } from '../../../../typings';
import LibrarySearch from '../../../components/PageComponent/LibrarySearch/LibrarySearch';
import { MiniLoadingSpinner } from '../../../components/PageComponent/Products/MiniSpinner';

export default function Page({ params }: { params: { search: string } }) {
  const { search } = params;
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Para controlar el estado de carga

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch(`/api/individualClass/getClasses?search=${search}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
          next: { tags: ['classes'] },
        });
        const data = await res.json();
        setClasses(data);
        setIsLoading(false); // Termina el estado de carga
      } catch (err) {
        console.error('Error fetching classes:', err);
        setIsLoading(false); // Termina el estado de carga incluso en caso de error
      }
    }

    fetchClasses();
  }, [search]); // Vuelve a ejecutarse si cambia el valor de search

  // Muestra un indicador de carga mientras los datos se están recuperando
  if (isLoading) {
    return <div> <MiniLoadingSpinner /></div>; // Puedes reemplazar este mensaje con un spinner
  }

  return <LibrarySearch classesDB={classes} search={search} />;
}
