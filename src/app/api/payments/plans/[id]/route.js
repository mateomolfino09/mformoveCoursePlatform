import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import { stripe } from '../../stripe/stripeConfig';

export async function DELETE(
  request,
  { params }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('type') || 'membership';
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID del plan requerido' },
        { status: 400 }
      );
    }
    
    const PlanModel = planType === 'mentorship' ? MentorshipPlan : Plan;
    const deletedPlan = await PlanModel.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      return NextResponse.json(
        { success: false, message: 'Plan no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Plan eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar el plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request,
  { params }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('type') || 'membership';
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID del plan requerido' },
        { status: 400 }
      );
    }
    
    const PlanModel = planType === 'mentorship' ? MentorshipPlan : Plan;
    
    // Obtener el plan actual antes de actualizar
    const currentPlan = await PlanModel.findById(id);
    if (!currentPlan) {
      return NextResponse.json(
        { success: false, message: 'Plan no encontrado' },
        { status: 404 }
      );
    }
    
    // Si el plan usa Stripe y el monto cambió, crear un nuevo precio en Stripe
    if (currentPlan.provider === 'stripe' && body.amount && body.amount !== currentPlan.amount) {
      try {
        // Obtener el precio actual de Stripe para obtener el producto
        const currentPriceId = currentPlan.plan_token || currentPlan.id;
        if (currentPriceId && currentPriceId.startsWith('price_')) {
          const currentPrice = await stripe.prices.retrieve(currentPriceId);
          const productId = currentPrice.product;
          
          // Determinar el intervalo basado en frequency_type
          let interval = 'month';
          let intervalCount = 1;
          if (body.frequency_type === 'year' || body.frequency_type === 'YEARLY' || body.frequency_type === 'yearly') {
            interval = 'year';
            intervalCount = 1;
          } else if (body.frequency_type === 'month' || body.frequency_type === 'MONTHLY' || body.frequency_type === 'monthly') {
            interval = 'month';
            intervalCount = 1;
          }
          
          // Crear nuevo precio en Stripe
          const newPrice = await stripe.prices.create({
            unit_amount: Math.round(body.amount * 100), // Stripe usa centavos
            currency: (body.currency || currentPlan.currency || 'USD').toLowerCase(),
            recurring: { interval, interval_count: intervalCount },
            product: typeof productId === 'string' ? productId : productId.id,
            billing_scheme: 'per_unit',
          });
          
          // Actualizar el body con el nuevo priceId
          body.plan_token = newPrice.id;
          body.id = newPrice.id;
        }
      } catch (stripeError) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Error al actualizar el precio en Stripe',
            details: stripeError instanceof Error ? stripeError.message : 'Error desconocido'
          },
          { status: 500 }
        );
      }
    }
    
    const updatedPlan = await PlanModel.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPlan) {
      return NextResponse.json(
        { success: false, message: 'Plan no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Plan actualizado exitosamente', plan: updatedPlan },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al actualizar el plan',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 