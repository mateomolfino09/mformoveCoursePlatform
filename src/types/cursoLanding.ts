import {
  COURSE_CLASS_MATERIALS,
  type CourseClassFields,
  type CourseClassMaterial,
} from './courseClass';

export type { CourseClassFields, CourseClassMaterial };

export type CursoTestimonioEscrito = {
  nombre: string;
  planEtiqueta: string;
  imagenUrl: string;
  texto: string;
  orden: number;
};

export type CursoTestimonioGrabado = {
  videoVimeoId: string;
  posterUrl?: string;
  titulo?: string;
  orden: number;
};

export type CursoOfferBlock = {
  lineas: string[];
  hint: string;
  iconKey: string;
  lineaDestacadaIndice?: number | null;
};

export type CursoModuloLanding = {
  titulo: string;
  descripcion: string;
  imagenPublicId: string;
};

export type CursoOutcome = {
  titulo: string;
  cuerpo: string;
};

export type CursoHighlight = {
  titulo: string;
  resumen: string;
  detalle: string;
  /** Cloudinary public id; si falta en BD, la landing usa la del módulo con el mismo título o la imagen del CTA del timeline. */
  imagenPublicId?: string;
  /** Etiqueta de ritmo sugerido para esta etapa (ej. "Semanas 1-4"), opcional. */
  duracion?: string;
};

export type CursoFaqItem = {
  pregunta: string;
  respuesta: string;
  orden: number;
};

export type CursoPlanPago = {
  proveedor: 'stripe' | 'dlocalgo' | 'mercadopago';
  etiqueta: string;
  descripcion: string;
  monto: number;
  moneda: string;
  paymentLink: string;
  activo: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  dlocalOrderId?: string;
  dlocalPaymentId?: string;
  merchantCheckoutToken?: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoExternalReference?: string;
  /** 1 = mensual (o pago único), 4 = cada 4 meses. */
  intervaloMeses?: number;
};

export function cursoPlanPagoKey(plan: CursoPlanPago, index: number): string {
  if (plan.stripePriceId) return plan.stripePriceId;
  return `${plan.proveedor}-${plan.intervaloMeses ?? 1}-${index}`;
}

/**
 * Clase dentro de un módulo de contenido del curso.
 * Misma forma que ModuleClass (name, video, materials, level…) para la vista de práctica.
 */
export type CursoClaseContenido = CourseClassFields & {
  /** @deprecated usar `name` */
  titulo?: string;
  /** @deprecated usar `videoId` */
  vimeoVideoId?: string;
  /** @deprecated usar `duration` (segundos) */
  duracionMinutos?: number;
  /** Describe el concepto central y su función en el módulo. */
  descripcionGeneral?: string;
  /** Copy corto orientado a interés/venta. */
  descripcionCorta?: string;
  /** Narrativa completa y contexto para el alumno. */
  descripcionCompleta?: string;
};

export function normalizeClaseContenido(
  raw: Partial<CursoClaseContenido> | null | undefined,
  orden = 0
): CursoClaseContenido {
  const name = String(raw?.name || raw?.titulo || '').trim();
  const videoId = String(raw?.videoId || raw?.vimeoVideoId || '').trim();
  let duration = Number(raw?.duration) || 0;
  if (!duration && typeof raw?.duracionMinutos === 'number' && raw.duracionMinutos > 0) {
    duration = Math.round(raw.duracionMinutos * 60);
  }
  const materials = Array.isArray(raw?.materials)
    ? raw.materials.filter((m): m is CourseClassMaterial =>
        COURSE_CLASS_MATERIALS.includes(m as CourseClassMaterial)
      )
    : [];

  const legacyDescription = String(raw?.description || '');
  const descripcionGeneral =
    String(raw?.descripcionGeneral || '').trim() || legacyDescription;

  return {
    courseClassId: raw?.courseClassId,
    name,
    description: legacyDescription,
    descripcionGeneral,
    descripcionCorta: String(raw?.descripcionCorta || ''),
    descripcionCompleta: String(raw?.descripcionCompleta || ''),
    videoUrl: String(raw?.videoUrl || ''),
    videoId,
    videoThumbnail: String(raw?.videoThumbnail || ''),
    duration,
    level: Math.min(10, Math.max(1, Number(raw?.level) || 1)),
    order: typeof raw?.order === 'number' ? raw.order : orden,
    materials,
    visibleInLibrary: raw?.visibleInLibrary !== false,
    pdfUrl: String(raw?.pdfUrl || '').trim(),
    pdfNombre: String(raw?.pdfNombre || '').trim(),
    pdfPublicId: String(raw?.pdfPublicId || '').trim(),
    pdfResourceType: String(raw?.pdfResourceType || '').trim(),
  };
}

export type CursoRecursoTipo = 'clase' | 'archivo';

/** Recurso extra del curso, fuera de los módulos. Clase (video) o archivo descargable. */
export type CursoRecursoAdicional = {
  recursoId: string;
  tipo: CursoRecursoTipo;
  titulo: string;
  descripcion: string;
  videoUrl: string;
  videoId: string;
  videoThumbnail: string;
  duration: number;
  archivoUrl: string;
  archivoNombre: string;
  archivoPublicId: string;
  archivoResourceType: string;
  orden: number;
};

export function createDefaultRecursoAdicional(orden = 0): CursoRecursoAdicional {
  return {
    recursoId:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `recurso-${Date.now()}-${orden}`,
    tipo: 'archivo',
    titulo: '',
    descripcion: '',
    videoUrl: '',
    videoId: '',
    videoThumbnail: '',
    duration: 0,
    archivoUrl: '',
    archivoNombre: '',
    archivoPublicId: '',
    archivoResourceType: '',
    orden,
  };
}

export function normalizeRecursoAdicional(
  raw: Partial<CursoRecursoAdicional> | null | undefined,
  orden = 0
): CursoRecursoAdicional {
  const tipo: CursoRecursoTipo = raw?.tipo === 'clase' ? 'clase' : 'archivo';
  const duration = Number(raw?.duration) || 0;
  return {
    recursoId: String(raw?.recursoId || '').trim() || `recurso-${orden}`,
    tipo,
    titulo: String(raw?.titulo || '').trim(),
    descripcion: String(raw?.descripcion || '').trim(),
    videoUrl: String(raw?.videoUrl || '').trim(),
    videoId: String(raw?.videoId || '').trim(),
    videoThumbnail: String(raw?.videoThumbnail || '').trim(),
    duration,
    archivoUrl: String(raw?.archivoUrl || '').trim(),
    archivoNombre: String(raw?.archivoNombre || '').trim(),
    archivoPublicId: String(raw?.archivoPublicId || '').trim(),
    archivoResourceType: String(raw?.archivoResourceType || '').trim(),
    orden: typeof raw?.orden === 'number' ? raw.orden : orden,
  };
}

export function normalizeRecursosAdicionales(
  items: CursoRecursoAdicional[] | undefined
): CursoRecursoAdicional[] {
  if (!items?.length) return [];
  return items.map((item, index) => normalizeRecursoAdicional(item, index));
}

/** Contenido entregable por ítem del timeline (highlights.items). */
export type CursoModuloContenido = {
  /** Índice en highlights.items */
  timelineIndex: number;
  titulo: string;
  /** Frase que resume la "esencia" del módulo. */
  esencia: string;
  bundleTipo: 'vimeo_playlist' | 'videos';
  /** ID de showcase/álbum Vimeo cuando bundleTipo es vimeo_playlist */
  vimeoPlaylistId: string;
  clases: CursoClaseContenido[];
};

/** Tier de preventa (solo si fecha de lanzamiento es futura). */
export type CursoPrecioPreventa = {
  id?: string;
  etiqueta: string;
  descripcion: string;
  monto: number;
  moneda: string;
  fechaFin: string | null;
  cuposLimite: number;
  cuposUsados: number;
  activo: boolean;
  orden: number;
  opcionesPago: CursoPlanPago[];
};

/** Logo de seguro, patrocinador o validador del producto (landing). */
export type CursoSelloValidacion = {
  imagenPublicId: string;
  alt: string;
  /** URL opcional al hacer click en el sello. */
  enlace: string;
  orden: number;
};

export type CursoLandingConfig = {
  slug: string;
  publicado: boolean;
  fechaPublicacion: string | null;
  /** Default false. Si es true, reemplaza la card de precio anterior por el sello en Inversión. */
  mostrarSellosValidacion: boolean;
  sellosValidacionTitulo: string;
  sellosValidacion: CursoSelloValidacion[];
  preciosPreventa: CursoPrecioPreventa[];
  contenidoModulos: CursoModuloContenido[];
  /** Clases o archivos extra, fuera de los módulos. Se muestran en la biblioteca del curso. */
  recursosAdicionales: CursoRecursoAdicional[];
  imagenCheckoutPublicId: string;
  vimeoGaleriaId: string;
  hero: {
    videoPresentacionVimeoId: string;
    eyebrow: string;
    tagline: string;
    ctaTexto: string;
    ctaSubcopy: string;
    rutaUsuarioSuscriptor: string;
    anclaPlanesId: string;
  };
  navegacion: {
    ctaBarraMovil: string;
  };
  presentacionTestimonios: {
    tituloVideos: string;
    tituloEscritos: string;
    eyebrowEscritos: string;
    textoPlaceholderVideo: string;
    anclaVideos: string;
    anclaEscritos: string;
  };
  betweenHero: {
    eyebrow: string;
    titulo: string;
    parrafos: string[];
    cierre: string;
  };
  bannerAncho: {
    cuerpo: string;
  };
  testimoniosEscritos: CursoTestimonioEscrito[];
  testimoniosGrabados: CursoTestimonioGrabado[];
  /** Sección de autoridad ("El Fundador") — opcional, se oculta si `titulo` está vacío. */
  fundador: {
    eyebrow: string;
    titulo: string;
    bio: string;
    imagenPublicId: string;
    stats: {
      anios: string;
      estudiantes: string;
      paises: string;
    };
  };
  introHighlights: {
    titulo: string;
    subtitulo: string;
    cuerpo: string;
    bloques: { titulo: string; cuerpo: string }[];
    imagenMobilePublicId: string;
    imagenDesktopPublicId: string;
    imagenAlt: string;
  };
  outcomes: {
    imagenPublicId: string;
    imagenAlt: string;
    titulo: string;
    items: CursoOutcome[];
  };
  highlights: {
    titulos: string[];
    puente: string;
    items: CursoHighlight[];
    ctaEyebrow: string;
    ctaTitulo: string;
    ctaDescripcion: string;
    ctaBoton: string;
    ctaImagenPublicId: string;
  };
  queIncluye: {
    titulo: string;
    anclaId: string;
    offerBlocks: CursoOfferBlock[];
    modulos: CursoModuloLanding[];
  };
  planes: {
    anclaId: string;
    titulo: string;
    parrafosValor: string[];
    etiquetaFormasPago: string;
    copyUruguayLatam: string;
    copyRestoMundo: string;
    copyCuotasTarjeta: string;
    imagenPagosUrl: string;
    imagenPagosAlt: string;
    diasUrgencia: number;
    emailSinPlanes: string;
    ctaSinPlanes: string;
    mensajeSinPlanes: string;
    /** stripe | dlocalgo | mercadopago — si falta, se asume stripe+dlocal (legacy). */
    proveedoresHabilitados?: Array<'stripe' | 'dlocalgo' | 'mercadopago'>;
    opcionesPago: CursoPlanPago[];
    /** Checklist "Tu membresía incluye" — solo tiene sentido cuando esSuscripcion:true. */
    beneficiosTitulo: string;
    beneficios: string[];
    /**
     * Default false. Si es true, la sección de planes oculta los montos y el CTA final
     * pasa a ser "Aplicar a {nombre del curso}" (venta por conversación) en vez de checkout directo.
     */
    ventaPorLlamada?: boolean;
    /** Texto de urgencia opcional (ej. cohorte/cupos) mostrado sobre el selector de planes. */
    cohorteUrgenciaTexto?: string;
  };
  whatsapp: {
    imagenMobilePublicId: string;
    imagenDesktopPublicId: string;
    imagenAlt: string;
    titulo: string;
    ctaTexto: string;
    enlace: string;
    /** Invitación al grupo del curso (chat.whatsapp.com/…). El enlace de contacto (`enlace`) es fijo. */
    invitacionGrupoWhatsapp: string;
    /** @deprecated usar invitacionGrupoWhatsapp */
    grupoWhatsapp?: string;
  };
  faq: {
    anclaId: string;
    titulo: string;
    intro: string;
    items: CursoFaqItem[];
  };
  ctaFinal: {
    titulo: string;
    cuerpo: string;
    boton: string;
    anclaId: string;
  };
};

const CURSO_BETWEEN_HERO_PARRAFOS = [
  'Capaz ya entrenás, pero sentís que la movilidad siempre queda pendiente. O querés empezar a moverte más y no sabés bien por dónde arrancar.',
  'En Cuerpo Autónomo trabajamos fuerza, movilidad y coordinación, mientras aprendemos a entender nuestro cuerpo y construir una práctica que podamos sostener en el tiempo.',
];

const CURSO_BETWEEN_HERO_CIERRE = '';

const CURSO_BANNER_ANCHO_CUERPO =
  'Cada persona empieza desde un lugar distinto. Lo que compartimos es la práctica.';

const CURSO_INTRO_CUERPO =
  'En Cuerpo Autónomo tenés un camino para seguir a tu ritmo y un grupo con el que encontrarte todas las semanas para practicar, compartir experiencias y resolver dudas.';

const CURSO_INTRO_BLOQUES: { titulo: string; cuerpo: string }[] = [
  {
    titulo: 'Practicá a tu ritmo',
    cuerpo:
      'Clases organizadas para desarrollar tus capacidades, repetir lo que necesites y avanzar según tus tiempos.',
  },
  {
    titulo: 'Nos encontramos todas las semanas',
    cuerpo:
      'Encuentros grupales conmigo para practicar movimiento, profundizar en lo que estamos aprendiendo y resolver dudas.',
  },
  {
    titulo: 'Compartí el proceso',
    cuerpo:
      'Una comunidad donde podés preguntar, contar cómo te va y aprender junto a otras personas que también están construyendo sus capacidades.',
  },
];

const CURSO_OUTCOMES_PRESETS: Omit<CursoOutcome, 'orden'>[] = [
  {
    titulo: 'Fuerza y movilidad',
    cuerpo: 'Desarrollá capacidades que te ayuden a moverte con mayor libertad y control.',
  },
  {
    titulo: 'Confianza para explorar',
    cuerpo: 'Aprendé a acercarte progresivamente a posiciones y movimientos nuevos.',
  },
  {
    titulo: 'Criterio para entrenar',
    cuerpo:
      'Entendé qué estás practicando, cómo progresar y cuándo adaptar un ejercicio a tu situación.',
  },
  {
    titulo: 'Una práctica sostenible',
    cuerpo: 'Encontrá maneras de incorporar el movimiento a tu semana y retomar cuando perdés el ritmo.',
  },
];

const CURSO_HIGHLIGHTS_PRESETS: Omit<CursoHighlight, 'orden'>[] = [
  {
    titulo: 'Percibir',
    resumen:
      'Aprendé a prestar atención al cuerpo, reconocer sensaciones y explorar cómo te movés.',
    detalle: '',
  },
  {
    titulo: 'Ordenar',
    resumen:
      'Descubrí cómo tus hábitos, tu entorno y tu vida cotidiana influyen sobre tu práctica, y cómo crear condiciones para sostenerla.',
    detalle: '',
  },
  {
    titulo: 'Construir',
    resumen:
      'Trabajá fuerza, movilidad y coordinación, aprendiendo principios para desarrollar esas capacidades progresivamente.',
    detalle: '',
  },
];

const CURSO_MODULOS_PRESETS: Omit<CursoModuloLanding, 'orden'>[] = [
  {
    titulo: 'Percibir',
    descripcion:
      'Aprendé a prestar atención al cuerpo, reconocer sensaciones y explorar cómo te movés.',
    imagenPublicId: 'DSC01884_grva4a',
  },
  {
    titulo: 'Ordenar',
    descripcion:
      'Descubrí cómo tus hábitos, tu entorno y tu vida cotidiana influyen sobre tu práctica.',
    imagenPublicId: 'my_uploads/fondos/DSC01472_mvzgw7',
  },
  {
    titulo: 'Construir',
    descripcion:
      'Trabajá fuerza, movilidad y coordinación, con principios para desarrollarlas progresivamente.',
    imagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
  },
];

const CURSO_FAQ_PRESETS: Omit<CursoFaqItem, 'orden'>[] = [
  {
    pregunta: '¿Para quién es Cuerpo Autónomo?',
    respuesta:
      'Es para quien quiere construir fuerza, movilidad y coordinación, y aprender a entender y entrenar su cuerpo. Sirve si ya te movés y sentís que te falta un criterio, o si querés empezar y no sabés por dónde. No es rehabilitación, terapia ni un entrenamiento individual.',
  },
  {
    pregunta: '¿Necesito experiencia previa?',
    respuesta:
      'No. Podés empezar desde cero o sumarte si ya entrenás. Cada persona adapta la práctica a su punto de partida.',
  },
  {
    pregunta: '¿Cuánto tiempo tengo que dedicarle?',
    respuesta:
      'No hay una carga obligatoria. Las clases están para avanzar a tu ritmo. Como referencia, podés empezar con dos o tres momentos por semana e integrarlos a tu vida.',
  },
  {
    pregunta: '¿Puedo hacerlo si ya voy al gimnasio o practico otro deporte?',
    respuesta:
      'Sí. El gimnasio y otros deportes pueden convivir con la escuela. Cuerpo Autónomo no los reemplaza: suma una práctica para entender y entrenar el cuerpo.',
  },
  {
    pregunta: '¿Qué pasa si una semana no puedo entrenar?',
    respuesta:
      'Podés retomar cuando vuelvas. Durante tu inscripción las clases quedan disponibles para repetirlas y avanzar a tu tiempo. No hace falta seguir el ritmo de nadie.',
  },
  {
    pregunta: '¿Cómo funcionan los encuentros semanales?',
    respuesta:
      'Son encuentros grupales con Mateo para practicar movimiento, profundizar en lo que estamos aprendiendo y resolver dudas. El día y el horario se confirman dentro de la escuela.',
  },
  {
    pregunta: '¿Puedo participar si no llego a los encuentros en vivo?',
    respuesta:
      'Sí. Podés seguir con las clases a tu ritmo y con la comunidad. No está confirmado que los encuentros en vivo queden grabados.',
  },
  {
    pregunta: '¿Qué pasa después de los cuatro meses?',
    respuesta:
      'El checkout actual está armado como una suscripción que se renueva cada 4 meses mientras decidas seguir. No es un acceso de por vida por haber pagado un período. Si la suscripción no se renueva, el acceso de ese período termina.',
  },
  {
    pregunta: '¿Qué acceso conservo a las clases?',
    respuesta:
      'Durante la inscripción tenés las clases de los módulos, los encuentros semanales, la comunidad y los recursos complementarios. No prometemos que las clases queden para siempre después de ese período.',
  },
  {
    pregunta: '¿En qué se diferencia de una mentoría individual?',
    respuesta:
      'La mentoría es un proceso individual. Cuerpo Autónomo es una escuela grupal: practicás a tu ritmo, te encontrás con el grupo cada semana y compartís el proceso con otras personas. No incluye una sesión individual.',
  },
  {
    pregunta: '¿Cómo me inscribo?',
    respuesta:
      'Con el botón «Quiero sumarme», que abre el checkout para pagar directo. La llamada es opcional y no hace falta agendarla para inscribirte.',
  },
  {
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta:
      'El checkout operativo cobra con tarjeta en USD a través de Stripe. Si Mercado Pago está habilitado para tu país, también aparece en el checkout. No prometemos una cantidad fija de cuotas.',
  },
  {
    pregunta: '¿Cuáles son las condiciones de cancelación y devolución?',
    respuesta:
      'La condición publicada hasta ahora es que, una vez activado el acceso, no hay reembolso. La suscripción puede dejar de renovarse; no hay otra política de cancelación confirmada en esta página. Si tenés dudas, mejor conversarlo antes de inscribirte.',
  },
];

const CURSO_TESTIMONIO_ESCRITO_PRESETS: Omit<CursoTestimonioEscrito, 'planEtiqueta' | 'orden'>[] = [
  {
    nombre: 'Ignacio Luz',
    imagenUrl: 'my_uploads/alumnos/testimonios/testimonio_nacho_w87pnz.jpg',
    texto:
      'Cuerpo autónomo con Mateo es una experiencia transformadora. Gracias a su mirada precisa y su acompañamiento constante, hoy me siento mucho más conectado con mi cuerpo y más cerca de los resultados que deseo.',
  },
  {
    nombre: 'Sofía Velozo',
    imagenUrl: 'my_uploads/alumnos/testimonios/sofia_ln0kji.jpg',
    texto:
      'Nunca había sentido un progreso tan real y sostenido. Mateo te motiva, te corrige y te acompaña en cada paso. Recomiendo Cuerpo autónomo a cualquiera que busque un cambio profundo.',
  },
  {
    nombre: 'Gonzalo Amado',
    imagenUrl: 'my_uploads/alumnos/testimonios/gonza_gmyvzj.jpg',
    texto:
      'Mateo como profe es excelente. Siempre te pone a prueba, te motiva y celebra tus intentos, sin importar el resultado. Lo recomiendo al 100% si querés sentirte más libre, con confianza en cada movimiento, y rodeado de un ambiente de amistad.',
  },
];

export const createDefaultTestimonioEscrito = (
  orden: number,
  nombreProducto: string
): CursoTestimonioEscrito => {
  const preset = CURSO_TESTIMONIO_ESCRITO_PRESETS[orden];

  if (!preset) {
    return {
      nombre: '',
      planEtiqueta: nombreProducto,
      imagenUrl: '',
      texto: '',
      orden,
    };
  }

  return {
    ...preset,
    planEtiqueta: nombreProducto,
    orden,
  };
};

export const createDefaultSelloValidacion = (orden = 0): CursoSelloValidacion => ({
  imagenPublicId: '',
  alt: '',
  enlace: '',
  orden,
});

export const createDefaultPrecioPreventa = (orden = 0): CursoPrecioPreventa => ({
  etiqueta: 'Preventa',
  descripcion: 'Precio especial antes del lanzamiento.',
  monto: 0,
  moneda: 'USD',
  fechaFin: null,
  cuposLimite: 50,
  cuposUsados: 0,
  activo: true,
  orden,
  opcionesPago: [],
});

export const createDefaultClaseContenido = (orden = 0): CursoClaseContenido =>
  normalizeClaseContenido(
    {
      name: '',
      description: '',
      descripcionGeneral: '',
      descripcionCorta: '',
      descripcionCompleta: '',
      videoUrl: '',
      videoId: '',
      videoThumbnail: '',
      duration: 0,
      level: 1,
      order: orden,
      materials: [],
      visibleInLibrary: true,
      pdfUrl: '',
      pdfNombre: '',
      pdfPublicId: '',
      pdfResourceType: '',
    },
    orden
  );

export const createDefaultModuloContenido = (
  timelineIndex: number,
  titulo = ''
): CursoModuloContenido => ({
  timelineIndex,
  titulo,
  esencia: '',
  bundleTipo: 'videos',
  vimeoPlaylistId: '',
  clases: [],
});

export function syncContenidoModulosFromHighlights(
  highlights: CursoHighlight[],
  existing: CursoModuloContenido[] = []
): CursoModuloContenido[] {
  return highlights.map((item, index) => {
    const prev =
      existing.find((m) => m.timelineIndex === index) ?? existing[index];
    return {
      timelineIndex: index,
      titulo: item.titulo?.trim() || prev?.titulo || '',
      esencia: prev?.esencia || '',
      bundleTipo: prev?.bundleTipo === 'vimeo_playlist' ? 'vimeo_playlist' : 'videos',
      vimeoPlaylistId: prev?.vimeoPlaylistId || '',
      clases: prev?.clases?.length ? prev.clases : [],
    };
  });
}

export const createDefaultCursoLandingConfig = (nombreProducto = 'Cuerpo autónomo'): CursoLandingConfig => ({
  slug: 'cuerpo-autonomo',
  publicado: false,
  fechaPublicacion: null,
  mostrarSellosValidacion: false,
  sellosValidacionTitulo: 'Respaldado por',
  sellosValidacion: [],
  preciosPreventa: [],
  contenidoModulos: syncContenidoModulosFromHighlights(
    CURSO_HIGHLIGHTS_PRESETS.map((item) => ({ ...item }))
  ),
  recursosAdicionales: [],
  imagenCheckoutPublicId: '',
  vimeoGaleriaId: '',
  hero: {
    videoPresentacionVimeoId: '1160337707',
    eyebrow: 'CUERPO AUTÓNOMO · ESCUELA ONLINE DE MOVIMIENTO',
    tagline: 'Construí un cuerpo fuerte, móvil y capaz.',
    ctaTexto: 'Quiero sumarme',
    ctaSubcopy:
      'Aprendé a entrenar y moverte mejor, con clases a tu ritmo, encuentros semanales y un grupo con el que compartir el proceso.',
    rutaUsuarioSuscriptor: '/biblioteca',
    anclaPlanesId: 'membership-plans',
  },
  navegacion: {
    ctaBarraMovil: 'Quiero sumarme',
  },
  presentacionTestimonios: {
    tituloVideos: 'Testimonios de alumn@s :)',
    tituloEscritos: 'Lo que cuentan quienes ya están practicando.',
    eyebrowEscritos: '',
    textoPlaceholderVideo: 'Acá va un video de cliente (embed próximo).',
    anclaVideos: 'course-testimonios-video',
    anclaEscritos: 'testimonios',
  },
  betweenHero: {
    eyebrow: 'Por qué existe',
    titulo: 'No se trata de entrenar más. Se trata de moverte mejor.',
    parrafos: [...CURSO_BETWEEN_HERO_PARRAFOS],
    cierre: CURSO_BETWEEN_HERO_CIERRE,
  },
  bannerAncho: { cuerpo: CURSO_BANNER_ANCHO_CUERPO },
  testimoniosEscritos: [createDefaultTestimonioEscrito(0, nombreProducto)],
  testimoniosGrabados: [],
  fundador: {
    eyebrow: 'Tu profesor',
    titulo: 'Soy Mateo Molfino.',
    bio: 'Soy profesor de movimiento, instructor de yoga y calistenia.\n\nMe apasiona estudiar el cuerpo humano, entrenar distintas formas de movimiento y acompañar a otras personas a desarrollar sus capacidades.\n\nCreé Cuerpo Autónomo para reunir lo que enseño en un espacio donde podamos practicar, aprender y seguir explorando juntos.',
    imagenPublicId: '',
    stats: { anios: '+5', estudiantes: '+100', paises: '+5' },
  },
  introHighlights: {
    titulo: nombreProducto,
    subtitulo: 'Un espacio para practicar, aprender y seguir avanzando juntos.',
    cuerpo: CURSO_INTRO_CUERPO,
    bloques: CURSO_INTRO_BLOQUES.map((item) => ({ ...item })),
    imagenMobilePublicId: 'my_uploads/plaza/DSC03366_ctiejt',
    imagenDesktopPublicId: 'my_uploads/plaza/DSC03366_ctiejt',
    imagenAlt: `${nombreProducto} — la escuela en práctica`,
  },
  outcomes: {
    imagenPublicId: 'my_uploads/fondos/DSC01642_rioxq5',
    imagenAlt: `${nombreProducto} — práctica de movimiento`,
    titulo: 'Más capacidades para moverte. Más herramientas para seguir aprendiendo.',
    items: CURSO_OUTCOMES_PRESETS.map((item) => ({ ...item })),
  },
  highlights: {
    titulos: [
      'Un camino para aprender a entender y entrenar tu cuerpo.',
      'Empezamos por tres módulos que construyen las bases de tu práctica. Son herramientas para seguir desarrollando capacidades dentro de la escuela.',
    ],
    puente: '',
    items: CURSO_HIGHLIGHTS_PRESETS.map((item, index) => ({
      ...item,
      imagenPublicId:
        CURSO_MODULOS_PRESETS[index]?.imagenPublicId || 'my_uploads/fondos/DSC01753_qdv9o0',
    })),
    ctaEyebrow: '',
    ctaTitulo: '',
    ctaDescripcion: '',
    ctaBoton: 'Quiero sumarme',
    ctaImagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
  },
  queIncluye: {
    titulo: 'Todo lo que necesitás para empezar y seguir practicando.',
    anclaId: 'course-que-incluye',
    offerBlocks: [
      {
        lineas: ['Encuentros grupales semanales'],
        hint: 'Practicamos juntos, profundizamos en lo que estamos trabajando y resolvemos dudas.',
        iconKey: 'live',
      },
      {
        lineas: ['Clases para avanzar a tu ritmo'],
        hint: 'Un camino progresivo que podés adaptar a tus tiempos y volver a recorrer cuando lo necesites.',
        iconKey: 'video',
      },
      {
        lineas: ['Comunidad privada'],
        hint: 'Un espacio para compartir tu práctica, tus preguntas y tus descubrimientos.',
        iconKey: 'community',
      },
      {
        lineas: ['Tres módulos fundacionales'],
        hint: 'Percibir, Ordenar y Construir: las bases para desarrollar capacidades y aprender a entrenarlas.',
        iconKey: 'book',
      },
      {
        lineas: ['Recursos complementarios'],
        hint: 'Material y herramientas para llevar lo que aprendés a tu entrenamiento y a tu vida cotidiana.',
        iconKey: 'health',
      },
    ],
    modulos: CURSO_MODULOS_PRESETS.map((item) => ({ ...item })),
  },
  planes: {
    anclaId: 'membership-plans',
    titulo: 'Sumate a Cuerpo Autónomo.',
    parrafosValor: [
      'Cuatro meses para construir una práctica con dirección, aprender a entrenar tu cuerpo y formar parte de una escuela donde seguimos moviéndonos juntos.',
    ],
    etiquetaFormasPago: 'Formas de pago',
    copyUruguayLatam:
      'El checkout operativo es con tarjeta en USD. Si Mercado Pago está habilitado para tu país, también aparece ahí.',
    copyRestoMundo: 'Para el resto del mundo, el pago es en USD con tarjeta a través de Stripe.',
    copyCuotasTarjeta: '',
    imagenPagosUrl: '/images/logos/tarjetasmpstripe2.png',
    imagenPagosAlt: 'Pagos con Mercado Pago y Stripe.',
    diasUrgencia: 7,
    emailSinPlanes: 'hola@mformove.com',
    ctaSinPlanes: 'Recibir novedades',
    mensajeSinPlanes:
      'Estoy actualizando los planes en este momento. Si querés reservar tu lugar, escribime o tocá el botón para recibir novedades.',
    proveedoresHabilitados: ['stripe', 'mercadopago'],
    opcionesPago: [],
    beneficiosTitulo: 'Qué incluye',
    beneficios: [
      'Encuentros grupales semanales para practicar, profundizar y resolver dudas.',
      'Clases para avanzar a tu ritmo y volver a recorrer cuando lo necesites.',
      'Comunidad privada para compartir la práctica, las preguntas y los descubrimientos.',
      'Tres módulos fundacionales: Percibir, Ordenar y Construir.',
      'Recursos complementarios para llevar lo aprendido al entrenamiento y a la vida cotidiana.',
    ],
    ventaPorLlamada: false,
  },
  whatsapp: {
    imagenMobilePublicId: CURSO_WHATSAPP_BANNER_MOBILE_PUBLIC_ID,
    imagenDesktopPublicId: 'FondoHablarConmigoWeb5_nogmad',
    imagenAlt: 'Mateo Molfin',
    titulo: '¿Tienes preguntas?',
    ctaTexto: 'Hablar con Mateo',
    enlace:
      'https://wa.me/59898964142?text=Hola%20Mateo!%20Quiero%20recuperar%20mi%20autonom%C3%ADa%20f%C3%ADsica%20con%20tu%20m%C3%A9todo.%20Tengo%20una%20duda%20sobre%20el%20programa%20antes%20de%20inscribirme.%20Mi%20nombre%20es:',
    invitacionGrupoWhatsapp: '',
  },
  faq: {
    anclaId: 'membership-faq',
    titulo: 'Preguntas frecuentes',
    intro: 'Respuestas concretas antes de sumarte.',
    items: CURSO_FAQ_PRESETS.map((item, orden) => ({ ...item, orden })),
  },
  ctaFinal: {
    titulo: 'Sumate y empecemos a movernos juntos.',
    cuerpo:
      'Cuatro meses para construir una práctica con dirección, con clases a tu ritmo y un grupo con el que encontrarte cada semana.',
    boton: 'Quiero sumarme',
    anclaId: 'membership-plans',
  },
});

export const normalizeCloudinaryAssetId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!trimmed.includes('cloudinary.com')) return trimmed;

  const withoutQuery = trimmed.split('?')[0];
  const parts = withoutQuery.split('/');
  const uploadIndex = parts.lastIndexOf('upload');
  if (uploadIndex === -1) return trimmed;

  const afterUpload = parts.slice(uploadIndex + 1);
  const assetParts = afterUpload[0]?.startsWith('v') ? afterUpload.slice(1) : afterUpload;
  return assetParts.join('/');
};

/** Banner WhatsApp curso — mobile (retrato, sujeto a la derecha). */
export const CURSO_WHATSAPP_BANNER_MOBILE_PUBLIC_ID =
  'my_uploads/fondos/FondoHablarConmigoMobile_mkhcgy';

/** IDs legacy cuyo asset ya no existe en Cloudinary (404). */
const WHATSAPP_BROKEN_MOBILE_PUBLIC_IDS = new Set(['FondoHablarConmigo_1_zj7lti']);

/** Mobile usa asset canónico si falta, está roto o es el mismo fallback desktop legacy. */
export const resolveCursoWhatsappBannerPublicIds = (
  imagenMobilePublicId: string,
  imagenDesktopPublicId: string
): { imagenMobilePublicId: string; imagenDesktopPublicId: string } => {
  const desktop =
    normalizeCloudinaryAssetId(imagenDesktopPublicId) ||
    normalizeCloudinaryAssetId(imagenMobilePublicId);
  let mobile = normalizeCloudinaryAssetId(imagenMobilePublicId);
  if (
    !mobile ||
    WHATSAPP_BROKEN_MOBILE_PUBLIC_IDS.has(mobile) ||
    mobile === desktop
  ) {
    mobile = CURSO_WHATSAPP_BANNER_MOBILE_PUBLIC_ID;
  }
  return { imagenMobilePublicId: mobile, imagenDesktopPublicId: desktop };
};

const mergeFaqItems = (
  items: CursoFaqItem[] | undefined,
  defaults: CursoFaqItem[]
): CursoFaqItem[] => {
  if (!items?.length) return defaults;

  return items.map((item, index) => ({
    ...defaults[index],
    ...item,
    orden: typeof item.orden === 'number' ? item.orden : index,
  }));
};

const mergeOfferBlocks = (
  items: CursoOfferBlock[] | undefined,
  defaults: CursoOfferBlock[]
): CursoOfferBlock[] => {
  if (!items?.length) return defaults;

  return items.map((item, index) => ({
    ...defaults[index],
    ...item,
    lineas: item.lineas?.length ? item.lineas : defaults[index]?.lineas || [],
    iconKey: item.iconKey || defaults[index]?.iconKey || 'book',
    lineaDestacadaIndice:
      typeof item.lineaDestacadaIndice === 'number'
        ? item.lineaDestacadaIndice
        : defaults[index]?.lineaDestacadaIndice ?? null,
  }));
};

const mergeModulos = (
  items: CursoModuloLanding[] | undefined,
  defaults: CursoModuloLanding[]
): CursoModuloLanding[] => {
  if (!items?.length) return defaults;

  return items.map((item, index) => ({
    ...defaults[index],
    ...item,
    imagenPublicId:
      normalizeCloudinaryAssetId(item.imagenPublicId || defaults[index]?.imagenPublicId || ''),
  }));
};

const mergeHighlightItems = (
  items: CursoHighlight[] | undefined,
  defaults: CursoHighlight[]
): CursoHighlight[] => {
  if (!items) return defaults;
  // Array vacío es una edición válida (el admin borró todos los ítems).
  if (items.length === 0) return [];

  return items.map((item, index) => ({
    ...(defaults[index] || {}),
    ...item,
    imagenPublicId: normalizeCloudinaryAssetId(
      item.imagenPublicId || defaults[index]?.imagenPublicId || ''
    ),
  }));
};

const mergePreciosPreventa = (
  items: CursoPrecioPreventa[] | undefined
): CursoPrecioPreventa[] => {
  if (!items?.length) return [];

  return items.map((item, index) => ({
    etiqueta: item.etiqueta || `Preventa ${index + 1}`,
    descripcion: item.descripcion || '',
    monto: Number(item.monto) || 0,
    moneda: item.moneda || 'USD',
    fechaFin: item.fechaFin || null,
    cuposLimite: Math.max(1, Number(item.cuposLimite) || 1),
    cuposUsados: Math.max(0, Number(item.cuposUsados) || 0),
    activo: item.activo !== false,
    orden: typeof item.orden === 'number' ? item.orden : index,
    id: item.id,
    opcionesPago: Array.isArray(item.opcionesPago) ? item.opcionesPago : [],
  }));
};

const mergeContenidoModulos = (
  items: CursoModuloContenido[] | undefined,
  highlights: CursoHighlight[]
): CursoModuloContenido[] => {
  const base = syncContenidoModulosFromHighlights(highlights, items || []);
  return base.map((mod, index) => {
    const src = items?.find((m) => m.timelineIndex === index) ?? items?.[index];
    if (!src) return mod;
    return {
      ...mod,
      ...src,
      timelineIndex: index,
      esencia: String(src.esencia ?? mod.esencia ?? '').trim(),
      bundleTipo: src.bundleTipo === 'vimeo_playlist' ? 'vimeo_playlist' : 'videos',
      clases: (src.clases || []).map((c, ci) => normalizeClaseContenido(c, ci)),
    };
  });
};

export const normalizeCursoLandingConfig = (
  partial?: Partial<CursoLandingConfig> | null,
  nombreProducto = 'Cuerpo autónomo'
): CursoLandingConfig => {
  const defaults = createDefaultCursoLandingConfig(nombreProducto);
  if (!partial) return defaults;

  const mergedHighlights = mergeHighlightItems(
    partial.highlights?.items,
    defaults.highlights.items
  );

  return {
    ...defaults,
    ...partial,
    mostrarSellosValidacion: Boolean(partial.mostrarSellosValidacion),
    sellosValidacionTitulo:
      partial.sellosValidacionTitulo?.trim() || defaults.sellosValidacionTitulo,
    sellosValidacion: Array.isArray(partial.sellosValidacion)
      ? partial.sellosValidacion.map((item, index) => ({
          imagenPublicId: normalizeCloudinaryAssetId(item?.imagenPublicId || ''),
          alt: item?.alt?.trim() || '',
          enlace: item?.enlace?.trim() || '',
          orden: typeof item?.orden === 'number' ? item.orden : index,
        }))
      : defaults.sellosValidacion,
    preciosPreventa: mergePreciosPreventa(partial.preciosPreventa),
    contenidoModulos: mergeContenidoModulos(partial.contenidoModulos, mergedHighlights),
    recursosAdicionales: normalizeRecursosAdicionales(partial.recursosAdicionales),
    hero: {
      ...defaults.hero,
      ...partial.hero,
    },
    navegacion: {
      ...defaults.navegacion,
      ...partial.navegacion,
    },
    presentacionTestimonios: {
      ...defaults.presentacionTestimonios,
      ...partial.presentacionTestimonios,
    },
    betweenHero: {
      ...defaults.betweenHero,
      ...partial.betweenHero,
      parrafos:
        partial.betweenHero?.parrafos?.filter(Boolean).length
          ? partial.betweenHero.parrafos.filter(Boolean)
          : defaults.betweenHero.parrafos,
      cierre:
        partial.betweenHero && Object.prototype.hasOwnProperty.call(partial.betweenHero, 'cierre')
          ? (partial.betweenHero.cierre || '').trim()
          : defaults.betweenHero.cierre,
    },
    introHighlights: {
      ...defaults.introHighlights,
      ...partial.introHighlights,
      bloques: partial.introHighlights?.bloques?.length
        ? partial.introHighlights.bloques
        : defaults.introHighlights.bloques,
    },
    whatsapp: (() => {
      const merged = {
        ...defaults.whatsapp,
        ...partial.whatsapp,
        invitacionGrupoWhatsapp:
          partial.whatsapp?.invitacionGrupoWhatsapp?.trim() ||
          partial.whatsapp?.grupoWhatsapp?.trim() ||
          defaults.whatsapp.invitacionGrupoWhatsapp,
      };
      const bannerIds = resolveCursoWhatsappBannerPublicIds(
        merged.imagenMobilePublicId,
        merged.imagenDesktopPublicId
      );
      return { ...merged, ...bannerIds };
    })(),
    faq: {
      ...defaults.faq,
      ...partial.faq,
      items: mergeFaqItems(partial.faq?.items, defaults.faq.items),
    },
    highlights: {
      ...defaults.highlights,
      ...(partial.highlights || {}),
      items: mergedHighlights,
    },
    queIncluye: {
      ...defaults.queIncluye,
      ...partial.queIncluye,
      offerBlocks: mergeOfferBlocks(partial.queIncluye?.offerBlocks, defaults.queIncluye.offerBlocks),
      modulos: mergeModulos(partial.queIncluye?.modulos, defaults.queIncluye.modulos),
    },
  };
};
