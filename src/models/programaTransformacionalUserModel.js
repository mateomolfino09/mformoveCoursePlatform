import mongoose from 'mongoose';

const programUserSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  programId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  
  // Estado del usuario en el programa
  estado: { 
    type: String, 
    enum: ['inscrito', 'en_curso', 'completado', 'abandonado'], 
    default: 'inscrito' 
  },
  
  // Fechas importantes
  fechaInscripcion: { type: Date, default: Date.now },
  fechaInicio: { type: Date },
  fechaCompletado: { type: Date },
  
  // Progreso semanal
  progresoSemanas: [{
    numeroSemana: { type: Number, required: true },
    completada: { type: Boolean, default: false },
    fechaCompletado: { type: Date },
    contenidoCompletado: [{
      tipo: { type: String },
      titulo: { type: String },
      fechaCompletado: { type: Date },
      tiempoDedicado: { type: Number } // en minutos
    }],
    notas: { type: String },
    reflexiones: { type: String }
  }],
  
  // Asistencia a sesiones en vivo
  sesionesEnVivo: [{
    fecha: { type: Date },
    asistio: { type: Boolean, default: false },
    duracionAsistencia: { type: Number }, // en minutos
    feedback: { type: String }
  }],
  
  // Participación en comunidad
  participacionComunidad: {
    mensajesEnviados: { type: Number, default: 0 },
    ultimaActividad: { type: Date },
    nivelParticipacion: { type: String, enum: ['bajo', 'medio', 'alto'], default: 'bajo' }
  },
  
  // Resultados y feedback
  resultados: {
    objetivosCumplidos: [{ type: String }],
    cambiosNotados: { type: String },
    satisfaccion: { type: Number, min: 1, max: 10 }, // 1-10
    recomendaria: { type: Boolean },
    feedbackGeneral: { type: String }
  },
  
  // Certificado
  certificado: {
    emitido: { type: Boolean, default: false },
    fechaEmision: { type: Date },
    urlCertificado: { type: String }
  },
  
  // Configuración de notificaciones
  notificaciones: {
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    recordatorios: { type: Boolean, default: true }
  }
  
}, { timestamps: true });

// Índices para optimizar consultas
programUserSchema.index({ userId: 1, programId: 1 }, { unique: true });
programUserSchema.index({ programId: 1, estado: 1 });
programUserSchema.index({ fechaInscripcion: -1 });

let Dataset = mongoose.models.ProgramaTransformacionalUser || mongoose.model('ProgramaTransformacionalUser', programUserSchema);
export default Dataset; 