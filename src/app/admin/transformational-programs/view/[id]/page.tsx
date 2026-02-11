'use client';

import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter, useParams } from 'next/navigation';
import { 
  SparklesIcon, 
  CalendarIcon, 
  UsersIcon, 
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { toast } from '../../../../../hooks/useToast';

const ViewProgramPage = () => {
  const router = useRouter();
  const params = useParams();
  const auth = useAuth();
  const [program, setProgram] = useState<any>(null);
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

    if (params.id) {
      fetchProgram(params.id as string);
    }
  }, [auth.user, params.id]);

  const fetchProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/product/getTransformationalProgram?id=${programId}`);
      const data = await response.json();
      if (data.success) {
        setProgram(data.program);
      } else {
        toast.error('Error cargando el programa');
      }
    } catch (error) {
      console.error('Error cargando programa:', error);
      toast.error('Error cargando el programa');
    } finally {
      setLoading(false);
    }
  };

  const triggerAutomation = async () => {
    try {
      const response = await fetch('/api/events/automate-transformational-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programId: params.id })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Automatización ejecutada: ${data.emailsEnviados} emails enviados, ${data.contenidoDesbloqueado} semanas desbloqueadas`);
        fetchProgram(params.id as string); // Recargar datos
      } else {
        toast.error(data.error || 'Error ejecutando automatización');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error ejecutando automatización');
    }
  };

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-300 mt-2">Cargando programa...</p>
        </div>
      </AdmimDashboardLayout>
    );
  }

  if (!program) {
    return (
      <AdmimDashboardLayout>
        <div className="text-center py-8">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">Programa no encontrado</p>
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <div className='bg-gray-700 w-full md:h-[100vh] p-6'>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className='text-white font-montserrat text-3xl font-bold'>
              {program.nombre}
            </h1>
            <p className='text-gray-300 text-sm mt-2'>
              Programa Transformacional de 8 semanas
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={triggerAutomation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Ejecutar Automatización</span>
            </button>
            <button
              onClick={() => router.push(`/admin/transformational-programs/edit/${params.id}`)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center space-x-2"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Editar</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información general */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado del programa */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Estado del Programa</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-blue-400 font-semibold mb-2">Estado de Cohorte</h3>
                  <p className="text-white text-lg font-bold">
                    {program.programaTransformacional?.estadoCohorte || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-green-400 font-semibold mb-2">Cupo Disponible</h3>
                  <p className="text-white text-lg font-bold">
                    {program.programaTransformacional?.cupoDisponible || 0}
                  </p>
                </div>
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-purple-400 font-semibold mb-2">Duración</h3>
                  <p className="text-white text-lg font-bold">
                    {program.programaTransformacional?.duracionSemanas || 8} semanas
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración de automatización */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Configuración de Automatización</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Emails Automáticos
                  </h3>
                  <p className="text-white">
                    {program.programaTransformacional?.automatizacion?.emailsAutomaticos ? 
                      '✅ Activado' : '❌ Desactivado'}
                  </p>
                </div>
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-green-400 font-semibold mb-2 flex items-center">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Contenido Vimeo
                  </h3>
                  <p className="text-white">
                    {program.programaTransformacional?.automatizacion?.contenidoVimeo ? 
                      '✅ Activado' : '❌ Desactivado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Semanas del programa */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Semanas del Programa</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {program.programaTransformacional?.semanas?.map((semana: any, index: number) => (
                  <div key={index} className="bg-gray-500 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">Semana {semana.numero}</h3>
                      {semana.desbloqueado ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ClockIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{semana.titulo}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(semana.fechaDesbloqueo).toLocaleDateString()}
                    </p>
                    {semana.vimeoVideoId && (
                      <p className="text-blue-400 text-xs mt-1">
                        Video: {semana.vimeoVideoId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1 space-y-6">
            {/* Acciones rápidas */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/admin/transformational-programs/participants`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded flex items-center space-x-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>Ver Participantes</span>
                </button>
                <button
                  onClick={() => router.push(`/admin/transformational-programs/analytics`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded flex items-center space-x-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Ver Analytics</span>
                </button>
                <button
                  onClick={() => router.push(`/admin/transformational-programs/automation`)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded flex items-center space-x-2"
                >
                  <ClockIcon className="w-4 h-4" />
                  <span>Configurar Automatización</span>
                </button>
              </div>
            </div>

            {/* Información del programa */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Información del Programa</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-300">Precio:</p>
                  <p className="text-white font-semibold">${program.precio}</p>
                </div>
                <div>
                  <p className="text-gray-300">Moneda:</p>
                  <p className="text-white font-semibold">{program.moneda}</p>
                </div>
                <div>
                  <p className="text-gray-300">Fecha de creación:</p>
                  <p className="text-white font-semibold">
                    {new Date(program.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Estado:</p>
                  <p className="text-white font-semibold">
                    {program.activo ? '✅ Activo' : '❌ Inactivo'}
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Descripción</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {program.descripcion || 'Sin descripción disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default ViewProgramPage; 