import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import Product from '../../../../models/productModel';
import { NextResponse } from 'next/server';
import { createEventProductWithPrices } from '../../payments/stripe/createEventProductWithPrices';
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

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data = {};
    let imagenes = [];
    let archivo = null;
    let pdfPresentacion = null;
    let imagenesUrls = [];
    let pdfPresentacionUrl = undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      data = JSON.parse(formData.get('data'));
      imagenes = data.imagenes || []; // Extraer imágenes del JSON, no del FormData
      archivo = formData.get('archivo');
      pdfPresentacion = formData.get('pdfPresentacion');
    } else {
      data = await req.json();
      imagenes = data.imagenes || [];
      archivo = data.archivo || null;
      pdfPresentacion = data.pdfPresentacion || null;
    }



    const { nombre, descripcion, tipo, precio, moneda, cursosIncluidos, fecha, ubicacion, online, linkEvento, cupo, tipoArchivo, userEmail, beneficios, aprendizajes, paraQuien } = data;

    // Validar usuario admin
    let user = await Users.findOne({ email: userEmail });
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'Este usuario no tiene permisos para crear un producto' },
        { status: 422 }
      );
    }

    // Subir imágenes a Cloudinary si vienen en FormData
    if (imagenes && imagenes.length > 0 && imagenes[0] instanceof File) {
      for (const img of imagenes) {
        const url = await uploadToCloudinary(img, 'productos/imagenes');
        imagenesUrls.push(url);
      }
    } else if (imagenes && imagenes.length > 0) {
      // Si las imágenes ya están subidas a Cloudinary (public_id), usarlas directamente
      imagenesUrls = imagenes;
    } else {
      imagenesUrls = [];
    }
    


    // Subir PDF de presentación si viene en FormData
    if (tipo === 'evento' && pdfPresentacion && pdfPresentacion instanceof File) {
      pdfPresentacionUrl = await uploadToCloudinary(pdfPresentacion, 'productos/pdfPresentacion');
    }

    // Subir archivo de recurso si corresponde
    let archivoUrl = undefined;
    if (tipo === 'recurso' && archivo && archivo instanceof File) {
      archivoUrl = await uploadToCloudinary(archivo, 'productos/recursos');
    } else if (tipo === 'recurso' && archivo) {
      archivoUrl = archivo;
    }

    // Crear cupón y promotion code en Stripe si hay descuento
    let stripeCouponId = undefined;
    let stripePromotionCodeId = undefined;
    if (data.descuento && data.descuento.codigo && data.descuento.porcentaje) {
      // Buscar si ya existe un promotion code con ese código
      const existingPromos = await stripe.promotionCodes.list({
        code: data.descuento.codigo,
        limit: 1
      });
      if (existingPromos.data.length > 0) {
        // Ya existe, usar el existente
        stripePromotionCodeId = existingPromos.data[0].id;
        stripeCouponId = existingPromos.data[0].coupon.id;
        console.warn(`Promotion code ya existe en Stripe: ${data.descuento.codigo}. Se usará el existente.`);
      } else {
        // Crear cupón
        const coupon = await stripe.coupons.create({
          percent_off: data.descuento.porcentaje,
          duration: 'once',
          max_redemptions: data.descuento.maxUsos || undefined,
          redeem_by: data.descuento.expiracion ? Math.floor(new Date(data.descuento.expiracion).getTime() / 1000) : undefined,
          name: `Descuento ${data.descuento.codigo}`
        });
        stripeCouponId = coupon.id;
        // Crear promotion code
        const promo = await stripe.promotionCodes.create({
          code: data.descuento.codigo,
          coupon: coupon.id,
          max_redemptions: data.descuento.maxUsos || undefined,
          expires_at: data.descuento.expiracion ? Math.floor(new Date(data.descuento.expiracion).getTime() / 1000) : undefined,
        });
        stripePromotionCodeId = promo.id;
      }
    }

    // Construir el objeto del producto
    let stripeProductId, preciosConLinks, product;
    
    if (tipo === 'evento' && data.precios) {
      // Construir URL de success para el evento
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Crear URL limpia para el nombre del evento
      const cleanEventName = nombre
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


      
      // Crear el producto primero para obtener el ID
      const productoData = {
        nombre,
        descripcion,
        tipo,
        precio,
        moneda,
        imagenes: imagenesUrls,
        portada: data.portada,
        portadaMobile: data.portadaMobile,
        pdfPresentacionUrl: tipo === 'evento' ? pdfPresentacionUrl : undefined,
        cursosIncluidos: tipo === 'bundle' ? cursosIncluidos : undefined,
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
        descuento: data.descuento ? {
          ...data.descuento,
          stripeCouponId,
          stripePromotionCodeId
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };



      // Eliminar campos undefined (pero mantener arrays vacíos)
      Object.keys(productoData).forEach(key => {
        if (productoData[key] === undefined) {
          delete productoData[key];
        }
      });

      product = await Product.create(productoData);

      
      const stripeResult = await createEventProductWithPrices({
        nombre,
        descripcion,
        precios: data.precios,
        portadaUrl: data.portada || imagenesUrls[0] || undefined,
        successUrl,
        productId: product._id.toString(),
      });
      stripeProductId = stripeResult.productId;
      // Armar objeto precios con paymentLink y priceId
      preciosConLinks = {
        earlyBird: {
          ...data.precios.earlyBird,
          priceId: stripeResult.precios.earlyBird.priceId,
          paymentLink: stripeResult.precios.earlyBird.paymentLink
        },
        general: {
          ...data.precios.general,
          priceId: stripeResult.precios.general.priceId,
          paymentLink: stripeResult.precios.general.paymentLink
        },
        lastTickets: {
          ...data.precios.lastTickets,
          priceId: stripeResult.precios.lastTickets.priceId,
          paymentLink: stripeResult.precios.lastTickets.paymentLink
        }
      };

      // Actualizar el producto con los datos de Stripe
      product.precios = preciosConLinks;
      product.stripeProductId = stripeResult.productId;
      await product.save();
    } else {
      // Para productos que no son eventos, crear directamente
      const productoData = {
        nombre,
        descripcion,
        tipo,
        precio,
        moneda,
        imagenes: imagenesUrls,
        portada: data.portada,
        portadaMobile: data.portadaMobile,
        pdfPresentacionUrl: tipo === 'evento' ? pdfPresentacionUrl : undefined,
        cursosIncluidos: tipo === 'bundle' ? cursosIncluidos : undefined,
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
        descuento: data.descuento ? {
          ...data.descuento,
          stripeCouponId,
          stripePromotionCodeId
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Eliminar campos undefined (pero mantener arrays vacíos)
      Object.keys(productoData).forEach(key => {
        if (productoData[key] === undefined) {
          delete productoData[key];
        }
      });

      product = await Product.create(productoData);
    }

    return NextResponse.json(
      { message: 'Producto creado con éxito', product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || error }, { status: 401 });
  }
}
