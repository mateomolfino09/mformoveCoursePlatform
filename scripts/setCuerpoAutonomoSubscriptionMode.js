/**
 * Convierte el producto "Cuerpo Autónomo" YA PUBLICADO en producción a modo suscripción,
 * sincronizando el copy de landing (hero/highlights/queIncluye/outcomes/faq/beneficios de
 * planes) desde dev, sin tocar los campos donde producción tiene el dato bueno y dev tiene
 * placeholder de prueba (descripcion del producto, sellosValidacion, imagenCheckoutPublicId).
 *
 * Qué hace:
 *  - esSuscripcion: true
 *  - precio: 49 (mismo monto mensual base que usa dev; el admin, al guardar en el dashboard,
 *    dispara ensureCursoSuscripcionPaymentLinks y genera los 2 Payment Links reales de Stripe
 *    en modo LIVE: mensual $49 y cada 4 meses $147 = 3x mensual)
 *  - Marca inactivos (activo:false) los opcionesPago viejos de pago único ($166 Stripe +
 *    MercadoPago) para que el checkout no quede ofreciendo un plan viejo/inconsistente
 *    mientras se regeneran los links reales. El front ya tiene fallback para este caso
 *    (cursoConfig.planes.mensajeSinPlanes).
 *  - Sincroniza SOLO copy de landing desde dev (lista explícita abajo) — no toca
 *    opcionesPago/preciosPreventa (tienen IDs de Stripe test) ni publicado/fechaPublicacion
 *    (ya está publicado, no se toca) ni descripcion/sellosValidacion/imagenCheckoutPublicId
 *    (dev tiene placeholder de prueba en esos campos, producción tiene el dato real).
 *
 * Uso:
 *   node scripts/setCuerpoAutonomoSubscriptionMode.js            # dry-run (no escribe nada)
 *   node scripts/setCuerpoAutonomoSubscriptionMode.js --confirm  # escribe en PRODUCCIÓN
 *
 * Requiere en .env: MONGODB_URI (dev, solo lectura) y MONGODB_URI_PRODUCTION (escritura).
 *
 * Pendiente después de correr con --confirm: entrar al dashboard admin en producción,
 * editar el curso y Guardar — eso genera los 2 Payment Links de Stripe LIVE reales.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');

const DEV_URI = process.env.MONGODB_URI;
const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;

if (!DEV_URI) {
  console.error('❌ Falta MONGODB_URI en .env');
  process.exit(1);
}
if (!PRODUCTION_URI) {
  console.error('❌ Falta MONGODB_URI_PRODUCTION en .env');
  process.exit(1);
}
if (PRODUCTION_URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}

const EXPECTED_PROD_ID = '6a74b5b24758cf3bdadb7526';
const PRECIO_MENSUAL = 49;

// Campos de cursoConfig a sincronizar tal cual desde dev (solo copy de landing).
const CURSO_CONFIG_PATHS_FROM_DEV = [
  'hero.tagline',
  'hero.ctaSubcopy',
  'betweenHero.titulo',
  'betweenHero.parrafos',
  'bannerAncho.cuerpo',
  'introHighlights.titulo',
  'introHighlights.cuerpo',
  'introHighlights.imagenAlt',
  'outcomes.imagenAlt',
  'outcomes.titulo',
  'outcomes.items',
  'highlights.puente',
  'highlights.items',
  'highlights.ctaTitulo',
  'highlights.ctaDescripcion',
  'queIncluye.titulo',
  'queIncluye.offerBlocks',
  'planes.titulo',
  'planes.parrafosValor',
  'planes.beneficiosTitulo',
  'planes.beneficios',
  'whatsapp.imagenAlt',
  'faq.items',
];

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

const ProductSchema = new mongoose.Schema({}, { strict: false });

async function main() {
  console.log(
    CONFIRM
      ? '🚀 Modo ejecución (--confirm): va a escribir en PRODUCCIÓN.'
      : '🧪 Dry-run: no se escribe nada. Pasá --confirm para ejecutar.'
  );

  const devConn = await mongoose.createConnection(DEV_URI).asPromise();
  const prodConn = await mongoose.createConnection(PRODUCTION_URI).asPromise();
  console.log('✅ Conectado a dev (' + devConn.name + ') y producción (' + prodConn.name + ')');

  const DevProduct = devConn.model('Product', ProductSchema, 'products');
  const ProdProduct = prodConn.model('Product', ProductSchema, 'products');

  const devDoc = await DevProduct.findOne({ 'cursoConfig.slug': 'cuerpo-autonomo' }).lean();
  const prodDoc = await ProdProduct.findOne({ _id: new mongoose.Types.ObjectId(EXPECTED_PROD_ID) }).lean();

  if (!devDoc) throw new Error('No se encontró Cuerpo Autónomo en dev');
  if (!prodDoc) throw new Error('No se encontró el producto esperado en producción (_id=' + EXPECTED_PROD_ID + ')');
  if (prodDoc.nombre !== 'Cuerpo Autónomo' || prodDoc.cursoConfig?.slug !== 'cuerpo-autonomo') {
    throw new Error('El documento de producción no coincide con lo esperado (nombre/slug) — abortando por seguridad.');
  }

  const set = {
    esSuscripcion: true,
    precio: PRECIO_MENSUAL,
  };

  console.log('\n--- Copy de landing a sincronizar desde dev ---');
  for (const path of CURSO_CONFIG_PATHS_FROM_DEV) {
    const devValue = getPath(devDoc.cursoConfig, path);
    const prodValue = getPath(prodDoc.cursoConfig, path);
    const changed = JSON.stringify(devValue) !== JSON.stringify(prodValue);
    set[`cursoConfig.${path}`] = devValue;
    console.log(`  [${changed ? 'CAMBIA' : 'igual '}] cursoConfig.${path}`);
  }

  const oldOpciones = (prodDoc.cursoConfig?.planes?.opcionesPago || []).map((o) => ({
    ...o,
    activo: false,
  }));
  set['cursoConfig.planes.opcionesPago'] = oldOpciones;

  console.log('\n--- Resumen ---');
  console.log('Producto (producción):', prodDoc._id.toString());
  console.log('esSuscripcion: undefined ->', set.esSuscripcion);
  console.log('precio:', prodDoc.precio, '->', set.precio);
  console.log(
    'opcionesPago viejos (pago único) pasan a activo:false:',
    oldOpciones.map((o) => `${o.proveedor} $${o.monto}`).join(', ')
  );
  console.log('\nNO se toca: descripcion, sellosValidacion, imagenCheckoutPublicId, publicado, fechaPublicacion, preciosPreventa.');

  if (!CONFIRM) {
    console.log('\nNada escrito. Revisá el resumen y corré con --confirm cuando estés listo.');
  } else {
    const nativeCollection = prodConn.db.collection('products');
    const result = await nativeCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(EXPECTED_PROD_ID) },
      { $set: set }
    );
    console.log('\n✅ Escrito en producción. matched:', result.matchedCount, '| modified:', result.modifiedCount);
    console.log('\n--- Pendiente por tu lado ---');
    console.log('1) Entrá al dashboard admin en producción, editá "Cuerpo Autónomo" y dale Guardar.');
    console.log('   Eso dispara la generación de los 2 Payment Links de Stripe LIVE (mensual $49 / 4 meses $147).');
    console.log('2) Hasta que hagas eso, el checkout va a mostrar "mensajeSinPlanes" (no hay opción de pago activa) en vez del plan viejo de $166.');
  }

  await devConn.close();
  await prodConn.close();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
