/**
 * Copia todas las IndividualClass a recursosAdicionales del curso Cuerpo Autónomo.
 * SOLO base de test (MONGODB_URI con clustertest). No toca producción.
 *
 * Idempotente: reemplaza los recursos cuyo recursoId empieza con "individual-class-"
 * y conserva los que se hayan cargado a mano.
 *
 * Uso:
 *   node scripts/injectIndividualClassesAsCursoRecursosTest.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const TEST_URI = process.env.MONGODB_URI;
const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;
const SLUG = 'cuerpo-autonomo';

function assertTestDatabase() {
  if (!TEST_URI) {
    console.error('Falta MONGODB_URI');
    process.exit(1);
  }
  if (PRODUCTION_URI && TEST_URI === PRODUCTION_URI) {
    console.error('MONGODB_URI coincide con MONGODB_URI_PRODUCTION. Abortando.');
    process.exit(1);
  }
  if (!/clustertest/i.test(TEST_URI)) {
    console.error('MONGODB_URI no apunta al cluster de test (clustertest). Abortando.');
    process.exit(1);
  }
  if (PRODUCTION_URI && /clustertest/i.test(PRODUCTION_URI)) {
    console.error('MONGODB_URI_PRODUCTION parece de test. Configuración ambigua. Abortando.');
    process.exit(1);
  }
}

function vimeoIdFrom(link) {
  const value = String(link || '').trim();
  if (!value) return '';
  const match = value.match(/vimeo\.com\/(?:video\/)?(\d+)/) || value.match(/^(\d+)$/);
  return match?.[1] || '';
}

function durationSeconds(clase) {
  const hours = Number(clase.hours) || 0;
  const minutes = Number(clase.minutes) || 0;
  const seconds = Number(clase.seconds) || 0;
  const fromParts = hours * 3600 + minutes * 60 + seconds;
  if (fromParts > 0) return fromParts;
  const total = Number(clase.totalTime) || 0;
  if (total <= 0) return 0;
  return total > 180 ? total : total * 60;
}

function toRecurso(clase, orden) {
  const numericId = clase.id;
  return {
    recursoId: `individual-class-${numericId}`,
    tipo: 'clase',
    titulo: String(clase.name || '').trim(),
    descripcion: String(clase.description || '').trim(),
    videoUrl: String(clase.link || '').trim(),
    videoId: vimeoIdFrom(clase.link),
    videoThumbnail: String(clase.image_base_link || clase.image_url || '').trim(),
    duration: durationSeconds(clase),
    archivoUrl: '',
    archivoNombre: '',
    archivoPublicId: '',
    archivoResourceType: '',
    orden,
  };
}

async function main() {
  assertTestDatabase();
  await mongoose.connect(TEST_URI);

  const products = mongoose.connection.collection('products');
  const classes = mongoose.connection.collection('individualclasses');

  const product = await products.findOne({
    tipo: 'curso',
    'cursoConfig.slug': SLUG,
  });

  if (!product) {
    console.error(`No hay producto tipo curso con slug ${SLUG} en test.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const individualClasses = await classes.find({}).sort({ id: 1 }).toArray();
  const injected = individualClasses.map((clase, index) => toRecurso(clase, index));
  const manual = (product.cursoConfig?.recursosAdicionales || []).filter(
    (item) => !String(item?.recursoId || '').startsWith('individual-class-')
  );
  const recursosAdicionales = [...injected, ...manual].map((item, index) => ({
    ...item,
    orden: index,
  }));

  await products.updateOne(
    { _id: product._id },
    { $set: { 'cursoConfig.recursosAdicionales': recursosAdicionales } }
  );

  console.log(
    `Test / ${SLUG}: ${injected.length} clases individuales inyectadas, ${manual.length} recursos manuales conservados.`
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
