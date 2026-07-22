import connectDB from '../../../../../config/connectDB';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';
import { ensureMentorshipPlanPaymentLinks } from '../../../../../lib/createMentorshipPaymentLinks';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

connectDB();

function resolveOrigin(req) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get('origin') ||
    'http://localhost:3000'
  );
}

function plainPriceEntry(entry) {
  if (!entry) return null;
  if (typeof entry.toObject === 'function') return entry.toObject();
  return { ...entry };
}

/** Actualiza planes con ciclo corto trimestral (3 meses) + anual (−15%). */
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      planId,
      name,
      description,
      features,
      level,
      priceMensual,
      priceTrimestral,
      currency,
      proveedoresHabilitados,
    } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'ID del plan es requerido' },
        { status: 400 },
      );
    }

    const existingPlan = await MentorshipPlan.findById(planId);
    if (!existingPlan) {
      return NextResponse.json(
        { success: false, message: 'Plan no encontrado' },
        { status: 404 },
      );
    }

    const updateData = {
      name,
      description,
      features,
      level,
      active: existingPlan.active,
    };

    if (Array.isArray(proveedoresHabilitados) && proveedoresHabilitados.length) {
      updateData.proveedoresHabilitados = proveedoresHabilitados;
    }

    const incomingTrimestral =
      priceTrimestral != null && priceTrimestral !== ''
        ? Number(priceTrimestral)
        : priceMensual != null && priceMensual !== ''
          ? Math.round(Number(priceMensual) * 3)
          : undefined;

    let priceChanged = false;

    if (incomingTrimestral !== undefined && !Number.isNaN(incomingTrimestral)) {
      const currentMensual = existingPlan.prices.find((p) => p.interval === 'mensual');
      const currentTrimestral = existingPlan.prices.find((p) => p.interval === 'trimestral');
      const currentAnual = existingPlan.prices.find((p) => p.interval === 'anual');
      const currentShort = currentTrimestral ?? currentMensual;

      const oldShortAsTrimestral =
        currentShort?.interval === 'mensual' && currentShort?.price != null
          ? Math.round(currentShort.price * 3)
          : currentShort?.price ?? null;

      const shouldMigrateToTrimestral = Boolean(currentMensual) && !currentTrimestral;

      if (oldShortAsTrimestral !== incomingTrimestral || shouldMigrateToTrimestral) {
        priceChanged = true;

        try {
          const stripeTrimestral = await stripe.prices.create({
            unit_amount: Math.round(incomingTrimestral * 100),
            currency: (currency || 'USD').toLowerCase(),
            recurring: { interval: 'month', interval_count: 3 },
            product_data: { name: `${name} (Trimestral)` },
          });

          const priceAnual = Math.round(incomingTrimestral * 4 * 0.85);

          const stripeAnual = await stripe.prices.create({
            unit_amount: Math.round(priceAnual * 100),
            currency: (currency || 'USD').toLowerCase(),
            recurring: { interval: 'year', interval_count: 1 },
            product_data: { name: `${name} (Anual)` },
          });

          existingPlan.prices = [
            {
              interval: 'trimestral',
              price: incomingTrimestral,
              currency: currency || 'USD',
              stripePriceId: stripeTrimestral.id,
              opcionesPago: plainPriceEntry(currentShort)?.opcionesPago,
            },
            {
              interval: 'anual',
              price: priceAnual,
              currency: currency || 'USD',
              stripePriceId: stripeAnual.id,
              opcionesPago: plainPriceEntry(currentAnual)?.opcionesPago,
            },
          ];
        } catch (stripeError) {
          console.error('Error creando nuevos precios en Stripe:', stripeError);
          return NextResponse.json(
            {
              success: false,
              message: 'Error al crear los nuevos precios en Stripe',
              error: stripeError.message,
            },
            { status: 500 },
          );
        }
      } else {
        existingPlan.prices = existingPlan.prices.map((entry) => {
          const plain = plainPriceEntry(entry);
          if (!plain) return entry;
          if (
            plain.interval === 'mensual' ||
            plain.interval === 'trimestral' ||
            plain.interval === 'anual'
          ) {
            return { ...plain, currency: currency || plain.currency || 'USD' };
          }
          return plain;
        });
      }
    }

    const origin = resolveOrigin(req);
    const resolvedProveedores =
      Array.isArray(proveedoresHabilitados) && proveedoresHabilitados.length
        ? proveedoresHabilitados
        : existingPlan.proveedoresHabilitados;
    const pricesWithLinks = await ensureMentorshipPlanPaymentLinks(
      {
        _id: planId,
        name: name ?? existingPlan.name,
        description: description ?? existingPlan.description,
        level: level ?? existingPlan.level,
        prices: existingPlan.prices,
        proveedoresHabilitados: resolvedProveedores,
      },
      origin,
      { forceRegenerate: priceChanged },
    );

    const updatedPlan = await MentorshipPlan.findByIdAndUpdate(
      planId,
      { ...updateData, prices: pricesWithLinks },
      { new: true, runValidators: true },
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Plan de mentoría actualizado exitosamente',
        plan: updatedPlan,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error al actualizar plan de mentoría:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar el plan de mentoría',
        error: error.message,
      },
      { status: 500 },
    );
  }
}
