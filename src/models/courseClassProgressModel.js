import mongoose from 'mongoose';

/**
 * Progreso de un usuario en una CourseClass de un producto gratuito secuencial.
 * La existencia del documento = la clase fue iniciada. No hay estado persistido
 * "not_started": su ausencia es el estado.
 */
const courseClassProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseClass', required: true },
    /** Denormalizado: permite traer todo el progreso de un producto sin joinear por CourseClass. */
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    /**
     * 'completed' está reservado para una iteración futura — no se setea en esta feature.
     * No conectar ningún evento del player (onEnded) a este valor todavía.
     */
    status: { type: String, enum: ['started', 'completed'], default: 'started' },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

courseClassProgressSchema.index({ userId: 1, courseClassId: 1 }, { unique: true });
courseClassProgressSchema.index({ userId: 1, productId: 1 });

const CourseClassProgress =
  mongoose.models.CourseClassProgress ||
  mongoose.model('CourseClassProgress', courseClassProgressSchema);
export default CourseClassProgress;
