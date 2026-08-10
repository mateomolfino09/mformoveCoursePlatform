/**
 * 1) Actualiza cursoConfig.highlights para que coincida con los 3 módulos reales
 *    (Reconectar / Ordenar / Construir) en vez del viejo esquema de 4 pasos
 *    (Percibir / Ordenar / Construir / Practicar).
 * 2) Limpia los campos de pago de TEST/sandbox (paymentLink, stripePriceId,
 *    stripeProductId, mercadoPagoPreferenceId, mercadoPagoExternalReference)
 *    en cursoConfig.planes.opcionesPago, cursoConfig.preciosPreventa[].opcionesPago
 *    y el stripeProductId raíz — para que ensureCursoLanzamientoPaymentLinks los
 *    regenere con las claves LIVE la próxima vez que se guarde el producto desde
 *    el panel admin en producción (esta parte no llama a Stripe/MercadoPago,
 *    solo deja los campos vacíos).
 *
 * Uso:
 *   node scripts/updateHighlightsAndClearTestPayments.js            # dry-run
 *   node scripts/updateHighlightsAndClearTestPayments.js --confirm  # escribe en PRODUCCIÓN
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
const PRODUCT_ID = '6a74b5b24758cf3bdadb7526';

const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;
if (!PRODUCTION_URI) {
  console.error('❌ Falta MONGODB_URI_PRODUCTION en .env');
  process.exit(1);
}
if (PRODUCTION_URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({}, { strict: false, versionKey: '__v' });
const Product = mongoose.model('Product', ProductSchema);

async function main() {
  console.log(CONFIRM ? '🚀 Modo ejecución (--confirm): va a escribir en PRODUCCIÓN.' : '🧪 Dry-run: no se escribe nada. Pasá --confirm para ejecutar.');
  console.log('Conectando a producción...');
  await mongoose.connect(PRODUCTION_URI);
  console.log('✅ Conectado a', mongoose.connection.name);

  const product = await Product.findById(PRODUCT_ID);
  if (!product) {
    console.error('❌ No se encontró el producto', PRODUCT_ID);
    process.exit(1);
  }

  const cc = product.cursoConfig;

  // 1) Highlights acorde a los 3 módulos reales
  const items = cc.highlights.items.filter((i) => i.titulo !== 'Practicar');
  const percibir = items.find((i) => i.titulo === 'Percibir');
  if (percibir) percibir.titulo = 'Reconectar';
  cc.highlights.items = items;
  cc.highlights.puente =
    'Cuerpo Autónomo está organizado en tres módulos que construyen una nueva relación con tu cuerpo, paso a paso.';

  // 2) Limpiar campos de pago de test
  for (const opcion of cc.planes?.opcionesPago || []) {
    opcion.paymentLink = '';
    opcion.stripePriceId = undefined;
    opcion.stripeProductId = undefined;
    opcion.mercadoPagoPreferenceId = undefined;
    opcion.mercadoPagoExternalReference = undefined;
  }
  for (const preventa of cc.preciosPreventa || []) {
    for (const opcion of preventa.opcionesPago || []) {
      opcion.paymentLink = '';
      opcion.stripePriceId = undefined;
      opcion.stripeProductId = undefined;
      opcion.mercadoPagoPreferenceId = undefined;
      opcion.mercadoPagoExternalReference = undefined;
    }
  }
  product.stripeProductId = undefined;

  if (!CONFIRM) {
    console.log('\n--- Resumen (dry-run) ---');
    console.log('Highlights items:', cc.highlights.items.map((i) => i.titulo).join(', '));
    console.log('Puente:', cc.highlights.puente);
    console.log('opcionesPago (planes) tras limpiar:', JSON.stringify(cc.planes.opcionesPago.map((o) => ({
      proveedor: o.proveedor, paymentLink: o.paymentLink, stripePriceId: o.stripePriceId, mercadoPagoPreferenceId: o.mercadoPagoPreferenceId,
    })), null, 2));
    console.log('\nNada escrito. Corré con --confirm cuando estés listo.');
    await mongoose.disconnect();
    return;
  }

  product.markModified('cursoConfig');
  await product.save();
  console.log('✅ Highlights actualizados y campos de pago de test limpiados.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
