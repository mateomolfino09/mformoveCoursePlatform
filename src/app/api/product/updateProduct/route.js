import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import { stripe } from '../../payments/stripe/stripeConfig';

connectDB();

// Función auxiliar para subir archivos a Cloudinary
async function uploadToCloudinary(file, folder = 'productos') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'my_uploads');
  formData.append('folder', folder);
  
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const res = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  return data.secure_url;
}

export async function PUT(req) {
  try {
    if (req.method === 'PUT') {
      const contentType = req.headers.get('content-type') || '';
      let data = {};
      let pdfPresentacion = null;
      let pdfPresentacionUrl = undefined;

      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        data = JSON.parse(formData.get('data'));
        pdfPresentacion = formData.get('pdfPresentacion');
      } else {
        data = await req.json();
      }

      const {
        productId,
        nombre,
        descripcion,
        tipo,
        precio,
        moneda,
        portada,
        portadaMobile,
        imagenes,
        precios,
        fecha,
        ubicacion,
        online,
        linkEvento,
        cupo,
        beneficios,
        aprendizajes,
        paraQuien,
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

      // Debug: mostrar objeto completo del producto
      console.log('📋 Producto encontrado:', {
        _id: existingProduct._id,
        nombre: existingProduct.nombre,
        tipo: existingProduct.tipo,
        stripeProductId: existingProduct.stripeProductId,
        precios: existingProduct.precios
      });

      // Verificar que el producto tiene stripeProductId si es un evento
      if (tipo === 'evento') {
        console.log('🔍 Verificando stripeProductId para:', existingProduct.nombre);
        console.log('📊 stripeProductId:', existingProduct.stripeProductId);
        console.log('📊 Precios existentes:', existingProduct.precios);
        
        // Si no tiene stripeProductId pero tiene precios con priceId, intentar extraer el productId del primer priceId
        if (!existingProduct.stripeProductId && existingProduct.precios) {
          const primerPrecio = Object.values(existingProduct.precios).find(precio => precio?.priceId);
          if (primerPrecio?.priceId) {
            try {
              // Extraer el productId del priceId (formato: price_1RxqRBJzWKYFnVw7RU8etLKD)
              const price = await stripe.prices.retrieve(primerPrecio.priceId);
              if (price.product) {
                existingProduct.stripeProductId = price.product;
                console.log('✅ stripeProductId extraído del priceId:', existingProduct.stripeProductId);
              }
            } catch (error) {
              console.error('❌ Error extrayendo productId del priceId:', error);
            }
          }
        }
        
        if (!existingProduct.stripeProductId) {
          console.log('🔄 Producto sin stripeProductId, creando todo de vuelta...');
          
          // Crear producto en Stripe desde cero
          const stripeProduct = await stripe.products.create({
            name: existingProduct.nombre,
            description: existingProduct.descripcion,
            images: existingProduct.portada ? [existingProduct.portada] : [],
            metadata: {
              productId: existingProduct._id.toString(),
              tipo: 'evento'
            }
          });
          
          // Asignar el nuevo stripeProductId
          existingProduct.stripeProductId = stripeProduct.id;
          console.log('✅ Nuevo stripeProductId creado:', stripeProduct.id);
          
          // Si se creó un nuevo stripeProductId, forzar la creación de todos los precios
          preciosConLinks = {};
        }
      }

      // Subir PDF de presentación si viene en FormData
      if (tipo === 'evento' && pdfPresentacion && pdfPresentacion instanceof File) {
        pdfPresentacionUrl = await uploadToCloudinary(pdfPresentacion, 'productos/pdfPresentacion');
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
      
      let preciosConLinks = {};
      if (tipo === 'evento' && precios) {
        console.log('🔄 Procesando precios para evento:', existingProduct.nombre);
        console.log('📊 stripeProductId:', existingProduct.stripeProductId);
        console.log('📊 Precios nuevos:', JSON.stringify(precios, null, 2));
        console.log('📊 Precios existentes:', JSON.stringify(existingProduct.precios, null, 2));
        // Procesar cada tipo de precio
        for (const tipoPrecio of ['earlyBird', 'general', 'lastTickets']) {
          const nuevoPrecio = precios[tipoPrecio];
          const precioExistente = existingProduct.precios?.[tipoPrecio];
          
          if (nuevoPrecio) {
            // Si se creó un nuevo stripeProductId, siempre crear precios nuevos
            const crearPrecioNuevo = !existingProduct.stripeProductId || 
              !precioExistente ||
              Number(nuevoPrecio.price) !== Number(precioExistente.price) ||
              !precioExistente.paymentLink;
            
            if (!crearPrecioNuevo) {
              // Si el precio no cambió, conserva el link y priceId existente
              preciosConLinks[tipoPrecio] = {
                ...nuevoPrecio,
                priceId: precioExistente.priceId,
                paymentLink: precioExistente.paymentLink,
              };
            } else if (nuevoPrecio.price && nuevoPrecio.start && nuevoPrecio.end) {
              // Si el precio cambió o no existe, crear uno nuevo en Stripe
              console.log(`🔄 Creando nuevo precio para ${tipoPrecio}: ${nuevoPrecio.price}`);
              
              // Verificar que existe stripeProductId
              if (!existingProduct.stripeProductId) {
                console.error('❌ No se encontró stripeProductId para el producto:', existingProduct._id);
                throw new Error('El producto no tiene un ID de Stripe válido.');
              }
              
              // Crear nuevo precio en Stripe
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
              
              // Crear link de pago con URL de success específica para eventos
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
              
              // Crear URL limpia para el nombre del evento
              const cleanEventName = existingProduct.nombre
                .toLowerCase()
                .replace(/[áäâà]/g, 'a')
                .replace(/[éëêè]/g, 'e')
                .replace(/[íïîì]/g, 'i')
                .replace(/[óöôò]/g, 'o')
                .replace(/[úüûù]/g, 'u')
                .replace(/[ñ]/g, 'n')
                .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
                .replace(/\s+/g, '-') // Reemplazar espacios con guiones
                .replace(/-+/g, '-') // Remover guiones múltiples
                .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
              
              const successUrl = `${baseUrl}/events/${cleanEventName}/success`;
              
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
                    url: successUrl,
                  },
                },
                metadata: {
                  productId: existingProduct._id.toString()
                }
              });
              
              preciosConLinks[tipoPrecio] = {
                ...nuevoPrecio,
                priceId: stripePrice.id,
                paymentLink: paymentLink.url,
              };
              
              console.log(`✅ Nuevo precio creado para ${tipoPrecio}: ${paymentLink.url}`);
            }
          }
        }
      }
      
      // Construir objeto de actualización
      const updateData = {
        nombre,
        descripcion,
        tipo,
        precio,
        moneda,
        imagenes,
        portada,
        portadaMobile,
        pdfPresentacionUrl: tipo === 'evento' ? (pdfPresentacionUrl || existingProduct.pdfPresentacionUrl) : undefined,
        precios: tipo === 'evento' ? preciosConLinks : undefined,
        fecha: tipo === 'evento' ? fecha : undefined,
        ubicacion: tipo === 'evento' ? ubicacion : undefined,
        online: tipo === 'evento' ? online : undefined,
        linkEvento: tipo === 'evento' ? linkEvento : undefined,
        cupo: tipo === 'evento' ? cupo : undefined,
        beneficios: tipo === 'evento' ? (beneficios || []) : undefined,
        aprendizajes: tipo === 'evento' ? (aprendizajes || []) : undefined,
        paraQuien: tipo === 'evento' ? (paraQuien || []) : undefined,
        archivoUrl: tipo === 'recurso' ? archivoUrl : undefined,
        tipoArchivo: tipo === 'recurso' ? tipoArchivo : undefined,
        descuento: descuento ? {
          ...descuento,
          stripeCouponId,
          stripePromotionCodeId
        } : undefined,
        updatedAt: new Date(),
      };

      // Debug: ver el objeto de actualización (solo para eventos)
      if (tipo === 'evento') {
        console.log('📊 Precios actualizados:', JSON.stringify(preciosConLinks, null, 2));
      }

      // Eliminar campos undefined (pero mantener arrays vacíos)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

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