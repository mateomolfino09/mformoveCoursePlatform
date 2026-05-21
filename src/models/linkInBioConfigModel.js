import mongoose from 'mongoose';

const linkInBioConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    mentoria: {
      activoEnBio: { type: Boolean, default: true },
      imagenBio: { type: String, default: '' },
      titulo: { type: String, default: 'Mentoría 1:1' },
      subtitulo: { type: String, default: 'Acompañamiento personalizado' },
    },
  },
  { timestamps: true }
);

const LinkInBioConfig =
  mongoose.models.LinkInBioConfig || mongoose.model('LinkInBioConfig', linkInBioConfigSchema);

export default LinkInBioConfig;
