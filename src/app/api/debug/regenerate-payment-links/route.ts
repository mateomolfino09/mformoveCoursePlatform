import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { createEventProductWithPrices } from '../../payments/stripe/createEventProductWithPrices';

connectDB();

export async function POST(req: Request) {
  try {
    const { eventName } = await req.json();
    
    if (!eventName) {
      return NextResponse.json({ error: 'eventName es requerido' }, { status: 400 });
    }

    // Buscar el evento por nombre
    const event = await Product.findOne({ 
      nombre: { $regex: new RegExp(eventName, 'i') },
      tipo: 'evento'
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    

    // Construir URL de success
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const cleanEventName = event.nombre
      .toLowerCase()
      .replace(/[áäâà]/g, 'a')
      .replace(/[éëêè]/g, 'e')
      .replace(/[íïîì]/g, 'i')
      .replace(/[óöôò]/g, 'o')
      .replace(/[úüûù]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const successUrl = `${baseUrl}/events/${cleanEventName}/success`;

    // Regenerar payment links con metadata
    const stripeResult = await createEventProductWithPrices({
      nombre: event.nombre,
      descripcion: event.descripcion,
      precios: event.precios,
      portadaUrl: event.portada,
      successUrl,
      productId: event._id.toString(),
    });

    // Actualizar el evento con los nuevos payment links
    const updatedPrecios = {
      earlyBird: {
        ...event.precios.earlyBird,
        priceId: stripeResult.precios.earlyBird.priceId,
        paymentLink: stripeResult.precios.earlyBird.paymentLink
      },
      general: {
        ...event.precios.general,
        priceId: stripeResult.precios.general.priceId,
        paymentLink: stripeResult.precios.general.paymentLink
      },
      lastTickets: {
        ...event.precios.lastTickets,
        priceId: stripeResult.precios.lastTickets.priceId,
        paymentLink: stripeResult.precios.lastTickets.paymentLink
      }
    };

    event.precios = updatedPrecios;
    event.stripeProductId = stripeResult.productId;
    await event.save();

    return NextResponse.json({
      message: 'Payment links regenerados con éxito',
      event: {
        nombre: event.nombre,
        precios: updatedPrecios
      }
    });

  } catch (error) {
    console.error('Error regenerando payment links:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 