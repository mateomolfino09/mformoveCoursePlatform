import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
  
  // Información de pago
  precioPagado: { type: Number, required: true },
  moneda: { type: String, default: 'USD' },
  metodoPago: { type: String, enum: ['stripe', 'dlocal', 'transferencia', 'gratis'] },
  transaccionId: { type: String }, // ID de la transacción en Stripe/dLocal
  fechaPago: { type: Date, default: Date.now },
  
  // Estado
  estado: { 
    type: String, 
    enum: ['activo', 'cancelado', 'reembolsado', 'expirado'], 
    default: 'activo' 
  },
  
  // Acceso
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date }, // null = acceso ilimitado
  accesoIlimitado: { type: Boolean, default: true },
  
  // Progreso general
  porcentajeCompletado: { type: Number, default: 0, min: 0, max: 100 },
  ultimaLeccionVista: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  },
  fechaUltimoAcceso: { type: Date, default: Date.now },
  
  // Certificado
  certificadoEmitido: { type: Boolean, default: false },
  fechaCertificado: { type: Date },
  certificadoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Certificate' 
  },
  
  // Notas del estudiante (opcional)
  notas: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Índices
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ estado: 1 });

// Método para actualizar porcentaje de completitud
enrollmentSchema.methods.actualizarProgreso = async function() {
  const Progress = mongoose.model('Progress');
  const Lesson = mongoose.model('Lesson');
  
  // Obtener todas las lecciones del curso
  const totalLecciones = await Lesson.countDocuments({ 
    courseId: this.courseId,
    publicado: true
  });
  
  if (totalLecciones === 0) {
    this.porcentajeCompletado = 0;
    await this.save();
    return;
  }
  
  // Contar lecciones completadas
  const leccionesCompletadas = await Progress.countDocuments({
    enrollmentId: this._id,
    completado: true
  });
  
  this.porcentajeCompletado = Math.round((leccionesCompletadas / totalLecciones) * 100);
  await this.save();
  
  // Verificar si cumple requisitos para certificado
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.courseId);
  
  if (course && course.emiteCertificado && 
      this.porcentajeCompletado >= course.porcentajeMinimoCompletitud &&
      !this.certificadoEmitido) {
    // Aquí se podría emitir el certificado automáticamente
    // Por ahora solo marcamos que es elegible
  }
};

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;


