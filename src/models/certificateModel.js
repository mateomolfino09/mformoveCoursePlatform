import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  // Relaciones
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  enrollmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Enrollment', 
    required: true 
  },
  
  // Información del certificado
  numeroCertificado: { type: String, unique: true, required: true }, // Ej: CERT-2025-001234
  nombreEstudiante: { type: String, required: true },
  nombreCurso: { type: String, required: true },
  nombreInstructor: { type: String, required: true },
  
  // Fechas
  fechaEmision: { type: Date, default: Date.now },
  fechaCompletacion: { type: Date, required: true },
  
  // Métricas
  porcentajeCompletado: { type: Number, required: true, min: 0, max: 100 },
  horasCompletadas: { type: Number, default: 0 }, // En horas
  
  // Archivos
  pdfUrl: { type: String }, // URL del PDF generado (Cloudinary o S3)
  imagenUrl: { type: String }, // URL de la imagen del certificado
  
  // Verificación
  codigoVerificacion: { type: String, unique: true, required: true }, // Para verificar autenticidad
  urlVerificacion: { type: String }, // URL pública para verificar
  
  // Estado
  emitido: { type: Boolean, default: true },
  revocado: { type: Boolean, default: false },
  motivoRevocacion: { type: String },
  fechaRevocacion: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Índices
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });
certificateSchema.index({ codigoVerificacion: 1 });
certificateSchema.index({ numeroCertificado: 1 });

// Método estático para generar número de certificado
certificateSchema.statics.generarNumeroCertificado = async function() {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({ 
    numeroCertificado: new RegExp(`^CERT-${year}-`)
  });
  const numero = String(count + 1).padStart(6, '0');
  return `CERT-${year}-${numero}`;
};

// Método estático para generar código de verificación
certificateSchema.statics.generarCodigoVerificacion = function() {
  // Genera un código único de 16 caracteres
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 16; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
};

// Pre-save hook para generar número y código si no existen
certificateSchema.pre('save', async function(next) {
  if (!this.numeroCertificado) {
    this.numeroCertificado = await this.constructor.generarNumeroCertificado();
  }
  if (!this.codigoVerificacion) {
    this.codigoVerificacion = this.constructor.generarCodigoVerificacion();
  }
  if (!this.urlVerificacion) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    this.urlVerificacion = `${baseUrl}/certificado/verificar/${this.codigoVerificacion}`;
  }
  next();
});

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
export default Certificate;


