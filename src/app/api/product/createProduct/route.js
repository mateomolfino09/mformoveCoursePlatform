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
      imagenes = formData.getAll('imagenes');
      archivo = formData.get('archivo');
      pdfPresentacion = formData.get('pdfPresentacion');
    } else {
      data = await req.json();
      imagenes = data.imagenes || [];
      archivo = data.archivo || null;
      pdfPresentacion = data.pdfPresentacion || null;
    }

    const { nombre, descripcion, tipo, precio, moneda, cursosIncluidos, fecha, ubicacion, online, linkEvento, cupo, tipoArchivo, userEmail } = data;

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
    } else {
      imagenesUrls = imagenes;
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
    console.log(data);
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
    let stripeProductId, preciosConLinks;
    if (tipo === 'evento' && data.precios) {
      const stripeResult = await createEventProductWithPrices({
        nombre,
        descripcion,
        precios: data.precios,
        portadaUrl: data.portada || imagenesUrls[0] || undefined,
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
    }
    const productoData = {
      nombre,
      descripcion,
      tipo,
      precio,
      moneda,
      imagenes: imagenesUrls,
      portada: data.portada,
      pdfPresentacionUrl: tipo === 'evento' ? pdfPresentacionUrl : undefined,
      cursosIncluidos: tipo === 'bundle' ? cursosIncluidos : undefined,
      fecha: tipo === 'evento' ? fecha : undefined,
      ubicacion: tipo === 'evento' ? ubicacion : undefined,
      online: tipo === 'evento' ? online : undefined,
      linkEvento: tipo === 'evento' ? linkEvento : undefined,
      cupo: tipo === 'evento' ? cupo : undefined,
      precios: tipo === 'evento' ? preciosConLinks : undefined,
      stripeProductId: tipo === 'evento' ? stripeProductId : undefined,
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

    // Eliminar campos undefined
    Object.keys(productoData).forEach(key => productoData[key] === undefined && delete productoData[key]);

    const product = await Product.create(productoData);

    return NextResponse.json(
      { message: 'Producto creado con éxito', product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || error }, { status: 401 });
  }
}
