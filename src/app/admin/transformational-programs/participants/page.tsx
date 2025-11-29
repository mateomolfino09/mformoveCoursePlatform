'use client';

import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { 
  UsersIcon, 
  UserIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ParticipantsPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
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

  const fetchParticipants = async (programId: string) => {
    try {
      const response = await fetch(`/api/events/get-transformational-participants?programId=${programId}`);
      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants);
      }
    } catch (error) {
      console.error('Error cargando participantes:', error);
    }
  };

  const handleProgramSelect = (program: any) => {
    setSelectedProgram(program);
    fetchParticipants(program._id);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'inscrito':
        return <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Inscrito</span>;
      case 'en_curso':
        return <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">En Curso</span>;
      case 'completado':
        return <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Completado</span>;
      case 'abandonado':
        return <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">Abandonado</span>;
      default:
        return <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs">Desconocido</span>;
    }
  };

  const getProgressIcon = (progreso: number) => {
    if (progreso >= 100) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    } else if (progreso > 0) {
      return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <AdmimDashboardLayout>
      <div className='bg-gray-700 w-full md:h-[100vh] p-6'>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className='text-white font-montserrat text-3xl font-bold'>
              Gestión de Participantes
            </h1>
            <p className='text-gray-300 text-sm mt-2'>
              Administra inscripciones y progreso de participantes
            </p>
          </div>
          <UsersIcon className="w-8 h-8 text-blue-400" />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-2">Cargando programas...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lista de programas */}
            <div className="lg:col-span-1">
              <div className="bg-gray-600 rounded-lg p-6">
                <h2 className="text-white text-xl font-semibold mb-4">Programas</h2>
                
                {programs.length === 0 ? (
                  <p className="text-gray-300">No hay programas disponibles</p>
                ) : (
                  <div className="space-y-3">
                    {programs.map((program: any) => (
                      <div
                        key={program._id}
                        onClick={() => handleProgramSelect(program)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedProgram?._id === program._id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-500 text-gray-300 hover:bg-gray-400'
                        }`}
                      >
                        <h3 className="font-semibold">{program.nombre}</h3>
                        <p className="text-sm mt-1">
                          Estado: {program.programaTransformacional?.estadoCohorte || 'N/A'}
                        </p>
                        <p className="text-sm mt-1">
                          Cupo: {program.programaTransformacional?.cupoDisponible || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lista de participantes */}
            <div className="lg:col-span-2">
              <div className="bg-gray-600 rounded-lg p-6">
                <h2 className="text-white text-xl font-semibold mb-4">
                  {selectedProgram ? `Participantes - ${selectedProgram.nombre}` : 'Selecciona un programa'}
                </h2>
                
                {!selectedProgram ? (
                  <div className="text-center py-8">
                    <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">Selecciona un programa para ver sus participantes</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No hay participantes inscritos en este programa</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participants.map((participant: any) => (
                      <div key={participant._id} className="bg-gray-500 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">
                                {participant.userId?.name || 'Usuario'}
                              </h3>
                              <p className="text-gray-300 text-sm">
                                {participant.userId?.email || 'Sin email'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getProgressIcon(participant.progreso || 0)}
                            {getStatusBadge(participant.estado)}
                          </div>
                        </div>

                        {/* Progreso */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">Progreso</span>
                            <span className="text-white">{participant.progreso || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-400 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${participant.progreso || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Información adicional */}
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              Inscrito: {new Date(participant.fechaInscripcion).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              Semanas completadas: {participant.semanasCompletadas || 0}/8
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              Última actividad: {participant.ultimaActividad ? 
                                new Date(participant.ultimaActividad).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex space-x-2 mt-4">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                            Ver Detalles
                          </button>
                          <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                            Enviar Mensaje
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdmimDashboardLayout>
  );
};

export default ParticipantsPage; 