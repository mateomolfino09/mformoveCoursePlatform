'use client';
import { useEffect, useState } from 'react';
import { IndividualClass } from '../../../../../typings';
import AllClasses from '../../../../../components/AllClasses';
import { MiniLoadingSpinner } from '../../../../components/PageComponent/Products/MiniSpinner';

export default function Page() {
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Para controlar el estado de carga

  useEffect(() => {
    async function fetchClasses() {
      try {
        // Cambia la URL a una URL absoluta si es necesario
        const res = await fetch('/api/individualClass/getClasses', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
          next: { tags: ['classes'] },
        });

        // Verifica si la respuesta es correcta
        if (!res.ok) {
          throw new Error('Error fetching classes');
        }

        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setIsLoading(false); // Termina el estado de carga siempre
      }
    }

    fetchClasses();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Muestra un indicador de carga mientras los datos se están recuperando
  if (isLoading) {
    return <div><MiniLoadingSpinner /></div>;
  }

  // Muestra un mensaje si no hay clases
  if (classes.length === 0) {
    return <div>No hay clases disponibles.</div>;
  }

  // Renderiza las clases cuando se obtienen correctamente
  return <AllClasses classes={classes as IndividualClass[]} />;
}
