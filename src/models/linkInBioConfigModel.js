import mongoose from 'mongoose';

const linkInBioConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    mentoria: {
      activoEnBio: { type: Boolean, default: true },
      /** @deprecated Preferí imagenBioTrimestral / imagenBioAnual. */
      imagenBio: { type: String, default: '' },
      imagenBioTrimestral: { type: String, default: '' },
      imagenBioAnual: { type: String, default: '' },
      titulo: { type: String, default: 'Mentoría 1:1' },
      subtitulo: { type: String, default: 'Acompañamiento personalizado' },
      tituloTrimestral: { type: String, default: '' },
      subtituloTrimestral: { type: String, default: '' },
      tituloAnual: { type: String, default: '' },
      subtituloAnual: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const LinkInBioConfig =
  mongoose.models.LinkInBioConfig || mongoose.model('LinkInBioConfig', linkInBioConfigSchema);

export default LinkInBioConfig;
