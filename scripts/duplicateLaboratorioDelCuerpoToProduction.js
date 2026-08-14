/**
 * Duplica el producto "Laboratorio del Cuerpo" (6a7a12ba4900232136c3460f, cluster de dev)
 * — tipo clases_gratuitas_secuenciales — hacia la base de PRODUCCIÓN (MONGODB_URI_PRODUCTION),
 * generando también los documentos CourseClass correspondientes.
 *
 * Seguridad aplicada a propósito (mismo patrón que duplicateCuerpoAutonomoToProduction.js):
 *  - No toca la base de dev/test en ningún momento (conecta solo a MONGODB_URI_PRODUCTION).
 *  - Guardarraíl: aborta si la URI de producción apunta al cluster de dev ("clustertest").
 *  - Aborta si ya existe un producto con el mismo slug/nombre en producción (evita duplicados
 *    si el script se corre dos veces).
 *  - La descripción del producto se replica tal cual está en dev (texto placeholder repetido,
 *    "Laboratorio del CuerpoLaboratorio del Cuerpo...") — reemplazarla desde el admin en
 *    producción (/admin/productos/clases-gratis) antes de promocionarlo.
 *
 * Uso:
 *   node scripts/duplicateLaboratorioDelCuerpoToProduction.js            # dry-run (no escribe nada)
 *   node scripts/duplicateLaboratorioDelCuerpoToProduction.js --confirm  # escribe en PRODUCCIÓN
 *
 * Requiere en .env: MONGODB_URI_PRODUCTION
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');

const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;
if (!PRODUCTION_URI) {
  console.error('❌ Falta MONGODB_URI_PRODUCTION en .env');
  process.exit(1);
}

// Guardarraíl extra: nunca correr contra el cluster de dev por accidente.
if (PRODUCTION_URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}

// Esquemas laxos: solo necesitamos que Mongoose resuelva el nombre de colección
// correcto ("products" / "courseclasses") y persista el documento tal cual.
const ProductSchema = new mongoose.Schema({}, { strict: false, versionKey: '__v' });
const CourseClassSchema = new mongoose.Schema({}, { strict: false, versionKey: false });
const Product = mongoose.model('Product', ProductSchema);
const CourseClass = mongoose.model('CourseClass', CourseClassSchema);

// --- Documento de origen (dev), sin _id / __v: los asigna Mongo en el insert ---
function buildProductDoc() {
  const now = new Date();
  return {
    nombre: 'Laboratorio del Cuerpo',
    descripcion:
      'Laboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del CuerpoLaboratorio del Cuerpo', // TODO: reemplazar por descripción real desde el admin
    tipo: 'clases_gratuitas_secuenciales',
    precio: 0,
    moneda: 'USD',
    imagenes: [],
    activo: true,
    destacado: false,
    beneficios: [],
    aprendizajes: [],
    paraQuien: [],
    esProgramaTransformacional: false,
    programaTransformacional: {
      automatizacion: { activa: false, emailsAutomaticos: true, contenidoVimeo: true },
      duracionSemanas: 8,
      estadoCohorte: 'abierta',
      resultadosEsperados: [],
      requisitosPrevios: [],
      materialesNecesarios: [],
      semanas: [],
      sesionesEnVivo: [],
    },
    secuenciaConfig: {
      slug: 'laboratorio-del-cuerpo',
      publicado: true,
    },
    etiquetas: [],
    createdAt: now,
    updatedAt: now,
  };
}

// --- Clases embebidas (dev), sin _id / productId: se completan después del insert del producto ---
function buildClaseDocs() {
  return [
    {
      timelineIndex: 0,
      name: '¿CÓMO CONSTRUIR UN CUERPO QUE DURE TODA LA VIDA',
      description: '',
      descripcionGeneral:
        'Volvé a explorar el movimiento y descubrí todo lo que tu cuerpo puede hacer antes de pensar en entrenarlo.',
      descripcionCorta:
        'Antes de entrenar fuerza o movilidad, necesitás recuperar algo más básico: la capacidad de explorar y moverte.',
      descripcionCompleta:
        'Durante años aprendimos a pensar el entrenamiento como una lista de ejercicios que tenemos que repetir correctamente. Pero antes de aprender ejercicios, nuestro cuerpo aprendió a moverse explorando.\n\nEn esta clase vamos a volver a algo mucho más simple: entrar y salir del piso, cambiar de apoyo, explorar distintas posiciones y descubrir nuevas formas de movernos.\n\nNo buscamos entrenar fuerza ni movilidad de manera aislada. Buscamos despertar la capacidad de explorar que está detrás de todas ellas.\n\nA través de movimientos como branching, sentadilla profunda, cuadrupedia y transiciones por el suelo, vas a empezar a descubrir cómo tu cuerpo resuelve naturalmente diferentes situaciones.\n\nPorque antes de construir un cuerpo más fuerte o flexible, necesitamos recuperar algo fundamental:\n\nla capacidad de movernos.',
      pdfUrl: '',
      videoUrl: 'https://vimeo.com/1217070297/97ecc5ca3e?share=copy&fl=sv&fe=ci',
      videoId: '1217070297',
      videoThumbnail: '',
      duration: 0,
      level: 1,
      order: 10,
      materials: [],
      visibleInLibrary: true,
    },
    {
      timelineIndex: 0,
      name: 'Aprendé a resolver',
      description: '',
      descripcionGeneral:
        'Descubrí cómo aprende tu cuerpo cuando deja de repetir movimientos y empieza a resolver problemas.',
      descripcionCorta:
        'Tu cuerpo no aprende solamente repitiendo. Aprende cuando tiene que encontrar nuevas soluciones.',
      descripcionCompleta:
        'Muchas veces pensamos que para mejorar un movimiento necesitamos repetirlo cientos de veces.\n\nPero aprender a movernos también implica explorar, equivocarnos, adaptarnos y encontrar nuevas estrategias.\n\nEn esta clase vamos a utilizar ejercicios simples para crear pequeños problemas de movimiento. Vas a cambiar apoyos, posiciones, velocidades y direcciones mientras explorás cómo responde tu cuerpo.\n\nVamos a trabajar con pelota, coordinaciones, molinos, infinitos, cuadrupedia, gateos y sentadilla, pero el objetivo no es aprender una lista de ejercicios.\n\nEl objetivo es observar qué sucede cuando el cuerpo tiene que resolver algo que no estaba completamente definido.\n\nPorque antes de hacerse más fuerte, muchas veces el cuerpo necesita aprender a organizar mejor la fuerza que ya tiene.\n\nY cuanto más soluciones puede encontrar, más adaptable se vuelve.',
      pdfUrl: '',
      videoUrl: 'https://vimeo.com/1217072032/ef0212c53c',
      videoId: '1217072032',
      videoThumbnail: '',
      duration: 0,
      level: 1,
      order: 20,
      materials: ['pelota'],
      visibleInLibrary: true,
    },
    {
      timelineIndex: 0,
      name: 'De la flexibilidad al control',
      description: '',
      descripcionGeneral:
        'Aprendé a transformar el rango de movimiento en una capacidad que puedas controlar y utilizar.',
      descripcionCorta:
        'No se trata solamente de llegar más lejos. Se trata de aprender a controlar el lugar al que llegás.',
      descripcionCompleta:
        'Muchas personas entrenan flexibilidad intentando llegar cada vez más lejos. Pero tener acceso a un rango no significa necesariamente poder utilizarlo.\n\nEn esta clase vamos a explorar la diferencia entre flexibilidad y movilidad, utilizando ejercicios simples para empezar a construir fuerza y control dentro de los rangos que ya tenemos.\n\nVamos a trabajar con pancake, active leg lifts, half split, contract-relax, flexores de cadera, elevaciones activas de brazos y hanging.\n\nLa idea no es forzar el cuerpo para conseguir más amplitud.\n\nEs enseñarle que puede producir fuerza, respirar y moverse con control dentro de ese rango.\n\nPorque cuando aparece el control, aparece la confianza.\n\nY muchas veces, cuando el cuerpo confía más en un movimiento, el rango empieza a aparecer como consecuencia.',
      pdfUrl: '',
      videoUrl: 'https://vimeo.com/1217073708/5ceeb3cdce',
      videoId: '1217073708',
      videoThumbnail: '',
      duration: 0,
      level: 1,
      order: 30,
      materials: [],
      visibleInLibrary: true,
    },
    {
      timelineIndex: 0,
      name: '¿CÓMO CONSTRUIR UN CUERPO QUE DURE TODA LA VIDA?',
      description: '',
      descripcionGeneral:
        'Integrá movimiento, fuerza, movilidad y coordinación para empezar a construir un cuerpo capaz de adaptarse y seguir aprendiendo.',
      descripcionCorta:
        'Un cuerpo capaz no es solamente fuerte o flexible. Es un cuerpo que puede adaptarse, aprender y encontrar nuevas soluciones.',
      descripcionCompleta:
        'Durante las clases anteriores exploraste el movimiento, aprendiste a resolver problemas y empezaste a desarrollar mayor control sobre tu cuerpo.\n\nAhora vamos a unir esas piezas.\n\nEn esta clase vas a recorrer un flow continuo que combina weight transfers, branching, sentadilla profunda, cuadrupedia, gateos, rotaciones, movilidad y transiciones por el suelo.\n\nNo buscamos ejecutar cada movimiento de manera perfecta. Buscamos mantenernos en movimiento, adaptarnos y encontrar soluciones mientras avanzamos.\n\nA medida que repetís el flow, vas a notar que necesitás pensar menos en cada movimiento y que distintas capacidades empiezan a trabajar juntas.\n\nPorque la vida nunca nos pide fuerza, movilidad o coordinación de manera aislada.\n\nNos pide movernos, adaptarnos y resolver situaciones constantemente.\n\nY un cuerpo que dura toda la vida no es un cuerpo que simplemente deja de deteriorarse.\n\nEs un cuerpo que conserva la capacidad de aprender.',
      pdfUrl: '',
      videoUrl: 'https://vimeo.com/1217076552/7116ac55bd',
      videoId: '1217076552',
      videoThumbnail: '',
      duration: 0,
      level: 1,
      order: 40,
      materials: [],
      visibleInLibrary: true,
    },
  ];
}

async function main() {
  console.log(
    CONFIRM
      ? '🚀 Modo ejecución (--confirm): va a escribir en PRODUCCIÓN.'
      : '🧪 Dry-run: no se escribe nada. Pasá --confirm para ejecutar.'
  );
  console.log('Conectando a producción...');
  await mongoose.connect(PRODUCTION_URI);
  console.log('✅ Conectado a', mongoose.connection.name);

  const productDoc = buildProductDoc();
  const claseDocs = buildClaseDocs();

  // Guardarraíl: evitar duplicados si el script se corre más de una vez.
  const existing = await Product.findOne({
    $or: [
      { 'secuenciaConfig.slug': productDoc.secuenciaConfig.slug },
      { nombre: productDoc.nombre, tipo: productDoc.tipo },
    ],
  }).lean();
  if (existing) {
    console.error(
      '❌ Ya existe un producto con ese slug/nombre en producción (_id:',
      existing._id.toString(),
      '). Abortando para no duplicar.'
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (!CONFIRM) {
    console.log('\n--- Resumen (dry-run) ---');
    console.log('Producto:', productDoc.nombre, '| slug:', productDoc.secuenciaConfig.slug);
    console.log('publicado:', productDoc.secuenciaConfig.publicado, '| activo:', productDoc.activo);
    console.log('Clases a crear:', claseDocs.length);
    claseDocs.forEach((c) => console.log('  - order', c.order, '|', c.name, '| videoId:', c.videoId));
    console.log('\nNada escrito. Revisá el script y corré con --confirm cuando estés listo.');
    await mongoose.disconnect();
    return;
  }

  // 1) Insertar el producto
  const created = await Product.create(productDoc);
  const productId = created._id;
  console.log('✅ Producto creado en producción con _id:', productId.toString());

  // 2) Insertar cada CourseClass, referenciando el producto recién creado
  for (const clase of claseDocs) {
    const courseClassDoc = await CourseClass.create({ ...clase, productId });
    console.log('  ✅ Clase creada:', courseClassDoc._id.toString(), '| order', clase.order, '|', clase.name);
  }

  console.log('\n--- Pendiente por tu lado (dashboard admin, en producción) ---');
  console.log('1) Reemplazar la descripción del producto (hoy es texto placeholder repetido).');
  console.log('2) Verificar que el código de /clases-gratis esté deployado antes de promocionar el link.');
  console.log('\nProductId:', productId.toString());
  console.log('URL pública: /clases-gratis/' + productDoc.secuenciaConfig.slug);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
