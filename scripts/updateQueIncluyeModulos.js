/**
 * Reemplaza cursoConfig.queIncluye.modulos (sección "El recorrido" de la landing)
 * por los 3 módulos reales (Reconectar / Ordenar / Construir), en vez de los 5
 * módulos viejos (Regulación / Arquitectura corporal / Capacidades / Expresión /
 * Rehabilitación) que no corresponden a la estructura real del curso.
 *
 * "El recorrido" y "{n} módulos que se complementan entre sí" son texto
 * hardcodeado en CourseWhatWeTeach.tsx — el número se calcula solo del length
 * de este array, no hace falta tocarlo aparte.
 *
 * Uso:
 *   node scripts/updateQueIncluyeModulos.js            # dry-run
 *   node scripts/updateQueIncluyeModulos.js --confirm  # escribe en PRODUCCIÓN
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

const MODULOS = [
  {
    titulo: 'Reconectar',
    descripcion: 'Percepción, respiración y atención antes de moverte con propósito.',
    imagenPublicId: 'DSC01884_grva4a',
  },
  {
    titulo: 'Ordenar',
    descripcion: 'Hábitos, postura y descanso que sostienen el cambio en el día a día.',
    imagenPublicId: 'my_uploads/fondos/DSC01472_mvzgw7',
  },
  {
    titulo: 'Construir',
    descripcion: 'Fuerza, movilidad y coordinación integradas en capacidades reales.',
    imagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
  },
];

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

  if (!CONFIRM) {
    console.log('\n--- Resumen (dry-run) ---');
    console.log('queIncluye.modulos actual:', product.cursoConfig.queIncluye.modulos.map((m) => m.titulo));
    console.log('queIncluye.modulos nuevo:', MODULOS.map((m) => m.titulo));
    console.log('\nNada escrito. Corré con --confirm cuando estés listo.');
    await mongoose.disconnect();
    return;
  }

  product.cursoConfig.queIncluye.modulos = MODULOS;
  product.markModified('cursoConfig');
  await product.save();

  console.log('✅ queIncluye.modulos actualizado:', MODULOS.map((m) => m.titulo).join(', '));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
