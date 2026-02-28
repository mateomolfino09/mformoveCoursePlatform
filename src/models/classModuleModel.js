import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    caption: { type: String }
  },
  { _id: true }
);

const submoduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true }
  },
  { _id: true }
);

const howToUseItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' }
  },
  { _id: true }
);

const classModuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String },
    shortDescription: { type: String },
    /** Descripción para la sección "Sobre esta serie" en la página del módulo */
    aboutDescription: { type: String },
    /** Galería de imágenes del módulo (subir con preview) */
    imageGallery: {
      type: [galleryImageSchema],
      default: []
    },
    /** Cómo usar esta biblioteca: lista de bloques título + descripción (rectángulos en la página del módulo) */
    howToUse: {
      type: [howToUseItemSchema],
      default: []
    },
    /** Submódulos: ej. Locomotions, Squat Work, Floor Work (solo nombre, sin imagen) */
    submodules: {
      type: [submoduleSchema],
      default: []
    },
    /** Video principal asociado al módulo */
    videoUrl: { type: String },
    videoId: { type: String },
    videoThumbnail: { type: String },
    /** Opcionales para UI (icono, color) */
    icon: { type: String },
    color: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

classModuleSchema.index({ slug: 1 });
classModuleSchema.index({ isActive: 1 });

const ClassModule = mongoose.models.ClassModule || mongoose.model('ClassModule', classModuleSchema);
export default ClassModule;
