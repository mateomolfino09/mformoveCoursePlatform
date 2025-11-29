'use client';

import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
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

  const fetchAnalytics = async (programId: string) => {
    try {
      const response = await fetch(`/api/analytics/mentorship/transformational-program?programId=${programId}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error cargando analytics:', error);
    }
  };

  const handleProgramSelect = (program: any) => {
    setSelectedProgram(program);
    fetchAnalytics(program._id);
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-gray-500 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <AdmimDashboardLayout>
      <div className='bg-gray-700 w-full md:h-[100vh] p-6'>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className='text-white font-montserrat text-3xl font-bold'>
              Analytics de Programas
            </h1>
            <p className='text-gray-300 text-sm mt-2'>
              Métricas y estadísticas de rendimiento
            </p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-blue-400" />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-2">Cargando programas...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Analytics */}
            <div className="lg:col-span-3">
              {!selectedProgram ? (
                <div className="text-center py-8">
                  <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">Selecciona un programa para ver sus analytics</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Estadísticas principales */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Total Participantes"
                      value={analytics?.totalParticipantes || 0}
                      icon={<UsersIcon className="w-6 h-6 text-white" />}
                      color="bg-blue-600"
                    />
                    <StatCard
                      title="Tasa de Completación"
                      value={`${analytics?.tasaCompletacion || 0}%`}
                      icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
                      color="bg-green-600"
                    />
                    <StatCard
                      title="Promedio de Progreso"
                      value={`${analytics?.promedioProgreso || 0}%`}
                      icon={<ArrowTrendingUpIcon className="w-6 h-6 text-white" />}
                      color="bg-purple-600"
                    />
                    <StatCard
                      title="Semanas Activas"
                      value={analytics?.semanasActivas || 0}
                      icon={<CalendarIcon className="w-6 h-6 text-white" />}
                      color="bg-yellow-600"
                    />
                  </div>

                  {/* Progreso por semana */}
                  <div className="bg-gray-600 rounded-lg p-6">
                    <h3 className="text-white text-xl font-semibold mb-4">Progreso por Semana</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((semana) => (
                        <div key={semana} className="bg-gray-500 rounded p-3 text-center">
                          <p className="text-white font-semibold text-sm">Semana {semana}</p>
                          <p className="text-gray-300 text-xs mt-1">
                            {analytics?.progresoSemanas?.[semana] || 0}%
                          </p>
                          <div className="w-full bg-gray-400 rounded-full h-1 mt-2">
                            <div 
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${analytics?.progresoSemanas?.[semana] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estado de participantes */}
                  <div className="bg-gray-600 rounded-lg p-6">
                    <h3 className="text-white text-xl font-semibold mb-4">Estado de Participantes</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-500 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Inscritos</span>
                          <span className="text-blue-400 font-bold">{analytics?.estados?.inscrito || 0}</span>
                        </div>
                        <div className="w-full bg-gray-400 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(analytics?.estados?.inscrito || 0) / (analytics?.totalParticipantes || 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gray-500 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">En Curso</span>
                          <span className="text-green-400 font-bold">{analytics?.estados?.en_curso || 0}</span>
                        </div>
                        <div className="w-full bg-gray-400 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(analytics?.estados?.en_curso || 0) / (analytics?.totalParticipantes || 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-gray-500 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Completados</span>
                          <span className="text-purple-400 font-bold">{analytics?.estados?.completado || 0}</span>
                        </div>
                        <div className="w-full bg-gray-400 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(analytics?.estados?.completado || 0) / (analytics?.totalParticipantes || 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actividad reciente */}
                  <div className="bg-gray-600 rounded-lg p-6">
                    <h3 className="text-white text-xl font-semibold mb-4">Actividad Reciente</h3>
                    <div className="space-y-3">
                      {analytics?.actividadReciente?.length > 0 ? (
                        analytics.actividadReciente.map((actividad: any, index: number) => (
                          <div key={index} className="bg-gray-500 rounded p-3 flex items-center space-x-3">
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-white text-sm">{actividad.descripcion}</p>
                              <p className="text-gray-300 text-xs">{actividad.fecha}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-300 text-center py-4">No hay actividad reciente</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdmimDashboardLayout>
  );
};

export default AnalyticsPage; 