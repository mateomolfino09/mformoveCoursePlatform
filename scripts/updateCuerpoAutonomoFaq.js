/**
 * Reemplaza cursoConfig.faq de Cuerpo Autónomo (slug cuerpo-autonomo).
 *
 * v2 (2026-09-09): reordena los ítems — las objeciones (nivel, tiempo, consistencia) suben
 * justo después de las 2 preguntas de orientación, y lo financiero/legal (medios de pago,
 * cancelación, reembolsos) baja al final. Mismo contenido, sin reescribir texto — ver
 * comparativa `.claude/specs/cuerpo-autonomo-vs-madamove-comparativa.md` punto 10.
 *
 * Uso:
 *   node scripts/updateCuerpoAutonomoFaq.js                    # dry-run contra dev
 *   node scripts/updateCuerpoAutonomoFaq.js --confirm          # escribe en dev
 *   node scripts/updateCuerpoAutonomoFaq.js --env=prod         # dry-run producción
 *   node scripts/updateCuerpoAutonomoFaq.js --env=prod --confirm
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

const FAQ = {
  anclaId: 'membership-faq',
  titulo: 'Respuestas claras antes de sumarte',
  intro:
    'Cuerpo Autónomo es una academia en movimiento. Estas son algunas de las preguntas más comunes antes de empezar.',
  items: [
    {
      pregunta: '¿Qué es Cuerpo Autónomo y qué incluye?',
      respuesta:
        'Cuerpo Autónomo es una academia para aprender a construir un cuerpo fuerte, sin restricciones de movimiento y saludable. Al sumarte accedés a los 3 módulos principales y sus 20 clases, llamadas grupales semanales, una clase virtual mensual, comunidad, material nuevo semanalmente y una sesión individual online con un profesional del equipo.',
      orden: 0,
    },
    {
      pregunta: '¿Es un curso o una membresía?',
      respuesta:
        'Es una academia por suscripción. Los módulos principales te dan un camino claro para empezar, pero Cuerpo Autónomo no termina cuando completás las clases. Mientras formes parte de la academia seguís teniendo acceso a la comunidad, las llamadas, las clases virtuales y a los nuevos materiales y herramientas que vayamos incorporando.',
      orden: 1,
    },
    {
      pregunta: '¿Necesito experiencia previa?',
      respuesta:
        'No. Podés empezar desde cero o sumarte aunque ya entrenes. El recorrido comienza por aprender a percibir y entender mejor tu cuerpo antes de avanzar hacia el desarrollo de capacidades más complejas. Cada persona adapta la práctica a su propio punto de partida.',
      orden: 2,
    },
    {
      pregunta: '¿Cuánto tiempo tengo que dedicarle?',
      respuesta:
        'No buscamos que Cuerpo Autónomo se convierta en otra obligación difícil de sostener. Como referencia, podés empezar dedicando entre 2 y 3 momentos por semana a las clases y prácticas. El contenido está disponible para que avances a tu ritmo y puedas integrarlo a tu vida.',
      orden: 3,
    },
    {
      pregunta: '¿Qué pasa si me pierdo una semana?',
      respuesta:
        'No pasa nada. No necesitás seguir el ritmo de nadie. Las clases principales están disponibles para que avances a tu propio ritmo y puedas retomar cuando lo necesites. La idea es construir una práctica sostenible, no agregar presión.',
      orden: 4,
    },
    {
      pregunta: '¿Qué pasa cuando termino los 3 módulos?',
      respuesta:
        'Ahí empieza otra etapa. Los módulos te dan las bases para entender tu cuerpo y desarrollar movilidad, fuerza y coordinación. Después podés seguir practicando, profundizando y utilizando los nuevos contenidos, clases y encuentros de la academia para continuar construyendo tu cuerpo según tus propios objetivos.',
      orden: 5,
    },
    {
      pregunta: '¿Cómo funciona el acompañamiento?',
      respuesta:
        'No hacés el proceso completamente solo. Durante tu recorrido tenés acceso a la comunidad para compartir dudas y avances, llamadas grupales semanales para profundizar en los temas que estamos trabajando y una clase virtual mensual para practicar juntos. Los encuentros pueden estar acompañados por Mateo, Nico y otros profesionales invitados.',
      orden: 6,
    },
    {
      pregunta: '¿Qué es la sesión individual con un profesional?',
      respuesta:
        'Al formar parte de la academia tenés acceso a una sesión individual online, por única vez, con el profesional del equipo que consideres más adecuado para tu momento. Podés elegir una mirada más orientada al movimiento y entrenamiento, los hábitos o situaciones físicas puntuales.',
      orden: 7,
    },
    {
      pregunta: '¿En qué se diferencia de una mentoría personalizada?',
      respuesta:
        'En una mentoría trabajamos de forma individual sobre tus objetivos y necesidades específicas. Cuerpo Autónomo ofrece un camino estructurado dentro de una experiencia grupal, con contenido, comunidad y acompañamiento profesional. Si buscás construir una práctica propia mientras aprendés junto a otras personas, la academia probablemente sea para vos.',
      orden: 8,
    },
    {
      pregunta: '¿Puedo cancelar mi suscripción?',
      respuesta:
        'Sí. Cuerpo Autónomo está pensado para que permanezcas porque seguís encontrando valor en la academia, no porque estés atado a un contrato. Podés cancelar tu suscripción cuando decidas dejar de formar parte.',
      orden: 9,
    },
    {
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta:
        'En Uruguay y Latinoamérica podés pagar utilizando los medios disponibles en tu moneda local. Para el resto del mundo procesamos pagos internacionales en USD mediante tarjeta.',
      orden: 10,
    },
    {
      pregunta: '¿Tienen políticas de reembolso?',
      respuesta:
        'Al tratarse de una academia digital con acceso inmediato al contenido y los espacios de la comunidad, no ofrecemos reembolsos una vez activada la suscripción. Si antes de sumarte tenés dudas sobre si Cuerpo Autónomo es para vos, podés hablar con nuestro equipo para ayudarte a decidir.',
      orden: 11,
    },
  ],
};

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', ProductSchema, 'products');

async function main() {
  await mongoose.connect(URI);
  const target = IS_PROD ? 'PRODUCCIÓN' : 'DEV';
  const doc = await Product.findOne({ 'cursoConfig.slug': 'cuerpo-autonomo' }).lean();
  if (!doc) {
    throw new Error('No se encontró el producto con cursoConfig.slug=cuerpo-autonomo');
  }

  const prevCount = doc.cursoConfig?.faq?.items?.length ?? 0;
  console.log(`${CONFIRM ? '🚀' : '🧪'} ${target} — ${doc.nombre} (${doc._id})`);
  console.log(`FAQ actual: ${prevCount} ítems → nuevo: ${FAQ.items.length} ítems`);

  if (!CONFIRM) {
    console.log('Dry-run. Pasá --confirm para escribir.');
    await mongoose.disconnect();
    return;
  }

  await Product.updateOne(
    { _id: doc._id },
    { $set: { 'cursoConfig.faq': FAQ } }
  );
  console.log('✅ cursoConfig.faq actualizado');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
