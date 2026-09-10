/**
 * Setea cursoConfig.fundador (sección de autoridad, estilo "El Fundador") y
 * cursoConfig.highlights.items[].duracion (roadmap de 16 semanas) para Cuerpo Autónomo
 * (slug cuerpo-autonomo).
 *
 * El curso hoy tiene 3 etapas cargadas en highlights.items (no 4) — se reparten las 16
 * semanas en 3 tramos (5/6/5) en vez de 4 tramos de 4, para que coincida con la estructura
 * real (ver "Los 3 módulos principales" en cursoConfig.planes.beneficios).
 *
 * Uso:
 *   node scripts/setCuerpoAutonomoFundadorYRoadmap.js                    # dry-run dev
 *   node scripts/setCuerpoAutonomoFundadorYRoadmap.js --confirm          # escribe en dev
 *   node scripts/setCuerpoAutonomoFundadorYRoadmap.js --env=prod         # dry-run prod
 *   node scripts/setCuerpoAutonomoFundadorYRoadmap.js --env=prod --confirm
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

const FUNDADOR = {
  eyebrow: 'El fundador',
  titulo: 'Mateo Molfino',
  bio:
    'Mateo lleva +5 años trabajando en movimiento, entrenamiento y rehabilitación. Ya acompañó a +100 estudiantes en +5 países, y creó Cuerpo Autónomo para condensar ese método en un solo lugar.',
  imagenPublicId: 'my_uploads/equipo/Sin_titulo_1080_x_1080_px_uylhwc',
  stats: { anios: '+5', estudiantes: '+100', paises: '+5' },
};

/** Reparto de las 16 semanas en las 3 etapas reales (5+6+5), por índice en highlights.items. */
const DURACIONES = ['Semanas 1-5', 'Semanas 6-11', 'Semanas 12-16'];

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

  const items = doc.cursoConfig?.highlights?.items || [];
  console.log(`Producto: ${doc.nombre} (${doc._id})`);
  console.log(`highlights.items: ${items.length} etapa(s)`);
  items.forEach((it, i) => {
    console.log(`  [${i}] ${it.titulo} — duracion: "${it.duracion || ''}" -> "${DURACIONES[i] || ''}"`);
  });
  console.log(
    'fundador actual:',
    doc.cursoConfig?.fundador ? JSON.stringify(doc.cursoConfig.fundador.stats) : 'vacío',
    '-> stats +5/+100/+5, foto my_uploads/equipo/Sin_titulo_1080_x_1080_px_uylhwc'
  );

  if (!CONFIRM) {
    console.log('\nDry-run. Pasá --confirm para escribir.');
    await conn.close();
    return;
  }

  const nextItems = items.map((it, i) => ({ ...it, duracion: DURACIONES[i] || it.duracion || '' }));

  await conn.db.collection('products').updateOne(
    { _id: doc._id },
    {
      $set: {
        'cursoConfig.fundador': FUNDADOR,
        'cursoConfig.highlights.items': nextItems,
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
