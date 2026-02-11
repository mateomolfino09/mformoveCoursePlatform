'use client';

import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { PlusCircleIcon, TableCellsIcon, CogIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next13-progressbar';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const Index = () => {
  const router = useRouter();
  const auth = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/login');

    // Cargar programas transformacionales
    fetchTransformationalPrograms();
  }, [auth.user]);

  const fetchTransformationalPrograms = async () => {
    try {
      const response = await fetch('/api/product/getTransformationalPrograms');
      const data = await response.json();
      if (data.success) {
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error('Error cargando programas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className='bg-gray-700 w-full md:h-[100vh]'>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className='text-white font-montserrat text-3xl font-bold'>
              Programas Transformacionales
            </p>
            <p className='text-gray-300 text-sm mt-2'>
              Gestiona los programas de 8 semanas con contenido automático
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className='grid lg:grid-cols-2 xl:grid-cols-4 gap-5 mb-16'>
          <Link href={'/admin/products/createProduct'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer border-2 border-dashed border-gray-400'>
              <PlusCircleIcon className='w-16 h-16 text-blue-400 mb-2' />
              <p className="text-white font-semibold">Crear Nuevo Programa</p>
              <p className="text-gray-300 text-xs text-center mt-1">
                Programa de 8 semanas con automatización
              </p>
            </div>
          </Link>
          
          <Link href={'/admin/transformational-programs/analytics'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              <CogIcon className='w-16 h-16 text-green-400 mb-2' />
              <p className="text-white font-semibold">Analytics</p>
              <p className="text-gray-300 text-xs text-center mt-1">
                Métricas y progreso de participantes
              </p>
            </div>
          </Link>

          <Link href={'/admin/transformational-programs/participants'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              <UsersIcon className='w-16 h-16 text-purple-400 mb-2' />
              <p className="text-white font-semibold">Participantes</p>
              <p className="text-gray-300 text-xs text-center mt-1">
                Gestionar inscripciones y progreso
              </p>
            </div>
          </Link>

          <Link href={'/admin/transformational-programs/automation'}>
            <div className='rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer'>
              <SparklesIcon className='w-16 h-16 text-yellow-400 mb-2' />
              <p className="text-white font-semibold">Automatización</p>
              <p className="text-gray-300 text-xs text-center mt-1">
                Configurar emails y contenido automático
              </p>
            </div>
          </Link>
        </div>

        {/* Lista de programas existentes */}
        <div className="bg-gray-600 rounded-lg p-6">
          <h3 className="text-white text-xl font-semibold mb-4">Programas Activos</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-300 mt-2">Cargando programas...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8">
              <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No hay programas transformacionales creados</p>
              <p className="text-gray-400 text-sm mt-1">Crea tu primer programa para comenzar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {programs.map((program: any) => (
                <div key={program._id} className="bg-gray-500 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{program.nombre}</h4>
                                          <p className="text-gray-300 text-sm mt-1">
                        Tipo: <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                          Programa Transformacional
                        </span>
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Estado: <span className={`px-2 py-1 rounded text-xs ${
                          program.programaTransformacional?.estadoCohorte === 'abierta' ? 'bg-green-600 text-white' :
                          program.programaTransformacional?.estadoCohorte === 'en_curso' ? 'bg-blue-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {program.programaTransformacional?.estadoCohorte || 'N/A'}
                        </span>
                      </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Cupo: {program.programaTransformacional?.cupoDisponible || 0} disponibles
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/transformational-programs/edit/${program._id}`}>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        Editar
                      </button>
                    </Link>
                    <Link href={`/admin/transformational-programs/view/${program._id}`}>
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                        Ver
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdmimDashboardLayout> 
  );
}

export default Index; 