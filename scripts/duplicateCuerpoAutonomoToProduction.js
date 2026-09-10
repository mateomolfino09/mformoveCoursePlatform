/**
 * Duplica el producto de test "Cuerpo Autónomo" (6a0a4d25d13df40e5d2ecfeb, cluster de dev)
 * hacia la base de PRODUCCIÓN (MONGODB_URI_PRODUCTION), generando también los documentos
 * CourseClass correspondientes (misma lógica que syncCourseClassesFromContenidoModulos).
 *
 * Seguridad aplicada a propósito (ver conversación):
 *  - cursoConfig.fechaPublicacion se fuerza a null: el cron publish-curso-landings
 *    auto-publica cualquier curso con publicado=false y fechaPublicacion en el pasado,
 *    y la fecha del doc de test (2026-05-31) ya pasó. Sin esto, el curso podría quedar
 *    publicado en vivo con links de pago de test/sandbox todavía puestos.
 *  - cursoConfig.publicado se mantiene en false.
 *  - Los paymentLink / stripePriceId / stripeProductId / mercadoPagoPreferenceId quedan
 *    con los valores de TEST tal cual — hay que reemplazarlos desde el dashboard admin
 *    antes de publicar el curso.
 *  - No toca la base de dev/test en ningún momento (conecta solo a MONGODB_URI_PRODUCTION).
 *
 * Uso:
 *   node scripts/duplicateCuerpoAutonomoToProduction.js            # dry-run (no escribe nada)
 *   node scripts/duplicateCuerpoAutonomoToProduction.js --confirm  # escribe en PRODUCCIÓN
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

// --- Documento de origen (test), sin _id / __v: los asigna Mongo en el insert ---
function buildProductDoc() {
  const now = new Date();
  return {
    nombre: 'Cuerpo Autónomo',
    descripcion:
      'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSohttps://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo', // TODO: reemplazar por descripción real (min 20 chars, hoy es el link de WhatsApp duplicado)
    tipo: 'curso',
    precio: 220,
    moneda: 'USD',
    imagenes: [],
    portada: 'my_uploads/pk3mfwueblbu7jgrxorq',
    portadaMobile: null,
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
    cursoConfig: {
      slug: 'cuerpo-autonomo',
      publicado: false, // no tocar hasta reemplazar los links de pago
      fechaPublicacion: null, // forzado a null a propósito, ver cabecera del script
      preciosPreventa: [
        {
          _id: new mongoose.Types.ObjectId(),
          etiqueta: 'Preventa',
          descripcion: 'Precio especial antes del lanzamiento.',
          monto: 170,
          moneda: 'USD',
          fechaFin: new Date('2026-05-22T23:53:00.000Z'), // ya expiró: queda inerte hasta que la actualicen
          cuposLimite: 10,
          cuposUsados: 0,
          activo: true,
          orden: 0,
          opcionesPago: [
            {
              proveedor: 'stripe',
              etiqueta: 'Preventa — tarjeta',
              descripcion: 'Pago único con tarjetas internacionales, Apple Pay y Google Pay.',
              monto: 170,
              moneda: 'USD',
              paymentLink: 'https://buy.stripe.com/test_aFa14oe4KbLufuA6TU8IU0I', // TODO: reemplazar por link LIVE
              activo: true,
              stripePriceId: 'price_1TYEe5JzWKYFnVw79cJXE7rD', // TODO: TEST
              stripeProductId: 'prod_UXJGSKSO1FnBK7', // TODO: TEST
            },
          ],
        },
      ],
      preventaRedencionesSessionIds: [],
      contenidoModulos: [
        {
          timelineIndex: 0,
          titulo: 'Reconectar',
          esencia:
            'La experiencia puede cambiar cuando dejás de reaccionar automáticamente y empezás a observar.',
          bundleTipo: 'videos',
          vimeoPlaylistId: '',
          clases: [
            {
              name: 'Clase1',
              description:
                'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO: contenido real
              descripcionGeneral:
                'Qué es Calmar y por qué es el primer paso antes de cualquier otra cosa. Cómo abordar las clases, qué actitud traer y qué no esperar todavía. Este módulo no se mide en resultados físicos, se mide en conciencia.',
              descripcionCorta:
                'Qué es Calmar y por qué es el primer paso antes de cualquier otra cosa. Cómo abordar las clases, qué actitud traer y qué no esperar todavía. Este módulo no se mide en resultados físicos, se mide en conciencia.',
              descripcionCompleta:
                'Es normal llegar a un programa como este esperando resultados rápidos. Menos dolor. Más movilidad. Más flexibilidad. Más control sobre el cuerpo.\nY aunque muchas de esas cosas van a pasar, no es ahí donde empieza el cambio.\nAntes de intentar corregir, mejorar o empujar cualquier capacidad física, necesitamos desarrollar algo más importante: la capacidad de observar.\nEn este módulo no te voy a pedir que rindas examen ni que logres ningún movimiento espectacular. Te voy a invitar a prestar atención.\nA cómo se siente tu cuerpo.\nA cómo respiras.\nA cómo respondes frente a la tensión, la incomodidad o el dolor.\nPorque muchas veces el problema no es la falta de herramientas. Es la falta de información y percepción interna.\nY cuanto mejor aprendes a percibir lo que está pasando sin reaccionar automáticamente, mejores decisiones podés tomar después.\nPor eso empezamos por acá. \nNo es sólo calmar es sistema, es inteligencia corporal.\n',
              videoUrl: 'https://vimeo.com/1185536296?fl=ip&fe=ec', // TODO: video real
              videoId: '1185536296', // TODO: video real
              videoThumbnail: '',
              duration: 3600,
              level: 1,
              order: 0,
              materials: ['banda elastica', 'banco'],
              visibleInLibrary: true,
              pdfUrl: '',
              titulo: '',
              vimeoVideoId: '',
              orden: 0,
            },
            {
              name: 'Clase2',
              description:
                'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
              descripcionGeneral:
                'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
              descripcionCorta: '',
              descripcionCompleta: '',
              videoUrl: 'https://vimeo.com/1185536296?fl=ip&fe=ec', // TODO
              videoId: '1185536296', // TODO
              videoThumbnail: '',
              duration: 3600,
              level: 1,
              order: 1,
              materials: ['banda elastica', 'banco'],
              visibleInLibrary: true,
              pdfUrl: '',
              titulo: '',
              vimeoVideoId: '',
              orden: 0,
            },
          ],
        },
        {
          timelineIndex: 1,
          titulo: 'Arquitectura corporal (postura: pies y columna)',
          esencia: '',
          bundleTipo: 'videos',
          vimeoPlaylistId: '',
          clases: [0, 1, 2].map((i) => ({
            name: `Clase${i}`,
            description:
              'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
            descripcionGeneral:
              'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
            descripcionCorta: '',
            descripcionCompleta: '',
            videoUrl: 'https://vimeo.com/1185536296?fl=ip&fe=ec', // TODO
            videoId: '1185536296', // TODO
            videoThumbnail: '',
            duration: 3600,
            level: 1,
            order: i,
            materials: ['banda elastica', 'banco'],
            visibleInLibrary: true,
            pdfUrl: '',
            titulo: '',
            vimeoVideoId: '',
            orden: 0,
          })),
        },
        {
          timelineIndex: 2,
          titulo: 'Capacidades (movilidad, fuerza y coordinación)',
          esencia: '',
          bundleTipo: 'videos',
          vimeoPlaylistId: '',
          clases: [0, 1, 2].map((i) => ({
            name: `Clase${i}`,
            description:
              'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
            descripcionGeneral:
              'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
            descripcionCorta: '',
            descripcionCompleta: '',
            videoUrl: 'https://vimeo.com/1185536296?fl=ip&fe=ec', // TODO
            videoId: '1185536296', // TODO
            videoThumbnail: '',
            duration: 3600,
            level: 1,
            order: i,
            materials: ['banda elastica', 'banco'],
            visibleInLibrary: true,
            pdfUrl: '',
            titulo: '',
            vimeoVideoId: '',
            orden: 0,
          })),
        },
        {
          timelineIndex: 3,
          titulo: 'Expresión (el lenguaje: lucha y danza)',
          esencia: '',
          bundleTipo: 'videos',
          vimeoPlaylistId: '',
          clases: [0, 1, 2].map((i) => ({
            name: `Clase${i}`,
            description:
              'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
            descripcionGeneral:
              'Ocurrió un error inesperado al actualizar el producto.Ocurrió un error inesperado al actualizar el producto.', // TODO
            descripcionCorta: '',
            descripcionCompleta: '',
            videoUrl: 'https://vimeo.com/1185536296?fl=ip&fe=ec', // TODO
            videoId: '1185536296', // TODO
            videoThumbnail: '',
            duration: 3600,
            level: 1,
            order: i,
            materials: ['banda elastica', 'banco'],
            visibleInLibrary: true,
            pdfUrl: '',
            titulo: '',
            vimeoVideoId: '',
            orden: 0,
          })),
        },
      ],
      imagenCheckoutPublicId: 'my_uploads/vvjbwcqxcrncvk90nmzs',
      vimeoGaleriaId: '',
      hero: {
        videoPresentacionVimeoId: '1160337707',
        tagline: 'De la rigidez a volver a sentir que tu cuerpo es tuyo.',
        ctaTexto: 'Agendar una llamada',
        ctaSubcopy:
          'Un programa para entender tu cuerpo, eliminar la rigidez y construir una práctica que te permita moverte con confianza durante toda la vida.',
        rutaUsuarioSuscriptor: '/biblioteca',
        anclaPlanesId: 'membership-plans',
      },
      navegacion: { ctaBarraMovil: 'Agendar llamada' },
      presentacionTestimonios: {
        tituloVideos: 'Testimonios de alumn@s :)',
        tituloEscritos: 'Testimonios escritos',
        eyebrowEscritos: 'Palabras propias',
        textoPlaceholderVideo: 'Acá va un video de cliente (embed próximo).',
        anclaVideos: 'course-testimonios-video',
        anclaEscritos: 'course-testimonios-escritos',
      },
      betweenHero: {
        eyebrow: 'Cuerpo autónomo',
        titulo: 'El método ordenado, claro y profundo para…',
        parrafos: [
          'Dejar atrás la rigidez y la incertidumbre de no saber qué hacer con tu cuerpo.',
          'Reconectar con el movimiento a través de una práctica que disfrutes y puedas sostener en el tiempo.',
          'Desarrollar el criterio para entrenar con confianza, entender tu cuerpo y volver a sentir que es tuyo.',
        ],
      },
      bannerAncho: {
        cuerpo:
          'Un recorrido 100 % a tu ritmo, con más de 20 sesiones prácticas para acompañarte paso a paso. Vas a compartir el proceso con una comunidad que busca lo mismo que vos. El mapa queda para siempre; el camino lo construís con tu práctica.',
      },
      testimoniosEscritos: [
        {
          nombre: 'Ignacio Luz',
          planEtiqueta: 'Cuerpo autónomo',
          imagenUrl: 'my_uploads/alumnos/testimonios/testimonio_nacho_w87pnz.jpg',
          texto:
            'Cuerpo Autónomo cambió la forma en la que entiendo mi cuerpo. Dejé de buscar ejercicios sueltos para empezar a comprender qué necesitaba realmente. Hoy me siento mucho más conectado con mi movimiento y tengo herramientas para seguir progresando por mi cuenta.',
          orden: 0,
        },
        {
          nombre: 'Sofía Velozo',
          planEtiqueta: 'Cuerpo Autonomo',
          imagenUrl: 'my_uploads/alumnos/testimonios/sofia_ln0kji.jpg',
          texto:
            'Nunca había sentido un cambio tan real y sostenido. Cuerpo Autónomo me dio claridad, orden y una forma completamente distinta de relacionarme con el entrenamiento. Ahora sé por qué hago cada cosa y disfruto mucho más el proceso.',
          orden: 1,
        },
        {
          nombre: 'Gonzalo Amado',
          planEtiqueta: 'Cuerpo Autonomo',
          imagenUrl: 'my_uploads/alumnos/testimonios/gonza_gmyvzj.jpg',
          texto:
            'Lo que más me llevo de Cuerpo Autónomo es la confianza. Dejé de tener miedo a moverme, empecé a entender los límites de mi cuerpo y descubrí que podía construir una práctica que realmente disfruto. Hoy me siento mucho más libre en mi movimiento.',
          orden: 2,
        },
      ],
      testimoniosGrabados: [],
      introHighlights: {
        titulo: 'Cuerpo autónomo',
        subtitulo: '¿Como funciona?',
        cuerpo:
          'Un programa 100 % online con más de 25 clases, material práctico, manuales, una comunidad y 6 meses de encuentros en vivo para acompañarte paso a paso.\n\nNo vas a memorizar ejercicios. Vas a aprender a entender tu cuerpo. El programa integra principios de movimiento, entrenamiento, rehabilitación, danza y artes marciales para que desarrolles herramientas que te permitan reducir la rigidez, tomar mejores decisiones y construir una práctica que puedas sostener durante toda la vida.',
        imagenMobilePublicId: 'my_uploads/fondos/DSC01488_jb7nit',
        imagenDesktopPublicId: 'my_uploads/fondos/DSC01832_je5av4',
        imagenAlt: 'Cuerpo autónomo — cómo funciona el método',
      },
      outcomes: {
        imagenPublicId: 'my_uploads/fondos/DSC01642_rioxq5',
        imagenAlt: 'Cuerpo autónomo — resultados en el cuerpo',
        titulo: 'Lo que vas a lograr',
        items: [
          {
            titulo: 'Entendés tu cuerpo',
            cuerpo:
              'Dejás de sentir que tu cuerpo es un misterio. Aprendés a interpretar la rigidez, el dolor y el movimiento para tomar mejores decisiones.',
          },
          {
            titulo: 'Te movés con criterio',
            cuerpo:
              'Dejás de copiar ejercicios sin entender por qué. Construís una práctica que responde a tus necesidades y objetivos.',
          },
          {
            titulo: 'Construís un cuerpo fuerte y adaptable',
            cuerpo:
              'Desarrollás movilidad, fuerza y control para moverte con más confianza en el deporte, el entrenamiento y la vida cotidiana.',
          },
          {
            titulo: 'Recuperás la confianza',
            cuerpo:
              'Perdés el miedo a moverte o lesionarte. Descubrís nuevas posibilidades respetando el momento en el que está tu cuerpo.',
          },
          {
            titulo: 'Cambiás la relación con el movimiento',
            cuerpo:
              'Entrenar deja de ser una obligación para convertirse en una práctica que disfrutás, entendés y elegís sostener.',
          },
          {
            titulo: 'Construís hábitos que perduran',
            cuerpo:
              'Encontrás una forma de practicar que se adapta a tu vida y que podés sostener durante años, sin depender únicamente de la motivación.',
          },
          {
            titulo: 'Dejás de probar de todo',
            cuerpo:
              'Ordenás la información, te enfocás en lo que realmente funciona y dejás de acumular métodos sin una dirección clara.',
          },
          {
            titulo: 'Un mapa para toda la vida',
            cuerpo:
              'No aprendés una rutina. Aprendés una forma de entender tu cuerpo que te permite seguir evolucionando por tu cuenta.',
          },
        ],
      },
      highlights: {
        titulos: ['Tu cuerpo ya sabe adaptarse.', 'Ahora aprendé a guiar ese proceso.'],
        puente:
          'Cuerpo Autónomo está organizado en cuatro módulos que construyen una nueva relación con tu cuerpo, paso a paso.',
        items: [
          {
            titulo: 'Percibir',
            resumen: 'Conocé tu cuerpo antes de intentar cambiarlo.',
            detalle:
              'Aprendés a sentir, respirar y observar. Dejás de pelearte con tu cuerpo para empezar a entender cómo se adaptó y qué necesita realmente. No podés cambiar lo que no percibís.',
            imagenPublicId: 'DSC01884_grva4a',
          },
          {
            titulo: 'Ordenar',
            resumen: 'Construí una vida que acompañe al cuerpo que querés tener.',
            detalle:
              'Entendés cómo los hábitos, el descanso, la alimentación, el estrés y el movimiento forman un mismo sistema. Lo que repetís todos los días es lo que termina construyendo tu cuerpo.',
            imagenPublicId: 'my_uploads/fondos/DSC01472_mvzgw7',
          },
          {
            titulo: 'Construir',
            resumen: 'Desarrollá las capacidades que sostienen un cuerpo autónomo.',
            detalle:
              'Construís movilidad, fuerza, coordinación y resistencia desde un enfoque integrado. No entrenás ejercicios: desarrollás capacidades que te acompañan toda la vida.',
            imagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
          },
          {
            titulo: 'Practicar',
            resumen: 'Llevá todo lo aprendido al movimiento real.',
            detalle:
              'Jugás, explorás, improvisás y resolvés problemas a través del movimiento. Las capacidades dejan de entrenarse por separado y empiezan a aparecer naturalmente en tu práctica.',
            imagenPublicId: 'my_uploads/plaza/DSC03366_ctiejt',
          },
        ],
        ctaEyebrow: 'Empezá hoy',
        ctaTitulo: 'Volvé a sentir que tu cuerpo es tuyo.',
        ctaDescripcion:
          'Construí una práctica que reduzca la rigidez, te devuelva confianza y puedas sostener durante toda la vida.',
        ctaBoton: 'Agendar una llamada',
        ctaImagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
      },
      queIncluye: {
        titulo: 'Esto es lo que incluye tu programa',
        anclaId: 'course-que-incluye',
        offerBlocks: [
          {
            lineas: ['WORKBOOK Y', 'GUÍAS PRÁCTICAS'],
            hint: 'Material descargable para ordenar tu entrenamiento semana a semana.',
            iconKey: 'book',
            lineaDestacadaIndice: null,
          },
          {
            lineas: ['+25 CLASES GRABADAS'],
            hint: 'Clases progresivas para aprender a moverte con seguridad, control y eficiencia.',
            iconKey: 'video',
            lineaDestacadaIndice: null,
          },
          {
            lineas: ['6 MESES DE', 'ENCUENTROS EN VIVO', 'con Mateo'],
            hint: 'Sesiones mensuales de Q&A con Mateo para dudas, ajustes y profundización técnica.',
            iconKey: 'live',
            lineaDestacadaIndice: 2,
          },
          {
            lineas: ['COMUNIDAD'],
            hint: 'Un espacio con personas que están siguiendo el mismo proceso y método.',
            iconKey: 'community',
            lineaDestacadaIndice: null,
          },
        ],
        modulos: [
          {
            titulo: 'Regulación (trabajos internos)',
            descripcion: 'Respiración y calma del sistema para bajar tensión.',
            imagenPublicId: 'DSC01884_grva4a',
          },
          {
            titulo: 'Arquitectura corporal (postura: pies y columna)',
            descripcion: 'Base y eje para sostenerte con menos esfuerzo.',
            imagenPublicId: 'my_uploads/fondos/DSC01472_mvzgw7',
          },
          {
            titulo: 'Capacidades (movilidad, fuerza y coordinación)',
            descripcion: 'Vigor y agilidad para el día a día real.',
            imagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
          },
          {
            titulo: 'Expresión (el lenguaje: lucha y danza)',
            descripcion: 'Suelo, flujo y juego cuando ya hay estructura.',
            imagenPublicId: 'my_uploads/plaza/DSC03366_ctiejt',
          },
          {
            titulo: 'Rehabilitación (prevención de lesiones)',
            descripcion: 'Criterio para ajustar, sanar molestias y progresar con seguridad.',
            imagenPublicId: 'my_uploads/fondos/DSC01642_rioxq5',
          },
        ],
      },
      planes: {
        anclaId: 'membership-plans',
        titulo: 'Accedé a todo el método hoy mismo',
        parrafosValor: [
          'Un entrenador privado te cobraría más de $2,000 USD por este nivel de estructura y seguimiento.',
          'Un entrenamiento sin criterio te hace perder años de vida y dinero en cursos que no funcionan.',
          'Hoy, podés tener el mapa completo para recuperar tu soberanía, los encuentros en vivo conmigo y un rehabilitador por una parte mínima de este monto.',
        ],
        etiquetaFormasPago: 'Formas de pago y financiación',
        copyUruguayLatam:
          'Uruguay y Latinoamérica: Pagá en tu moneda local y aprovechá hasta 12 cuotas con Mercado Pago.',
        copyRestoMundo:
          'Resto del Mundo (Stripe): Pago rápido en USD mediante tarjetas internacionales, Apple Pay o Google Pay.',
        copyCuotasTarjeta: 'Hasta 12 cuotas · Uruguay y Latinoamérica con Mercado Pago',
        imagenPagosUrl: '/images/logos/tarjetasmpstripe2.png',
        imagenPagosAlt: 'Pagos con Mercado Pago y Stripe.',
        diasUrgencia: 7,
        emailSinPlanes: 'hola@mformove.com',
        ctaSinPlanes: 'Recibir novedades',
        mensajeSinPlanes:
          'Estoy actualizando los planes en este momento. Si querés reservar tu lugar, escribime o tocá el botón para recibir novedades.',
        proveedoresHabilitados: ['stripe', 'mercadopago'],
        opcionesPago: [
          {
            proveedor: 'stripe',
            etiqueta: 'Empezar AHORA',
            descripcion: 'Pago único con tarjetas internacionales, Apple Pay y Google Pay.',
            monto: 220,
            moneda: 'USD',
            paymentLink: 'https://buy.stripe.com/test_14AfZid0G4j25U0dii8IU0T', // TODO: reemplazar por link LIVE desde el dashboard
            activo: true,
            stripePriceId: 'price_1TgQzdJzWKYFnVw7UCjARKXH', // TODO: TEST
            stripeProductId: 'prod_UfmYZrdwVLnVV5', // TODO: TEST
          },
          {
            proveedor: 'mercadopago',
            etiqueta: 'Empezar AHORA (Mercado Pago)',
            descripcion: 'Pago con Mercado Pago y hasta 12 cuotas en tarjeta.',
            monto: 220,
            moneda: 'USD',
            paymentLink:
              'https://sandbox.mercadopago.com.uy/checkout/v1/redirect?pref_id=202245413-7f416e12-9e06-4e91-a8a5-126558b5bc8a', // TODO: reemplazar por preferencia real (no sandbox)
            activo: true,
            mercadoPagoPreferenceId: '202245413-7f416e12-9e06-4e91-a8a5-126558b5bc8a', // TODO: TEST/sandbox
            mercadoPagoExternalReference: null, // se completa después del insert con el _id real
          },
        ],
      },
      whatsapp: {
        imagenMobilePublicId: 'my_uploads/fondos/FondoHablarConmigoMobile_mkhcgy',
        imagenDesktopPublicId: 'FondoHablarConmigoWeb5_nogmad',
        imagenAlt: 'Mateo Molfin',
        titulo: '¿Tienes preguntas?',
        ctaTexto: 'Agendar una llamada',
        enlace:
          'https://wa.me/59898964142?text=Hola%20Mateo!%20Quiero%20recuperar%20mi%20autonom%C3%ADa%20f%C3%ADsica%20con%20tu%20m%C3%A9todo.%20Tengo%20una%20duda%20sobre%20el%20programa%20antes%20de%20inscribirme.%20Mi%20nombre%20es:',
        invitacionGrupoWhatsapp: '',
        grupoWhatsapp: '',
      },
      faq: {
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
            pregunta: '¿Qué pasa cuando termino los 3 módulos?',
            respuesta:
              'Ahí empieza otra etapa. Los módulos te dan las bases para entender tu cuerpo y desarrollar movilidad, fuerza y coordinación. Después podés seguir practicando, profundizando y utilizando los nuevos contenidos, clases y encuentros de la academia para continuar construyendo tu cuerpo según tus propios objetivos.',
            orden: 2,
          },
          {
            pregunta: '¿Necesito experiencia previa?',
            respuesta:
              'No. Podés empezar desde cero o sumarte aunque ya entrenes. El recorrido comienza por aprender a percibir y entender mejor tu cuerpo antes de avanzar hacia el desarrollo de capacidades más complejas. Cada persona adapta la práctica a su propio punto de partida.',
            orden: 3,
          },
          {
            pregunta: '¿Cuánto tiempo tengo que dedicarle?',
            respuesta:
              'No buscamos que Cuerpo Autónomo se convierta en otra obligación difícil de sostener. Como referencia, podés empezar dedicando entre 2 y 3 momentos por semana a las clases y prácticas. El contenido está disponible para que avances a tu ritmo y puedas integrarlo a tu vida.',
            orden: 4,
          },
          {
            pregunta: '¿Cómo funciona el acompañamiento?',
            respuesta:
              'No hacés el proceso completamente solo. Durante tu recorrido tenés acceso a la comunidad para compartir dudas y avances, llamadas grupales semanales para profundizar en los temas que estamos trabajando y una clase virtual mensual para practicar juntos. Los encuentros pueden estar acompañados por Mateo, Nico y otros profesionales invitados.',
            orden: 5,
          },
          {
            pregunta: '¿Qué es la sesión individual con un profesional?',
            respuesta:
              'Al formar parte de la academia tenés acceso a una sesión individual online, por única vez, con el profesional del equipo que consideres más adecuado para tu momento. Podés elegir una mirada más orientada al movimiento y entrenamiento, los hábitos o situaciones físicas puntuales.',
            orden: 6,
          },
          {
            pregunta: '¿Qué pasa si me pierdo una semana?',
            respuesta:
              'No pasa nada. No necesitás seguir el ritmo de nadie. Las clases principales están disponibles para que avances a tu propio ritmo y puedas retomar cuando lo necesites. La idea es construir una práctica sostenible, no agregar presión.',
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
      },
      ctaFinal: {
        titulo: 'Si esto es lo que te pasa — Volvé a sentirte dueño de tus movimientos.',
        cuerpo:
          'Elegí tu forma de pago y empezá con un camino claro: menos dolor, más calma, más fuerza útil y autonomía real.',
        boton: 'Entrar ahora',
        anclaId: 'membership-plans',
      },
    },
    etiquetas: [],
    createdAt: now,
    updatedAt: now,
    stripeProductId: 'prod_UXIZuzjvSBR2k8', // TODO: reemplazar por Product ID LIVE de Stripe
  };
}

async function main() {
  console.log(CONFIRM ? '🚀 Modo ejecución (--confirm): va a escribir en PRODUCCIÓN.' : '🧪 Dry-run: no se escribe nada. Pasá --confirm para ejecutar.');
  console.log('Conectando a producción...');
  await mongoose.connect(PRODUCTION_URI);
  console.log('✅ Conectado a', mongoose.connection.name);

  const productDoc = buildProductDoc();

  if (!CONFIRM) {
    console.log('\n--- Resumen (dry-run) ---');
    console.log('Producto:', productDoc.nombre, '| slug:', productDoc.cursoConfig.slug);
    console.log('Módulos:', productDoc.cursoConfig.contenidoModulos.length);
    const totalClases = productDoc.cursoConfig.contenidoModulos.reduce((n, m) => n + m.clases.length, 0);
    console.log('Clases totales a crear como CourseClass:', totalClases);
    console.log('publicado:', productDoc.cursoConfig.publicado, '| fechaPublicacion:', productDoc.cursoConfig.fechaPublicacion);
    console.log('\nNada escrito. Revisá el script y corré con --confirm cuando estés listo.');
    await mongoose.disconnect();
    return;
  }

  // 1) Insertar el producto
  const created = await Product.create(productDoc);
  const productId = created._id;
  console.log('✅ Producto creado en producción con _id:', productId.toString());

  // 2) Crear CourseClass por cada clase embebida y reescribir courseClassId
  const modulos = created.cursoConfig.contenidoModulos;
  for (const modulo of modulos) {
    for (const clase of modulo.clases) {
      const courseClassDoc = await CourseClass.create({
        productId,
        timelineIndex: modulo.timelineIndex,
        name: clase.name,
        description: clase.description,
        descripcionGeneral: clase.descripcionGeneral,
        descripcionCorta: clase.descripcionCorta,
        descripcionCompleta: clase.descripcionCompleta,
        pdfUrl: clase.pdfUrl,
        videoUrl: clase.videoUrl,
        videoId: clase.videoId,
        videoThumbnail: clase.videoThumbnail,
        duration: clase.duration,
        level: clase.level,
        order: clase.order,
        materials: clase.materials,
        visibleInLibrary: clase.visibleInLibrary,
      });
      clase.courseClassId = String(courseClassDoc._id);
    }
  }

  // 3) Regenerar mercadoPagoExternalReference con el _id real
  const suffix = Math.random().toString(36).slice(2, 10);
  const mpOption = created.cursoConfig.planes.opcionesPago.find((o) => o.proveedor === 'mercadopago');
  if (mpOption) {
    mpOption.mercadoPagoExternalReference = `curso-mp-${productId.toString()}-${suffix}`;
  }

  created.markModified('cursoConfig');
  await created.save();

  console.log('✅ CourseClass sincronizadas:', modulos.reduce((n, m) => n + m.clases.length, 0));
  console.log('\n--- Pendiente por tu lado (dashboard admin, en producción) ---');
  console.log('1) Reemplazar paymentLink/stripePriceId/stripeProductId (Stripe, hoy TEST) por los LIVE.');
  console.log('2) Reemplazar paymentLink/mercadoPagoPreferenceId (MercadoPago, hoy sandbox) por los reales.');
  console.log('3) Cargar el contenido real (video + descripciones) de las clases que quedaron con placeholder.');
  console.log('4) Cuando esté todo listo: setear cursoConfig.fechaPublicacion y/o publicado=true.');
  console.log('\nProductId:', productId.toString());

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
