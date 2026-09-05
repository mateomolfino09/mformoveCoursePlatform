/**
 * Elimina el campo `subscription` (el viejo "membership" global de Stripe, ya no existe en el
 * schema de userModel.js) de todos los documentos de User. No se usan membresías hoy en día, así
 * que este script solo limpia datos huérfanos — no migra nada a cursosAdquiridos.
 *
 * Uso:
 *   node scripts/removeUserSubscriptionField.js                    # dry-run contra dev (MONGODB_URI)
 *   node scripts/removeUserSubscriptionField.js --confirm          # escribe en dev
 *   node scripts/removeUserSubscriptionField.js --env=prod         # dry-run contra producción
 *   node scripts/removeUserSubscriptionField.js --env=prod --confirm  # escribe en producción
 *
 * Requiere en .env: MONGODB_URI (dev) y, para --env=prod, MONGODB_URI_PRODUCTION.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
const IS_PROD = process.argv.includes('--env=prod');

const URI = IS_PROD ? process.env.MONGODB_URI_PRODUCTION : process.env.MONGODB_URI;
if (!URI) {
  console.error(`❌ Falta ${IS_PROD ? 'MONGODB_URI_PRODUCTION' : 'MONGODB_URI'} en .env`);
  process.exit(1);
}

// Guardarraíl: --env=prod nunca debe apuntar por error al cluster de dev, y viceversa.
if (IS_PROD && URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

async function main() {
  await mongoose.connect(URI);

  const target = IS_PROD ? 'PRODUCCIÓN' : 'DEV';
  const withSubscription = await User.countDocuments({ subscription: { $exists: true } });
  const active = await User.countDocuments({ 'subscription.active': true });

  console.log(`[${target}] Usuarios con campo subscription: ${withSubscription}`);
  console.log(`[${target}] De esos, con subscription.active === true: ${active}`);

  if (!CONFIRM) {
    console.log('Dry-run (no se escribió nada). Volvé a correr con --confirm para aplicar el $unset.');
    await mongoose.disconnect();
    return;
  }

  const result = await User.updateMany(
    { subscription: { $exists: true } },
    { $unset: { subscription: '' } }
  );

  console.log(`[${target}] Campo subscription eliminado de ${result.modifiedCount} usuarios.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error corriendo la migración:', err);
  process.exit(1);
});
