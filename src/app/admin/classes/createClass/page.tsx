'use client';
import { useEffect, useState } from 'react';
import CreateClass from '../../../../components/PageComponent/CreateClass/CreateClass';

export default function Page() {
  const [classTypes, setClassTypes] = useState([]);

  useEffect(() => {
    async function fetchClassTypes() {
      try {
        const res = await fetch('/api/individualClass/getClassTypes', {
          // Configuración para evitar el caché en todas partes:
          cache: 'no-store', // Deshabilita el caché del navegador
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0', // Deshabilita el caché del servidor
          },
          next: {
            tags: ['classFilters'],
          },
        });
        const data = await res.json();
        setClassTypes(data);
      } catch (err) {
        console.error('Error fetching class types:', err);
      }
    }

    fetchClassTypes();
  }, []);

  return <CreateClass classTypes={classTypes} />;
}
