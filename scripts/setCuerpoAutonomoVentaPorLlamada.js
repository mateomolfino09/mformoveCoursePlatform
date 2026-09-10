/**
 * Activa cursoConfig.planes.ventaPorLlamada en Cuerpo Autónomo (slug cuerpo-autonomo):
 * oculta los montos en la sección de planes y el CTA final pasa a ser "Agendar una
 * llamada" en vez de checkout directo. También setea un texto de urgencia opcional
 * sobre el selector de planes (cohorteUrgenciaTexto).
 *
 * Ver `.claude/specs/cuerpo-autonomo-vs-madamove-comparativa.md` — decisiones 1 y 4.
 * Escribe por driver nativo de Mongo (no `Product.save()`/`updateOne` de Mongoose) por el
 * mismo motivo documentado en `regenerateSuscripcionPaymentLinks/route.ts`: escrituras
 * anidadas dentro de `cursoConfig` vía Mongoose pueden no persistir de forma confiable.
 *
 * Uso:
 *   node scripts/setCuerpoAutonomoVentaPorLlamada.js                    # dry-run dev
 *   node scripts/setCuerpoAutonomoVentaPorLlamada.js --confirm          # escribe en dev
 *   node scripts/setCuerpoAutonomoVentaPorLlamada.js --env=prod         # dry-run prod
 *   node scripts/setCuerpoAutonomoVentaPorLlamada.js --env=prod --confirm
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
if (IS_PROD && URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}

const COHORTE_URGENCIA_TEXTO =
  'El próximo ciclo de llamadas grupales y clase mensual está por arrancar.';

async function main() {
  const conn = await mongoose.createConnection(URI).asPromise();
  const target = IS_PROD ? 'PRODUCCIÓN' : 'DEV';
  console.log(`${CONFIRM ? '🚀' : '🧪'} ${target} (${conn.name})`);

  const ProductSchema = new mongoose.Schema({}, { strict: false });
  const Product = conn.model('Product', ProductSchema, 'products');

  const doc = await Product.findOne({ 'cursoConfig.slug': 'cuerpo-autonomo' }).lean();
  if (!doc) {
    throw new Error('No se encontró el producto con cursoConfig.slug=cuerpo-autonomo');
  }

  console.log(`Producto: ${doc.nombre} (${doc._id})`);
  console.log(
    `ventaPorLlamada: ${doc.cursoConfig?.planes?.ventaPorLlamada ?? false} -> true`
  );
  console.log(
    `cohorteUrgenciaTexto: "${doc.cursoConfig?.planes?.cohorteUrgenciaTexto || ''}" -> "${COHORTE_URGENCIA_TEXTO}"`
  );

  if (!CONFIRM) {
    console.log('\nDry-run. Pasá --confirm para escribir.');
    await conn.close();
    return;
  }

  await conn.db.collection('products').updateOne(
    { _id: doc._id },
    {
      $set: {
        'cursoConfig.planes.ventaPorLlamada': true,
        'cursoConfig.planes.cohorteUrgenciaTexto': COHORTE_URGENCIA_TEXTO,
      },
    }
  );
  console.log('✅ Actualizado.');
  await conn.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
