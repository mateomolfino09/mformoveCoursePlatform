'use client';

import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const AutomationPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [automationStatus, setAutomationStatus] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/login');

    fetchPrograms();
  }, [auth.user]);

  const fetchPrograms = async () => {
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

  const triggerAutomation = async (programId: string) => {
    try {
      setAutomationStatus(prev => ({ ...prev, [programId]: 'running' }));
      
      const response = await fetch('/api/events/automate-transformational-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programId })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Automatización ejecutada: ${data.emailsEnviados} emails enviados, ${data.contenidoDesbloqueado} semanas desbloqueadas`);
        setAutomationStatus(prev => ({ ...prev, [programId]: 'success' }));
      } else {
        toast.error(data.error || 'Error ejecutando automatización');
        setAutomationStatus(prev => ({ ...prev, [programId]: 'error' }));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error ejecutando automatización');
      setAutomationStatus(prev => ({ ...prev, [programId]: 'error' }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className='bg-gray-700 w-full md:h-[100vh] p-6'>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className='text-white font-montserrat text-3xl font-bold'>
              Automatización de Programas
            </h1>
            <p className='text-gray-300 text-sm mt-2'>
              Configura y ejecuta la automatización de contenido y emails
            </p>
          </div>
          <SparklesIcon className="w-8 h-8 text-blue-400" />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-2">Cargando programas...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Información general */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4 flex items-center">
                <EnvelopeIcon className="w-6 h-6 mr-2 text-blue-400" />
                Configuración de Automatización
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-blue-400 font-semibold mb-2">Emails Automáticos</h3>
                  <p className="text-gray-300">Se envían automáticamente cuando se desbloquea contenido semanal</p>
                </div>
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-green-400 font-semibold mb-2">Desbloqueo de Contenido</h3>
                  <p className="text-gray-300">El contenido se desbloquea según las fechas programadas</p>
                </div>
                <div className="bg-gray-500 p-4 rounded">
                  <h3 className="text-purple-400 font-semibold mb-2">Integración Vimeo</h3>
                  <p className="text-gray-300">Los videos se vinculan automáticamente con el contenido semanal</p>
                </div>
              </div>
            </div>

            {/* Lista de programas */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Programas Disponibles</h2>
              
              {programs.length === 0 ? (
                <div className="text-center py-8">
                  <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No hay programas transformacionales configurados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map((program: any) => (
                    <div key={program._id} className="bg-gray-500 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{program.nombre}</h3>
                          <p className="text-gray-300 text-sm">
                            Estado: {program.programaTransformacional?.estadoCohorte || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(automationStatus[program._id])}
                          <button
                            onClick={() => triggerAutomation(program._id)}
                            disabled={automationStatus[program._id] === 'running'}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Ejecutar Automatización</span>
                          </button>
                        </div>
                      </div>

                      {/* Configuración de automatización */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-400 rounded p-3">
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            Emails Automáticos
                          </h4>
                          <p className="text-gray-200 text-sm">
                            {program.programaTransformacional?.automatizacion?.emailsAutomaticos ? 
                              '✅ Activado' : '❌ Desactivado'}
                          </p>
                        </div>
                        
                        <div className="bg-gray-400 rounded p-3">
                          <h4 className="text-white font-semibold mb-2 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Contenido Vimeo
                          </h4>
                          <p className="text-gray-200 text-sm">
                            {program.programaTransformacional?.automatizacion?.contenidoVimeo ? 
                              '✅ Activado' : '❌ Desactivado'}
                          </p>
                        </div>
                      </div>

                      {/* Semanas configuradas */}
                      <div className="mt-4">
                        <h4 className="text-white font-semibold mb-2">Semanas Configuradas</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {program.programaTransformacional?.semanas?.map((semana: any, index: number) => (
                            <div key={index} className="bg-gray-400 rounded p-2 text-center">
                              <p className="text-white font-semibold text-sm">Semana {semana.numero}</p>
                              <p className="text-gray-200 text-xs">
                                {new Date(semana.fechaDesbloqueo).toLocaleDateString()}
                              </p>
                              <p className="text-gray-200 text-xs">
                                {semana.desbloqueado ? '✅ Desbloqueado' : '⏳ Pendiente'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-gray-600 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Información Importante</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    La automatización se ejecuta automáticamente cada hora mediante un cron job
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Los emails se envían solo una vez por semana y participante
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Puedes ejecutar la automatización manualmente para pruebas
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdmimDashboardLayout>
  );
};

export default AutomationPage; 