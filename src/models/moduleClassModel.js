import mongoose from 'mongoose';

/**
 * Clase de módulo: videos cortos que viven dentro de un submódulo.
 * Se crean solo desde crear/editar submódulo. Nivel 1-10.
 * Distinto de IndividualClass (clases "completas" de la biblioteca).
 */
const moduleClassSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassModule',
      required: true
    },
    submoduleSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    videoUrl: { type: String, default: '' },
    videoId: { type: String },
    videoThumbnail: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1
    },
    order: { type: Number, default: 0 },
    /** Materiales a usar en clase (lista predefinida). */
    materials: {
      type: [{ type: String, enum: ['baston', 'banda elastica', 'banco', 'pelota'] }],
      default: []
    }
  },
  { timestamps: true }
);

moduleClassSchema.index({ moduleId: 1, submoduleSlug: 1 });
moduleClassSchema.index({ moduleId: 1, submoduleSlug: 1, order: 1 });

const ModuleClass = mongoose.models.ModuleClass || mongoose.model('ModuleClass', moduleClassSchema);
export default ModuleClass;
