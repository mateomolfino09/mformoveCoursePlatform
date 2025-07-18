'use client';

import React, { useState } from 'react';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import { LoadingSpinner } from '../../LoadingSpinner';

interface Props {
  evento: ProductDB;
}

const EventDetailPage: React.FC<Props> = ({ evento }) => {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Formatear fecha
  const formatearFecha = (fecha: string | Date | undefined) => {
    if (!fecha) return 'Fecha por confirmar';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener precio actual basado en fechas
  const obtenerPrecioActual = () => {
    if (!evento.precios) return null;
    
    const ahora = new Date();
    const { earlyBird, general, lastTickets } = evento.precios;

    // Verificar Early Bird
    if (earlyBird?.price && earlyBird?.end) {
      const earlyBirdEnd = new Date(earlyBird.end);
      if (ahora <= earlyBirdEnd) {
        return {
          precio: earlyBird.price,
          tipo: 'Early Bird',
          original: general?.price || lastTickets?.price,
          urgencia: 'Precio especial',
          stripePriceId: (evento as any).stripePrices?.earlyBird
        };
      }
    }

    // Verificar General
    if (general?.price && general?.end) {
      const generalEnd = new Date(general.end);
      if (ahora <= generalEnd) {
        return {
          precio: general.price,
          tipo: 'Precio General',
          original: lastTickets?.price,
          urgencia: lastTickets?.price ? 'Precio aumentará pronto' : null,
          stripePriceId: (evento as any).stripePrices?.general
        };
      }
    }

    // Last Tickets
    if (lastTickets?.price) {
      return {
        precio: lastTickets.price,
        tipo: 'Last Tickets',
        original: null,
        urgencia: 'Últimos cupos',
        stripePriceId: (evento as any).stripePrices?.lastTickets
      };
    }

    return null;
  };

  const precioActual = obtenerPrecioActual();

  // Verificar si el evento ya pasó
  const eventoTerminado = evento.fecha ? new Date(evento.fecha) < new Date() : false;
  
  // Calcular días restantes
  const diasRestantes = evento.fecha ? Math.ceil((new Date(evento.fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Función para descargar PDF
  const handleDownloadPDF = () => {
    if (evento.pdfPresentacionUrl) {
      const link = document.createElement('a');
      link.href = evento.pdfPresentacionUrl;
      link.download = `${evento.nombre ? evento.nombre.replace(/\s+/g, '-') : 'evento'}-informacion.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Función para comprar ticket
  const handleBuyTicket = async () => {
    if (!auth.user) {
      toast.error('Debes iniciar sesión para comprar tickets');
      return;
    }

    if (eventoTerminado) {
      toast.error('Este evento ya ha finalizado');
      return;
    }

    if (!precioActual) {
      toast.error('No hay tickets disponibles en este momento');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.post(
        '/api/payments/oneTimePayment',
        {
          name: evento.nombre,
          description: evento.descripcion,
          currency: 'USD',
          amount: precioActual.precio,
          priceId: precioActual.stripePriceId,
          back_url: `/events/${evento.nombre?.replace(/\s+/g, '-').toLowerCase()}`,
          success_url: `/events/${evento.nombre?.replace(/\s+/g, '-').toLowerCase()}/success`
        },
        config
      );

      const token = data?.response?.merchant_checkout_token;
      const userId = auth?.user._id;
      const productId = evento?._id;

      if (!userId || !productId) {
        toast.error('Error en la configuración. Contacta soporte.');
        return;
      }

      await axios.put(
        '/api/user/product/assignToken',
        {
          userId,
          token,
          productId
        },
        config
      );

      Cookies.set('userPaymentToken', token ? token : '', { expires: 5 });
      auth.fetchUser();
      
      const redirectPaymentLink = data?.response?.redirect_url;
      if (redirectPaymentLink) {
        router.push(redirectPaymentLink);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al procesar el pago');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-montserrat">
      <MainSideBar where={'events'}>
        <main className="pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Botón volver */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/events')}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#234C8C] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Volver a eventos</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna principal - Información del evento */}
              <div className="lg:col-span-2 space-y-8">
                {/* Imagen principal */}
                <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden">
                  {evento.portada ? (
                    <CldImage
                      src={evento.portada}
                      alt={evento.nombre || 'Evento'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#234C8C] to-[#1a3d73] flex items-center justify-center">
                      <CalendarDaysIcon className="h-24 w-24 text-white/50" />
                    </div>
                  )}
                  
                  {/* Overlay con badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col space-y-2">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-black/60 text-white backdrop-blur-sm">
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
                    
                    {precioActual?.urgencia && !eventoTerminado && (
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-red-500/80 text-white backdrop-blur-sm">
                        <FireIcon className="h-4 w-4 mr-2" />
                        {precioActual.urgencia}
                      </div>
                    )}
                  </div>
                  
                  {/* Estado del evento */}
                  <div className="absolute top-6 right-6">
                    {eventoTerminado ? (
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-500/80 text-white backdrop-blur-sm">
                        Finalizado
                      </div>
                    ) : diasRestantes && diasRestantes <= 7 && diasRestantes > 0 && (
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-500/80 text-white backdrop-blur-sm animate-pulse">
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        {diasRestantes === 1 ? 'Mañana' : `${diasRestantes} días`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del evento */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {evento.nombre}
                  </h1>
                  
                  {/* Detalles básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="h-6 w-6 text-[#234C8C]" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha y hora</p>
                        <p className="font-semibold">{formatearFecha(evento.fecha)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {evento.online ? (
                        <GlobeAltIcon className="h-6 w-6 text-[#234C8C]" />
                      ) : (
                        <MapPinIcon className="h-6 w-6 text-[#234C8C]" />
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Modalidad</p>
                        <p className="font-semibold">
                          {evento.online 
                            ? 'Online' 
                            : evento.ubicacion?.ciudad || evento.ubicacion?.display_name || 'Por confirmar'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {evento.cupo && (
                      <div className="flex items-center space-x-3">
                        <UsersIcon className="h-6 w-6 text-[#234C8C]" />
                        <div>
                          <p className="text-sm text-gray-500">Cupo</p>
                          <p className="font-semibold">{evento.cupo} personas</p>
                        </div>
                      </div>
                    )}
                    
                    {precioActual && (
                      <div className="flex items-center space-x-3">
                        <CurrencyDollarIcon className="h-6 w-6 text-[#234C8C]" />
                        <div>
                          <p className="text-sm text-gray-500">{precioActual.tipo}</p>
                          <p className="font-semibold text-2xl">${precioActual.precio}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Descripción */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {evento.descripcion}
                    </p>
                  </div>
                  
                  {/* PDF de presentación */}
                  {evento.pdfPresentacionUrl && (
                    <div className="mb-8">
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <DocumentArrowDownIcon className="h-6 w-6" />
                        <span className="font-semibold">Descargar información completa del evento</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna lateral - Compra */}
              <div className="lg:col-span-1">
                <div className="sticky top-32">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    {precioActual && !eventoTerminado ? (
                      <>
                        <div className="text-center mb-6">
                          <p className="text-sm text-gray-500 mb-2">{precioActual.tipo}</p>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-4xl font-bold text-gray-900">
                              ${precioActual.precio}
                            </span>
                            {precioActual.original && (
                              <span className="text-xl text-gray-500 line-through">
                                ${precioActual.original}
                              </span>
                            )}
                          </div>
                          {precioActual.original && (
                            <p className="text-green-600 font-semibold mt-2">
                              Ahorras ${precioActual.original - precioActual.precio}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={handleBuyTicket}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[#234C8C] to-[#1a3d73] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? <LoadingSpinner /> : 'Reservar mi lugar →'}
                        </button>
                        
                        {precioActual.urgencia && (
                          <p className="text-center text-sm text-red-600 mt-3 font-semibold">
                            ⚡ {precioActual.urgencia}
                          </p>
                        )}
                      </>
                    ) : eventoTerminado ? (
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-500 mb-4">Evento finalizado</p>
                        <p className="text-gray-600">Este evento ya ha terminado</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 mb-4">Próximamente</p>
                        <p className="text-gray-600">Los tickets estarán disponibles pronto</p>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Incluye:</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Acceso completo al evento</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Material de apoyo</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Certificado de participación</span>
                        </li>
                        {evento.online && (
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Grabación del evento</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </MainSideBar>
      <Footer />
    </div>
  );
};

export default EventDetailPage; 