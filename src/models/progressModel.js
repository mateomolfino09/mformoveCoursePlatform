import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  // Relaciones
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  enrollmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Enrollment', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  
  // Estado de completitud
  completado: { type: Boolean, default: false },
  fechaCompletado: { type: Date },
  
  // Progreso de video (si es tipo video)
  tiempoVisto: { type: Number, default: 0 }, // En segundos
  porcentajeVisto: { type: Number, default: 0, min: 0, max: 100 },
  ultimaPosicion: { type: Number, default: 0 }, // Segundo donde se quedó
  
  // Quiz (si es tipo quiz)
  quizCompletado: { type: Boolean, default: false },
  intentos: { type: Number, default: 0 },
  mejorPuntuacion: { type: Number, default: 0 },
  ultimaPuntuacion: { type: Number },
  respuestas: [{
    preguntaId: { type: String },
    respuestaSeleccionada: { type: String },
    esCorrecta: { type: Boolean },
    fecha: { type: Date, default: Date.now }
  }],
  
  // Notas del estudiante
  notas: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Índices
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ enrollmentId: 1 });
progressSchema.index({ courseId: 1 });
progressSchema.index({ completado: 1 });

// Método para marcar como completado
progressSchema.methods.marcarCompletado = async function() {
  if (!this.completado) {
    this.completado = true;
    this.fechaCompletado = new Date();
    await this.save();
    
    // Actualizar progreso del enrollment
    const Enrollment = mongoose.model('Enrollment');
    const enrollment = await Enrollment.findById(this.enrollmentId);
    if (enrollment) {
      await enrollment.actualizarProgreso();
    }
  }
};

// Método para actualizar progreso de video
progressSchema.methods.actualizarProgresoVideo = async function(tiempoVisto, duracionTotal) {
  this.tiempoVisto = tiempoVisto;
  this.ultimaPosicion = tiempoVisto;
  
  if (duracionTotal > 0) {
    this.porcentajeVisto = Math.round((tiempoVisto / duracionTotal) * 100);
    
    // Marcar como completado si vio al menos el 90%
    if (this.porcentajeVisto >= 90 && !this.completado) {
      await this.marcarCompletado();
    }
  }
  
  await this.save();
};

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);
export default Progress;


