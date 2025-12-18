'use client';
import { useEffect, useState } from 'react';
import CreateClass from '../../../../../components/PageComponent/CreateClass/CreateClass';
import { MiniLoadingSpinner } from '../../../../../components/PageComponent/Products/MiniSpinner';
import { ClassTypes } from '../../../../../typings';

// Variable global declarada fuera del componente
let filters: ClassTypes[] = [];

export default function Page() {
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/individualClass/getClassTypes', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
          next: { tags: ['classFilters'] },
        });

        const classTypesData = await res.json();

        filters = classTypesData;

        setIsLoading(false); // Termina la carga después de que la llamada finalice
      } catch (err) {
        console.error('Error fetching class types:', err);
        setIsLoading(false); // Termina la carga incluso en caso de error
      }
    }

    fetchData(); // Ejecutar la función de carga de datos
  }, []); // El efecto se ejecutará solo una vez al montar el componente

  if (isLoading) {
    return <div> <MiniLoadingSpinner /></div>; 
  }

  // Renderizar el componente CreateClass solo después de que los datos estén disponibles
  return <CreateClass classTypes={filters} />;
}
