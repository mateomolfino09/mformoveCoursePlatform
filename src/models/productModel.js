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
  tipo: { type: String, enum: ['curso', 'bundle', 'evento', 'recurso'], required: true },
  precio: { type: Number, required: true },
  moneda: { type: String, default: 'USD' },
  imagenes: [{ type: String }], // URLs de imágenes
  portada: { type: String }, // URL de la imagen de portada
  precios: { type: Object }, // Objeto con earlyBird, general, lastTickets
  paymentLinks: { type: Object }, // Links de pago para cada precio
  activo: { type: Boolean, default: true },
  destacado: { type: Boolean, default: false },

  // --- Eventos ---
  fecha: { type: Date },
  ubicacion: { type: ubicacionSchema },
  online: { type: Boolean },
  linkEvento: { type: String }, // Zoom, Meet, etc.
  cupo: { type: Number },
  pdfPresentacionUrl: { type: String }, // PDF de presentación para eventos

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