'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircleIcon, CalendarDaysIcon, MapPinIcon, GlobeAltIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import MainSideBar from '../../../../components/MainSidebar/MainSideBar';
import Footer from '../../../../components/Footer';
import ErrorBoundary from '../../../../components/ErrorBoundary';
import { getLocationDisplayName } from '../../../../utils/locationHelpers';

interface EventSuccessProps {
  params: {
    name: string;
  };
}

const EventSuccessPageContent: React.FC<EventSuccessProps> = ({ params }) => {
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !params?.name) return;

    const fetchEvento = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Validar que el nombre del evento existe
        if (!params.name || typeof params.name !== 'string') {
          throw new Error('Nombre del evento inválido');
        }
        
        // Intentar buscar por nombre limpio primero
        let response = await fetch(`/api/product/getEventByName?name=${encodeURIComponent(params.name)}`);
        
        if (!response.ok) {
          // Si no se encuentra, intentar buscar por nombre original
          const searchPattern = params.name.replace(/-/g, ' ');
          response = await fetch(`/api/product/getEventByName?name=${encodeURIComponent(searchPattern)}`);
        }
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.evento) {
            setEvento(data.evento);
          } else {
            throw new Error('No se encontró información del evento');
          }
        } else {
          console.error('❌ No se pudo cargar la información del evento');
          setError('No se pudo cargar la información del evento');
        }
      } catch (error) {
        console.error('Error fetching evento:', error);
        setError('Error al cargar la información del evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [params.name, mounted]);

  // Mostrar loading mientras se monta el componente
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#234C8C]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <MainSideBar where={'events'}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#234C8C]"></div>
        </div>
        <Footer />
      </MainSideBar>
    );
  }

  if (error || !evento) {
    return (
      <MainSideBar where={'events'}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-montserrat">
          <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50" />
            
            {/* Patrón de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center space-y-8">
                {/* Icono de éxito */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl mb-8">
                  <CheckCircleIcon className="h-12 w-12 text-white" />
                </div>

                {/* Título */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                    ¡Reserva confirmada!
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Tu pago ha sido procesado exitosamente. Recibirás un email de confirmación con todos los detalles.
                  </p>
                </div>

                {/* Información general */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 max-w-2xl mx-auto">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                      <h3 className="font-bold text-blue-900 mb-3 text-lg">📧 Email de confirmación</h3>
                      <p className="text-blue-800">Recibirás un email con todos los detalles de tu reserva en los próximos minutos.</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                      <h3 className="font-bold text-green-900 mb-3 text-lg">🎯 Próximos pasos</h3>
                      <ul className="text-green-800 space-y-2">
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-3 text-green-600" />
                          Revisa tu email de confirmación
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-3 text-green-600" />
                          Guarda la información del evento
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 mr-3 text-green-600" />
                          Te enviaremos recordatorios antes del evento
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6">
                      <h3 className="font-bold text-amber-900 mb-3 text-lg">💬 ¿Necesitas ayuda?</h3>
                      <p className="text-amber-800">
                        Si tienes alguna pregunta, contáctanos en{' '}
                        <a href="mailto:soporte@mateomove.com" className="underline font-semibold text-amber-700 hover:text-amber-900">
                        soporte@mateomove.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-4">
                  <button
                    onClick={() => window.location.href = '/events'}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#234C8C] to-blue-700 text-white font-bold text-lg rounded-2xl hover:from-[#1a3a6b] hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    Ver más eventos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </MainSideBar>
    );
  }

  // Si encontramos el evento, mostrar la página completa con estética de events
  return (
    <MainSideBar where={'events'}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-montserrat">
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Imagen de fondo con overlay - Banner del evento */}
          <div className="absolute inset-0">
            {evento.portada ? (
              <>
                {/* Imagen para desktop */}
                <CldImage
                  src={evento.portada}
                  alt={evento.nombre || 'Evento'}
                  fill
                  className="object-cover hidden md:block"
                  priority
                />
                {/* Imagen para móvil */}
                {evento.portadaMobile ? (
                  <CldImage
                    src={evento.portadaMobile}
                    alt={evento.nombre || 'Evento'}
                    fill
                    className="object-cover md:hidden"
                    priority
                  />
                ) : (
                  <CldImage
                    src={evento.portada}
                    alt={evento.nombre || 'Evento'}
                    fill
                    className="object-cover md:hidden"
                    priority
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-black" />
            )}
            
            {/* Overlay simple */}
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Contenido principal */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Columna izquierda - Confirmación */}
              <div className="space-y-8">
                {/* Badges superiores */}
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Reserva confirmada
                  </div>
                  
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    {evento.online ? (
                      <>
                        <GlobeAltIcon className="h-4 w-4 mr-2" />
                        Online
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Presencial
                      </>
                    )}
                  </div>
                </div>

                {/* Título principal */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    ¡Reserva confirmada!
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                    Tu lugar en <span className="font-bold text-white">{evento.nombre}</span> ha sido reservado exitosamente.
                  </p>
                </div>

                {/* Información clave */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CalendarDaysIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-300 mb-1">Fecha</p>
                    <p className="text-white font-semibold text-sm">
                      {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                      }) : 'Por confirmar'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                      {evento.online ? (
                        <GlobeAltIcon className="h-6 w-6 text-white" />
                      ) : (
                        <MapPinIcon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-1">Modalidad</p>
                    <p className="text-white font-semibold text-sm">
                      {evento.online ? 'Online' : 'Presencial'}
                    </p>
                  </div>
                  
                  {evento.cupo && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                        <UsersIcon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-gray-300 mb-1">Cupo</p>
                      <p className="text-white font-semibold text-sm">{evento.cupo} personas</p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrophyIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-300 mb-1">Estado</p>
                    <p className="text-white font-semibold text-sm">Confirmado</p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Detalles */}
              <div className="flex justify-center lg:justify-end">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-4">Detalles de tu reserva</h3>
                    </div>

                    {/* Información del evento */}
                    <div className="space-y-4">
                      {evento.fecha && (
                        <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                          <CalendarDaysIcon className="h-6 w-6 text-white" />
                          <div>
                            <p className="text-sm text-gray-200 font-semibold">Fecha del evento</p>
                            <p className="text-white font-medium">
                              {new Date(evento.fecha).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {evento.hora && (
                        <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                          <SparklesIcon className="h-6 w-6 text-white" />
                          <div>
                            <p className="text-sm text-gray-200 font-semibold">Hora</p>
                            <p className="text-white font-medium">{evento.hora}</p>
                          </div>
                        </div>
                      )}

                      {evento.ubicacion && !evento.online && (
                        <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                          <MapPinIcon className="h-6 w-6 text-white" />
                          <div>
                            <p className="text-sm text-gray-200 font-semibold">Ubicación</p>
                            <p className="text-white font-medium">
                              {getLocationDisplayName(evento.ubicacion)}
                            </p>
                          </div>
                        </div>
                      )}

                      {evento.linkEvento && evento.online && (
                        <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                          <GlobeAltIcon className="h-6 w-6 text-white" />
                          <div>
                            <p className="text-sm text-gray-200 font-semibold">Link del evento</p>
                            <a 
                              href={evento.linkEvento} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-white hover:text-gray-200 underline font-medium"
                            >
                              Acceder al evento
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Beneficios */}
                    {evento.beneficios && Array.isArray(evento.beneficios) && evento.beneficios.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <h4 className="font-bold text-white mb-3 flex items-center">
                          <TrophyIcon className="h-5 w-5 mr-2" />
                          Tu reserva incluye:
                        </h4>
                        <ul className="space-y-2">
                          {evento.beneficios.map((beneficio: string, index: number) => (
                            <li key={index} className="flex items-center text-gray-200">
                              <CheckCircleIcon className="h-4 w-4 mr-3 text-white" />
                              {beneficio}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <h4 className="font-bold text-white mb-3">📧 Email de confirmación</h4>
                      <p className="text-gray-200 text-sm">
                        Recibirás un email con todos los detalles y recordatorios antes del evento.
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-3">
                      <button
                        onClick={() => window.location.href = '/events'}
                        className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        Ver más eventos
                      </button>
                      
                      <div className="text-center text-sm text-gray-300">
                        ¿Preguntas? <a href="mailto:soporte@mateomove.com" className="text-white hover:text-gray-200 font-semibold">Contáctanos</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </MainSideBar>
  );
};

const EventSuccessPage: React.FC<EventSuccessProps> = ({ params }) => {
  return (
    <ErrorBoundary>
      <EventSuccessPageContent params={params} />
    </ErrorBoundary>
  );
};

export default EventSuccessPage; 