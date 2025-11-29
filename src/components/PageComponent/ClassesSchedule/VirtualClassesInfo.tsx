'use client';
import React, { useState, useMemo } from 'react';
import { IndividualClass } from '../../../../typings';
import { ClockIcon, AcademicCapIcon, TagIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  classes: IndividualClass[];
}

const levelLabels: { [key: number]: string } = {
  1: 'Principiante',
  2: 'Intermedio',
  3: 'Avanzado',
  0: 'Todos los niveles'
};

const VirtualClassesInfo: React.FC<Props> = ({ classes }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();

  // Obtener tipos únicos de clases
  const classTypes = useMemo(() => {
    const types = new Set(classes.map(clase => clase.type));
    return Array.from(types);
  }, [classes]);

  // Filtrar clases por tipo seleccionado
  const filteredClasses = useMemo(() => {
    if (!selectedType) return classes;
    return classes.filter(clase => clase.type === selectedType);
  }, [classes, selectedType]);

  // Agrupar clases por tipo
  const classesByType = useMemo(() => {
    const grouped: { [key: string]: IndividualClass[] } = {};
    
    filteredClasses.forEach(clase => {
      if (!grouped[clase.type]) {
        grouped[clase.type] = [];
      }
      grouped[clase.type].push(clase);
    });

    return grouped;
  }, [filteredClasses]);

  const formatDuration = (totalTime: number, hours: number, minutes: number) => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}min`;
    } else if (totalTime > 0) {
      return `${totalTime}min`;
    }
    return 'Duración variable';
  };

  if (classes.length === 0) {
    return (
      <div className="bg-dark-soft rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white font-boldFont mb-4">
          Clases Virtuales
        </h2>
        <p className="text-gray-400 font-montserrat">
          Próximamente estaremos agregando clases virtuales. ¡Mantenete atento!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-soft rounded-lg p-6 md:p-8">
      <h2 className="text-3xl font-bold text-white font-boldFont mb-4">
        Clases Virtuales
      </h2>
      <p className="text-gray-300 font-montserrat mb-6">
        Accede a nuestras clases virtuales en cualquier momento y desde cualquier lugar. 
        Explora nuestra biblioteca de clases grabadas.
      </p>

      {/* Filtro por tipo */}
      {classTypes.length > 1 && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setSelectedType(null)}
                className={`px-4 py-2 rounded-lg font-montserrat transition-all duration-200 whitespace-nowrap ${
                  selectedType === null
                    ? 'bg-white text-gray-900 font-bold'
                    : 'bg-dark text-gray-300 hover:bg-gray-700'
                }`}
            >
              Todas
            </button>
            {classTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-montserrat transition-all duration-200 whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-white text-gray-900 font-bold'
                    : 'bg-dark text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de clases por tipo */}
      <div className="space-y-8">
        {Object.entries(classesByType).map(([type, typeClasses]) => (
          <div key={type} className="space-y-4">
            {classTypes.length > 1 && (
              <h3 className="text-2xl font-bold text-white font-boldFont mb-4">
                {type}
              </h3>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typeClasses.map((clase) => (
                <Link
                  key={clase._id}
                  href={`/classes/${clase.id}`}
                  className="bg-dark rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                >
                  {/* Imagen */}
                  <div className="relative w-full h-48 overflow-hidden">
                    <CldImage
                      src={clase.image_url}
                      alt={clase.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {clase.isFree && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        Gratis
                      </div>
                    )}
                    {clase.new && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                        Nuevo
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white font-boldFont mb-2 line-clamp-2">
                      {clase.name}
                    </h4>
                    <p className="text-gray-400 font-montserrat text-sm mb-4 line-clamp-2">
                      {clase.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {/* Duración */}
                      <div className="flex items-center text-gray-300">
                        <ClockIcon className="h-4 w-4 mr-1 text-white" />
                        <span className="font-montserrat">
                          {formatDuration(clase.totalTime, clase.hours, clase.minutes)}
                        </span>
                      </div>

                      {/* Nivel */}
                      <div className="flex items-center text-gray-300">
                        <AcademicCapIcon className="h-4 w-4 mr-1 text-white" />
                        <span className="font-montserrat">
                          {levelLabels[clase.level] || `Nivel ${clase.level}`}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {clase.tags && clase.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {clase.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA para ver más clases */}
      <div className="mt-8 text-center">
        <Link
          href="/classes"
          className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-bold font-boldFont hover:bg-gray-200 transition-all duration-200"
        >
          Ver todas las clases virtuales
        </Link>
      </div>
    </div>
  );
};

export default VirtualClassesInfo;

