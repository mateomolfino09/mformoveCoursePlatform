const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  paisCiudad: { type: String, required: true },
  interesadoEn: [{ type: String, required: true }],
  dondeEntrena: { type: String, required: true },
  nivelActual: { type: String, required: true },
  /** Texto legacy (objetivos unidos). Se mantiene por compatibilidad con solicitudes viejas. */
  nivelBuscado: { type: String, required: true },
  /** Objetivos múltiples del formulario nuevo. */
  objetivos: [{ type: String }],
  principalFrenoJustificacion: { type: String, required: true },
  principalFreno: { type: String, required: true },
  porQueElegirme: { type: String, required: true },
  whatsapp: { type: String, required: true },
  /** Inversión mensual cómoda (pregunta nueva). */
  modalidad: { type: String },
  /** Modalidad de plan (trimestral/anual u opciones legacy). */
  presupuesto: { type: String, required: true },
  comentarios: { type: String },
  estado: { type: String, enum: ['pendiente', 'aprobada', 'rechazada'], default: 'pendiente' },
  vista: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.MentorshipRequest || mongoose.model('MentorshipRequest', mentorshipRequestSchema);
