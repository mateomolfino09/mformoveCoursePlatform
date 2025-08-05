import connectDB from '../src/config/connectDB.js';
import Product from '../src/models/productModel.js';

const programaTransformacional = {
  nombre: "Programa Transformacional de 8 Semanas",
  descripcion: "Un viaje de 8 semanas para transformar tu relación con el movimiento, recuperar tu vitalidad y sentirte más fuerte, ágil y conectado. Este no es solo un programa de ejercicios, es una transformación completa de tu relación con el movimiento y tu cuerpo.",
  tipo: "evento",
  precio: 297,
  moneda: "USD",
  imagenes: [
    "https://res.cloudinary.com/demo/image/upload/v1/samples/people/boy-snow-hoodie",
    "https://res.cloudinary.com/demo/image/upload/v1/samples/people/woman-1"
  ],
  portada: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/boy-snow-hoodie",
  activo: true,
  destacado: true,
  online: true,
  fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
  cupo: 50,
  beneficios: [
    "Reconexión profunda con tu cuerpo",
    "Movimiento natural y fluido",
    "Fuerza orgánica y funcional",
    "Flexibilidad real y duradera",
    "Confianza en tus capacidades físicas",
    "Salida del sedentarismo",
    "Comunidad de apoyo continuo",
    "Resultados visibles en 8 semanas"
  ],
  aprendizajes: [
    "Fundamentos del movimiento natural",
    "Técnicas de consciencia corporal",
    "Métodos de movilidad y flexibilidad",
    "Desarrollo de fuerza orgánica",
    "Locomociones naturales",
    "Juego y expresión corporal",
    "Integración y fluidez",
    "Transformación personal completa"
  ],
  paraQuien: [
    "Personas que quieren reconectarse con su cuerpo",
    "Quienes buscan salir del sedentarismo",
    "Practicantes de movimiento que quieren profundizar",
    "Personas que quieren mejorar su movilidad",
    "Quienes buscan una práctica más natural",
    "Personas que quieren sentirse más fuertes y ágiles"
  ],
  etiquetas: ["movimiento", "transformación", "8 semanas", "online", "comunidad"],
  
  // Precios con early bird
  precios: {
    earlyBird: {
      price: 197,
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
      paymentLink: "https://buy.stripe.com/test_link_here"
    },
    general: {
      price: 297,
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      paymentLink: "https://buy.stripe.com/test_link_here"
    },
    lastTickets: {
      price: 397,
      paymentLink: "https://buy.stripe.com/test_link_here"
    }
  },

  // Programa Transformacional
  esProgramaTransformacional: true,
  programaTransformacional: {
    duracionSemanas: 8,
    fechaFin: new Date(Date.now() + 9 * 7 * 24 * 60 * 60 * 1000), // 9 semanas desde ahora
    cupoDisponible: 35,
    estadoCohorte: "abierta",
    semanas: [
      {
        numero: 1,
        titulo: "Fundamentos del Movimiento",
        descripcion: "Establecemos las bases para una práctica sostenible y natural",
        contenido: [
          {
            tipo: "video",
            titulo: "Introducción al Movimiento Natural",
            duracion: 45,
            descripcion: "Video introductorio sobre los principios del movimiento natural",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Exploración Corporal Básica",
            duracion: 30,
            descripcion: "Práctica guiada de exploración corporal",
            orden: 2
          },
          {
            tipo: "reflexion",
            titulo: "Diario de Movimiento",
            descripcion: "Reflexión sobre tu relación actual con el movimiento",
            orden: 3
          }
        ],
        desbloqueado: true,
        fechaDesbloqueo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 2,
        titulo: "Consciencia Corporal",
        descripcion: "Desarrollamos la conexión mente-cuerpo",
        contenido: [
          {
            tipo: "video",
            titulo: "Técnicas de Consciencia Corporal",
            duracion: 50,
            descripcion: "Aprende técnicas para desarrollar mayor consciencia corporal",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Meditación en Movimiento",
            duracion: 25,
            descripcion: "Práctica de meditación mientras te mueves",
            orden: 2
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 3,
        titulo: "Movilidad y Flexibilidad",
        descripcion: "Liberamos tensiones y ampliamos rangos de movimiento",
        contenido: [
          {
            tipo: "video",
            titulo: "Rutina de Movilidad",
            duracion: 40,
            descripcion: "Rutina completa de movilidad y flexibilidad",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Liberación de Tensiones",
            duracion: 35,
            descripcion: "Técnicas para liberar tensiones corporales",
            orden: 2
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 4,
        titulo: "Fuerza Orgánica",
        descripcion: "Construimos fuerza desde el centro",
        contenido: [
          {
            tipo: "video",
            titulo: "Fundamentos de Fuerza Orgánica",
            duracion: 55,
            descripcion: "Principios de la fuerza orgánica y funcional",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Ejercicios de Fuerza Natural",
            duracion: 45,
            descripcion: "Secuencia de ejercicios de fuerza orgánica",
            orden: 2
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 5,
        titulo: "Locomociones Naturales",
        descripcion: "Exploramos movimientos primitivos",
        contenido: [
          {
            tipo: "video",
            titulo: "Introducción a las Locomociones",
            duracion: 50,
            descripcion: "Aprende los patrones básicos de locomoción",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Práctica de Locomociones",
            duracion: 40,
            descripcion: "Práctica guiada de locomociones naturales",
            orden: 2
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 6,
        titulo: "Juego y Expresión",
        descripcion: "Recuperamos la alegría del movimiento",
        contenido: [
          {
            tipo: "video",
            titulo: "El Poder del Juego",
            duracion: 45,
            descripcion: "Cómo el juego puede transformar tu movimiento",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Juegos de Movimiento",
            duracion: 50,
            descripcion: "Secuencia de juegos para explorar el movimiento",
            orden: 2
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 7,
        titulo: "Integración y Fluidez",
        descripcion: "Conectamos todos los elementos",
        contenido: [
          {
            tipo: "video",
            titulo: "Integrando Todo lo Aprendido",
            duracion: 60,
            descripcion: "Cómo integrar todos los elementos del programa",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Flujo Completo",
            duracion: 55,
            descripcion: "Secuencia completa integrando todos los elementos",
            orden: 2
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000)
      },
      {
        numero: 8,
        titulo: "Transformación Completa",
        descripcion: "Celebramos tu nueva relación con el movimiento",
        contenido: [
          {
            tipo: "video",
            titulo: "Reflexión Final",
            duracion: 30,
            descripcion: "Reflexión sobre tu transformación",
            orden: 1
          },
          {
            tipo: "practica",
            titulo: "Celebración del Movimiento",
            duracion: 45,
            descripcion: "Práctica final de celebración",
            orden: 2
          },
          {
            tipo: "tarea",
            titulo: "Plan para el Futuro",
            descripcion: "Crea tu plan para mantener tu práctica",
            orden: 3
          }
        ],
        desbloqueado: false,
        fechaDesbloqueo: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000)
      }
    ],
    sesionesEnVivo: [
      {
        fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        titulo: "Sesión de Bienvenida",
        descripcion: "Conoce a tus compañeros y al equipo. Resolvemos dudas y establecemos expectativas.",
        duracion: 90,
        tipo: "q&a"
      },
      {
        fecha: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        titulo: "Q&A Semana 2",
        descripcion: "Sesión de preguntas y respuestas sobre consciencia corporal.",
        duracion: 60,
        tipo: "q&a"
      },
      {
        fecha: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        titulo: "Práctica Grupal de Movilidad",
        descripcion: "Sesión práctica grupal de movilidad y flexibilidad.",
        duracion: 75,
        tipo: "practica"
      },
      {
        fecha: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        titulo: "Q&A Semana 4",
        descripcion: "Preguntas sobre fuerza orgánica y progreso.",
        duracion: 60,
        tipo: "q&a"
      },
      {
        fecha: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        titulo: "Práctica de Locomociones",
        descripcion: "Sesión práctica de locomociones naturales.",
        duracion: 80,
        tipo: "practica"
      },
      {
        fecha: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        titulo: "Q&A Semana 6",
        descripcion: "Preguntas sobre juego y expresión corporal.",
        duracion: 60,
        tipo: "q&a"
      },
      {
        fecha: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000),
        titulo: "Integración Grupal",
        descripcion: "Sesión de integración de todos los elementos aprendidos.",
        duracion: 90,
        tipo: "practica"
      },
      {
        fecha: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
        titulo: "Celebración Final",
        descripcion: "Celebramos juntos tu transformación y planificamos el futuro.",
        duracion: 120,
        tipo: "comunidad"
      }
    ],
    comunidad: {
      grupoWhatsapp: "https://chat.whatsapp.com/example",
      grupoTelegram: "https://t.me/example",
      descripcion: "Únete a una comunidad de personas que, como tú, buscan transformar su relación con el movimiento. Comparte experiencias, dudas y logros con tus compañeros."
    },
    resultadosEsperados: [
      "Mayor consciencia corporal y conexión mente-cuerpo",
      "Mejora significativa en movilidad y flexibilidad",
      "Desarrollo de fuerza orgánica y funcional",
      "Recuperación de la alegría del movimiento",
      "Confianza en tus capacidades físicas",
      "Hábitos sostenibles de movimiento",
      "Comunidad de apoyo para continuar"
    ],
    requisitosPrevios: [
      "Ganas de transformar tu relación con el movimiento",
      "Compromiso de dedicar tiempo semanal al programa",
      "Disposición para explorar y experimentar",
      "No se requiere experiencia previa"
    ],
    materialesNecesarios: [
      "Espacio cómodo para moverte",
      "Ropa cómoda para ejercicio",
      "Dispositivo para ver videos",
      "Diario o cuaderno para reflexiones"
    ]
  }
};

async function createTransformationalProgram() {
  try {
    await connectDB();
    
    // Verificar si ya existe
    const existingProgram = await Product.findOne({ 
      nombre: programaTransformacional.nombre,
      esProgramaTransformacional: true 
    });
    
    if (existingProgram) {
      console.log('El programa transformacional ya existe en la base de datos.');
      return;
    }
    
    // Crear el programa
    const newProgram = new Product(programaTransformacional);
    await newProgram.save();
    
    console.log('✅ Programa transformacional creado exitosamente!');
    console.log('ID:', newProgram._id);
    console.log('Nombre:', newProgram.nombre);
    console.log('URL:', `/events/${newProgram.nombre.toLowerCase().replace(/\s+/g, '-')}`);
    
  } catch (error) {
    console.error('❌ Error al crear el programa transformacional:', error);
  } finally {
    process.exit(0);
  }
}

createTransformationalProgram(); 