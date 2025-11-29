import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  // Relaciones
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  moduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module', 
    required: true 
  },
  
  // Información básica
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String },
  orden: { type: Number, required: true, min: 0 }, // Orden dentro del módulo
  
  // Tipo de contenido
  tipo: { 
    type: String, 
    enum: ['video', 'texto', 'quiz', 'descarga', 'enlace'], 
    default: 'video',
    required: true
  },
  
  // Contenido de video
  videoUrl: { type: String }, // URL de Vimeo, Mux, etc.
  videoId: { type: String }, // ID del video en la plataforma
  videoProvider: { type: String, enum: ['vimeo', 'mux', 'cloudflare', 'youtube'] },
  duracion: { type: Number, default: 0 }, // En segundos
  
  // Contenido de texto
  contenidoTexto: { type: String }, // HTML o Markdown
  
  // Quiz
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam' 
  },
  
  // Recursos descargables
  recursos: [{
    nombre: { type: String, required: true },
    url: { type: String, required: true },
    tipo: { type: String, enum: ['pdf', 'zip', 'imagen', 'otro'] },
    tamano: { type: Number }, // En bytes
  }],
  
  // Enlaces externos
  enlaces: [{
    titulo: { type: String, required: true },
    url: { type: String, required: true },
    descripcion: { type: String }
  }],
  
  // Estado
  publicado: { type: Boolean, default: true },
  esGratis: { type: Boolean, default: false }, // Preview gratuito
  
  // Configuración
  permiteDescarga: { type: Boolean, default: false },
  requiereCompletarLeccionAnterior: { type: Boolean, default: false },
  leccionAnteriorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson' 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Índices
lessonSchema.index({ courseId: 1, moduleId: 1, orden: 1 });
lessonSchema.index({ courseId: 1 });
lessonSchema.index({ moduleId: 1 });

// Virtual para obtener duración en formato legible
lessonSchema.virtual('duracionFormateada').get(function() {
  if (!this.duracion) return '0:00';
  const minutos = Math.floor(this.duracion / 60);
  const segundos = this.duracion % 60;
  return `${minutos}:${segundos.toString().padStart(2, '0')}`;
});

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
export default Lesson;


