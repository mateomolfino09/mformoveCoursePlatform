/**
 * Otorga acceso a "Cuerpo Autónomo" en PRODUCCIÓN a un usuario ya registrado que pagó
 * por fuera de la plataforma (transferencia), en el marco del nuevo funnel de venta por
 * llamada (ver scripts/setCuerpoAutonomoVentaPorLlamada.js).
 *
 * Agrega una entrada a cursosAdquiridos con source: 'suscripcion' y expiresAt a 4 meses
 * (oferta 4 meses), para que el acceso se corte solo cuando venza — igual que si viniera
 * de un webhook de Stripe, pero sin transacción real.
 *
 * Uso:
 *   node scripts/grantCuerpoAutonomoAccessProduction.js <email>              # dry-run
 *   node scripts/grantCuerpoAutonomoAccessProduction.js <email> --confirm    # escribe en PRODUCCIÓN
 *
 * Requiere en .env: MONGODB_URI_PRODUCTION
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
const email = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2].trim().toLowerCase() : null;

const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;
if (!PRODUCTION_URI) {
  console.error('❌ Falta MONGODB_URI_PRODUCTION en .env');
  process.exit(1);
}
if (PRODUCTION_URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}
if (!email) {
  console.error('❌ Falta el email. Uso: node scripts/grantCuerpoAutonomoAccessProduction.js <email> [--confirm]');
  process.exit(1);
}

const CUERPO_AUTONOMO_SLUG = 'cuerpo-autonomo';
const MONTO = 147;
const MONEDA = 'USD';
const METODO_PAGO = 'transferencia';
const MESES_VIGENCIA = 4;

// Esquemas laxos: alcanza con resolver el nombre de colección correcto y persistir tal cual.
const ProductSchema = new mongoose.Schema({}, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema);
const User = mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(PRODUCTION_URI);
  console.log(`🔗 Conectado a PRODUCCIÓN (${mongoose.connection.name})`);

  const product = await Product.findOne({ 'cursoConfig.slug': CUERPO_AUTONOMO_SLUG }).select('_id nombre');
  if (!product) {
    console.error('❌ No existe en producción el producto de curso "cuerpo-autonomo"');
    process.exit(1);
  }

  const user = await User.findOne({ email }).select('_id email name cursosAdquiridos');
  if (!user) {
    console.error(`❌ No existe ningún usuario en producción con email ${email}`);
    process.exit(1);
  }

  const productId = product._id.toString();
  const alreadyHasAccess = (user.cursosAdquiridos || []).some(
    (entry) => entry?.productoId?.toString() === productId
  );
  if (alreadyHasAccess) {
    console.log(`ℹ️  ${email} ya tiene una entrada de acceso a Cuerpo Autónomo (${productId}). No se modifica nada.`);
    await mongoose.disconnect();
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + MESES_VIGENCIA);

  const entry = {
    productoId: product._id,
    fechaCompra: now,
    metodoPago: METODO_PAGO,
    transaccionId: `manual-transferencia:${now.getTime()}`,
    monto: MONTO,
    moneda: MONEDA,
    bienvenidaPendiente: true,
    source: 'suscripcion',
    status: 'active',
    expiresAt,
  };

  console.log('\n📋 Entrada a agregar en cursosAdquiridos:');
  console.log(JSON.stringify({ ...entry, productoId: productId }, null, 2));
  console.log(`\nUsuario: ${user.email} (${user._id})`);
  console.log(`Producto: ${product.nombre || CUERPO_AUTONOMO_SLUG} (${productId})`);
  console.log(`Vence: ${expiresAt.toISOString().slice(0, 10)}`);

  if (!CONFIRM) {
    console.log('\n🧪 Dry-run — no se escribió nada. Correr con --confirm para aplicar en PRODUCCIÓN.');
    await mongoose.disconnect();
    return;
  }

  await User.updateOne({ _id: user._id }, { $push: { cursosAdquiridos: entry } });
  console.log('\n✅ Acceso otorgado en PRODUCCIÓN.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
