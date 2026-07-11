import mongoose from 'mongoose';

/**
 * Clase de curso (producto tipo curso): vive bajo un módulo de contenido (timelineIndex).
 * Misma forma que ModuleClass para la visualización en biblioteca/práctica.
 */
const courseClassSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    /** Índice en cursoConfig.contenidoModulos / highlights.items */
    timelineIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    descripcionGeneral: { type: String, default: '' },
    descripcionCorta: { type: String, default: '' },
    descripcionCompleta: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    videoId: { type: String },
    videoThumbnail: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    order: { type: Number, default: 0 },
    materials: {
      type: [{ type: String, enum: ['pelota', 'baston', 'banda elastica', 'banco', 'bloque', 'libreta', 'lapicera'] }],
      default: [],
    },
    visibleInLibrary: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseClassSchema.index({ productId: 1, timelineIndex: 1 });
courseClassSchema.index({ productId: 1, timelineIndex: 1, order: 1 });

const CourseClass =
  mongoose.models.CourseClass || mongoose.model('CourseClass', courseClassSchema);
export default CourseClass;
