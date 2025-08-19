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
    // Configurar límite de body más pequeño para Vercel
    const maxBodySize = 4 * 1024 * 1024; // 4MB (límite de Vercel)
    
    const contentType = req.headers.get('content-type') || '';
    let data = {};
    let imagenes = [];
    let archivo = null;
    let imagenesUrls = [];

    // Verificar el tamaño del contenido
    const contentLength = req.headers.get('content-length');
    console.log('📊 Tamaño de la petición:', contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB` : 'Desconocido');
    
    if (contentLength && parseInt(contentLength) > maxBodySize) {
      console.error('❌ Petición demasiado grande:', `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB`);
      return NextResponse.json(
        { 
          error: `El tamaño de la petición (${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB) excede el límite de Vercel (4MB). Por favor, reduce el tamaño de las imágenes.`,
          code: '413'
        },
        { status: 413 }
      );
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const dataString = formData.get('data');
      
      if (!dataString) {
        return NextResponse.json(
          { error: 'Datos del formulario no encontrados' },
          { status: 400 }
        );
      }
      
      try {
        data = JSON.parse(dataString);
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Error al parsear los datos del formulario' },
          { status: 400 }
        );
      }
      
      imagenes = data.imagenes || []; // Extraer imágenes del JSON, no del FormData
      archivo = formData.get('archivo');
    } else {
      data = await req.json();
      imagenes = data.imagenes || [];
      archivo = data.archivo || null;
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

    // Procesar imágenes - optimizar para reducir el tamaño del payload
    if (imagenes && imagenes.length > 0) {
      if (imagenes[0] instanceof File) {
        // Si vienen archivos, subirlos a Cloudinary
        for (const img of imagenes) {
          const url = await uploadToCloudinary(img, 'productos/imagenes');
          imagenesUrls.push(url);
        }
      } else if (typeof imagenes[0] === 'string') {
        // Si vienen strings, verificar si son URLs completas o public_ids
        imagenesUrls = imagenes.map(img => {
          // Si es una URL completa de Cloudinary, convertir a public_id
          if (img.includes('cloudinary.com')) {
            const urlParts = img.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];
            return publicId;
          }
          // Si ya es un public_id, usarlo directamente
          return img;
        });
      }
    } else {
      imagenesUrls = [];
    }
    


    // El PDF ya se subió desde el frontend, solo usar la URL
    const pdfPresentacionUrl = data.pdfPresentacionUrl;

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
        pdfPresentacionUrl: tipo === 'evento' ? (pdfPresentacionUrl || data.pdfPresentacionUrl) : undefined,
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
        pdfPresentacionUrl: tipo === 'evento' ? (pdfPresentacionUrl || data.pdfPresentacionUrl) : undefined,
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
