import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import User from '../../../../models/userModel';
import { ensureMentorshipPlanPaymentLinks } from '../../../../lib/createMentorshipPaymentLinks';
import {
  mentorshipPricesHaveStaleLinks,
  resolveMentorshipPaymentOrigin,
} from '../../../../lib/resolveMentorshipPaymentOrigin';
import {
  resolveMentorshipDefaultInterval,
  resolveMentorshipToggleIntervals,
  type MentorshipBillingInterval,
} from '../../../../lib/mentorshipPricing';
import { resolveProveedoresHabilitados } from '../../../../constants/paymentProveedores';
import {
  ensureMentorshipCuerpoAutonomoDiscount,
  resolveCuerpoAutonomoDiscountFromPlan,
  type MentorshipCuerpoAutonomoDiscount,
} from '../../../../lib/ensureMentorshipCuerpoAutonomoDiscount';
import { userHasCuerpoAutonomo } from '../../../../lib/userHasCuerpoAutonomo';
import {
  CUERPO_AUTONOMO_DISCOUNT_CODE_ANUAL,
  CUERPO_AUTONOMO_DISCOUNT_CODE_SHORT,
  CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL,
  CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT,
} from '../../../../constants/mentorshipCuerpoAutonomoDiscount';

function plainPriceEntry(entry: unknown) {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as { interval?: string; toObject?: () => Record<string, unknown> };
  if (typeof record.toObject === 'function') return record.toObject();
  return { ...(entry as Record<string, unknown>) };
}

function resolveActivePlan(
  plans: any[],
  preferredInterval?: MentorshipBillingInterval | null,
) {
  if (!plans.length) return null;

  if (preferredInterval) {
    const match = plans.find((plan) =>
      (plan.prices || []).some(
        (price: unknown) => plainPriceEntry(price)?.interval === preferredInterval,
      ),
    );
    if (match) return match;
  }

  return plans[0];
}

function resolveOrigin(req: NextRequest) {
  return resolveMentorshipPaymentOrigin(req);
}

function hasActivePaymentLinks(
  opcionesPago: Array<{ paymentLink?: string; activo?: boolean }> | undefined,
) {
  return Boolean(
    opcionesPago?.some((o) => o.activo !== false && o.paymentLink?.trim()),
  );
}

const VALID_INTERVALS = new Set<MentorshipBillingInterval>([
  'mensual',
  'anual',
  'trimestral',
]);

async function resolveSessionUser() {
  try {
    const userToken = cookies().get('userToken')?.value;
    if (!userToken) return null;
    const decoded = verify(userToken, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };
    const id = decoded.userId || decoded._id;
    if (!id) return null;
    return User.findById(id).select('email rol cursosAdquiridos').lean();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const intervalParam = req.nextUrl.searchParams.get('interval');
    const preferredInterval =
      intervalParam && VALID_INTERVALS.has(intervalParam as MentorshipBillingInterval)
        ? (intervalParam as MentorshipBillingInterval)
        : null;

    const plans = await MentorshipPlan.find({ active: true }).sort({ createdAt: -1 });
    const plan = resolveActivePlan(plans, preferredInterval);

    if (!plan) {
      return NextResponse.json({ error: 'No hay planes activos' }, { status: 404 });
    }

    const planPrices = (plan.prices || [])
      .map((entry: unknown) => plainPriceEntry(entry))
      .filter(Boolean) as any[];

    const availableIntervals = resolveMentorshipToggleIntervals(planPrices);

    let interval: MentorshipBillingInterval | null = null;
    if (preferredInterval && availableIntervals.includes(preferredInterval)) {
      interval = preferredInterval;
    } else {
      interval = resolveMentorshipDefaultInterval(planPrices);
    }

    if (!interval || !availableIntervals.includes(interval)) {
      return NextResponse.json(
        { error: 'Intervalo de facturación no disponible' },
        { status: 400 },
      );
    }

    const priceEntry = planPrices.find((p) => p.interval === interval);

    if (!priceEntry) {
      return NextResponse.json(
        { error: 'Precio no encontrado para el intervalo seleccionado' },
        { status: 404 },
      );
    }

    let prices = planPrices;
    const origin = resolveOrigin(req);
    const needsLinks =
      planPrices.some((p) => !hasActivePaymentLinks(p.opcionesPago)) ||
      mentorshipPricesHaveStaleLinks(planPrices, origin);

    const proveedoresHabilitados = resolveProveedoresHabilitados(
      plan.proveedoresHabilitados?.length
        ? plan.proveedoresHabilitados
        : planPrices.some((p) =>
            (p.opcionesPago || []).some((o: { proveedor?: string }) => o.proveedor === 'mercadopago'),
          )
          ? ['stripe', 'mercadopago']
          : null,
    );

    prices = await ensureMentorshipPlanPaymentLinks(
      {
        _id: plan._id,
        name: plan.name,
        description: plan.description,
        level: plan.level,
        prices: planPrices,
        proveedoresHabilitados,
      },
      origin,
      { forceRegenerate: false },
    );

    // Asegurar cupones CA si el plan activo aún no los tiene
    let descuentoCuerpoAutonomo =
      plan.descuentoCuerpoAutonomo as MentorshipCuerpoAutonomoDiscount | undefined;
    const needsDiscountIds =
      !descuentoCuerpoAutonomo?.stripeCouponIdCorto ||
      !descuentoCuerpoAutonomo?.stripeCouponIdAnual;
    if (needsDiscountIds) {
      try {
        descuentoCuerpoAutonomo = await ensureMentorshipCuerpoAutonomoDiscount(
          descuentoCuerpoAutonomo,
        );
      } catch (e) {
        console.error('No se pudieron asegurar cupones CA:', e);
      }
    }

    const pricesChanged =
      needsLinks || JSON.stringify(prices) !== JSON.stringify(planPrices);
    const updatePayload: Record<string, unknown> = {};
    if (pricesChanged) updatePayload.prices = prices;
    if (descuentoCuerpoAutonomo && needsDiscountIds) {
      updatePayload.descuentoCuerpoAutonomo = descuentoCuerpoAutonomo;
    }
    if (!plan.proveedoresHabilitados?.length) {
      updatePayload.proveedoresHabilitados = proveedoresHabilitados;
    }
    if (Object.keys(updatePayload).length) {
      await MentorshipPlan.findByIdAndUpdate(plan._id, updatePayload);
    }

    const resolvedPrice = prices.find((p) => p.interval === interval);

    if (!resolvedPrice) {
      return NextResponse.json(
        { error: 'Precio no encontrado para el intervalo seleccionado' },
        { status: 404 },
      );
    }

    const sessionUser = await resolveSessionUser();
    const elegible = sessionUser
      ? await userHasCuerpoAutonomo(sessionUser as any)
      : false;
    const applied = resolveCuerpoAutonomoDiscountFromPlan(
      descuentoCuerpoAutonomo,
      interval,
    );

    return NextResponse.json({
      plan: {
        _id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
        features: plan.features,
        level: plan.level,
        active: plan.active,
        proveedoresHabilitados:
          plan.proveedoresHabilitados?.length > 0
            ? plan.proveedoresHabilitados
            : proveedoresHabilitados,
      },
      interval,
      availableIntervals,
      price: {
        interval: resolvedPrice.interval,
        price: resolvedPrice.price,
        currency: resolvedPrice.currency,
        stripePriceId: resolvedPrice.stripePriceId,
      },
      opcionesPago: (resolvedPrice.opcionesPago || []).filter((o: any) =>
        proveedoresHabilitados.includes(
          o.proveedor as 'stripe' | 'dlocalgo' | 'mercadopago',
        ),
      ),
      descuentoCuerpoAutonomo: {
        elegible,
        porcentajeCorto:
          descuentoCuerpoAutonomo?.porcentajeCorto ?? CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT,
        porcentajeAnual:
          descuentoCuerpoAutonomo?.porcentajeAnual ?? CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL,
        porcentajeAplicado: elegible && applied ? applied.percent : 0,
        codigo: applied?.code
          ?? (interval === 'anual'
            ? CUERPO_AUTONOMO_DISCOUNT_CODE_ANUAL
            : CUERPO_AUTONOMO_DISCOUNT_CODE_SHORT),
        activo: descuentoCuerpoAutonomo?.activo !== false,
      },
    });
  } catch (error) {
    console.error('Error en checkout de mentoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
