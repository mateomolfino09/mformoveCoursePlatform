'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { formatearPrecioEventoSync, formatearPrecioConDescuentoSync } from '../../../utils/currencyHelpers';
import { getLocationCity } from '../../../utils/locationHelpers';

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
    if (earlyBird?.price && earlyBird?.start && earlyBird?.end) {
      const earlyBirdStart = new Date(earlyBird.start);
      const earlyBirdEnd = new Date(earlyBird.end);
      if (ahora >= earlyBirdStart && ahora <= earlyBirdEnd) {
        const precioFormateado = formatearPrecioEventoSync(earlyBird.price, evento);
        const precioOriginal = general?.price || lastTickets?.price;
        const descuento = precioOriginal ? formatearPrecioConDescuentoSync(earlyBird.price, precioOriginal, evento) : null;
        
        return {
          precio: earlyBird.price,
          precioFormateado,
          tipo: 'Early Bird',
          original: general?.price || lastTickets?.price,
          descuento,
          urgencia: 'Precio especial'
        };
      }
    }

    // Verificar General
    if (general?.price && general?.start && general?.end) {
      const generalStart = new Date(general.start);
      const generalEnd = new Date(general.end);
      if (ahora >= generalStart && ahora <= generalEnd) {
        const precioFormateado = formatearPrecioEventoSync(general.price, evento);
        const precioOriginal = lastTickets?.price;
        const descuento = precioOriginal ? formatearPrecioConDescuentoSync(general.price, precioOriginal, evento) : null;
        
        return {
          precio: general.price,
          precioFormateado,
          tipo: 'Precio General',
          original: lastTickets?.price,
          descuento,
          urgencia: lastTickets?.price ? 'Precio aumentará pronto' : null
        };
      }
    }

    // Last Tickets
    if (lastTickets?.price && lastTickets?.start && lastTickets?.end) {
      const lastTicketsStart = new Date(lastTickets.start);
      const lastTicketsEnd = new Date(lastTickets.end);
      if (ahora >= lastTicketsStart && ahora <= lastTicketsEnd) {
        const precioFormateado = formatearPrecioEventoSync(lastTickets.price, evento);
        
        return {
          precio: lastTickets.price,
          precioFormateado,
          tipo: 'Last Tickets',
          original: null,
          descuento: null,
          urgencia: 'Últimos cupos'
        };
      }
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
    <motion.div
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-palette-stone/20 bg-white font-montserrat shadow-[0_18px_50px_-28px_rgba(20,20,17,0.16)] transition-[border-color,box-shadow] duration-300 hover:border-palette-stone/45 hover:shadow-[0_22px_56px_-24px_rgba(20,20,17,0.2)]"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative h-60 overflow-hidden md:h-64">
        {evento.portada ? (
          <div 
            className="w-full h-full cursor-pointer relative z-10"
            onClick={handleImageClick}
          >
            <CldImage
              src={evento.portada}
              alt={evento.nombre || 'Evento'}
              fill
              className="object-cover"
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
          <div className="flex h-full w-full items-center justify-center bg-palette-ink">
            <CalendarDaysIcon className="h-10 w-10 text-palette-cream/40" />
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Badges superiores */}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
          <div className="inline-flex items-center rounded-full bg-palette-cream/95 px-3 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink">
            {evento.online ? (
              <>
                <GlobeAltIcon className="mr-1.5 h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <MapPinIcon className="mr-1.5 h-3 w-3" />
                Presencial
              </>
            )}
          </div>
          {precioActual?.urgencia && !eventoTerminado && (
            <div className="inline-flex items-center rounded-full bg-palette-cream px-3 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-ink">
              {precioActual.urgencia}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute right-4 top-4">
          {eventoTerminado ? (
            <div className="inline-flex items-center rounded-full bg-palette-ink/80 px-3 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-cream">
              Finalizado
            </div>
          ) : diasRestantes && diasRestantes <= 7 && diasRestantes > 0 ? (
            <div className="inline-flex items-center rounded-full bg-palette-ink/80 px-3 py-1.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-cream">
              {diasRestantes === 1 ? 'Mañana' : `${diasRestantes} días`}
            </div>
          ) : null}
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="flex flex-1 flex-col space-y-4 p-5 md:p-6">
        <div className="space-y-2">
          <h3 className="line-clamp-2 font-montserrat text-xl font-bold tracking-tight text-palette-ink md:text-[1.45rem] md:leading-tight">
            {evento.nombre}
          </h3>
          <p className="line-clamp-3 font-montserrat text-[15px] leading-relaxed text-palette-stone md:text-[16px]">
            {evento.descripcion}
          </p>
        </div>

        {/* Información del evento en grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Fecha */}
          <div className="flex items-center space-x-2 rounded-md border border-palette-stone/15 bg-palette-cream px-3 py-2">
            <CalendarDaysIcon className="h-4 w-4 flex-shrink-0 text-palette-stone" />
            <span className="truncate font-montserrat text-sm text-palette-ink">
              {formatearFecha(evento.fecha)}
            </span>
          </div>

          {/* Ubicación/Modalidad */}
          <div className="flex items-center space-x-2 rounded-md border border-palette-stone/15 bg-palette-cream px-3 py-2">
            {evento.online ? (
              <>
                <GlobeAltIcon className="h-4 w-4 flex-shrink-0 text-palette-stone" />
                <span className="font-montserrat text-sm text-palette-ink">Online</span>
              </>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-palette-stone" />
                <span className="truncate font-montserrat text-sm text-palette-ink">
                  {getLocationCity(evento.ubicacion)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Cupo y detalles adicionales */}
        {evento.cupo && (
          <div className="flex items-center justify-between rounded-md border border-palette-stone/15 bg-palette-cream px-3 py-2">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-palette-stone" />
              <span className="font-montserrat text-sm text-palette-ink">
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
              className="flex items-center space-x-2 font-montserrat text-[13px] text-palette-stone transition-colors hover:text-palette-ink"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Descargar información</span>
            </button>
          </div>
        )}

        {/* Separador con gradiente */}
        <div className="h-px bg-palette-stone/20"></div>

        {/* CTA y precio detallado */}
        <div className="space-y-3">
          {/* Información de precio expandida */}
          {precioActual && !eventoTerminado && (
            <div className="rounded-2xl border border-palette-stone/15 bg-palette-cream p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-montserrat text-[11px] font-medium uppercase tracking-[0.14em] text-palette-stone">
                  {precioActual.tipo}
                </span>
                {precioActual.descuento && (
                  <span className="rounded-full bg-white px-2 py-0.5 font-montserrat text-[11px] text-palette-ink">
                    Ahorra {precioActual.descuento.ahorro.textoCompleto}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline space-x-2">
                  <span className="font-montserrat text-[18px] font-medium text-palette-ink">
                    {precioActual.precioFormateado.textoCompleto}
                  </span>
                  {precioActual.descuento && (
                    <span className="font-montserrat text-[12px] text-palette-stone line-through">
                      {precioActual.descuento.precioOriginal.textoCompleto}
                    </span>
                  )}
                </div>
                {precioActual.urgencia && (
                  <span className="font-montserrat text-[11px] text-palette-stone">
                    {precioActual.urgencia}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botón de acción premium */}
          <Link 
            href={`/eventos/${evento.nombre ? evento.nombre.replace(/\s+/g, '-').toLowerCase() : 'evento'}`}
            className="block w-full"
          >
            <button 
              className={`w-full rounded-full border-2 px-6 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-200 ${
                eventoTerminado
                  ? 'cursor-not-allowed border-palette-stone/20 bg-palette-cream text-palette-stone'
                  : 'border-palette-ink bg-palette-ink text-palette-cream hover:border-palette-cream hover:bg-palette-cream hover:text-palette-ink'
              }`}
              disabled={eventoTerminado}
            >
              {eventoTerminado
                ? 'Evento finalizado'
                : precioActual
                  ? 'Reservar lugar'
                  : 'Ver el encuentro'}
            </button>
          </Link>
        </div>
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
                Tocá afuera de la imagen para cerrar
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
    </motion.div>
  );
};

export default EventCard; 