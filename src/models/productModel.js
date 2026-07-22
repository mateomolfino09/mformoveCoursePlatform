import mongoose from 'mongoose';

const ubicacionSchema = new mongoose.Schema({
  display_name: { type: String },
  lat: { type: String },
  lon: { type: String },
  ciudad: { type: String },
  pais: { type: String }
}, { _id: false });

const cursoTestimonioEscritoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  planEtiqueta: { type: String, default: '' },
  imagenUrl: { type: String, required: true },
  texto: { type: String, required: true },
  orden: { type: Number, default: 0 },
}, { _id: false });

const cursoTestimonioGrabadoSchema = new mongoose.Schema({
  videoVimeoId: { type: String, required: true },
  posterUrl: { type: String },
  titulo: { type: String },
  orden: { type: Number, default: 0 },
}, { _id: false });

const cursoOfferBlockSchema = new mongoose.Schema({
  lineas: [{ type: String }],
  hint: { type: String, default: '' },
  iconKey: { type: String, default: 'book' },
  lineaDestacadaIndice: { type: Number, default: null },
}, { _id: false });

const cursoModuloLandingSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  imagenPublicId: { type: String, default: '' },
}, { _id: false });

const cursoOutcomeSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  cuerpo: { type: String, default: '' },
}, { _id: false });

const cursoHighlightSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  resumen: { type: String, default: '' },
  detalle: { type: String, default: '' },
  imagenPublicId: { type: String, default: '' },
}, { _id: false });

const cursoFaqItemSchema = new mongoose.Schema({
  pregunta: { type: String, required: true },
  respuesta: { type: String, required: true },
  orden: { type: Number, default: 0 },
}, { _id: false });

const cursoPlanPagoSchema = new mongoose.Schema({
  proveedor: { type: String, enum: ['stripe', 'dlocalgo', 'mercadopago'], required: true },
  etiqueta: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  monto: { type: Number, default: 0 },
  moneda: { type: String, default: 'USD' },
  paymentLink: { type: String, default: '' },
  activo: { type: Boolean, default: true },
  stripePriceId: { type: String },
  stripeProductId: { type: String },
  dlocalOrderId: { type: String },
  dlocalPaymentId: { type: String },
  merchantCheckoutToken: { type: String },
  mercadoPagoPreferenceId: { type: String },
  mercadoPagoExternalReference: { type: String },
}, { _id: false });

const cursoClaseContenidoSchema = new mongoose.Schema({
  courseClassId: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  descripcionGeneral: { type: String, default: '' },
  descripcionCorta: { type: String, default: '' },
  descripcionCompleta: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  videoId: { type: String, default: '' },
  videoThumbnail: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  level: { type: Number, min: 1, max: 10, default: 1 },
  order: { type: Number, default: 0 },
  materials: {
    type: [{ type: String, enum: ['pelota', 'baston', 'banda elastica', 'banco', 'bloque', 'libreta', 'lapicera'] }],
    default: [],
  },
  visibleInLibrary: { type: Boolean, default: true },
  pdfUrl: { type: String, default: '' },
  /** Legacy */
  titulo: { type: String, default: '' },
  vimeoVideoId: { type: String, default: '' },
  duracionMinutos: { type: Number },
  orden: { type: Number, default: 0 },
}, { _id: false });

const cursoModuloContenidoSchema = new mongoose.Schema({
  timelineIndex: { type: Number, required: true },
  titulo: { type: String, default: '' },
  esencia: { type: String, default: '' },
  bundleTipo: { type: String, enum: ['vimeo_playlist', 'videos'], default: 'videos' },
  vimeoPlaylistId: { type: String, default: '' },
  clases: [cursoClaseContenidoSchema],
}, { _id: false });

const cursoPrecioPreventaSchema = new mongoose.Schema({
  etiqueta: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  monto: { type: Number, required: true },
  moneda: { type: String, default: 'USD' },
  fechaFin: { type: Date, required: true },
  cuposLimite: { type: Number, required: true, min: 1 },
  cuposUsados: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  orden: { type: Number, default: 0 },
  opcionesPago: [cursoPlanPagoSchema],
});

const cursoLandingConfigSchema = new mongoose.Schema({
  slug: { type: String, trim: true, lowercase: true },
  publicado: { type: Boolean, default: false },
  fechaPublicacion: { type: Date, default: null },
  preciosPreventa: [cursoPrecioPreventaSchema],
  /** session_id de Stripe u otros IDs para no contar dos veces el mismo pago en preventa */
  preventaRedencionesSessionIds: [{ type: String }],
  contenidoModulos: [cursoModuloContenidoSchema],
  imagenCheckoutPublicId: { type: String, default: '' },
  vimeoGaleriaId: { type: String, default: '' },
  hero: {
    videoPresentacionVimeoId: { type: String, default: '' },
    tagline: { type: String, default: '' },
    ctaTexto: { type: String, default: '' },
    ctaSubcopy: { type: String, default: '' },
    rutaUsuarioSuscriptor: { type: String, default: '/biblioteca' },
    anclaPlanesId: { type: String, default: 'membership-plans' },
  },
  navegacion: {
    ctaBarraMovil: { type: String, default: 'Empezar Camino' },
  },
  presentacionTestimonios: {
    tituloVideos: { type: String, default: '' },
    tituloEscritos: { type: String, default: '' },
    eyebrowEscritos: { type: String, default: '' },
    textoPlaceholderVideo: { type: String, default: '' },
    anclaVideos: { type: String, default: 'course-testimonios-video' },
    anclaEscritos: { type: String, default: 'course-testimonios-escritos' },
  },
  betweenHero: {
    eyebrow: { type: String, default: '' },
    titulo: { type: String, default: '' },
    parrafos: [{ type: String }],
  },
  bannerAncho: {
    cuerpo: { type: String, default: '' },
  },
  testimoniosEscritos: [cursoTestimonioEscritoSchema],
  testimoniosGrabados: [cursoTestimonioGrabadoSchema],
  introHighlights: {
    titulo: { type: String, default: '' },
    subtitulo: { type: String, default: '' },
    cuerpo: { type: String, default: '' },
    imagenMobilePublicId: { type: String, default: '' },
    imagenDesktopPublicId: { type: String, default: '' },
    imagenAlt: { type: String, default: '' },
  },
  outcomes: {
    imagenPublicId: { type: String, default: '' },
    imagenAlt: { type: String, default: '' },
    titulo: { type: String, default: '' },
    items: [cursoOutcomeSchema],
  },
  highlights: {
    titulos: [{ type: String }],
    puente: { type: String, default: '' },
    items: [cursoHighlightSchema],
    ctaEyebrow: { type: String, default: '' },
    ctaTitulo: { type: String, default: '' },
    ctaDescripcion: { type: String, default: '' },
    ctaBoton: { type: String, default: '' },
    ctaImagenPublicId: { type: String, default: '' },
  },
  queIncluye: {
    titulo: { type: String, default: '' },
    anclaId: { type: String, default: 'course-que-incluye' },
    offerBlocks: [cursoOfferBlockSchema],
    modulos: [cursoModuloLandingSchema],
  },
  planes: {
    anclaId: { type: String, default: 'membership-plans' },
    titulo: { type: String, default: '' },
    parrafosValor: [{ type: String }],
    etiquetaFormasPago: { type: String, default: '' },
    copyUruguayLatam: { type: String, default: '' },
    copyRestoMundo: { type: String, default: '' },
    copyCuotasTarjeta: { type: String, default: '' },
    imagenPagosUrl: { type: String, default: '' },
    imagenPagosAlt: { type: String, default: '' },
    diasUrgencia: { type: Number, default: 7 },
    emailSinPlanes: { type: String, default: '' },
    ctaSinPlanes: { type: String, default: '' },
    mensajeSinPlanes: { type: String, default: '' },
    /** Métodos de pago habilitados al crear/editar: stripe | dlocalgo | mercadopago */
    proveedoresHabilitados: {
      type: [{ type: String, enum: ['stripe', 'dlocalgo', 'mercadopago'] }],
      default: undefined,
    },
    opcionesPago: [cursoPlanPagoSchema],
  },
  whatsapp: {
    imagenMobilePublicId: { type: String, default: '' },
    imagenDesktopPublicId: { type: String, default: '' },
    imagenAlt: { type: String, default: '' },
    titulo: { type: String, default: '' },
    ctaTexto: { type: String, default: '' },
    enlace: { type: String, default: '' },
    invitacionGrupoWhatsapp: { type: String, default: '' },
    /** @deprecated usar invitacionGrupoWhatsapp */
    grupoWhatsapp: { type: String, default: '' },
  },
  faq: {
    anclaId: { type: String, default: 'membership-faq' },
    titulo: { type: String, default: '' },
    intro: { type: String, default: '' },
    items: [cursoFaqItemSchema],
  },
  ctaFinal: {
    titulo: { type: String, default: '' },
    cuerpo: { type: String, default: '' },
    boton: { type: String, default: '' },
    anclaId: { type: String, default: 'membership-plans' },
  },
}, { _id: false });

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true, minLength: 20 },
  tipo: { type: String, enum: ['curso', 'bundle', 'evento', 'programa_transformacional', 'recurso'], required: true },
  precio: { type: Number, required: true },
  moneda: { type: String, default: 'USD' },
  imagenes: [{ type: String }], // URLs de imágenes
  portada: { type: String }, // URL de la imagen de portada
  portadaMobile: { type: String }, // URL de la imagen de portada para móviles
  /** Imagen vertical 3:4 para el carrusel de /bio (eventos). */
  imagenBio: { type: String },
  precios: { type: Object }, // Objeto con earlyBird, general, lastTickets
  paymentLinks: { type: Object }, // Links de pago para cada precio
  stripeProductId: { type: String }, // ID del producto en Stripe
  activo: { type: Boolean, default: true },
  destacado: { type: Boolean, default: false },

  // --- Eventos ---
  fecha: { type: Date },
  ubicacion: { type: ubicacionSchema },
  online: { type: Boolean },
  linkEvento: { type: String }, // Zoom, Meet, etc.
  cupo: { type: Number },
  pdfPresentacionUrl: { type: String }, // PDF de presentación para eventos
  beneficios: [{ type: String }], // Lista de beneficios del evento
  aprendizajes: {
    type: [String],
    default: [],
  },
  paraQuien: {
    type: [String],
    default: [],
  },
  /** Invitación al grupo de WhatsApp del curso/evento (chat.whatsapp.com/…). */
  invitacionGrupoWhatsapp: { type: String },
  /** @deprecated usar invitacionGrupoWhatsapp */
  grupoWhatsapp: { type: String },

  // --- Programas Transformacionales (extensión de eventos) ---
  esProgramaTransformacional: { type: Boolean, default: false },
  programaTransformacional: {
    duracionSemanas: { type: Number, default: 8 },
    fechaFin: { type: Date }, // Fecha de finalización del programa
    cupoDisponible: { type: Number }, // Cupo actual disponible
    estadoCohorte: { type: String, enum: ['abierta', 'cerrada', 'en_curso', 'finalizada'], default: 'abierta' },
    
    // Automatización de contenido
    automatizacion: {
      activa: { type: Boolean, default: false },
      emailsAutomaticos: { type: Boolean, default: true },
      contenidoVimeo: { type: Boolean, default: true }
    },
    
    semanas: [{
      numero: { type: Number, required: true },
      titulo: { type: String, required: true },
      descripcion: { type: String },
      fechaDesbloqueo: { type: Date, required: true }, // Fecha específica para desbloquear
      vimeoVideoId: { type: String }, // ID del video de Vimeo para esta semana
      emailTemplate: {
        asunto: { type: String },
        contenido: { type: String }, // HTML del email
        enviado: { type: Boolean, default: false },
        fechaEnvio: { type: Date }
      },
      contenido: [{
        tipo: { type: String, enum: ['video', 'pdf', 'audio', 'tarea', 'practica', 'reflexion'] },
        titulo: { type: String, required: true },
        url: { type: String },
        duracion: { type: Number }, // en minutos
        descripcion: { type: String },
        orden: { type: Number, default: 0 }
      }],
      desbloqueado: { type: Boolean, default: false }
    }],
    sesionesEnVivo: [{
      fecha: { type: Date, required: true },
      titulo: { type: String, required: true },
      descripcion: { type: String },
      linkZoom: { type: String },
      grabacionUrl: { type: String },
      duracion: { type: Number }, // en minutos
      tipo: { type: String, enum: ['q&a', 'practica', 'reflexion', 'comunidad'], default: 'q&a' }
    }],
    comunidad: {
      invitacionGrupoWhatsapp: { type: String },
      grupoWhatsapp: { type: String },
      grupoTelegram: { type: String },
      foroUrl: { type: String },
      descripcion: { type: String }
    },
    resultadosEsperados: [{ type: String }], // Qué logrará el alumno
    requisitosPrevios: [{ type: String }], // Qué necesita saber antes
    materialesNecesarios: [{ type: String }] // Qué necesita tener
  },

  // --- Recursos descargables ---
  archivoUrl: { type: String }, // PDF, video, audio, etc.
  tipoArchivo: { type: String, enum: ['pdf', 'video', 'audio', 'zip'] },

  // --- Curso (landing comercial tipo Cuerpo autónomo) ---
  cursoConfig: cursoLandingConfigSchema,

  // --- Comunes ---
  etiquetas: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // --- Descuento familia y amigos ---
  descuento: {
    codigo: { type: String },
    porcentaje: { type: Number },
    maxUsos: { type: Number },
    expiracion: { type: Date },
  },

  // --- Legacy/compatibilidad (puedes eliminar estos campos cuando migres todo) ---
  // phraseName, intro_video_url, paymentLink, classesQuantity, image_url, url, diploma_url, likes, vimeoShowCaseId, classes, modules, users, created_by, productType, frequentQuestions
}, { timestamps: true });

let Dataset = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Dataset;