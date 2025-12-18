import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Promocion from '../../../../../models/promocionModel';
import { stripe } from '../../stripe/stripeConfig';

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const body = await req.json();
    const { 
      nombre, 
      descripcion, 
      porcentajeDescuento, 
      frecuenciasAplicables, 
      fechaInicio, 
      fechaFin,
      activa,
      codigoPromocional 
    } = body;

    // Buscar la promoción
    const promocion = await Promocion.findById(id);
    if (!promocion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    // Validaciones
    if (porcentajeDescuento !== undefined && (porcentajeDescuento < 0 || porcentajeDescuento > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
        { status: 400 }
      );
    }

    if (frecuenciasAplicables !== undefined) {
      if (!Array.isArray(frecuenciasAplicables) || frecuenciasAplicables.length === 0) {
        return NextResponse.json(
          { error: 'Debe seleccionar al menos una frecuencia aplicable' },
          { status: 400 }
        );
      }

      const frecuenciasValidas = ['mensual', 'trimestral', 'ambas'];
      const frecuenciasInvalidas = frecuenciasAplicables.filter(f => !frecuenciasValidas.includes(f));
      if (frecuenciasInvalidas.length > 0) {
        return NextResponse.json(
          { error: `Frecuencias inválidas: ${frecuenciasInvalidas.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Actualizar campos
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (porcentajeDescuento !== undefined) updateData.porcentajeDescuento = porcentajeDescuento;
    if (frecuenciasAplicables !== undefined) updateData.frecuenciasAplicables = frecuenciasAplicables;
    if (fechaInicio !== undefined) updateData.fechaInicio = new Date(fechaInicio);
    if (fechaFin !== undefined) updateData.fechaFin = new Date(fechaFin);
    if (activa !== undefined) updateData.activa = activa;
    if (codigoPromocional !== undefined) {
      updateData.codigoPromocional = codigoPromocional ? codigoPromocional.toUpperCase() : null;
    }

    // Verificar si cambió el porcentaje de descuento
    const porcentajeCambio = porcentajeDescuento !== undefined && porcentajeDescuento !== promocion.porcentajeDescuento;
    
    // Si cambió el porcentaje, crear un nuevo cupón en Stripe
    if (porcentajeCambio) {
      try {
        const finalPorcentaje = porcentajeDescuento;
        const finalFechaFin = fechaFin !== undefined ? new Date(fechaFin) : promocion.fechaFin;
        const finalNombre = nombre !== undefined ? nombre : promocion.nombre;
        
        // Crear nuevo cupón en Stripe
        const newCoupon = await stripe.coupons.create({
          percent_off: finalPorcentaje,
          duration: 'once',
          name: `Promoción: ${finalNombre}`,
          redeem_by: Math.floor(new Date(finalFechaFin).getTime() / 1000),
        });
        
        updateData.stripeCouponId = newCoupon.id;
        
        // Si hay código promocional, crear o actualizar el promotion code
        const finalCodigo = codigoPromocional !== undefined ? codigoPromocional : promocion.codigoPromocional;
        if (finalCodigo) {
          // Si ya existe un promotion code, intentar eliminarlo primero (opcional, Stripe no lo requiere)
          // Crear nuevo promotion code
          const promoCode = await stripe.promotionCodes.create({
            code: finalCodigo.toUpperCase(),
            coupon: newCoupon.id,
            expires_at: Math.floor(new Date(finalFechaFin).getTime() / 1000),
          });
          updateData.stripePromotionCodeId = promoCode.id;
        } else {
          // Si no hay código promocional, limpiar el promotion code
          updateData.stripePromotionCodeId = null;
        }
      } catch (stripeError) {
        console.error('Error creando cupón en Stripe:', stripeError);
        // Continuar con la actualización aunque falle Stripe
        // Pero retornar un error más descriptivo
        return NextResponse.json(
          { 
            error: 'Error al crear el cupón en Stripe', 
            details: stripeError.message || 'Error desconocido al crear cupón'
          },
          { status: 500 }
        );
      }
    } else if (fechaFin !== undefined && promocion.stripeCouponId) {
      // Si solo cambió la fecha de fin y existe un cupón, actualizar el redeem_by
      // Nota: Stripe no permite actualizar cupones, pero podemos crear uno nuevo con la nueva fecha
      try {
        const finalPorcentaje = promocion.porcentajeDescuento;
        const finalFechaFin = new Date(fechaFin);
        const finalNombre = nombre !== undefined ? nombre : promocion.nombre;
        
        const newCoupon = await stripe.coupons.create({
          percent_off: finalPorcentaje,
          duration: 'once',
          name: `Promoción: ${finalNombre}`,
          redeem_by: Math.floor(finalFechaFin.getTime() / 1000),
        });
        
        updateData.stripeCouponId = newCoupon.id;
        
        // Actualizar promotion code si existe
        const finalCodigo = codigoPromocional !== undefined ? codigoPromocional : promocion.codigoPromocional;
        if (finalCodigo && promocion.stripePromotionCodeId) {
          const promoCode = await stripe.promotionCodes.create({
            code: finalCodigo.toUpperCase(),
            coupon: newCoupon.id,
            expires_at: Math.floor(finalFechaFin.getTime() / 1000),
          });
          updateData.stripePromotionCodeId = promoCode.id;
        }
      } catch (stripeError) {
        console.error('Error actualizando cupón en Stripe:', stripeError);
        // Continuar con la actualización aunque falle Stripe
      }
    }

    // Actualizar la promoción
    const promocionActualizada = await Promocion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, promocion: promocionActualizada },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al editar promoción:', error);
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'El código promocional ya existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al editar la promoción', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const promocion = await Promocion.findById(id);
    
    if (!promocion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, promocion },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener promoción:', error);
    return NextResponse.json(
      { error: 'Error al obtener la promoción', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const promocion = await Promocion.findByIdAndDelete(id);
    
    if (!promocion) {
      return NextResponse.json(
        { error: 'Promoción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Promoción eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la promoción', details: error.message },
      { status: 500 }
    );
  }
}

