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

    const incomingPrice = priceMensual ?? priceTrimestral;
    let priceChanged = false;

    if (incomingPrice !== undefined) {
      const currentMensual = existingPlan.prices.find((p) => p.interval === 'mensual');
      const currentTrimestral = existingPlan.prices.find((p) => p.interval === 'trimestral');
      const currentAnual = existingPlan.prices.find((p) => p.interval === 'anual');
      const currentShort = currentMensual ?? currentTrimestral;

      const resolvedInterval = priceMensual != null ? 'mensual' : 'trimestral';
      const oldShortPrice = currentShort?.price ?? null;
      const oldComparablePrice =
        currentShort?.interval === 'trimestral' && oldShortPrice != null
          ? Math.round(oldShortPrice / 3)
          : oldShortPrice;

      const shouldMigrateToMensual =
        Boolean(currentTrimestral) && !currentMensual && priceMensual != null;

      if (oldComparablePrice !== incomingPrice || shouldMigrateToMensual) {
        priceChanged = oldComparablePrice !== incomingPrice || shouldMigrateToMensual;

        try {
          const stripeShort = await stripe.prices.create({
            unit_amount: Math.round(incomingPrice * 100),
            currency: (currency || 'USD').toLowerCase(),
            recurring: {
              interval: 'month',
              interval_count: resolvedInterval === 'trimestral' ? 3 : 1,
            },
            product_data: {
              name: `${name} (${resolvedInterval === 'trimestral' ? 'Trimestral' : 'Mensual'})`,
            },
          });

          const priceAnual = Math.round(
            resolvedInterval === 'trimestral'
              ? incomingPrice * 4 * 0.85
              : incomingPrice * 12 * 0.85,
          );

          const stripeAnual = await stripe.prices.create({
            unit_amount: Math.round(priceAnual * 100),
            currency: (currency || 'USD').toLowerCase(),
            recurring: { interval: 'year', interval_count: 1 },
            product_data: { name: `${name} (Anual)` },
          });

          const shortPayload = {
            interval: resolvedInterval,
            price: incomingPrice,
            currency: currency || 'USD',
            stripePriceId: stripeShort.id,
            opcionesPago: plainPriceEntry(currentShort)?.opcionesPago,
          };

          const anualPayload = {
            interval: 'anual',
            price: priceAnual,
            currency: currency || 'USD',
            stripePriceId: stripeAnual.id,
            opcionesPago: plainPriceEntry(currentAnual)?.opcionesPago,
          };

          existingPlan.prices = [shortPayload, anualPayload];
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
          if (plain.interval === 'mensual' || plain.interval === 'trimestral' || plain.interval === 'anual') {
            return { ...plain, currency: currency || plain.currency || 'USD' };
          }
          return plain;
        });
      }
    }

    const origin = resolveOrigin(req);
    const pricesWithLinks = await ensureMentorshipPlanPaymentLinks(
      {
        _id: planId,
        name: name ?? existingPlan.name,
        description: description ?? existingPlan.description,
        level: level ?? existingPlan.level,
        prices: existingPlan.prices,
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
