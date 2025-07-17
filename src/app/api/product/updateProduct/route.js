import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import { stripe } from '../../payments/stripe/stripeConfig';

connectDB();

export async function PUT(req) {
  try {
    if (req.method === 'PUT') {
      const data = await req.json();
      const {
        productId,
        nombre,
        descripcion,
        tipo,
        precio,
        moneda,
        portada,
        imagenes,
        precios,
        fecha,
        ubicacion,
        online,
        linkEvento,
        cupo,
        archivoUrl,
        tipoArchivo,
        descuento,
        userEmail
      } = data;

      // Validar usuario admin
      let user = await Users.findOne({ email: userEmail });
      if (!user || user.rol !== 'Admin') {
        return NextResponse.json(
          { error: 'Este usuario no tiene permisos para editar productos' },
          { status: 422 }
        );
      }

      // Buscar el producto existente
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        );
      }

      // Manejar descuento si se proporciona
      let stripeCouponId = existingProduct.descuento?.stripeCouponId;
      let stripePromotionCodeId = existingProduct.descuento?.stripePromotionCodeId;

      if (descuento && descuento.codigo && descuento.porcentaje) {
        // Si el código de descuento cambió, crear uno nuevo
        if (existingProduct.descuento?.codigo !== descuento.codigo) {
          // Buscar si ya existe un promotion code con ese código
          const existingPromos = await stripe.promotionCodes.list({
            code: descuento.codigo,
            limit: 1
          });
          
          if (existingPromos.data.length > 0) {
            // Ya existe, usar el existente
            stripePromotionCodeId = existingPromos.data[0].id;
            stripeCouponId = existingPromos.data[0].coupon.id;
          } else {
            // Crear cupón nuevo
            const coupon = await stripe.coupons.create({
              percent_off: descuento.porcentaje,
              duration: 'once',
              max_redemptions: descuento.maxUsos || undefined,
              redeem_by: descuento.expiracion ? Math.floor(new Date(descuento.expiracion).getTime() / 1000) : undefined,
              name: `Descuento ${descuento.codigo}`
            });
            stripeCouponId = coupon.id;
            
            // Crear promotion code nuevo
            const promo = await stripe.promotionCodes.create({
              code: descuento.codigo,
              coupon: coupon.id,
              max_redemptions: descuento.maxUsos || undefined,
              expires_at: descuento.expiracion ? Math.floor(new Date(descuento.expiracion).getTime() / 1000) : undefined,
            });
            stripePromotionCodeId = promo.id;
          }
        }
      }

      // Actualizar precios en Stripe si es un evento y los precios cambiaron
      console.log('Debug - existingProduct.precios:', existingProduct.precios);
      console.log('Debug - precios recibidos:', precios);
      console.log('Debug - existingProduct.stripeProductId:', existingProduct.stripeProductId);
      
      let preciosConLinks = { ...existingProduct.precios, ...precios };
      if (tipo === 'evento' && precios) {
        // Si el producto ya existe en Stripe, actualizar los precios
        if (existingProduct.stripeProductId) {
          console.log('Debug - Producto tiene stripeProductId, procesando precios');
        } else {
          console.log('Debug - Producto NO tiene stripeProductId, conservando precios existentes');
          // Si no tiene stripeProductId pero tiene precios existentes, conservar los links
          for (const tipoPrecio of ['earlyBird', 'general', 'lastTickets']) {
            const nuevoPrecio = precios[tipoPrecio];
            const precioExistente = existingProduct.precios?.[tipoPrecio];
            if (nuevoPrecio && precioExistente && precioExistente.paymentLink) {
              preciosConLinks[tipoPrecio] = {
                ...nuevoPrecio,
                priceId: precioExistente.priceId,
                paymentLink: precioExistente.paymentLink,
              };
              console.log(`Debug - ${tipoPrecio} - Conservando links existentes:`, preciosConLinks[tipoPrecio]);
            }
          }
        }
        
        if (existingProduct.stripeProductId) {
          for (const tipoPrecio of ['earlyBird', 'general', 'lastTickets']) {
            const nuevoPrecio = precios[tipoPrecio];
            const precioExistente = existingProduct.precios?.[tipoPrecio];
            if (nuevoPrecio) {
              console.log(`Debug - ${tipoPrecio} - nuevoPrecio:`, nuevoPrecio);
              console.log(`Debug - ${tipoPrecio} - precioExistente:`, precioExistente);
              
              // Si el precio no cambió, conserva el link y priceId
              if (
                precioExistente &&
                Number(nuevoPrecio.price) === Number(precioExistente.price)
              ) {
                console.log(`Debug - ${tipoPrecio} - Precio no cambió, conservando links`);
                preciosConLinks[tipoPrecio] = {
                  ...nuevoPrecio,
                  priceId: precioExistente.priceId,
                  paymentLink: precioExistente.paymentLink,
                };
              } else if (nuevoPrecio.price && nuevoPrecio.start && nuevoPrecio.end) {
                console.log(`Debug - ${tipoPrecio} - Precio cambió, creando nuevo en Stripe`);
                // Si el precio cambió, crear uno nuevo en Stripe
                const stripePrice = await stripe.prices.create({
                  unit_amount: Math.round(nuevoPrecio.price * 100),
                  currency: moneda.toLowerCase(),
                  product: existingProduct.stripeProductId,
                  metadata: {
                    tipo: tipoPrecio,
                    start: nuevoPrecio.start,
                    end: nuevoPrecio.end,
                  },
                });
                // Crear link de pago
                const paymentLink = await stripe.paymentLinks.create({
                  line_items: [
                    {
                      price: stripePrice.id,
                      quantity: 1,
                    },
                  ],
                  after_completion: {
                    type: 'redirect',
                    redirect: {
                      url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${existingProduct._id}/success-payment`,
                    },
                  },
                });
                preciosConLinks[tipoPrecio] = {
                  ...nuevoPrecio,
                  priceId: stripePrice.id,
                  paymentLink: paymentLink.url,
                };
                console.log(`Debug - ${tipoPrecio} - Nuevo precio creado:`, preciosConLinks[tipoPrecio]);
              }
            }
          }
        }
      }
      
      console.log('Debug - preciosConLinks final:', preciosConLinks);

      // Construir objeto de actualización
      const updateData = {
        nombre,
        descripcion,
        tipo,
        precio,
        moneda,
        imagenes,
        portada,
        precios: tipo === 'evento' ? preciosConLinks : undefined,
        fecha: tipo === 'evento' ? fecha : undefined,
        ubicacion: tipo === 'evento' ? ubicacion : undefined,
        online: tipo === 'evento' ? online : undefined,
        linkEvento: tipo === 'evento' ? linkEvento : undefined,
        cupo: tipo === 'evento' ? cupo : undefined,
        archivoUrl: tipo === 'recurso' ? archivoUrl : undefined,
        tipoArchivo: tipo === 'recurso' ? tipoArchivo : undefined,
        descuento: descuento ? {
          ...descuento,
          stripeCouponId,
          stripePromotionCodeId
        } : undefined,
        updatedAt: new Date(),
      };

      // Eliminar campos undefined
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      // Actualizar el producto
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true }
      );

      return NextResponse.json(
        { message: 'Producto actualizado con éxito', product: updatedProduct },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
} 