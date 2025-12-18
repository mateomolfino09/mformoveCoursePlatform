import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
    ref: 'Enrollment' 
  },
  
  // Contenido de la reseña
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  titulo: { type: String, maxLength: 100 },
  comentario: { type: String, maxLength: 1000 },
  
  // Aspectos específicos (opcional)
  aspectos: {
    contenido: { type: Number, min: 1, max: 5 },
    instructor: { type: Number, min: 1, max: 5 },
    valor: { type: Number, min: 1, max: 5 }
  },
  
  // Estado
  publicado: { type: Boolean, default: false },
  moderado: { type: Boolean, default: false },
  moderadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  fechaModeracion: { type: Date },
  
  // Útil/No útil
  util: { type: Number, default: 0 }, // Contador de "útil"
  reportado: { type: Boolean, default: false },
  motivoReporte: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Índices
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true }); // Un usuario solo puede reseñar un curso una vez
reviewSchema.index({ courseId: 1, publicado: 1 });
reviewSchema.index({ rating: 1 });

// Pre-save hook para actualizar rating del curso
reviewSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.courseId);
  if (course) {
    await course.actualizarMetricas();
  }
});

// Pre-remove hook para actualizar rating del curso
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Course = mongoose.model('Course');
    const course = await Course.findById(doc.courseId);
    if (course) {
      await course.actualizarMetricas();
    }
  }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;


