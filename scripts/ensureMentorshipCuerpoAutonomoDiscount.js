/**
 * Backfill: asegura cupones Stripe + campo descuentoCuerpoAutonomo en planes de mentoría.
 * Uso: node scripts/ensureMentorshipCuerpoAutonomoDiscount.js
 * Requiere: MONGODB_URI, STRIPE_SECRET_KEY
 */

async function loadEnv() {
  try {
    const dotenv = await import('dotenv');
    const fs = await import('fs');
    const path = await import('path');
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
    else if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
  } catch {
    // env del sistema
  }
}

async function ensureDiscount(stripe, existing) {
  const SHORT = 15;
  const ANUAL = 25;
  const CODE_SHORT = 'CUERPOAUTONOMO';
  const CODE_ANUAL = 'CUERPOAUTONOMO25';

  async function findOrCreateCoupon(percent, name, existingId) {
    if (existingId) return existingId;
    const list = await stripe.coupons.list({ limit: 100 });
    const found = list.data.find(
      (c) => c.valid && c.percent_off === percent && c.duration === 'forever' && c.name === name,
    );
    if (found) return found.id;
    const created = await stripe.coupons.create({
      percent_off: percent,
      duration: 'forever',
      name,
    });
    return created.id;
  }

  async function findOrCreatePromo(code, couponId, existingId) {
    if (existingId) return existingId;
    const list = await stripe.promotionCodes.list({ code, limit: 1 });
    if (list.data[0]) return list.data[0].id;
    try {
      const created = await stripe.promotionCodes.create({
        code,
        coupon: couponId,
        active: true,
      });
      return created.id;
    } catch {
      const retry = await stripe.promotionCodes.list({ code, limit: 1 });
      if (retry.data[0]) return retry.data[0].id;
      throw new Error(`No se pudo crear promotion code ${code}`);
    }
  }

  const stripeCouponIdCorto = await findOrCreateCoupon(
    SHORT,
    `Mentoría · Cuerpo Autónomo ${SHORT}%`,
    existing?.stripeCouponIdCorto,
  );
  const stripeCouponIdAnual = await findOrCreateCoupon(
    ANUAL,
    `Mentoría · Cuerpo Autónomo anual ${ANUAL}%`,
    existing?.stripeCouponIdAnual,
  );
  const stripePromotionCodeIdCorto = await findOrCreatePromo(
    CODE_SHORT,
    stripeCouponIdCorto,
    existing?.stripePromotionCodeIdCorto,
  );
  const stripePromotionCodeIdAnual = await findOrCreatePromo(
    CODE_ANUAL,
    stripeCouponIdAnual,
    existing?.stripePromotionCodeIdAnual,
  );

  return {
    activo: existing?.activo !== false,
    porcentajeCorto: SHORT,
    porcentajeAnual: ANUAL,
    codigoCorto: CODE_SHORT,
    codigoAnual: CODE_ANUAL,
    stripeCouponIdCorto,
    stripePromotionCodeIdCorto,
    stripeCouponIdAnual,
    stripePromotionCodeIdAnual,
  };
}

async function main() {
  await loadEnv();

  const mongoose = (await import('mongoose')).default;
  const Stripe = (await import('stripe')).default;

  if (!process.env.MONGODB_URI) {
    console.error('Falta MONGODB_URI');
    process.exit(1);
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Falta STRIPE_SECRET_KEY');
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  const MentorshipPlan = (await import('../src/models/mentorshipPlanModel.js')).default;
  const plans = await MentorshipPlan.find({});
  console.log(`Planes encontrados: ${plans.length}`);

  for (const plan of plans) {
    try {
      const discount = await ensureDiscount(stripe, plan.descuentoCuerpoAutonomo || null);
      plan.descuentoCuerpoAutonomo = discount;
      await plan.save();
      console.log(`OK ${plan.name} · ${discount.codigoCorto} / ${discount.codigoAnual}`);
    } catch (err) {
      console.error(`FAIL ${plan.name}:`, err.message || err);
    }
  }

  await mongoose.disconnect();
  console.log('Listo');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
