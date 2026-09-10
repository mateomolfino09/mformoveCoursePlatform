/**
 * Actualiza el copy de los CTAs de Cuerpo Autónomo (slug cuerpo-autonomo) para
 * que coincidan con el funnel de venta por llamada: "Agendar una llamada".
 *
 * El código ya fuerza ese texto cuando ventaPorLlamada=true, pero el código
 * viejo (y algunos fallbacks) leen hero.ctaTexto / highlights.ctaBoton de la DB.
 *
 * Uso:
 *   node scripts/setCuerpoAutonomoCtaLlamada.js                    # dry-run dev
 *   node scripts/setCuerpoAutonomoCtaLlamada.js --confirm      # escribe en dev
 *   node scripts/setCuerpoAutonomoCtaLlamada.js --env=prod     # dry-run prod
 *   node scripts/setCuerpoAutonomoCtaLlamada.js --env=prod --confirm
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

const CTA = 'Agendar una llamada';

const SET = {
  'cursoConfig.hero.ctaTexto': CTA,
  'cursoConfig.highlights.ctaBoton': CTA,
  'cursoConfig.navegacion.ctaBarraMovil': 'Agendar llamada',
  'cursoConfig.ctaFinal.boton': CTA,
};

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
  console.log(`hero.ctaTexto: "${doc.cursoConfig?.hero?.ctaTexto || ''}" -> "${CTA}"`);
  console.log(
    `highlights.ctaBoton: "${doc.cursoConfig?.highlights?.ctaBoton || ''}" -> "${CTA}"`
  );
  console.log(
    `navegacion.ctaBarraMovil: "${doc.cursoConfig?.navegacion?.ctaBarraMovil || ''}" -> "Agendar llamada"`
  );
  console.log(`ctaFinal.boton: "${doc.cursoConfig?.ctaFinal?.boton || ''}" -> "${CTA}"`);

  if (!CONFIRM) {
    console.log('\nDry-run. Pasá --confirm para escribir.');
    await conn.close();
    return;
  }

  await conn.db.collection('products').updateOne({ _id: doc._id }, { $set: SET });
  console.log('✅ Actualizado.');
  await conn.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
