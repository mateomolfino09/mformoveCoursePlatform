import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Promocion from '../../../../../models/promocionModel';
import { stripe } from '../../stripe/stripeConfig';

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { 
      nombre, 
      descripcion, 
      porcentajeDescuento, 
      frecuenciasAplicables, 
      fechaInicio, 
      fechaFin,
      codigoPromocional 
    } = body;

    // Validaciones
    if (!nombre || !porcentajeDescuento || !frecuenciasAplicables || !fechaFin) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: nombre, porcentajeDescuento, frecuenciasAplicables, fechaFin' },
        { status: 400 }
      );
    }

    if (porcentajeDescuento < 0 || porcentajeDescuento > 100) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    if (!Array.isArray(frecuenciasAplicables) || frecuenciasAplicables.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos una frecuencia aplicable' },
        { status: 400 }
      );
    }

    // Validar que las frecuencias sean válidas
    const frecuenciasValidas = ['mensual', 'trimestral', 'ambas'];
    const frecuenciasInvalidas = frecuenciasAplicables.filter(f => !frecuenciasValidas.includes(f));
    if (frecuenciasInvalidas.length > 0) {
      return NextResponse.json(
        { error: `Frecuencias inválidas: ${frecuenciasInvalidas.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear cupón en Stripe
    let stripeCouponId = null;
    let stripePromotionCodeId = null;
    
    try {
      // Crear cupón en Stripe
      const coupon = await stripe.coupons.create({
        percent_off: porcentajeDescuento,
        duration: 'once', // Una vez por suscripción
        name: `Promoción: ${nombre}`,
        redeem_by: Math.floor(new Date(fechaFin).getTime() / 1000), // Fecha de expiración en Unix timestamp
      });
      
      stripeCouponId = coupon.id;
      
      // Crear promotion code si hay código promocional
      if (codigoPromocional) {
        const promoCode = await stripe.promotionCodes.create({
          code: codigoPromocional.toUpperCase(),
          coupon: coupon.id,
          expires_at: Math.floor(new Date(fechaFin).getTime() / 1000),
        });
        stripePromotionCodeId = promoCode.id;
      }
    } catch (stripeError) {
      console.error('Error creando cupón en Stripe:', stripeError);
      // Continuar con la creación de la promoción aunque falle Stripe
      // para no bloquear el proceso
    }

    // Crear la promoción
    const promocion = await Promocion.create({
      nombre,
      descripcion,
      porcentajeDescuento,
      frecuenciasAplicables,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
      fechaFin: new Date(fechaFin),
      codigoPromocional: codigoPromocional?.toUpperCase() || undefined,
      activa: true,
      stripeCouponId,
      stripePromotionCodeId
    });

    return NextResponse.json(
      { success: true, promocion },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear promoción:', error);
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'El código promocional ya existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear la promoción', details: error.message },
      { status: 500 }
    );
  }
}

