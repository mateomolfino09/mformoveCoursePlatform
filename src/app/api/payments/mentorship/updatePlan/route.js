import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import { NextResponse } from 'next/server';

connectDB();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { planId, name, description, features, level, priceTrimestral, currency } = body;

    if (!planId) {
      return NextResponse.json({
        success: false,
        message: 'ID del plan es requerido'
      }, { status: 400 });
    }

    // Buscar el plan existente
    const existingPlan = await MentorshipPlan.findById(planId);
    if (!existingPlan) {
      return NextResponse.json({
        success: false,
        message: 'Plan no encontrado'
      }, { status: 404 });
    }

    // Preparar los datos de actualización
    const updateData = {
      name,
      description,
      features,
      level,
      active: existingPlan.active // Mantener el estado activo actual
    };

    // Actualizar el precio en el array de precios
    if (priceTrimestral !== undefined) {
      const priceIndex = existingPlan.prices.findIndex(p => p.interval === 'trimestral');
      if (priceIndex !== -1) {
        existingPlan.prices[priceIndex].price = priceTrimestral;
        existingPlan.prices[priceIndex].currency = currency || 'USD';
      } else {
        // Si no existe un precio trimestral, agregarlo
        existingPlan.prices.push({
          interval: 'trimestral',
          price: priceTrimestral,
          currency: currency || 'USD',
          stripePriceId: existingPlan.stripePriceId || `price_${level}_quarterly`
        });
      }
    }

    // Actualizar el plan
    const updatedPlan = await MentorshipPlan.findByIdAndUpdate(
      planId,
      { ...updateData, prices: existingPlan.prices },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Plan de mentoría actualizado exitosamente',
      plan: updatedPlan
    }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar plan de mentoría:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar el plan de mentoría',
      error: error.message
    }, { status: 500 });
  }
} 