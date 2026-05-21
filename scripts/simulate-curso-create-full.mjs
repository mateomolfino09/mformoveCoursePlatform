/**
 * Simulación end-to-end: formulario → productData → normalize API → documento Mongo + CourseClass
 * node scripts/simulate-curso-create-full.mjs
 */

import { normalizeCursoLandingConfig } from '../src/types/cursoLanding.ts';

const INVITACION = 'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo';
const ENLACE_FIJO =
  'https://wa.me/59898964142?text=Hola%20Mateo!%20Quiero%20recuperar%20mi%20autonom%C3%ADa%20f%C3%ADsica';

function resolveInvitacion(data) {
  return (
    data.invitacionGrupoWhatsapp?.trim() ||
    data.grupoWhatsapp?.trim() ||
    data.cursoConfig?.whatsapp?.invitacionGrupoWhatsapp?.trim() ||
    data.cursoConfig?.whatsapp?.grupoWhatsapp?.trim() ||
    ''
  );
}

// --- 1. Estado del formulario (CreateProductStep1) ---
const cursoConfigFromForm = normalizeCursoLandingConfig(
  {
    slug: 'cuerpo-autonomo-test',
    publicado: false,
    fechaPublicacion: '2026-05-31T23:05:00.000Z',
    hero: {
      videoPresentacionVimeoId: '1160337707',
      tagline: 'Recuperá la capacidad de moverte con libertad.',
      ctaTexto: 'Quiero un cuerpo libre',
    },
    whatsapp: {
      enlace: ENLACE_FIJO,
      invitacionGrupoWhatsapp: INVITACION,
      titulo: '¿Tienes preguntas?',
      ctaTexto: 'Hablar con Mateo',
    },
    contenidoModulos: [
      {
        timelineIndex: 0,
        titulo: 'Regulación (trabajos internos)',
        bundleTipo: 'videos',
        clases: [
          {
            name: 'Respiración base',
            description: 'Intro regulación',
            videoId: '111111111',
            level: 2,
            order: 0,
            materials: ['baston'],
          },
          {
            name: 'Meditación activa',
            videoId: '222222222',
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
        clases: [
          {
            name: 'Pies y base',
            videoId: '333333333',
            level: 3,
            order: 0,
            materials: ['banco'],
          },
        ],
      },
    ],
  },
  'Cuerpo Autonomo Test'
);

const invitacionGrupoResuelta = ''; // campo evento vacío en curso

// --- 2. CreateProduct.tsx arma productData ---
const productData = {
  nombre: 'Cuerpo Autonomo Test',
  descripcion:
    'Programa online con +25 clases, comunidad y encuentros en vivo. Texto real de descripción.',
  tipo: 'curso',
  cursoConfig: cursoConfigFromForm,
  invitacionGrupoWhatsapp:
    invitacionGrupoResuelta ||
    cursoConfigFromForm.whatsapp.invitacionGrupoWhatsapp.trim(),
};

// --- 3. API createProduct (normalize + resolve) ---
const invitacionGrupoResolved = resolveInvitacion(productData);

const cursoConfigParaGuardar = normalizeCursoLandingConfig(
  {
    ...productData.cursoConfig,
    whatsapp: {
      ...productData.cursoConfig.whatsapp,
      invitacionGrupoWhatsapp:
        invitacionGrupoResolved ||
        productData.cursoConfig.whatsapp.invitacionGrupoWhatsapp ||
        '',
    },
    imagenCheckoutPublicId: 'my_uploads/test-portada',
  },
  productData.nombre
);

const productoData = {
  nombre: productData.nombre,
  descripcion: productData.descripcion,
  tipo: productData.tipo,
  cursoConfig: cursoConfigParaGuardar,
  invitacionGrupoWhatsapp: invitacionGrupoResolved || undefined,
};

// --- 4. Simular merge post-Stripe (fix actual) ---
const existingCfg = {}; // primer save falló vacío (caso bug viejo)
const baseCfg = cursoConfigParaGuardar;

const mergedAfterStripe = {
  ...baseCfg,
  ...existingCfg,
  contenidoModulos: baseCfg.contenidoModulos?.length
    ? baseCfg.contenidoModulos
    : existingCfg.contenidoModulos,
  whatsapp: {
    ...(baseCfg.whatsapp || {}),
    ...(existingCfg.whatsapp || {}),
  },
  planes: {
    ...(baseCfg.planes || {}),
    ...(existingCfg.planes || {}),
    opcionesPago: [{ proveedor: 'stripe', etiqueta: 'Empezar AHORA', paymentLink: 'https://stripe.test/link' }],
  },
};

// --- 5. CourseClass a crear ---
const courseClassesToCreate = [];
for (const mod of mergedAfterStripe.contenidoModulos || []) {
  for (const clase of mod.clases || []) {
    if (clase.name || clase.videoId) {
      courseClassesToCreate.push({
        timelineIndex: mod.timelineIndex,
        name: clase.name || 'Clase sin título',
        videoId: clase.videoId,
        level: clase.level,
        order: clase.order,
      });
    }
  }
}

const totalClasesPayload = cursoConfigFromForm.contenidoModulos.reduce(
  (n, m) => n + (m.clases?.length || 0),
  0
);

console.log('═══════════════════════════════════════════════════');
console.log(' SIMULACIÓN CREACIÓN CURSO (código real normalizeCursoLandingConfig)');
console.log('═══════════════════════════════════════════════════\n');

console.log('1) FORMULARIO → cursoConfig en React');
console.log('   Módulos cargados por usuario:', cursoConfigFromForm.contenidoModulos.length);
console.log('   Clases en payload usuario:', totalClasesPayload);
console.log('   invitacionGrupoWhatsapp:', cursoConfigFromForm.whatsapp.invitacionGrupoWhatsapp);
console.log('   enlace contacto (fijo):', cursoConfigFromForm.whatsapp.enlace.slice(0, 50) + '...\n');

console.log('2) POST /api/product/createProduct (productData)');
console.log('   invitacionGrupoWhatsapp raíz:', productData.invitacionGrupoWhatsapp);
console.log('   cursoConfig enviado: SÍ (' + Object.keys(productData.cursoConfig).length + ' keys)\n');

console.log('3) API normalizeCursoLandingConfig');
console.log('   contenidoModulos:', cursoConfigParaGuardar.contenidoModulos.length, 'módulos');
const clasesPorModulo = cursoConfigParaGuardar.contenidoModulos.map(
  (m, i) => `      M${i + 1} "${m.titulo?.slice(0, 30)}": ${m.clases?.length || 0} clases`
);
clasesPorModulo.forEach((l) => console.log(l));
console.log(
  '   invitacion en whatsapp:',
  cursoConfigParaGuardar.whatsapp.invitacionGrupoWhatsapp || '(vacío)'
);
console.log('   invitacion raíz producto:', productoData.invitacionGrupoWhatsapp || '(vacío)\n');

console.log('4) Product.create (productoData) — campos críticos');
console.log(
  JSON.stringify(
    {
      nombre: productoData.nombre,
      descripcion: productoData.descripcion.slice(0, 60) + '...',
      invitacionGrupoWhatsapp: productoData.invitacionGrupoWhatsapp,
      'cursoConfig.contenidoModulos': productoData.cursoConfig.contenidoModulos?.length,
      'cursoConfig.whatsapp': {
        enlace: productoData.cursoConfig.whatsapp.enlace?.slice(0, 40) + '...',
        invitacionGrupoWhatsapp: productoData.cursoConfig.whatsapp.invitacionGrupoWhatsapp,
      },
    },
    null,
    2
  )
);

console.log('\n5) Tras merge post-Stripe (fix nuevo)');
console.log('   contenidoModulos:', mergedAfterStripe.contenidoModulos?.length);
console.log('   ¿Se pierden módulos si existingCfg vacío?:', mergedAfterStripe.contenidoModulos?.length > 0 ? 'NO ✓' : 'SÍ ✗');

console.log('\n6) syncCourseClasses → colección courseclasses');
console.log('   Documentos a crear:', courseClassesToCreate.length);
courseClassesToCreate.forEach((c, i) => {
  console.log(`      [${i + 1}] ${c.name} (video ${c.videoId}) → módulo timeline ${c.timelineIndex}`);
});

console.log('\n═══════════════════════════════════════════════════');
console.log(' COMPARACIÓN con tu producto 6a0a4d25d13df40e5d2ecfeb');
console.log('═══════════════════════════════════════════════════');
console.log('   Tu doc: sin contenidoModulos, sin invitacionGrupoWhatsapp');
console.log('   Simulación OK:', productoData.cursoConfig.contenidoModulos?.length > 0 && productoData.invitacionGrupoWhatsapp ? 'SÍ ✓' : 'NO ✗');
console.log('\n→ Con el código actual + guardar desde Editar producto, debería persistir todo.\n');
