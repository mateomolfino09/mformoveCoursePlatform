import mongoose from 'mongoose';
import validator from 'validator';

const fileSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true    
    },
    document_url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    format: {
      type: String
    }
  }
)

const linkSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true    
    },
    link_url: {
      type: String,
      required: true
    },
  }
)

const tagsSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
    },
    title: {
      type: String,
    },
  }
)

const individualClassSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: () => Date.now()
    },
    image_url: {
      type: String,
      required: true
    },
    totalTime: {
      type: Number,
      default: () => 0
    },
    seconds: {
      type: Number,
      default: () => 0
    },
    minutes: {
      type: Number,
      default: () => 0
    },
    hours: {
      type: Number,
      default: () => 0
    },
    level: {
        type: String,
        required: true
    },
    type: {
      type: String,
      required: true
    },
    /** Módulo de clase (Movimiento, Movilidad, Handbalance, etc.) - filtro principal */
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassModule',
      default: null
    },
    /** Submódulo (ej. Locomotions, Squat Work) - slug del submódulo dentro del módulo */
    submoduleSlug: { type: String, default: null },
    isFree: {
      type: Boolean,
      default: () => false
    },
    image_base_link: {
      type: String,
      required: true
    },
        //embed.html
    html: {
      type: String,
      required: true
    },
    //embed.html
    link: {
      type: String,
      required: true
    },
    /** Si false, la clase solo aparece en weekly path hasta que el job publique la última semana. */
    visibleInLibrary: {
      type: Boolean,
      default: true
    },
    new: {
      type: Boolean,
      required: true,
      default: () => true
    },
    tags: [
      tagsSchema
    ],
    links: [
      linkSchema
    ],
    atachedFiles: [
      fileSchema
    ],
  },
  { timestamps: true }
);

let Dataset = mongoose.models.IndividualClass || mongoose.model('IndividualClass', individualClassSchema);
export default Dataset;
