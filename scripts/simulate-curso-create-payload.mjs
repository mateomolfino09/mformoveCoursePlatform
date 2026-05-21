/**
 * Simula creación de curso con módulos, clases e invitación (como el formulario admin).
 * node scripts/simulate-curso-create-payload.mjs
 */

const INVITACION = 'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo';
const ENLACE_FIJO = 'https://wa.me/59898964142?text=Hola%20Mateo';

// Estado React al enviar (CreateProductStep1 + CursoLandingConfigForm)
const cursoConfigFromForm = {
  slug: 'cuerpo-autonomo',
  publicado: false,
  fechaPublicacion: '2026-05-31T23:05:00.000Z',
  whatsapp: {
    enlace: ENLACE_FIJO,
    invitacionGrupoWhatsapp: INVITACION,
    titulo: '¿Tienes preguntas?',
    ctaTexto: 'Hablar con Mateo',
  },
  highlights: {
    items: [
      { titulo: 'Regulación', resumen: '', detalle: '', imagenPublicId: 'a' },
      { titulo: 'Arquitectura', resumen: '', detalle: '', imagenPublicId: 'b' },
      { titulo: 'Capacidades', resumen: '', detalle: '', imagenPublicId: 'c' },
      { titulo: 'Expresión', resumen: '', detalle: '', imagenPublicId: 'd' },
      { titulo: 'Rehabilitación', resumen: '', detalle: '', imagenPublicId: 'e' },
    ],
  },
  contenidoModulos: [
    {
      timelineIndex: 0,
      titulo: 'Regulación (trabajos internos)',
      bundleTipo: 'videos',
      vimeoPlaylistId: '',
      clases: [
        {
          name: 'Respiración base',
          description: 'Intro',
          videoId: '111111',
          level: 2,
          order: 0,
          materials: ['baston'],
          visibleInLibrary: true,
        },
        {
          name: 'Meditación activa',
          videoId: '222222',
          level: 1,
          order: 1,
          materials: [],
        },
      ],
    },
    {
      timelineIndex: 1,
      titulo: 'Arquitectura corporal',
      bundleTipo: 'videos',
      clases: [{ name: 'Pies y base', videoId: '333333', level: 3, order: 0, materials: [] }],
    },
  ],
};

const productData = {
  nombre: 'Cuerpo Autonomo',
  descripcion: 'Programa online con +25 clases y comunidad.',
  tipo: 'curso',
  cursoConfig: cursoConfigFromForm,
  invitacionGrupoWhatsapp: INVITACION,
};

function resolveInvitacion(data) {
  return (
    data.invitacionGrupoWhatsapp?.trim() ||
    data.cursoConfig?.whatsapp?.invitacionGrupoWhatsapp?.trim() ||
    ''
  );
}

function mergeContenidoModulos(items, highlights) {
  return highlights.map((item, index) => {
    const src = items?.find((m) => m.timelineIndex === index) ?? items?.[index];
    return {
      timelineIndex: index,
      titulo: src?.titulo || item.titulo || '',
      bundleTipo: src?.bundleTipo === 'vimeo_playlist' ? 'vimeo_playlist' : 'videos',
      vimeoPlaylistId: src?.vimeoPlaylistId || '',
      clases: src?.clases || [],
    };
  });
}

const invitacionResolved = resolveInvitacion(productData);
const highlights = productData.cursoConfig.highlights.items;
const contenidoModulosMerged = mergeContenidoModulos(
  productData.cursoConfig.contenidoModulos,
  highlights
);

const cursoConfigParaGuardar = {
  ...productData.cursoConfig,
  whatsapp: {
    ...productData.cursoConfig.whatsapp,
    invitacionGrupoWhatsapp: invitacionResolved || productData.cursoConfig.whatsapp.invitacionGrupoWhatsapp,
  },
  contenidoModulos: contenidoModulosMerged,
};

const documentoMongo = {
  nombre: productData.nombre,
  descripcion: productData.descripcion,
  tipo: 'curso',
  invitacionGrupoWhatsapp: invitacionResolved,
  cursoConfig: cursoConfigParaGuardar,
};

const totalClases = contenidoModulosMerged.reduce((n, m) => n + (m.clases?.length || 0), 0);

console.log('=== SIMULACIÓN FORMULARIO COMPLETO ===\n');
console.log('Módulos en payload cliente:', productData.cursoConfig.contenidoModulos.length);
console.log('Clases en payload cliente:', productData.cursoConfig.contenidoModulos.reduce((n, m) => n + m.clases.length, 0));
console.log('Invitación en payload:', productData.cursoConfig.whatsapp.invitacionGrupoWhatsapp);
console.log('\nTras API (normalize simplificado):');
console.log('  contenidoModulos:', contenidoModulosMerged.length, 'módulos');
console.log('  clases totales:', totalClases);
console.log('  invitacionGrupoWhatsapp raíz:', documentoMongo.invitacionGrupoWhatsapp);
console.log('  cursoConfig.whatsapp.invitacionGrupoWhatsapp:', documentoMongo.cursoConfig.whatsapp.invitacionGrupoWhatsapp);
console.log('\nCourseClass que se crearían:', totalClases, 'documentos en colección courseclasses');
console.log('\n--- Tu documento Mongo (export) ---');
console.log('  contenidoModulos: AUSENTE');
console.log('  invitacionGrupoWhatsapp: AUSENTE');
console.log('  descripcion: link pegado manualmente');
console.log('\n=> Si el formulario envió bien, faltó persistir en create O el servidor no tenía el schema aún.');
