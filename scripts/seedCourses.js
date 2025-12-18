// Script de seeder para cursos
// Uso: node scripts/seedCourses.js [--fresh]
// Requiere: MONGODB_URI en variables de entorno

// Cargar variables de entorno
async function loadEnv() {
  try {
    const dotenv = await import('dotenv');
    const fs = await import('fs');
    const path = await import('path');
    
    // Intentar cargar .env.local primero, luego .env
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    const envPath = path.resolve(process.cwd(), '.env');
    
    if (fs.existsSync(envLocalPath)) {
      dotenv.config({ path: envLocalPath });
      console.log('✅ Variables de entorno cargadas desde .env.local');
    } else if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log('✅ Variables de entorno cargadas desde .env');
    } else {
      console.log('⚠️  No se encontró archivo .env.local o .env, usando variables del sistema');
    }
  } catch (error) {
    console.log('⚠️  No se pudo cargar dotenv, usando variables del sistema');
  }
}

async function loadModules() {
  // Cargar mongoose primero
  const mongooseModule = await import('mongoose');
  const mongoose = mongooseModule.default;
  
  // Conectar a MongoDB ANTES de cargar los modelos
  async function connectDB() {
    if (mongoose.connections[0]?.readyState === 1) {
      return;
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Conectar primero
  await connectDB();

  // Ahora cargar los modelos (necesitan mongoose conectado)
  // Importar los modelos para que se registren en mongoose.models
  await Promise.all([
    import('../src/models/userModel.js'),
    import('../src/models/courseModel.js'),
    import('../src/models/moduleModel.js'),
    import('../src/models/lessonModel.js'),
    import('../src/models/enrollmentModel.js'),
    import('../src/models/progressModel.js'),
    import('../src/models/certificateModel.js'),
    import('../src/models/reviewModel.js')
  ]);

  // Cargar bcrypt
  const bcryptModule = await import('bcryptjs');

  // Los modelos ahora deberían estar registrados en mongoose.models
  // Acceder directamente desde mongoose.models
  const User = mongoose.models.User;
  const Course = mongoose.models.Course;
  const Module = mongoose.models.Module;
  const Lesson = mongoose.models.Lesson;
  const Enrollment = mongoose.models.Enrollment;
  const Progress = mongoose.models.Progress;
  const Certificate = mongoose.models.Certificate;
  const Review = mongoose.models.Review;
  
  // Verificar que los modelos se cargaron correctamente
  if (!User || typeof User.findOne !== 'function') {
    console.error('User model type:', typeof User);
    console.error('User model:', User);
    console.error('mongoose.models.User:', mongoose.models.User);
    throw new Error('Error: User model no se registró correctamente en mongoose.models');
  }
  
  if (!Course || typeof Course.create !== 'function') {
    throw new Error('Error: Course model no se registró correctamente');
  }

  return {
    connectDB: async () => {}, // Ya conectado, solo retornar función vacía
    Course,
    Module,
    Lesson,
    Enrollment,
    Progress,
    Certificate,
    Review,
    User,
    bcrypt: bcryptModule.default,
    mongoose
  };
}

// Función para limpiar datos previos (solo si se pasa --fresh)
async function limpiarDatos(models) {
  const { Certificate, Review, Progress, Enrollment, Lesson, Module, Course } = models;
  console.log('🗑️  Limpiando datos previos...');
  await Promise.all([
    Certificate.deleteMany({}),
    Review.deleteMany({}),
    Progress.deleteMany({}),
    Enrollment.deleteMany({}),
    Lesson.deleteMany({}),
    Module.deleteMany({}),
    Course.deleteMany({})
  ]);
  console.log('✅ Datos limpiados');
}

// Función para crear o obtener usuarios de prueba
async function crearUsuarios(models) {
  const { User, bcrypt } = models;
  console.log('👥 Creando usuarios de prueba...');
  
  const instructorEmail = 'instructor@demo.com';
  const studentEmail = 'alumno@demo.com';
  const adminEmail = 'admin@demo.com';

  // Buscar o crear instructor
  let instructor = await User.findOne({ email: instructorEmail });
  if (!instructor) {
    instructor = await User.create({
      name: 'Instructor Demo',
      email: instructorEmail,
      password: await bcrypt.hash('demo1234', 10),
      rol: 'Instructor',
      validEmail: 'yes'
    });
    console.log('✅ Instructor creado:', instructor.email);
  } else {
    console.log('ℹ️  Instructor ya existe:', instructor.email);
  }

  // Buscar o crear estudiante
  let student = await User.findOne({ email: studentEmail });
  if (!student) {
    student = await User.create({
      name: 'Alumno Demo',
      email: studentEmail,
      password: await bcrypt.hash('demo1234', 10),
      rol: 'User',
      validEmail: 'yes'
    });
    console.log('✅ Estudiante creado:', student.email);
  } else {
    console.log('ℹ️  Estudiante ya existe:', student.email);
  }

  // Buscar o crear admin (por si acaso)
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Demo',
      email: adminEmail,
      password: await bcrypt.hash('demo1234', 10),
      rol: 'Admin',
      validEmail: 'yes'
    });
    console.log('✅ Admin creado:', admin.email);
  } else {
    console.log('ℹ️  Admin ya existe:', admin.email);
  }

  return { instructor, student, admin };
}

// Función para crear un curso completo
async function crearCurso(instructor, models) {
  const { Course, Module, Lesson } = models;
  console.log('📚 Creando curso de ejemplo...');

  // Crear curso
  const curso = await Course.create({
    titulo: 'Formación en Movimiento Consciente',
    descripcion: 'Programa completo de formación en movimiento consciente que te guiará desde los fundamentos hasta prácticas avanzadas. Aprenderás técnicas de respiración, alineación corporal, y cómo integrar el movimiento consciente en tu vida diaria. Incluye sesiones prácticas, material teórico y recursos descargables.',
    descripcionCorta: 'Aprende los fundamentos del movimiento consciente y transforma tu relación con tu cuerpo',
    slug: 'formacion-movimiento-consciente',
    imagenPortada: 'https://res.cloudinary.com/demo/image/upload/v12345/curso-demo.jpg',
    imagenPortadaMobile: 'https://res.cloudinary.com/demo/image/upload/v12345/curso-demo-mobile.jpg',
    galeriaImagenes: [
      'https://res.cloudinary.com/demo/image/upload/v12345/galeria1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v12345/galeria2.jpg'
    ],
    videoTrailer: 'https://vimeo.com/123456789',
    precio: 120,
    precioOriginal: 150,
    moneda: 'USD',
    categoria: 'movimiento',
    nivel: 'principiante',
    etiquetas: ['movimiento', 'conciencia corporal', 'bienestar', 'yoga'],
    instructorId: instructor._id,
    instructorNombre: instructor.name,
    objetivos: [
      'Comprender los fundamentos del movimiento consciente',
      'Desarrollar una práctica personal sostenible',
      'Aprender técnicas de respiración y alineación',
      'Integrar el movimiento consciente en la vida diaria'
    ],
    requisitosPrevios: [
      'Ningún requisito previo, ideal para principiantes',
      'Ropa cómoda para moverse',
      'Espacio tranquilo para practicar'
    ],
    materialesIncluidos: [
      'Manual PDF con teoría completa',
      'Lista de reproducción de música para prácticas',
      'Guía de ejercicios descargable',
      'Acceso a comunidad privada'
    ],
    emiteCertificado: true,
    porcentajeMinimoCompletitud: 80,
    estado: 'publicado',
    publicado: true,
    fechaPublicacion: new Date(),
    metaTitulo: 'Formación en Movimiento Consciente - Curso Online',
    metaDescripcion: 'Aprende movimiento consciente desde cero con este curso completo',
    palabrasClave: ['movimiento consciente', 'yoga', 'bienestar', 'curso online']
  });

  console.log('✅ Curso creado:', curso.titulo);

  // Crear módulos
  const modulo1 = await Module.create({
    courseId: curso._id,
    titulo: 'Módulo 1: Fundamentos del Movimiento',
    descripcion: 'Introducción completa al movimiento consciente. Aprenderás los conceptos básicos y establecerás las bases para tu práctica personal.',
    orden: 1,
    publicado: true,
    desbloqueado: true
  });

  const modulo2 = await Module.create({
    courseId: curso._id,
    titulo: 'Módulo 2: Práctica Guiada',
    descripcion: 'Sesiones prácticas paso a paso con seguimiento detallado. Aplicarás todo lo aprendido en el módulo anterior.',
    orden: 2,
    publicado: true,
    desbloqueado: false,
    requiereCompletarModuloAnterior: true,
    moduloAnteriorId: modulo1._id
  });

  const modulo3 = await Module.create({
    courseId: curso._id,
    titulo: 'Módulo 3: Integración y Avanzado',
    descripcion: 'Técnicas avanzadas y cómo integrar el movimiento consciente en diferentes contextos de tu vida.',
    orden: 3,
    publicado: true,
    desbloqueado: false,
    requiereCompletarModuloAnterior: true,
    moduloAnteriorId: modulo2._id
  });

  console.log('✅ Módulos creados:', 3);

  // Crear lecciones para módulo 1
  const leccionesModulo1 = await Lesson.insertMany([
    {
      courseId: curso._id,
      moduleId: modulo1._id,
      titulo: 'Bienvenida y Presentación del Curso',
      descripcion: 'Video introductorio donde conocerás a tu instructora y los objetivos del curso completo.',
      orden: 1,
      tipo: 'video',
      videoProvider: 'vimeo',
      videoId: '123456789',
      videoUrl: 'https://vimeo.com/123456789',
      duracion: 480, // 8 minutos
      publicado: true,
      esGratis: true
    },
    {
      courseId: curso._id,
      moduleId: modulo1._id,
      titulo: 'Fundamentos Teóricos del Movimiento Consciente',
      descripcion: 'Sesión teórica completa sobre los principios fundamentales del movimiento consciente.',
      orden: 2,
      tipo: 'texto',
      contenidoTexto: '<h2>¿Qué es el Movimiento Consciente?</h2><p>El movimiento consciente es una práctica que integra la atención plena con el movimiento corporal...</p><h3>Principios Clave</h3><ul><li>Respiración consciente</li><li>Alineación corporal</li><li>Presencia en el momento</li></ul>',
      publicado: true,
      recursos: [
        {
          nombre: 'Manual Introductorio - Fundamentos',
          url: 'https://res.cloudinary.com/demo/manual-fundamentos.pdf',
          tipo: 'pdf',
          tamano: 1024000
        }
      ]
    },
    {
      courseId: curso._id,
      moduleId: modulo1._id,
      titulo: 'Anatomía Básica para el Movimiento',
      descripcion: 'Conoce las estructuras corporales clave para una práctica segura y efectiva.',
      orden: 3,
      tipo: 'video',
      videoProvider: 'vimeo',
      videoId: '123456790',
      videoUrl: 'https://vimeo.com/123456790',
      duracion: 900, // 15 minutos
      publicado: true,
      recursos: [
        {
          nombre: 'Guía de Anatomía',
          url: 'https://res.cloudinary.com/demo/anatomia.pdf',
          tipo: 'pdf',
          tamano: 2048000
        }
      ]
    }
  ]);

  // Crear lecciones para módulo 2
  const leccionesModulo2 = await Lesson.insertMany([
    {
      courseId: curso._id,
      moduleId: modulo2._id,
      titulo: 'Sesión Guiada: Respiración Consciente',
      descripcion: 'Práctica guiada completa de respiración consciente paso a paso.',
      orden: 1,
      tipo: 'video',
      videoProvider: 'vimeo',
      videoId: '987654321',
      videoUrl: 'https://vimeo.com/987654321',
      duracion: 1200, // 20 minutos
      publicado: true,
      requiereCompletarLeccionAnterior: true
    },
    {
      courseId: curso._id,
      moduleId: modulo2._id,
      titulo: 'Secuencia de Movimientos Básicos',
      descripcion: 'Aprende una secuencia completa de movimientos básicos que puedes practicar diariamente.',
      orden: 2,
      tipo: 'video',
      videoProvider: 'vimeo',
      videoId: '987654322',
      videoUrl: 'https://vimeo.com/987654322',
      duracion: 1800, // 30 minutos
      publicado: true,
      requiereCompletarLeccionAnterior: true
    },
    {
      courseId: curso._id,
      moduleId: modulo2._id,
      titulo: 'Quiz: Evaluación del Módulo 2',
      descripcion: 'Evalúa tu comprensión de los conceptos aprendidos en este módulo.',
      orden: 3,
      tipo: 'quiz',
      publicado: true
    }
  ]);

  // Crear lecciones para módulo 3
  const leccionesModulo3 = await Lesson.insertMany([
    {
      courseId: curso._id,
      moduleId: modulo3._id,
      titulo: 'Técnicas Avanzadas de Movimiento',
      descripcion: 'Explora técnicas más complejas y desafiantes para tu práctica.',
      orden: 1,
      tipo: 'video',
      videoProvider: 'vimeo',
      videoId: '555555555',
      videoUrl: 'https://vimeo.com/555555555',
      duracion: 2400, // 40 minutos
      publicado: true
    },
    {
      courseId: curso._id,
      moduleId: modulo3._id,
      titulo: 'Integración en la Vida Diaria',
      descripcion: 'Aprende cómo llevar el movimiento consciente a diferentes contextos de tu vida.',
      orden: 2,
      tipo: 'texto',
      contenidoTexto: '<h2>Integrando el Movimiento Consciente</h2><p>El verdadero poder del movimiento consciente se revela cuando lo integramos en nuestra vida diaria...</p>',
      publicado: true,
      enlaces: [
        {
          titulo: 'Artículo: Movimiento en el Trabajo',
          url: 'https://ejemplo.com/movimiento-trabajo',
          descripcion: 'Cómo practicar movimiento consciente durante la jornada laboral'
        }
      ]
    }
  ]);

  const todasLasLecciones = [...leccionesModulo1, ...leccionesModulo2, ...leccionesModulo3];
  console.log('✅ Lecciones creadas:', todasLasLecciones.length);

  // Actualizar métricas de módulos
  await Promise.all([
    modulo1.actualizarMetricas(),
    modulo2.actualizarMetricas(),
    modulo3.actualizarMetricas()
  ]);

  // Actualizar métricas del curso
  curso.totalModulos = 3;
  curso.totalLecciones = todasLasLecciones.length;
  curso.duracionTotal = Math.round(todasLasLecciones.reduce((acc, l) => acc + (l.duracion || 0), 0) / 60); // En minutos
  await curso.save();

  console.log('✅ Métricas del curso actualizadas');
  console.log(`   - Total módulos: ${curso.totalModulos}`);
  console.log(`   - Total lecciones: ${curso.totalLecciones}`);
  console.log(`   - Duración total: ${curso.duracionTotal} minutos`);

  return { curso, modulo1, modulo2, modulo3, todasLasLecciones };
}

// Función para crear inscripción y progreso
async function crearInscripcionYProgreso(curso, student, todasLasLecciones, models) {
  const { Enrollment, Progress } = models;
  console.log('📝 Creando inscripción y progreso...');

  // Crear inscripción
  const enrollment = await Enrollment.create({
    userId: student._id,
    courseId: curso._id,
    precioPagado: 120,
    moneda: 'USD',
    metodoPago: 'gratis',
    estado: 'activo',
    accesoIlimitado: true,
    fechaPago: new Date(),
    fechaInicio: new Date()
  });

  console.log('✅ Inscripción creada');

  // Crear progreso en algunas lecciones
  const primeraLeccion = todasLasLecciones[0];
  const segundaLeccion = todasLasLecciones[1];

  // Progreso completado en primera lección
  const progress1 = await Progress.create({
    userId: student._id,
    enrollmentId: enrollment._id,
    courseId: curso._id,
    lessonId: primeraLeccion._id,
    completado: true,
    fechaCompletado: new Date(),
    tiempoVisto: primeraLeccion.duracion,
    porcentajeVisto: 100,
    ultimaPosicion: primeraLeccion.duracion
  });

  // Progreso parcial en segunda lección
  const progress2 = await Progress.create({
    userId: student._id,
    enrollmentId: enrollment._id,
    courseId: curso._id,
    lessonId: segundaLeccion._id,
    completado: false,
    tiempoVisto: Math.floor(segundaLeccion.duracion * 0.6), // 60% visto
    porcentajeVisto: 60,
    ultimaPosicion: Math.floor(segundaLeccion.duracion * 0.6)
  });

  console.log('✅ Progreso creado');

  // Actualizar progreso del enrollment
  await enrollment.actualizarProgreso();
  console.log(`✅ Progreso del enrollment actualizado: ${enrollment.porcentajeCompletado}%`);

  return { enrollment, progress1, progress2 };
}

// Función para crear reseña
async function crearResena(curso, student, enrollment, models) {
  const { Review } = models;
  console.log('⭐ Creando reseña...');

  const review = await Review.create({
    userId: student._id,
    courseId: curso._id,
    enrollmentId: enrollment._id,
    rating: 5,
    titulo: 'Excelente introducción al movimiento consciente',
    comentario: 'El curso está muy bien estructurado y es fácil de seguir. La instructora explica todo de manera clara y las prácticas son muy útiles. Recomendado para principiantes.',
    aspectos: {
      contenido: 5,
      instructor: 5,
      valor: 5
    },
    publicado: true,
    moderado: true
  });

  console.log('✅ Reseña creada');

  // Actualizar métricas del curso
  await curso.actualizarMetricas();
  console.log(`✅ Métricas del curso actualizadas - Rating: ${curso.ratingPromedio}`);

  return review;
}

// Función principal
async function seed() {
  try {
    console.log('🚀 Iniciando seeder de cursos...\n');

    // Cargar variables de entorno primero
    await loadEnv();
    console.log('');

    // Cargar módulos (ya conecta a MongoDB internamente)
    const models = await loadModules();
    const { mongoose } = models;

    console.log('✅ Conectado a MongoDB\n');

    // Limpiar datos si se pasa --fresh
    const shouldClean = process.argv.includes('--fresh');
    if (shouldClean) {
      await limpiarDatos(models);
      console.log('');
    }

    // Crear usuarios
    const { instructor, student, admin } = await crearUsuarios(models);
    console.log('');

    // Crear curso completo
    const { curso, todasLasLecciones } = await crearCurso(instructor, models);
    console.log('');

    // Crear inscripción y progreso
    const { enrollment } = await crearInscripcionYProgreso(curso, student, todasLasLecciones, models);
    console.log('');

    // Crear reseña
    await crearResena(curso, student, enrollment, models);
    console.log('');

    console.log('🎉 ¡Seeder completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Curso: ${curso.titulo}`);
    console.log(`   - Slug: ${curso.slug}`);
    console.log(`   - Módulos: ${curso.totalModulos}`);
    console.log(`   - Lecciones: ${curso.totalLecciones}`);
    console.log(`   - Duración: ${curso.duracionTotal} minutos`);
    console.log(`   - Precio: $${curso.precio} ${curso.moneda}`);
    console.log(`   - Rating: ${curso.ratingPromedio}/5`);
    console.log('\n👤 Usuarios de prueba:');
    console.log(`   - Instructor: instructor@demo.com / demo1234`);
    console.log(`   - Estudiante: alumno@demo.com / demo1234`);
    console.log(`   - Admin: admin@demo.com / demo1234`);

  } catch (error) {
    console.error('❌ Error al ejecutar seeder:', error);
    throw error;
  } finally {
    // Cerrar conexión
    const models = await loadModules();
    await models.mongoose.connection.close();
    console.log('\n✅ Conexión cerrada');
  }
}

// Ejecutar seeder (IIFE para evitar top-level await)
(async () => {
  try {
    await seed();
    console.log('\n✅ Proceso finalizado');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  }
})();
