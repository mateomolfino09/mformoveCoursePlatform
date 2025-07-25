import { stripe } from './stripeConfig';

interface PreciosEvento {
  earlyBird: { price: number | string };
  general: { price: number | string };
  lastTickets: { price: number | string };
}

interface CreateEventProductWithPricesParams {
  nombre: string;
  descripcion: string;
  precios: PreciosEvento;
  portadaUrl?: string;
  successUrl?: string;
  productId?: string;
}

/**
 * Crea un producto de evento y tres precios escalonados en Stripe.
 */
export async function createEventProductWithPrices({ 
  nombre, 
  descripcion, 
  precios, 
  portadaUrl,
  successUrl,
  productId
}: CreateEventProductWithPricesParams) {
  // Antes de crear el producto en Stripe:
  let portadaStripeUrl = portadaUrl;
  if (portadaUrl && !portadaUrl.startsWith('http')) {
    // Asume Cloudinary, construye la URL pública
    portadaStripeUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${portadaUrl}.jpg`;
  }

  // 1. Crear el producto en Stripe
  const product = await stripe.products.create({
    name: nombre,
    description: descripcion,
    ...(portadaStripeUrl ? { images: [portadaStripeUrl] } : {}),
  });

  // 2. Crear los tres precios
  const earlyBirdPrice = await stripe.prices.create({
    unit_amount: Math.round(Number(precios.earlyBird.price) * 100), // Stripe usa centavos
    currency: 'usd',
    product: product.id,
  });
  const generalPrice = await stripe.prices.create({
    unit_amount: Math.round(Number(precios.general.price) * 100),
    currency: 'usd',
    product: product.id,
  });
  const lastTicketsPrice = await stripe.prices.create({
    unit_amount: Math.round(Number(precios.lastTickets.price) * 100),
    currency: 'usd',
    product: product.id,
  });

  // 3. Crear Payment Links para cada precio con URL de success y metadatos
  const paymentLinkConfig = {
    line_items: [{ price: earlyBirdPrice.id, quantity: 1 }],
    ...(successUrl && {
      after_completion: {
        type: 'redirect' as const,
        redirect: { url: successUrl }
      }
    }),
    ...(productId && {
      metadata: {
        productId: productId
      }
    }),
    // Configurar campos de información del cliente
    customer_creation: 'always' as const,
    // Agregar campo de teléfono
    phone_number_collection: {
      enabled: true
    }
  };

  const earlyBirdLink = await stripe.paymentLinks.create(paymentLinkConfig);
  
  const generalLink = await stripe.paymentLinks.create({
    line_items: [{ price: generalPrice.id, quantity: 1 }],
    ...(successUrl && {
      after_completion: {
        type: 'redirect' as const,
        redirect: { url: successUrl }
      }
    }),
    ...(productId && {
      metadata: {
        productId: productId
      }
    }),
    // Configurar campos de información del cliente
    customer_creation: 'always' as const,
    // Agregar campo de teléfono
    phone_number_collection: {
      enabled: true
    }
  });
  
  const lastTicketsLink = await stripe.paymentLinks.create({
    line_items: [{ price: lastTicketsPrice.id, quantity: 1 }],
    ...(successUrl && {
      after_completion: {
        type: 'redirect' as const,
        redirect: { url: successUrl }
      }
    }),
    ...(productId && {
      metadata: {
        productId: productId
      }
    }),
    // Configurar campos de información del cliente
    customer_creation: 'always' as const,
    // Agregar campo de teléfono
    phone_number_collection: {
      enabled: true
    }
  });

  return {
    productId: product.id,
    precios: {
      earlyBird: {
        priceId: earlyBirdPrice.id,
        paymentLink: earlyBirdLink.url
      },
      general: {
        priceId: generalPrice.id,
        paymentLink: generalLink.url
      },
      lastTickets: {
        priceId: lastTicketsPrice.id,
        paymentLink: lastTicketsLink.url
      },
    },
  };
} 