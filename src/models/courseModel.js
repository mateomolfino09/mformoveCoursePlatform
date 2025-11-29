import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  // Información básica
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, minLength: 20 },
  descripcionCorta: { type: String, maxLength: 200 }, // Para cards y previews
  slug: { type: String, unique: true, lowercase: true, trim: true }, // URL amigable
  
  // Multimedia
  imagenPortada: { type: String, required: true }, // URL de Cloudinary
  imagenPortadaMobile: { type: String }, // URL optimizada para móvil
  galeriaImagenes: [{ type: String }], // Array de URLs
  videoTrailer: { type: String }, // URL de Vimeo o video embed
  
  // Precio y monetización
  precio: { type: Number, required: true, min: 0 },
  moneda: { type: String, default: 'USD' },
  precioOriginal: { type: Number }, // Para mostrar descuentos
  stripeProductId: { type: String }, // ID del producto en Stripe
  stripePriceId: { type: String }, // ID del precio en Stripe
  
  // Categorización
  categoria: { type: String, required: true }, // Ej: 'yoga', 'meditacion', 'fitness'
  nivel: { type: String, enum: ['principiante', 'intermedio', 'avanzado'], default: 'principiante' },
  etiquetas: [{ type: String }], // Para búsqueda y filtros
  
  // Instructor
  instructorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  instructorNombre: { type: String }, // Cache del nombre para evitar joins
  
  // Contenido
  duracionTotal: { type: Number, default: 0 }, // En minutos
  totalLecciones: { type: Number, default: 0 },
  totalModulos: { type: Number, default: 0 },
  
  // Estado y visibilidad
  estado: { 
    type: String, 
    enum: ['borrador', 'revision', 'publicado', 'archivado'], 
    default: 'borrador' 
  },
  publicado: { type: Boolean, default: false },
  fechaPublicacion: { type: Date },
  
  // Métricas
  totalVentas: { type: Number, default: 0 },
  totalEstudiantes: { type: Number, default: 0 },
  ratingPromedio: { type: Number, default: 0, min: 0, max: 5 },
  totalResenas: { type: Number, default: 0 },
  
  // Información adicional
  objetivos: [{ type: String }], // Qué aprenderá el estudiante
  requisitosPrevios: [{ type: String }], // Qué necesita saber antes
  materialesIncluidos: [{ type: String }], // PDFs, recursos, etc.
  
  // Certificado
  emiteCertificado: { type: Boolean, default: true },
  porcentajeMinimoCompletitud: { type: Number, default: 80 }, // % necesario para certificado
  
  // SEO y marketing
  metaTitulo: { type: String },
  metaDescripcion: { type: String },
  palabrasClave: [{ type: String }],
  
  // Configuración
  permiteAccesoIlimitado: { type: Boolean, default: true }, // Acceso de por vida
  permiteDescarga: { type: Boolean, default: false }, // Si permite descargar contenido
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsqueda y performance
courseSchema.index({ slug: 1 });
courseSchema.index({ categoria: 1, nivel: 1 });
courseSchema.index({ instructorId: 1 });
courseSchema.index({ estado: 1, publicado: 1 });
courseSchema.index({ titulo: 'text', descripcion: 'text', etiquetas: 'text' }); // Text search

// Virtual para calcular porcentaje de descuento
courseSchema.virtual('descuentoPorcentaje').get(function() {
  if (this.precioOriginal && this.precioOriginal > this.precio) {
    return Math.round(((this.precioOriginal - this.precio) / this.precioOriginal) * 100);
  }
  return 0;
});

// Método para actualizar métricas
courseSchema.methods.actualizarMetricas = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const Review = mongoose.model('Review'); // Asumimos que existe
  
  const totalEnrollments = await Enrollment.countDocuments({ 
    courseId: this._id,
    estado: 'activo'
  });
  
  const reviews = await Review.find({ courseId: this._id });
  const ratingPromedio = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  
  this.totalEstudiantes = totalEnrollments;
  this.totalResenas = reviews.length;
  this.ratingPromedio = Math.round(ratingPromedio * 10) / 10; // Redondear a 1 decimal
  
  await this.save();
};

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;


