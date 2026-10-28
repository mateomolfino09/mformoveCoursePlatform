/**
 * Actualiza el copy comercial de la landing Cuerpo Autónomo (slug cuerpo-autonomo)
 * para que test y producción queden iguales.
 *
 * No toca: publicado, opcionesPago, testimonios, clases, videos ni payment links.
 * Renombra solo el título visible de los 3 módulos de contenido (Reconectar → Percibir).
 *
 * Uso:
 *   node scripts/updateCuerpoAutonomoLandingComercial.js                 # dry-run ambos
 *   node scripts/updateCuerpoAutonomoLandingComercial.js --confirm       # escribe ambos
 *   node scripts/updateCuerpoAutonomoLandingComercial.js --env=test --confirm
 *   node scripts/updateCuerpoAutonomoLandingComercial.js --env=prod --confirm
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
const ENV_ARG = (process.argv.find((arg) => arg.startsWith('--env=')) || '--env=both').split('=')[1];

const FUNDADOR_IMAGEN = 'my_uploads/equipo/Sin_titulo_1080_x_1080_px_uylhwc';
const MODULO_TITULOS = ['Percibir', 'Ordenar', 'Construir'];

const FAQ = {
  anclaId: 'membership-faq',
  titulo: 'Preguntas frecuentes',
  intro: 'Respuestas concretas antes de sumarte.',
  items: [
    ['¿Para quién es Cuerpo Autónomo?', 'Es para quien quiere construir fuerza, movilidad y coordinación, y aprender a entender y entrenar su cuerpo. Sirve si ya te movés y sentís que te falta un criterio, o si querés empezar y no sabés por dónde. No es rehabilitación, terapia ni un entrenamiento individual.'],
    ['¿Necesito experiencia previa?', 'No. Podés empezar desde cero o sumarte si ya entrenás. Cada persona adapta la práctica a su punto de partida.'],
    ['¿Cuánto tiempo tengo que dedicarle?', 'No hay una carga obligatoria. Las clases están para avanzar a tu ritmo. Como referencia, podés empezar con dos o tres momentos por semana e integrarlos a tu vida.'],
    ['¿Puedo hacerlo si ya voy al gimnasio o practico otro deporte?', 'Sí. El gimnasio y otros deportes pueden convivir con la escuela. Cuerpo Autónomo no los reemplaza: suma una práctica para entender y entrenar el cuerpo.'],
    ['¿Qué pasa si una semana no puedo entrenar?', 'Podés retomar cuando vuelvas. Durante tu inscripción las clases quedan disponibles para repetirlas y avanzar a tu tiempo. No hace falta seguir el ritmo de nadie.'],
    ['¿Cómo funcionan los encuentros semanales?', 'Son encuentros grupales con Mateo para practicar movimiento, profundizar en lo que estamos aprendiendo y resolver dudas. El día y el horario se confirman dentro de la escuela.'],
    ['¿Puedo participar si no llego a los encuentros en vivo?', 'Sí. Podés seguir con las clases a tu ritmo y con la comunidad. No está confirmado que los encuentros en vivo queden grabados.'],
    ['¿Qué pasa después de los cuatro meses?', 'El checkout actual está armado como una suscripción que se renueva cada 4 meses mientras decidas seguir. No es un acceso de por vida por haber pagado un período. Si la suscripción no se renueva, el acceso de ese período termina.'],
    ['¿Qué acceso conservo a las clases?', 'Durante la inscripción tenés las clases de los módulos, los encuentros semanales, la comunidad y los recursos complementarios. No prometemos que las clases queden para siempre después de ese período.'],
    ['¿En qué se diferencia de una mentoría individual?', 'La mentoría es un proceso individual. Cuerpo Autónomo es una escuela grupal: practicás a tu ritmo, te encontrás con el grupo cada semana y compartís el proceso con otras personas. No incluye una sesión individual.'],
    ['¿Cómo me inscribo?', 'Con el botón «Quiero sumarme», que abre el checkout para pagar directo. La llamada es opcional y no hace falta agendarla para inscribirte.'],
    ['¿Qué métodos de pago aceptan?', 'El checkout operativo cobra con tarjeta en USD a través de Stripe. Si Mercado Pago está habilitado para tu país, también aparece en el checkout. No prometemos una cantidad fija de cuotas.'],
    ['¿Cuáles son las condiciones de cancelación y devolución?', 'La condición publicada hasta ahora es que, una vez activado el acceso, no hay reembolso. La suscripción puede dejar de renovarse; no hay otra política de cancelación confirmada en esta página. Si tenés dudas, mejor conversarlo antes de inscribirte.'],
  ].map(([pregunta, respuesta], orden) => ({ pregunta, respuesta, orden })),
};

const HIGHLIGHT_COPY = [
  {
    titulo: 'Percibir',
    resumen: 'Aprendé a prestar atención al cuerpo, reconocer sensaciones y explorar cómo te movés.',
    detalle: '',
  },
  {
    titulo: 'Ordenar',
    resumen: 'Descubrí cómo tus hábitos, tu entorno y tu vida cotidiana influyen sobre tu práctica, y cómo crear condiciones para sostenerla.',
    detalle: '',
  },
  {
    titulo: 'Construir',
    resumen: 'Trabajá fuerza, movilidad y coordinación, aprendiendo principios para desarrollar esas capacidades progresivamente.',
    detalle: '',
  },
];

const OFFER_BLOCKS = [
  { lineas: ['Encuentros grupales semanales'], hint: 'Practicamos juntos, profundizamos en lo que estamos trabajando y resolvemos dudas.', iconKey: 'live' },
  { lineas: ['Clases para avanzar a tu ritmo'], hint: 'Un camino progresivo que podés adaptar a tus tiempos y volver a recorrer cuando lo necesites.', iconKey: 'video' },
  { lineas: ['Comunidad privada'], hint: 'Un espacio para compartir tu práctica, tus preguntas y tus descubrimientos.', iconKey: 'community' },
  { lineas: ['Tres módulos fundacionales'], hint: 'Percibir, Ordenar y Construir: las bases para desarrollar capacidades y aprender a entrenarlas.', iconKey: 'book' },
  { lineas: ['Recursos complementarios'], hint: 'Material y herramientas para llevar lo que aprendés a tu entrenamiento y a tu vida cotidiana.', iconKey: 'health' },
];

const MODULO_COPY = [
  { titulo: 'Percibir', descripcion: 'Aprendé a prestar atención al cuerpo, reconocer sensaciones y explorar cómo te movés.' },
  { titulo: 'Ordenar', descripcion: 'Descubrí cómo tus hábitos, tu entorno y tu vida cotidiana influyen sobre tu práctica, y cómo crear condiciones para sostenerla.' },
  { titulo: 'Construir', descripcion: 'Trabajá fuerza, movilidad y coordinación, aprendiendo principios para desarrollar esas capacidades progresivamente.' },
];

const OUTCOMES = [
  { titulo: 'Fuerza y movilidad', cuerpo: 'Desarrollá capacidades que te ayuden a moverte con mayor libertad y control.' },
  { titulo: 'Confianza para explorar', cuerpo: 'Aprendé a acercarte progresivamente a posiciones y movimientos nuevos.' },
  { titulo: 'Criterio para entrenar', cuerpo: 'Entendé qué estás practicando, cómo progresar y cuándo adaptar un ejercicio a tu situación.' },
  { titulo: 'Una práctica sostenible', cuerpo: 'Encontrá maneras de incorporar el movimiento a tu semana y retomar cuando perdés el ritmo.' },
];

const BLOQUES = [
  { titulo: 'Practicá a tu ritmo', cuerpo: 'Clases organizadas para desarrollar tus capacidades, repetir lo que necesites y avanzar según tus tiempos.' },
  { titulo: 'Nos encontramos todas las semanas', cuerpo: 'Encuentros grupales conmigo para practicar movimiento, profundizar en lo que estamos aprendiendo y resolver dudas.' },
  { titulo: 'Compartí el proceso', cuerpo: 'Una comunidad donde podés preguntar, contar cómo te va y aprender junto a otras personas que también están construyendo sus capacidades.' },
];

function imageAt(list, index, fallback) {
  return (list && list[index] && list[index].imagenPublicId) || fallback || '';
}

function buildSet(doc) {
  const cfg = doc.cursoConfig || {};
  const highlightImages = (cfg.highlights && cfg.highlights.items) || [];
  const moduloImages = (cfg.queIncluye && cfg.queIncluye.modulos) || [];
  const fallbackImg = 'my_uploads/fondos/DSC01753_qdv9o0';

  const contenidoModulos = (cfg.contenidoModulos || []).map((mod, index) => ({
    ...mod,
    titulo: MODULO_TITULOS[index] || mod.titulo,
  }));

  return {
    'cursoConfig.hero.eyebrow': 'CUERPO AUTÓNOMO · ESCUELA ONLINE DE MOVIMIENTO',
    'cursoConfig.hero.tagline': 'Construí un cuerpo fuerte, móvil y capaz.',
    'cursoConfig.hero.ctaTexto': 'Quiero sumarme',
    'cursoConfig.hero.ctaSubcopy':
      'Aprendé a entrenar y moverte mejor, con clases a tu ritmo, encuentros semanales y un grupo con el que compartir el proceso.',
    'cursoConfig.navegacion.ctaBarraMovil': 'Quiero sumarme',
    'cursoConfig.presentacionTestimonios.tituloEscritos': 'Lo que cuentan quienes ya están practicando.',
    'cursoConfig.presentacionTestimonios.eyebrowEscritos': '',
    'cursoConfig.presentacionTestimonios.anclaEscritos': 'testimonios',
    'cursoConfig.betweenHero.eyebrow': 'Por qué existe',
    'cursoConfig.betweenHero.titulo':
      'No se trata de entrenar más. Se trata de moverte mejor.',
    'cursoConfig.betweenHero.parrafos': [
      'Capaz ya entrenás, pero sentís que la movilidad siempre queda pendiente. O querés empezar a moverte más y no sabés bien por dónde arrancar.',
      'En Cuerpo Autónomo trabajamos fuerza, movilidad y coordinación, mientras aprendemos a entender nuestro cuerpo y construir una práctica que podamos sostener en el tiempo.',
    ],
    'cursoConfig.betweenHero.cierre': '',
    'cursoConfig.bannerAncho.cuerpo':
      'Cada persona empieza desde un lugar distinto. Lo que compartimos es la práctica.',
    'cursoConfig.introHighlights.subtitulo':
      'Un espacio para practicar, aprender y seguir avanzando juntos.',
    'cursoConfig.introHighlights.cuerpo':
      'En Cuerpo Autónomo tenés un camino para seguir a tu ritmo y un grupo con el que encontrarte todas las semanas para practicar, compartir experiencias y resolver dudas.',
    'cursoConfig.introHighlights.bloques': BLOQUES,
    'cursoConfig.introHighlights.imagenAlt': 'Cuerpo Autónomo — la escuela en práctica',
    'cursoConfig.introHighlights.imagenMobilePublicId': 'my_uploads/plaza/DSC03366_ctiejt',
    'cursoConfig.introHighlights.imagenDesktopPublicId': 'my_uploads/plaza/DSC03366_ctiejt',
    'cursoConfig.outcomes.titulo':
      'Más capacidades para moverte. Más herramientas para seguir aprendiendo.',
    'cursoConfig.outcomes.items': OUTCOMES,
    'cursoConfig.highlights.titulos': [
      'Un camino para aprender a entender y entrenar tu cuerpo.',
      'Empezamos por tres módulos que construyen las bases de tu práctica. Son herramientas para seguir desarrollando capacidades dentro de la escuela.',
    ],
    'cursoConfig.highlights.puente': '',
    'cursoConfig.highlights.ctaEyebrow': '',
    'cursoConfig.highlights.ctaTitulo': '',
    'cursoConfig.highlights.ctaDescripcion': '',
    'cursoConfig.highlights.ctaBoton': 'Quiero sumarme',
    'cursoConfig.highlights.items': HIGHLIGHT_COPY.map((item, index) => ({
      ...item,
      imagenPublicId: imageAt(highlightImages, index, imageAt(moduloImages, index, fallbackImg)),
      orden: index,
    })),
    'cursoConfig.queIncluye.titulo': 'Todo lo que necesitás para empezar y seguir practicando.',
    'cursoConfig.queIncluye.anclaId': 'course-que-incluye',
    'cursoConfig.queIncluye.offerBlocks': OFFER_BLOCKS,
    'cursoConfig.queIncluye.modulos': MODULO_COPY.map((item, index) => ({
      ...item,
      imagenPublicId: imageAt(moduloImages, index, imageAt(highlightImages, index, fallbackImg)),
    })),
    'cursoConfig.contenidoModulos': contenidoModulos,
    'cursoConfig.fundador.eyebrow': 'Tu profesor',
    'cursoConfig.fundador.titulo': 'Soy Mateo Molfino.',
    'cursoConfig.fundador.bio':
      'Soy profesor de movimiento, instructor de yoga y calistenia.\n\nMe apasiona estudiar el cuerpo humano, entrenar distintas formas de movimiento y acompañar a otras personas a desarrollar sus capacidades.\n\nCreé Cuerpo Autónomo para reunir lo que enseño en un espacio donde podamos practicar, aprender y seguir explorando juntos.',
    'cursoConfig.fundador.imagenPublicId':
      (cfg.fundador && cfg.fundador.imagenPublicId) || FUNDADOR_IMAGEN,
    'cursoConfig.fundador.stats.anios': '+5',
    'cursoConfig.fundador.stats.estudiantes': '+100',
    'cursoConfig.fundador.stats.paises': '+5',
    'cursoConfig.planes.ventaPorLlamada': false,
    'cursoConfig.planes.cohorteUrgenciaTexto': '',
    'cursoConfig.planes.titulo': 'Sumate a Cuerpo Autónomo.',
    'cursoConfig.planes.parrafosValor': [
      'Cuatro meses para construir una práctica con dirección, aprender a entrenar tu cuerpo y formar parte de una escuela donde seguimos moviéndonos juntos.',
    ],
    'cursoConfig.planes.etiquetaFormasPago': 'Formas de pago',
    'cursoConfig.planes.copyUruguayLatam':
      'El checkout operativo es con tarjeta en USD. Si Mercado Pago está habilitado para tu país, también aparece ahí.',
    'cursoConfig.planes.copyRestoMundo':
      'Para el resto del mundo, el pago es en USD con tarjeta a través de Stripe.',
    'cursoConfig.planes.copyCuotasTarjeta': '',
    'cursoConfig.planes.beneficiosTitulo': 'Qué incluye',
    'cursoConfig.planes.beneficios': [
      'Encuentros grupales semanales para practicar, profundizar y resolver dudas.',
      'Clases para avanzar a tu ritmo y volver a recorrer cuando lo necesites.',
      'Comunidad privada para compartir la práctica, las preguntas y los descubrimientos.',
      'Tres módulos fundacionales: Percibir, Ordenar y Construir.',
      'Recursos complementarios para llevar lo aprendido al entrenamiento y a la vida cotidiana.',
    ],
    'cursoConfig.faq': FAQ,
    'cursoConfig.ctaFinal.titulo': 'Sumate y empecemos a movernos juntos.',
    'cursoConfig.ctaFinal.cuerpo':
      'Cuatro meses para construir una práctica con dirección, con clases a tu ritmo y un grupo con el que encontrarte cada semana.',
    'cursoConfig.ctaFinal.boton': 'Quiero sumarme',
    'cursoConfig.ctaFinal.anclaId': 'membership-plans',
  };
}

async function applyEnv(label, uri) {
  if (!uri) {
    console.error(`Falta la URI de ${label}`);
    process.exit(1);
  }
  if (label === 'PROD' && uri.includes('clustertest')) {
    console.error('MONGODB_URI_PRODUCTION apunta a clustertest. Abortando.');
    process.exit(1);
  }

  const conn = await mongoose.createConnection(uri).asPromise();
  const Product = conn.model(`ProductLanding${label}`, new mongoose.Schema({}, { strict: false }), 'products');
  const doc = await Product.findOne({ 'cursoConfig.slug': 'cuerpo-autonomo' }).lean();
  if (!doc) {
    throw new Error(`${label}: no está el producto cuerpo-autonomo`);
  }

  const set = buildSet(doc);
  const planes = (doc.cursoConfig.planes && doc.cursoConfig.planes.opcionesPago) || [];
  console.log(`\n${CONFIRM ? 'ESCRIBE' : 'DRY-RUN'} ${label} db=${conn.name} id=${doc._id}`);
  console.log(`publicado se mantiene: ${doc.cursoConfig.publicado}`);
  console.log(`opcionesPago se mantienen: ${planes.map((p) => `${p.proveedor} ${p.monto}/${p.intervaloMeses}`).join(', ')}`);
  console.log(`ventaPorLlamada: ${doc.cursoConfig.planes && doc.cursoConfig.planes.ventaPorLlamada} -> false`);
  console.log(`hero: "${doc.cursoConfig.hero && doc.cursoConfig.hero.tagline}" -> "${set['cursoConfig.hero.tagline']}"`);
  console.log(`modulos contenido: ${(doc.cursoConfig.contenidoModulos || []).map((m) => m.titulo).join(', ')} -> ${MODULO_TITULOS.join(', ')}`);
  console.log(`clases por modulo: ${(doc.cursoConfig.contenidoModulos || []).map((m) => (m.clases || []).length).join(', ')} (sin cambios)`);

  if (CONFIRM) {
    await conn.db.collection('products').updateOne({ _id: doc._id }, { $set: set });
    console.log(`${label}: actualizado`);
  }

  await conn.close();
}

async function main() {
  const jobs = [];
  if (ENV_ARG === 'both' || ENV_ARG === 'test') jobs.push(['TEST', process.env.MONGODB_URI]);
  if (ENV_ARG === 'both' || ENV_ARG === 'prod') jobs.push(['PROD', process.env.MONGODB_URI_PRODUCTION]);
  if (!jobs.length) {
    console.error('Usá --env=test, --env=prod o --env=both');
    process.exit(1);
  }
  for (const [label, uri] of jobs) {
    await applyEnv(label, uri);
  }
  if (!CONFIRM) console.log('\nDry-run. Pasá --confirm para escribir.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
