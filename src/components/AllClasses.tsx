import React from 'react';
import { IndividualClass } from '../../typings';
import { ClockIcon, AcademicCapIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';

interface AllClassesProps {
  classes: IndividualClass[];
}

const formatTime = (totalTime: number) => {
  if (!totalTime) return 'No especificada';
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);
  const seconds = totalTime % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const AllClasses: React.FC<AllClassesProps> = ({ classes }) => {
  if (classes.length === 0) {
    return (
      <div className='w-full min-h-screen p-8'>
        <div className='mb-12 mt-8'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
            Clases de Membresía
          </h1>
          <p className='text-gray-600 text-lg font-montserrat'>
            Gestiona las clases exclusivas para miembros
          </p>
        </div>
        <div className='bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg'>
          <p className='text-gray-900 text-lg font-montserrat mb-4'>No hay clases disponibles.</p>
          <Link href={'/admin/memberships/classes/createClass'}>
            <button className='mt-4 px-6 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold font-montserrat'>
              Crear Primera Clase
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen p-8'>
      <div className='mb-12 mt-8'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-2'>
              Clases de Membresía
            </h1>
            <p className='text-gray-600 text-lg font-montserrat'>
              Gestiona las clases exclusivas para miembros ({classes.length} {classes.length === 1 ? 'clase' : 'clases'})
            </p>
          </div>
          <Link href={'/admin/memberships/classes/createClass'}>
            <button className='px-6 py-3 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white rounded-xl hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-montserrat font-semibold shadow-lg'>
              <span>+ Crear Clase</span>
            </button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {classes.map((clase) => (
          <div 
            key={clase.id} 
            className='group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 transition-all duration-300 cursor-pointer'
          >
            <div className='relative w-full h-48'>
              {clase.image_url ? (
                <CldImage 
                  src={clase.image_url} 
                  alt={clase.name} 
                  fill 
                  className='object-cover' 
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
                  <PhotoIcon className='w-16 h-16 text-gray-400' />
                </div>
              )}
              {clase.isFree && (
                <div className='absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold'>
                  Gratis
                </div>
              )}
              <div className='absolute top-2 left-2 bg-[#234C8C]/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm'>
                {clase.type}
              </div>
            </div>

            <div className='p-5 space-y-3'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2 font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300'>
                  {clase.name}
                </h3>
                <p className='text-gray-600 text-sm line-clamp-2 font-montserrat'>
                  {clase.description}
                </p>
              </div>

              <div className='flex flex-wrap gap-3 text-sm'>
                <div className='flex items-center gap-2 text-gray-700'>
                  <ClockIcon className='w-4 h-4 text-gray-500' />
                  <span className='font-montserrat'>{formatTime(clase.totalTime)}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <AcademicCapIcon className='w-4 h-4 text-gray-500' />
                  <span className='font-montserrat'>{clase.level}</span>
                </div>
              </div>

              <div className='pt-3 border-t border-gray-200'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-gray-500 font-montserrat'>
                    Creada: {new Date(clase.createdAt).toLocaleDateString('es-ES')}
                  </span>
                  <Link 
                    href={`/admin/memberships/classes/edit/${clase.id}`}
                    className='text-[#4F7CCF] hover:text-[#234C8C] text-sm font-semibold font-montserrat transition-colors duration-200'
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllClasses; 