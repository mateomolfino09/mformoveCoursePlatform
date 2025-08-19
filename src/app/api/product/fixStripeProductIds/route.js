import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { NextResponse } from 'next/server';
import { stripe } from '../../payments/stripe/stripeConfig';

connectDB();

export async function POST(req) {
  try {
    // Buscar productos de tipo evento que no tienen stripeProductId
    const productosSinStripeId = await Product.find({
      tipo: 'evento',
      $or: [
        { stripeProductId: { $exists: false } },
        { stripeProductId: null },
        { stripeProductId: '' }
      ]
    });

    console.log(`🔍 Encontrados ${productosSinStripeId.length} productos sin stripeProductId`);

    const resultados = [];

    for (const producto of productosSinStripeId) {
      try {
        console.log(`🔄 Procesando producto: ${producto.nombre} (${producto._id})`);
        
        // Buscar el primer priceId disponible
        let primerPriceId = null;
        if (producto.precios) {
          for (const tipoPrecio of ['earlyBird', 'general', 'lastTickets']) {
            if (producto.precios[tipoPrecio]?.priceId) {
              primerPriceId = producto.precios[tipoPrecio].priceId;
              break;
            }
          }
        }

        if (!primerPriceId) {
          console.log(`❌ Producto ${producto.nombre} no tiene priceId válido`);
          resultados.push({
            producto: producto.nombre,
            status: 'error',
            message: 'No tiene priceId válido'
          });
          continue;
        }

        // Obtener el precio de Stripe para extraer el productId
        const price = await stripe.prices.retrieve(primerPriceId);
        if (!price.product) {
          console.log(`❌ Price ${primerPriceId} no tiene product asociado`);
          resultados.push({
            producto: producto.nombre,
            status: 'error',
            message: 'Price no tiene product asociado'
          });
          continue;
        }

        // Actualizar el producto con el stripeProductId
        await Product.findByIdAndUpdate(producto._id, {
          stripeProductId: price.product
        });

        console.log(`✅ Producto ${producto.nombre} actualizado con stripeProductId: ${price.product}`);
        
        resultados.push({
          producto: producto.nombre,
          status: 'success',
          stripeProductId: price.product
        });

      } catch (error) {
        console.error(`❌ Error procesando producto ${producto.nombre}:`, error);
        resultados.push({
          producto: producto.nombre,
          status: 'error',
          message: error.message
        });
      }
    }

    return NextResponse.json({
      message: `Procesados ${productosSinStripeId.length} productos`,
      resultados
    });

  } catch (error) {
    console.error('Error en fixStripeProductIds:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
} 