import mongoose from 'mongoose';

/**
 * Registro de clase de módulo completada por un usuario.
 * Una fila por usuario por clase (idempotente por userId + classId).
 */
const moduleClassCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModuleClass',
      required: true,
    },
    completedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

moduleClassCompletionSchema.index({ userId: 1, classId: 1 }, { unique: true });
moduleClassCompletionSchema.index({ userId: 1 });

const ModuleClassCompletion =
  mongoose.models.ModuleClassCompletion ||
  mongoose.model('ModuleClassCompletion', moduleClassCompletionSchema);

export default ModuleClassCompletion;
