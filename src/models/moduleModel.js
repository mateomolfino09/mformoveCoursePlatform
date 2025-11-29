import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  // Relación con curso
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  
  // Información básica
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String },
  orden: { type: Number, required: true, min: 0 }, // Orden dentro del curso
  
  // Contenido
  duracionTotal: { type: Number, default: 0 }, // En minutos (suma de lecciones)
  totalLecciones: { type: Number, default: 0 },
  
  // Estado
  publicado: { type: Boolean, default: true },
  desbloqueado: { type: Boolean, default: true }, // Si está disponible desde el inicio
  
  // Configuración de desbloqueo
  requiereCompletarModuloAnterior: { type: Boolean, default: false },
  moduloAnteriorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module' 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Índices
moduleSchema.index({ courseId: 1, orden: 1 });
moduleSchema.index({ courseId: 1 });

// Método para actualizar duración y total de lecciones
moduleSchema.methods.actualizarMetricas = async function() {
  const Lesson = mongoose.model('Lesson');
  
  const lecciones = await Lesson.find({ moduleId: this._id });
  this.totalLecciones = lecciones.length;
  this.duracionTotal = lecciones.reduce((sum, l) => sum + (l.duracion || 0), 0);
  
  await this.save();
};

const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
export default Module;


