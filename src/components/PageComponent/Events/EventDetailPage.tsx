'use client';

import React, { useState, useEffect } from 'react';
import { ProductDB } from '../../../../typings';
import EventHero from './EventHero';
import EventOverview from './EventOverview';
import EventDescription from './EventDescription';
import EventCTA from './EventCTA';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';

interface Props {
  evento: ProductDB;
}

const EventDetailPage: React.FC<Props> = ({ evento }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [precioActual, setPrecioActual] = useState<any>(null);
  const [eventoTerminado, setEventoTerminado] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  // Calcular precio actual y estado del evento
  useEffect(() => {
    if (evento.precios) {
      // Obtener el precio actual basado en fechas
      const ahora = new Date();
      const { earlyBird, general, lastTickets } = evento.precios;

      // Verificar Early Bird
      if (earlyBird?.price && earlyBird?.end) {
        const earlyBirdEnd = new Date(earlyBird.end);
        if (ahora <= earlyBirdEnd) {
          setPrecioActual({
            precio: earlyBird.price,
            tipo: 'Early Bird',
            original: general?.price || lastTickets?.price,
            urgencia: 'Precio especial',
            stripePriceId: (evento as any).stripePrices?.earlyBird
          });
          return;
        }
      }

      // Verificar General
      if (general?.price && general?.end) {
        const generalEnd = new Date(general.end);
        if (ahora <= generalEnd) {
          setPrecioActual({
            precio: general.price,
            tipo: 'Precio General',
            original: lastTickets?.price,
            urgencia: lastTickets?.price ? 'Precio aumentará pronto' : null,
            stripePriceId: (evento as any).stripePrices?.general
          });
          return;
        }
      }

      // Last Tickets
      if (lastTickets?.price) {
        setPrecioActual({
          precio: lastTickets.price,
          tipo: 'Last Tickets',
          original: null,
          urgencia: 'Últimos cupos',
          stripePriceId: (evento as any).stripePrices?.lastTickets
        });
      }
    }

    // Verificar si el evento ha terminado
    if (evento.fecha) {
      const fechaEvento = new Date(evento.fecha);
      const ahora = new Date();
      const diferencia = fechaEvento.getTime() - ahora.getTime();
      const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
      
      if (dias < 0) {
        setEventoTerminado(true);
        setDiasRestantes(null);
      } else {
        setDiasRestantes(dias);
      }
    }
  }, [evento]);

  // Función para manejar la compra
  const handleBuyTicket = async () => {
    if (!precioActual) {
      toast.error('No hay precios disponibles para este evento');
      return;
    }

    setLoading(true);
    try {
      // Obtener el payment link del precio actual
      let paymentLink = null;
      
      if (precioActual.tipo === 'Early Bird' && evento.precios?.earlyBird?.paymentLink) {
        paymentLink = evento.precios.earlyBird.paymentLink;
      } else if (precioActual.tipo === 'Precio General' && evento.precios?.general?.paymentLink) {
        paymentLink = evento.precios.general.paymentLink;
      } else if (precioActual.tipo === 'Last Tickets' && evento.precios?.lastTickets?.paymentLink) {
        paymentLink = evento.precios.lastTickets.paymentLink;
      }

      if (!paymentLink) {
        toast.error('No se encontró el link de pago para este precio');
        return;
      }

      // Redirigir al link de pago de Stripe
      window.open(paymentLink, '_blank');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-montserrat">
      <MainSideBar where={'events'}>
        <main className="">
          {/* Hero Section */}
          <EventHero
            evento={evento}
            precioActual={precioActual}
            eventoTerminado={eventoTerminado}
            diasRestantes={diasRestantes}
            onBuyTicket={handleBuyTicket}
            loading={loading}
          />

          {/* Overview Section */}
          <EventOverview
            evento={evento}
            precioActual={precioActual}
            eventoTerminado={eventoTerminado}
            diasRestantes={diasRestantes}
            onBuyTicket={handleBuyTicket}
          />

          {/* Description Section */}
          <EventDescription evento={evento} />

          {/* CTA Section */}
          <EventCTA
            evento={evento}
            precioActual={precioActual}
            eventoTerminado={eventoTerminado}
            onBuyTicket={handleBuyTicket}
            loading={loading}
          />
        </main>
        <Footer />

      </MainSideBar>
    </div>
  );
};

export default EventDetailPage; 