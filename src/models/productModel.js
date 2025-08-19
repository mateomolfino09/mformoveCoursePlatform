import mongoose from 'mongoose';

const ubicacionSchema = new mongoose.Schema({
  display_name: { type: String },
  lat: { type: String },
  lon: { type: String },
  ciudad: { type: String },
  pais: { type: String }
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