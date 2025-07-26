import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      const trimestralIndex = existingPlan.prices.findIndex(p => p.interval === 'trimestral');
      const anualIndex = existingPlan.prices.findIndex(p => p.interval === 'anual');
      const oldTrimestralPrice = trimestralIndex !== -1 ? existingPlan.prices[trimestralIndex].price : null;
      
      // Si el precio trimestral cambió, crear nuevos precios en Stripe
      if (oldTrimestralPrice !== priceTrimestral) {
        try {
          // Crear nuevo precio trimestral en Stripe
          const newTrimestralStripePrice = await stripe.prices.create({
            unit_amount: Math.round(priceTrimestral * 100),
            currency: (currency || 'USD').toLowerCase(),
            recurring: { interval: 'month', interval_count: 3 }, // Trimestral
            product_data: { name: `${name} (Trimestral)` },
          });

          // Calcular precio anual con 15% de descuento (como en createPlan)
          const priceAnual = Math.round(priceTrimestral * 4 * 0.85);
          
          // Crear nuevo precio anual en Stripe
          const newAnualStripePrice = await stripe.prices.create({
            unit_amount: Math.round(priceAnual * 100),
            currency: (currency || 'USD').toLowerCase(),
            recurring: { interval: 'year', interval_count: 1 }, // Anual
            product_data: { name: `${name} (Anual)` },
          });

          // Actualizar precio trimestral en el array
          if (trimestralIndex !== -1) {
            existingPlan.prices[trimestralIndex].price = priceTrimestral;
            existingPlan.prices[trimestralIndex].currency = currency || 'USD';
            existingPlan.prices[trimestralIndex].stripePriceId = newTrimestralStripePrice.id;
          } else {
            // Si no existe un precio trimestral, agregarlo
            existingPlan.prices.push({
              interval: 'trimestral',
              price: priceTrimestral,
              currency: currency || 'USD',
              stripePriceId: newTrimestralStripePrice.id
            });
          }

          // Actualizar precio anual en el array
          if (anualIndex !== -1) {
            existingPlan.prices[anualIndex].price = priceAnual;
            existingPlan.prices[anualIndex].currency = currency || 'USD';
            existingPlan.prices[anualIndex].stripePriceId = newAnualStripePrice.id;
          } else {
            // Si no existe un precio anual, agregarlo
            existingPlan.prices.push({
              interval: 'anual',
              price: priceAnual,
              currency: currency || 'USD',
              stripePriceId: newAnualStripePrice.id
            });
          }
        } catch (stripeError) {
          console.error('Error creando nuevos precios en Stripe:', stripeError);
          return NextResponse.json({
            success: false,
            message: 'Error al crear los nuevos precios en Stripe',
            error: stripeError.message
          }, { status: 500 });
        }
      } else {
        // Si el precio no cambió, solo actualizar la moneda si es necesario
        if (trimestralIndex !== -1) {
          existingPlan.prices[trimestralIndex].currency = currency || 'USD';
        }
        if (anualIndex !== -1) {
          existingPlan.prices[anualIndex].currency = currency || 'USD';
        }
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