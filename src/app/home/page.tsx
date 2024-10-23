'use client';
import { useEffect, useState } from 'react';
import { ClassTypes, IndividualClass } from '../../../typings';
import Home from '../../components/PageComponent/Home';
import { MiniLoadingSpinner } from '../../components/PageComponent/Products/MiniSpinner';

// Variables globales declaradas fuera del componente
let filters: ClassTypes[] = [];
let classes: IndividualClass[] = [];

export default function Page() {
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga

  useEffect(() => {
    async function fetchData() {
      try {
        const [filtersRes, classesRes] = await Promise.all([
          fetch('/api/individualClass/getClassTypes', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            },
            next: { tags: ['classFilters'] },
          }),
          fetch('/api/individualClass/getClasses', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            },
            next: { tags: ['classes'] },
          }),
        ]);

        const filtersData = await filtersRes.json();
        const classesData = await classesRes.json();

        filters = filtersData;
        classes = classesData;

        setIsLoading(false); // Termina la carga después de que ambas llamadas finalicen
      } catch (err) {
        console.error('Error fetching data:', err);
        setIsLoading(false); // Aún si hay error, terminamos el estado de carga
      }
    }

    fetchData(); // Ejecutar la función de carga de datos
  }, []); // El efecto se ejecutará solo una vez al montar el componente

  if (isLoading) {
    return <div> <MiniLoadingSpinner /></div>; 
  }

  // Renderizar el componente Home solo después de que los datos estén disponibles
  return <Home filters={filters} classesDB={classes} />;
}
