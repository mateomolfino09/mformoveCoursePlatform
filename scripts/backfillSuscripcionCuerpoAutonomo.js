/**
 * Backfill previo a removeUserSubscriptionField.js: a cada usuario con subscription.active===true
 * (el viejo campo global de Stripe) le crea/actualiza la entrada correspondiente en
 * cursosAdquiridos para el producto Cuerpo Autónomo, con source:'suscripcion'. Consulta Stripe en
 * vivo por cada uno para obtener el status real y current_period_end (el viejo user.subscription
 * nunca guardó ese dato).
 *
 * Uso:
 *   node scripts/backfillSuscripcionCuerpoAutonomo.js                   # dry-run contra dev
 *   node scripts/backfillSuscripcionCuerpoAutonomo.js --confirm         # escribe en dev
 *   node scripts/backfillSuscripcionCuerpoAutonomo.js --env=prod        # dry-run contra producción
 *   node scripts/backfillSuscripcionCuerpoAutonomo.js --env=prod --confirm  # escribe en producción
 *
 * Requiere en .env: MONGODB_URI (dev) / MONGODB_URI_PRODUCTION (prod), y STRIPE_SECRET_KEY.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Stripe = require('stripe');

const CONFIRM = process.argv.includes('--confirm');
const IS_PROD = process.argv.includes('--env=prod');

const URI = IS_PROD ? process.env.MONGODB_URI_PRODUCTION : process.env.MONGODB_URI;
if (!URI) {
  console.error(`❌ Falta ${IS_PROD ? 'MONGODB_URI_PRODUCTION' : 'MONGODB_URI'} en .env`);
  process.exit(1);
}
if (IS_PROD && URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Falta STRIPE_SECRET_KEY en .env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');
const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema, 'products');

async function main() {
  await mongoose.connect(URI);
  const target = IS_PROD ? 'PRODUCCIÓN' : 'DEV';

  const cuerpoAutonomo = await Product.findOne({
    'cursoConfig.slug': { $regex: /cuerpo.?autonomo/i },
  })
    .select('_id nombre')
    .lean();

  if (!cuerpoAutonomo) {
    console.error(`❌ [${target}] No se encontró el producto Cuerpo Autónomo. Abortando.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`[${target}] Producto Cuerpo Autónomo: ${cuerpoAutonomo.nombre} (${cuerpoAutonomo._id})`);

  const users = await User.find({ 'subscription.active': true });
  console.log(`[${target}] Usuarios con subscription.active=true: ${users.length}`);

  let granted = 0;
  let alreadyHadEntry = 0;
  let stripeErrors = 0;

  for (const user of users) {
    const stripeSubscriptionId = user.subscription?.id;
    if (!stripeSubscriptionId) {
      console.warn(`  - ${user.email}: sin subscription.id, se salta.`);
      continue;
    }

    let statusReal = 'active';
    let expiresAt = null;
    try {
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      statusReal = ['active', 'trialing'].includes(sub.status) ? 'active' : 'expired';
      expiresAt = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
    } catch (err) {
      stripeErrors++;
      console.warn(`  - ${user.email}: error consultando Stripe (${stripeSubscriptionId}): ${err.message}`);
      continue;
    }

    const cursosAdquiridos = user.cursosAdquiridos || [];
    const existing = cursosAdquiridos.find(
      (e) => String(e.productoId) === String(cuerpoAutonomo._id) && e.source === 'suscripcion'
    );

    if (existing) {
      alreadyHadEntry++;
      console.log(`  - ${user.email}: ya tenía entrada de suscripción, actualizando vigencia.`);
      if (CONFIRM) {
        existing.status = statusReal;
        existing.expiresAt = expiresAt;
        existing.stripeSubscriptionId = stripeSubscriptionId;
      }
    } else {
      granted++;
      console.log(`  - ${user.email}: creando acceso (status=${statusReal}, expiresAt=${expiresAt?.toISOString() || 'null'}).`);
      if (CONFIRM) {
        user.cursosAdquiridos = cursosAdquiridos;
        user.cursosAdquiridos.push({
          productoId: cuerpoAutonomo._id,
          fechaCompra: new Date(),
          metodoPago: 'stripe',
          transaccionId: stripeSubscriptionId,
          moneda: 'USD',
          bienvenidaPendiente: false,
          source: 'suscripcion',
          status: statusReal,
          expiresAt,
          stripeSubscriptionId,
        });
      }
    }

    if (CONFIRM) {
      await user.save();
    }
  }

  console.log(`\n[${target}] Resumen: ${granted} accesos nuevos, ${alreadyHadEntry} entradas actualizadas, ${stripeErrors} errores de Stripe.`);
  if (!CONFIRM) {
    console.log('Dry-run (no se escribió nada). Volvé a correr con --confirm para aplicar.');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error corriendo el backfill:', err);
  process.exit(1);
});
