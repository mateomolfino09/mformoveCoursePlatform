import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { stripe } from '../../payments/stripe/stripeConfig';

connectDB();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventName = searchParams.get('eventName');

    if (!eventName) {
      return NextResponse.json({ error: 'eventName es requerido' }, { status: 400 });
    }

    // Buscar el evento
    const event = await Product.findOne({ 
      nombre: { $regex: new RegExp(eventName, 'i') },
      tipo: 'evento'
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Obtener payment links de Stripe
    const paymentLinks = await stripe.paymentLinks.list({
      limit: 100
    });

    // Filtrar payment links que coincidan con los del evento
    const eventPaymentLinks = [];
    
    for (const link of paymentLinks.data) {
      // Verificar si este payment link está en los precios del evento
      const isEventLink = Object.values(event.precios).some((precio: any) => 
        precio.paymentLink === link.url
      );
      
      if (isEventLink) {
        eventPaymentLinks.push({
          url: link.url,
          metadata: link.metadata,
          line_items: link.line_items,
          active: link.active
        });
      }
    }

    return NextResponse.json({
      event: {
        nombre: event.nombre,
        _id: event._id
      },
      paymentLinks: eventPaymentLinks,
      hasMetadata: eventPaymentLinks.some(link => link.metadata?.productId)
    });

  } catch (error) {
    console.error('Error verificando metadata:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 