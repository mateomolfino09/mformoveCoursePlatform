import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
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

function plainPriceEntry(entry: unknown) {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as { interval?: string; toObject?: () => Record<string, unknown> };
  if (typeof record.toObject === 'function') return record.toObject();
  return { ...(entry as Record<string, unknown>) };
}

function resolveActivePlan(
  plans: Array<{ prices?: unknown[]; createdAt?: Date }>,
  preferredInterval?: MentorshipBillingInterval | null,
) {
  if (!plans.length) return null;

  if (preferredInterval) {
    const match = plans.find((plan) =>
      (plan.prices || []).some(
        (price) => plainPriceEntry(price)?.interval === preferredInterval,
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
      .map((entry) => plainPriceEntry(entry))
      .filter(Boolean) as Array<{
      interval: string;
      price: number;
      currency: string;
      stripePriceId: string;
      opcionesPago?: Array<{ paymentLink?: string; activo?: boolean }>;
    }>;

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

    // Siempre corre ensure: genera faltantes y elimina proveedores deshabilitados.
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

    const pricesChanged =
      needsLinks || JSON.stringify(prices) !== JSON.stringify(planPrices);
    if (pricesChanged) {
      await MentorshipPlan.findByIdAndUpdate(plan._id, {
        prices,
        ...(plan.proveedoresHabilitados?.length
          ? {}
          : { proveedoresHabilitados }),
      });
    }

    const resolvedPrice = prices.find((p) => p.interval === interval);

    if (!resolvedPrice) {
      return NextResponse.json(
        { error: 'Precio no encontrado para el intervalo seleccionado' },
        { status: 404 },
      );
    }

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
      opcionesPago: (resolvedPrice.opcionesPago || []).filter((o: { proveedor?: string }) =>
        proveedoresHabilitados.includes(
          o.proveedor as 'stripe' | 'dlocalgo' | 'mercadopago',
        ),
      ),
    });
  } catch (error) {
    console.error('Error en checkout de mentoría:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
