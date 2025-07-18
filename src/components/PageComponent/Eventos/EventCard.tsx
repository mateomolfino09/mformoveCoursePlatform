'use client';

import React, { useState } from 'react';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Props {
  evento: ProductDB;
}

const EventCard: React.FC<Props> = ({ evento }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Formatear fecha
  const formatearFecha = (fecha: string | Date | undefined) => {
    if (!fecha) return 'Fecha por confirmar';
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Evento finalizado';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays <= 7) return `En ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
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
          urgencia: 'Precio especial'
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
          urgencia: lastTickets?.price ? 'Precio aumentará pronto' : null
        };
      }
    }

    // Last Tickets
    if (lastTickets?.price) {
      return {
        precio: lastTickets.price,
        tipo: 'Last Tickets',
        original: null,
        urgencia: 'Últimos cupos'
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

  // Función para abrir modal de imagen
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setImageLoading(true);
    setShowImageModal(true);
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100 font-montserrat">
      {/* Imagen de portada con overlay */}
      <div className="relative h-72 overflow-hidden rounded-t-3xl">
        {evento.portada ? (
          <div 
            className="w-full h-full cursor-pointer relative z-10"
            onClick={handleImageClick}
          >
            <CldImage
              src={evento.portada}
              alt={evento.nombre || 'Evento'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Overlay sutil para indicar que es clickeable */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#234C8C] to-[#1a3d73] flex items-center justify-center">
            <CalendarDaysIcon className="h-16 w-16 text-white/50" />
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Badges superiores */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none">
          {/* Badge de modalidad */}
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm font-montserrat ${
            evento.online 
              ? 'bg-black/60 text-white' 
              : 'bg-black/60 text-white'
          }`}>
            {evento.online ? (
              <>
                <GlobeAltIcon className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <MapPinIcon className="h-3 w-3 mr-1" />
                Presencial
              </>
            )}
          </div>
          
          {/* Badge de urgencia/precio */}
          {precioActual?.urgencia && !eventoTerminado && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm font-montserrat">
              <FireIcon className="h-3 w-3 mr-1" />
              {precioActual.urgencia}
            </div>
          )}
        </div>

        {/* Badge de estado superior derecho */}
        <div className="absolute top-4 right-4 pointer-events-none">
          {eventoTerminado ? (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm font-montserrat">
              Finalizado
            </div>
          ) : diasRestantes && diasRestantes <= 7 && diasRestantes > 0 && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-sm font-montserrat animate-pulse">
              <SparklesIcon className="h-3 w-3 mr-1" />
              {diasRestantes === 1 ? 'Mañana' : `${diasRestantes} días`}
            </div>
          )}
        </div>

        {/* Precio flotante */}
        {/* {precioActual && !eventoTerminado && (
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900 font-montserrat">
                ${precioActual.precio}
              </span>
            </div>
          </div>
        )} */}
      </div>

      {/* Contenido de la card */}
      <div className="p-8 space-y-6">
        {/* Título y descripción */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 font-montserrat group-hover:text-[#234C8C] transition-colors">
            {evento.nombre}
          </h3>
          <p className="text-gray-600 text-base line-clamp-3 font-montserrat font-light leading-relaxed">
            {evento.descripcion}
          </p>
        </div>

        {/* Información del evento en grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Fecha */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2">
            <CalendarDaysIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 font-montserrat font-medium truncate">
              {formatearFecha(evento.fecha)}
            </span>
          </div>

          {/* Ubicación/Modalidad */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2">
            {evento.online ? (
              <>
                <GlobeAltIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-montserrat font-medium">Online</span>
              </>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-montserrat font-medium truncate">
                  {evento.ubicacion?.ciudad || evento.ubicacion?.display_name?.split(',')[0] || 'Por confirmar'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cupo y detalles adicionales */}
        {evento.cupo && (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700 font-montserrat">
                Cupo limitado: {evento.cupo} personas
              </span>
            </div>
          </div>
        )}

        {/* Botón de descarga PDF */}
        {evento.pdfPresentacionUrl && (
          <div className="flex items-center justify-start">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 text-gray-500 hover:text-[#234C8C] transition-colors duration-300 font-montserrat text-sm font-medium"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Descargar información</span>
            </button>
          </div>
        )}

        {/* Separador con gradiente */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* CTA y precio detallado */}
        <div className="space-y-3">
          {/* Información de precio expandida */}
          {precioActual && !eventoTerminado && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700 font-montserrat">
                    {precioActual.tipo}
                  </span>
                </div>
                {precioActual.original && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-montserrat font-semibold">
                    Ahorra ${precioActual.original - precioActual.precio}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900 font-montserrat">
                    ${precioActual.precio}
                  </span>
                  {precioActual.original && (
                    <span className="text-sm text-gray-500 line-through font-montserrat">
                      ${precioActual.original}
                    </span>
                  )}
                </div>
                {precioActual.urgencia && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600 font-montserrat font-medium">
                      {precioActual.urgencia}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de acción premium */}
          <Link 
            href={`/events/${evento.nombre ? evento.nombre.replace(/\s+/g, '-').toLowerCase() : 'evento'}`}
            className="block w-full"
          >
            <button 
              className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 font-montserrat ${
                eventoTerminado
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#234C8C] to-[#1a3d73] text-white hover:shadow-xl hover:shadow-blue-500/25'
              }`}
              disabled={eventoTerminado}
            >
              {eventoTerminado 
                ? 'Evento finalizado' 
                : precioActual 
                  ? 'Reservar ahora →' 
                  : 'Ver detalles →'
              }
            </button>
          </Link>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 rounded-3xl"></div>
      </div>

      {/* Modal para imagen ampliada */}
      {showImageModal && evento.portada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            {/* Botón de cerrar */}
            <button
              onClick={() => {
                setShowImageModal(false);
                setImageLoading(false);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            
            {/* Loading spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            
            {/* Imagen ampliada */}
            <div className="relative w-full h-full">
              <CldImage
                src={evento.portada}
                alt={evento.nombre || 'Evento'}
                width={800}
                height={600}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>
            
            {/* Información del evento */}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white font-montserrat mb-2">
                {evento.nombre}
              </h3>
              <p className="text-gray-300 font-montserrat text-sm">
                Haz clic fuera de la imagen para cerrar
              </p>
            </div>
          </div>
          
          {/* Overlay para cerrar al hacer clic */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => {
              setShowImageModal(false);
              setImageLoading(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventCard; 