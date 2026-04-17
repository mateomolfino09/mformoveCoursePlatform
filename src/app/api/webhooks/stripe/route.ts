import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../payments/stripe/stripeConfig';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const runtime = 'nodejs';

export async function GET() {
  // Endpoint de salud/diagnóstico: Stripe webhooks reales llegan por POST.
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function OPTIONS() {
  // Respuesta rápida para preflights/proxies.
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  // Endpoint: /api/webhooks/stripe (productos/eventos)
  // Usa un signing secret dedicado para evitar choques con otros endpoints de Stripe.
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_WEBHOOKS_STRIPE ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(
      '❌ Falta STRIPE_WEBHOOK_SECRET_WEBHOOKS_STRIPE (o fallback STRIPE_WEBHOOK_SECRET)'
    );
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error('❌ Firma de webhook inválida:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Stripe necesita un 2xx rápido (<10s). Procesamos en segundo plano.
    processStripeEvent(event).catch((err) => {
      console.error('❌ Error procesando evento Stripe en background:', err);
    });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processStripeEvent(event: any) {
  try {
    await connectDB();
  } catch (dbErr) {
    // Evita tumbar el webhook; el procesamiento quedará incompleto, pero Stripe recibirá 2xx.
    console.error('❌ Error conectando a DB en webhook:', dbErr);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      default:
        break;
    }
  } catch (err) {
    console.error('❌ Error en processStripeEvent:', err);
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  let productId = session.metadata?.productId;
  
  // Si no hay productId en la sesión, intentar obtenerlo del payment link
  if (!productId && session.payment_link) {
    try {
      const paymentLink = await stripe.paymentLinks.retrieve(session.payment_link);
      productId = paymentLink.metadata?.productId;
    } catch (error) {
      console.error('❌ Error recuperando payment link:', error);
    }
  } else if (!productId) {
    // Si no hay payment_link, intentar obtenerlo del payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      if (paymentIntent.metadata?.productId) {
        productId = paymentIntent.metadata.productId;
      }
    } catch (error) {
      console.error('❌ Error recuperando payment intent:', error);
    }
  }
  
  try {
    const customerEmail = session.customer_details?.email;
    const customerPhone = session.customer_details?.phone;
    const amount = session.amount_total / 100;
    
    if (!productId || !customerEmail) {
      return;
    }

    let product = await Product.findById(productId).lean();
    
    if (!product) {
      product = await Product.findOne({ nombre: { $regex: new RegExp(productId, 'i') } }).lean();
    }
    
    if (!product) {
      console.error('❌ Producto no encontrado:', productId);
      return;
    }

    if (product.tipo === 'evento') {
      await sendEventConfirmationEmail(product, customerEmail, customerPhone, amount, session);
    } else {
      await sendProductConfirmationEmail(product, customerEmail, customerPhone, amount, session);
    }

    // Enviar notificación al admin
    await sendAdminNotification(product, customerEmail, customerPhone, amount, session);

  } catch (error) {
    console.error('❌ Error procesando checkout:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {

}

async function sendEventConfirmationEmail(evento: any, customerEmail: string, customerPhone: string | null, amount: number, session: any) {
  const emailService = EmailService.getInstance();
  
  try {
    const isOnline = evento.online;
    
    const emailData = {
      customerName: session.customer_details?.name || 'Participante',
      customerPhone: customerPhone || 'No proporcionado',
      eventName: evento.nombre,
      eventDate: evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Por confirmar',
      eventTime: evento.hora || 'Por confirmar',
      eventLocation: evento.ubicacion || 'Por confirmar',
      eventLink: evento.linkEvento || null,
      isOnline,
      amount: `$${amount}`,
      benefits: evento.beneficios || [],
      cupo: evento.cupo,
      sessionId: session.id,
      eventPageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${evento.nombre
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
        .replace(/^-+|-+$/g, '')}`,
      supportEmail: 'soporte@mateomove.com',
      ...(isOnline && {
        accessInstructions: 'El link de acceso estará disponible 15 minutos antes del evento',
        recordingInfo: 'La grabación estará disponible por 30 días después del evento'
      }),
      ...(!isOnline && {
        arrivalInstructions: 'Te recomendamos llegar 15 minutos antes del inicio',
        whatToBring: 'Ropa cómoda y botella de agua'
      })
    };

    const result = await emailService.sendEmail({
      type: EmailType.EVENT_CONFIRMATION,
      to: customerEmail,
      subject: `Confirmación de reserva: ${evento.nombre}`,
      data: emailData
    });

    if (!result.success) {
      console.error('❌ Error enviando email');
    }

  } catch (error) {
    console.error('❌ Error en sendEventConfirmationEmail');
  }
}

async function sendProductConfirmationEmail(product: any, customerEmail: string, customerPhone: string | null, amount: number, session: any) {
  const emailService = EmailService.getInstance();
  
  try {
    const emailData = {
      customerName: session.customer_details?.name || 'Cliente',
      customerPhone: customerPhone || 'No proporcionado',
      productName: product.nombre,
      productDescription: product.descripcion,
      amount: `$${amount}`,
      sessionId: session.id,
      productPageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.nombre}`,
      supportEmail: 'soporte@mateomove.com'
    };

    const result = await emailService.sendEmail({
      type: EmailType.PRODUCT_CONFIRMATION,
      to: customerEmail,
      subject: `Confirmación de compra: ${product.nombre}`,
      data: emailData
    });

    if (!result.success) {
      console.error('❌ Error enviando email');
    }

  } catch (error) {
    console.error('❌ Error en sendProductConfirmationEmail');
  }
}

async function sendAdminNotification(product: any, customerEmail: string, customerPhone: string | null, amount: number, session: any) {
  const emailService = EmailService.getInstance();
  
  try {
    const emailData = {
      customerName: session.customer_details?.name || 'Cliente',
      customerEmail: customerEmail,
      customerPhone: customerPhone || 'No proporcionado',
      productName: product.nombre,
      productType: product.tipo,
      amount: `$${amount}`,
      sessionId: session.id,
      paymentDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      // Datos específicos del evento si aplica
      ...(product.tipo === 'evento' && {
        eventDate: product.fecha ? new Date(product.fecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Por confirmar',
        eventLocation: product.ubicacion || 'Por confirmar',
        isOnline: product.online,
        cupo: product.cupo
      })
    };

    const result = await emailService.sendEmail({
      type: EmailType.ADMIN_NOTIFICATION,
      to: 'mateomolfino09@gmail.com',
      subject: `🛒 Nueva compra: ${product.nombre}`,
      data: emailData
    });

    if (!result.success) {
      console.error('❌ Error enviando notificación al admin');
    }

  } catch (error) {
    console.error('❌ Error en sendAdminNotification');
  }
} 