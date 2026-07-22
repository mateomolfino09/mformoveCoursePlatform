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
};

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
  };
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

export type CursoLandingConfig = {
  slug: string;
  publicado: boolean;
  fechaPublicacion: string | null;
  preciosPreventa: CursoPrecioPreventa[];
  contenidoModulos: CursoModuloContenido[];
  imagenCheckoutPublicId: string;
  vimeoGaleriaId: string;
  hero: {
    videoPresentacionVimeoId: string;
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
  };
  bannerAncho: {
    cuerpo: string;
  };
  testimoniosEscritos: CursoTestimonioEscrito[];
  testimoniosGrabados: CursoTestimonioGrabado[];
  introHighlights: {
    titulo: string;
    subtitulo: string;
    cuerpo: string;
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
  "1. dejar atrás la rigidez y las limitaciones, convirtiendo el 'no saber qué hacer' en seguridad para moverte sin lesionarte, recuperar tu agilidad y permitirte aprovechar al máximo el potencial de tu cuerpo.",
  '2. ganar resultados disfrutando, sin necesidad de un gimnasio, rutinas que no querés hacer y ejercicios monótonos, sino despertando un cuerpo ágil, instintivo y con ganas.',
  '3. eliminar el miedo a lesionarte, construyendo tu versión más soberana, comprometida y creativa, que se hace cargo de su propia salud física y entrena creando movimientos con criterio — sin depender de nadie más.',
];

const CURSO_BANNER_ANCHO_CUERPO =
  'Un recorrido 100 % a tu ritmo, con más de 20 sesiones prácticas listas para usar. Vas a estar acompañado por un grupo de gente que está en la misma. El mapa lo tenés para siempre, pero el camino lo hacemos juntos.';

const CURSO_INTRO_CUERPO =
  'Un programa 100% online con +25 clases, material para implementar, manuales de práctica, comunidad de practicantes y 6 meses de encuentros en vivo para profundizar.\n\nJunté rehabilitación, danza, artes marciales, juego, entrenamiento y deportes en un programa solo. Cuerpo autónomo es un proceso completo donde bajás los principios del movimiento del cuerpo y la mente y los convertís en decisiones concretas: cómo ser funcional, qué áreas priorizar según tu rigidez, cómo ganar movilidad y el trabajo mental necesario para sostener y transformar tu cuerpo en un aliado que te responde y se mueve sin depender de nadie más.';

const CURSO_OUTCOMES_PRESETS: Omit<CursoOutcome, 'orden'>[] = [
  {
    titulo: 'Entendés de qué estás hecho',
    cuerpo:
      'Mirás tu cuerpo y entendés por qué te duele lo que te duele. Dejás de ser un extraño para vos mismo y empezás a ver el potencial que tenés guardado.',
  },
  {
    titulo: 'Dejás de copiar "ejercicios" y empezás a moverte con sentido',
    cuerpo:
      'Chau a ser el que hace "un poco de gym". Empezás a moverte con criterio. Entendés qué hacer cada día, lo indispensable, lo elegible y a fluir en tus necesidades',
  },
  {
    titulo: 'Construís un cuerpo que no se rompe',
    cuerpo:
      'Te volvés el "ágil" del grupo, esa que te permite hacer deporte, sentirte comod@, experimentar y jugar sin lastimarte.',
  },
  {
    titulo: 'Chau miedo, hola seguridad',
    cuerpo:
      'Dejás de dudar de si te vas a lesionar o si "ya estás viejo" para esto. Te movés donde tu cuerpo te permite y ganas nuevos espacios con movilidad.',
  },
  {
    titulo: 'De una carga a tu aliado',
    cuerpo:
      'Ya no es "ir a entrenar": es una relación nueva. Te haces caso, te sentís cómodo en tu piel y aprovechás esa conexión para hacer lo que quieras en tu vida diaria.',
  },
  {
    titulo: 'Te movés porque querés, no porque te obligan',
    cuerpo:
      'Cuando entendés la técnica, entrenar deja de ser pesado. No necesitás fuerza de voluntad infinita porque el movimiento te recarga. Encontrás tu propio momento, ritmo y fluís sin esfuerzo.',
  },
  {
    titulo: 'Limpiás lo que no sirve y te enfocás en lo que rinde',
    cuerpo:
      'Dejás de perder tiempo en clases aburridas o rutinas que no te dan nada. Metés toda tu energía en un solo método que funciona.',
  },
  {
    titulo: 'Este mapa es para toda la vida',
    cuerpo:
      'Aprendés un método claro que es tuyo para siempre. No necesitás más cursos, ni más suscripciones, solo disfrutar de tu cuerpo y compartir tu practica como te guste. Ya sabés cómo cuidarte y cómo evolucionar por tu cuenta.',
  },
];

const CURSO_HIGHLIGHTS_PRESETS: Omit<CursoHighlight, 'orden'>[] = [
  {
    titulo: 'Regulación (trabajos internos)',
    resumen: 'Aprendés a respirar y moverte para calmar el sistema nervioso.',
    detalle:
      'Cuando el sistema baja revoluciones, el cuerpo deja de sostenerse desde la rigidez. Practicas de yoga, respiración, mentalidad y meditación',
  },
  {
    titulo: 'Arquitectura corporal (postura: pies y columna)',
    resumen: 'Reordenás la base y el eje para que sostenerte no sea un desgaste.',
    detalle:
      'Pies que informan al suelo y columna que organiza el resto. Movimiento, biomecánica, técnicas de liberación de tejido conectivo y masajes. No es un tema de postura, es no perpetuarlas',
  },
  {
    titulo: 'Capacidades (movilidad, fuerza y coordinación)',
    resumen: 'Construís confianza y agilidad para los desafíos de la vida.',
    detalle:
      'No buscamos “rendir”: buscamos estar disponibles. Movilidad que da espacio, fuerza que protege y coordinación que te vuelve eficiente e inteligente.',
  },
  {
    titulo: 'Expresión (el lenguaje: lucha y danza)',
    resumen: 'Recuperás el placer de moverte: suelo, flow y juego.',
    detalle:
      'La expresión aparece cuando hay estructura y calma. Volvés a jugar con el movimiento: girar, desplazarte, caer y levantarte. Entrenar debería ser divertido.',
  },
  {
    titulo: 'Rehabilitación (prevención de lesiones)',
    resumen: 'Conocimiento para sanar molestias y moverte con seguridad.',
    detalle:
      'Entendés qué hacer cuando aparece una molestia: cómo ajustar, cómo progresar y cómo prevenir. La meta es práctica segura y sostenible.',
  },
];

const CURSO_MODULOS_PRESETS: Omit<CursoModuloLanding, 'orden'>[] = [
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
];

const CURSO_FAQ_PRESETS: Omit<CursoFaqItem, 'orden'>[] = [
  {
    pregunta: '¿Qué es Cuerpo autónomo y qué incluye?',
    respuesta:
      'Es un programa de soberanía física para recuperar postura, regular tensión y moverte con más libertad y menos dolor. Incluye workbook y ejercicios, más de 25 clases grabadas, 6 meses de encuentros en vivo Q&A conmigo, comunidad y acceso al material para avanzar a tu ritmo.',
  },
  {
    pregunta: '¿En qué se diferencia de la mentoría?',
    respuesta:
      'En la mentoría trabajo con vos de forma individual y el plan se arma a tu medida. Cuerpo autónomo es un programa grupal con un camino estructurado, contenido grabado y vivo en comunidad. Si necesitás seguimiento uno a uno y un plan totalmente personalizado, la mentoría suele encajar mejor.',
  },
  {
    pregunta: '¿Necesito experiencia previa?',
    respuesta:
      'No. El método está pensado para distintos puntos de partida: podés empezar desde cero, retomar después de un tiempo o profundizar si ya tenés base. Vos regulás la intensidad según cómo te sentís cada semana.',
  },
  {
    pregunta: '¿Cuánto tiempo tengo que dedicar?',
    respuesta:
      'Como referencia, unas 2 horas por semana alcanzan para sostener el ritmo. Las clases grabadas duran entre 20 y 30 minutos y podés hacerlas cuando te quede cómodo; los encuentros en vivo de Q&A son mensuales durante 6 meses.',
  },
  {
    pregunta: '¿Cómo funciona el soporte?',
    respuesta:
      'Tenés un canal por WhatsApp para consultas puntuales y, además, los encuentros en vivo de Q&A para dudas, correcciones y profundizar técnica con el grupo.',
  },
  {
    pregunta: '¿Qué pasa si me pierdo una semana o pauso?',
    respuesta:
      'El contenido queda disponible para retomarlo cuando quieras. No perdés tu avance: volvés por donde te quedaste, sin penalidad ni culpa.',
  },
  {
    pregunta: '¿Puedo pagar en cuotas?',
    respuesta:
      'Sí. En Uruguay y Latinoamérica podés financiar el programa en tu moneda local con hasta 12 cuotas, según el medio de pago y el país que elijas al checkout.',
  },
  {
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta:
      'En Uruguay y Latinoamérica procesamos el pago con dLocal: tarjetas locales y cuotas en moneda local. En el resto del mundo usamos Stripe en USD, con tarjetas internacionales, Apple Pay y Google Pay.',
  },
  {
    pregunta: '¿Tienen políticas de reembolso?',
    respuesta:
      'Por tratarse de un programa digital con acceso inmediato, no ofrecemos reembolsos una vez activado el acceso. Si tenés un problema con el cobro o necesitás revisar tu caso, escribinos por WhatsApp o a hola@mformove.com antes de completar la compra si todavía tenés dudas.',
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
  preciosPreventa: [],
  contenidoModulos: syncContenidoModulosFromHighlights(
    CURSO_HIGHLIGHTS_PRESETS.map((item) => ({ ...item }))
  ),
  imagenCheckoutPublicId: '',
  vimeoGaleriaId: '',
  hero: {
    videoPresentacionVimeoId: '1160337707',
    tagline: 'Recuperá la capacidad de moverte con libertad.',
    ctaTexto: 'Quiero un cuerpo libre',
    ctaSubcopy: 'Acceso inmediato. Avanzás a tu ritmo y en comunidad. Material de por vida.',
    rutaUsuarioSuscriptor: '/biblioteca',
    anclaPlanesId: 'membership-plans',
  },
  navegacion: {
    ctaBarraMovil: 'Empezar Camino',
  },
  presentacionTestimonios: {
    tituloVideos: 'Testimonios de alumn@s :)',
    tituloEscritos: 'Testimonios escritos',
    eyebrowEscritos: 'Palabras propias',
    textoPlaceholderVideo: 'Acá va un video de cliente (embed próximo).',
    anclaVideos: 'course-testimonios-video',
    anclaEscritos: 'course-testimonios-escritos',
  },
  betweenHero: {
    eyebrow: nombreProducto,
    titulo: 'El método ordenado, claro y profundo para…',
    parrafos: [...CURSO_BETWEEN_HERO_PARRAFOS],
  },
  bannerAncho: { cuerpo: CURSO_BANNER_ANCHO_CUERPO },
  testimoniosEscritos: [createDefaultTestimonioEscrito(0, nombreProducto)],
  testimoniosGrabados: [],
  introHighlights: {
    titulo: nombreProducto,
    subtitulo: '¿Como funciona?',
    cuerpo: CURSO_INTRO_CUERPO,
    imagenMobilePublicId: 'my_uploads/fondos/DSC01488_jb7nit',
    imagenDesktopPublicId: 'my_uploads/fondos/DSC01832_je5av4',
    imagenAlt: `${nombreProducto} — cómo funciona el método`,
  },
  outcomes: {
    imagenPublicId: 'my_uploads/fondos/DSC01642_rioxq5',
    imagenAlt: `${nombreProducto} — resultados en el cuerpo`,
    titulo: 'Lo que vas a lograr (paso a paso):',
    items: CURSO_OUTCOMES_PRESETS.map((item) => ({ ...item })),
  },
  highlights: {
    titulos: ['Siempre lo tuviste.', 'Solo te falta ordenarlo.'],
    puente: `Por eso, en ${nombreProducto} lo resolvemos así:`,
    items: CURSO_HIGHLIGHTS_PRESETS.map((item, index) => ({
      ...item,
      imagenPublicId:
        CURSO_MODULOS_PRESETS[index]?.imagenPublicId || 'my_uploads/fondos/DSC01753_qdv9o0',
    })),
    ctaEyebrow: 'Planes',
    ctaTitulo: '¿Todo listo para recuperar la soberanía de tu movimiento?',
    ctaDescripcion: 'Descubrí los planes y empezá hoy mismo a construir un cuerpo libre.',
    ctaBoton: 'Ver planes disponibles',
    ctaImagenPublicId: 'my_uploads/fondos/DSC01753_qdv9o0',
  },
  queIncluye: {
    titulo: 'Esto es lo que incluye tu programa:',
    anclaId: 'course-que-incluye',
    offerBlocks: [
      { lineas: ['WORKBOOK Y', 'EJERCICIOS'], hint: 'Guías y prácticas descargables para ordenar tu entrenamiento durante la semana.', iconKey: 'book' },
      { lineas: ['+25 CLASES GRABADAS'], hint: 'Clases paso a paso para que aprendas a moverte con seguridad y eficiencia.', iconKey: 'video' },
      { lineas: ['6 MESES', 'VIVOS Q&A', 'con Mateo'], hint: 'Encuentros mensuales en vivo para dudas, correcciones y profundizar técnica.', iconKey: 'live', lineaDestacadaIndice: 2 },
      { lineas: ['COMUNIDAD'], hint: 'Canal con otras personas que entrenan el mismo método.', iconKey: 'community' },
    ],
    modulos: CURSO_MODULOS_PRESETS.map((item) => ({ ...item })),
  },
  planes: {
    anclaId: 'membership-plans',
    titulo: 'Accedé a todo el método',
    parrafosValor: [
      'Un entrenador privado te cobraría más de $2,000 USD por este nivel de estructura y seguimiento.',
      'Un entrenamiento sin criterio te hace perder años de vida y dinero en cursos que no funcionan.',
      'Hoy, podés tener el mapa completo para recuperar tu soberanía, los encuentros en vivo conmigo y un rehabilitador por una parte mínima de este monto.',
    ],
    etiquetaFormasPago: 'Formas de pago y financiación',
    copyUruguayLatam:
      'Uruguay y Latinoamérica: Pagá en tu moneda local y aprovechá hasta 12 cuotas (dLocal o Mercado Pago)',
    copyRestoMundo: 'Resto del Mundo (Stripe): Pago rápido en USD mediante tarjetas internacionales, Apple Pay o Google Pay.',
    copyCuotasTarjeta: 'Hasta 12 cuotas en Uruguay y Latinoamérica con dLocal o Mercado Pago',
    imagenPagosUrl: '/images/svg/pagodoble.png',
    imagenPagosAlt: 'Cuotas con tarjeta: Mercado Pago, dLocal y Stripe.',
    diasUrgencia: 7,
    emailSinPlanes: 'hola@mformove.com',
    ctaSinPlanes: 'Recibir novedades',
    mensajeSinPlanes:
      'Estoy actualizando los planes en este momento. Si querés reservar tu lugar, escribime o tocá el botón para recibir novedades.',
    proveedoresHabilitados: ['stripe', 'mercadopago'],
    opcionesPago: [],
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
    titulo: 'Respuestas claras antes de sumarte',
    intro: 'Si todavía tenés dudas, revisá esta lista o escribime. Quiero que tomes una decisión informada.',
    items: CURSO_FAQ_PRESETS.map((item, orden) => ({ ...item, orden })),
  },
  ctaFinal: {
    titulo: 'Si esto es lo que te pasa — Volvé a sentirte dueño de tus movimientos.',
    cuerpo: 'Elegí tu forma de pago y empezá con un camino claro: menos dolor, más calma, más fuerza útil y autonomía real.',
    boton: 'Entrar ahora',
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
  if (!items?.length) return defaults;

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
    preciosPreventa: mergePreciosPreventa(partial.preciosPreventa),
    contenidoModulos: mergeContenidoModulos(partial.contenidoModulos, mergedHighlights),
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
