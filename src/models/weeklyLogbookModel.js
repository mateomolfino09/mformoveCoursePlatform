import mongoose from 'mongoose';

// Schema para contenido diario dentro de una semana
const dailyContentSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 7 // 7 días de la semana
  },
  dayTitle: {
    type: String, // Ej: "Día 1", "Lunes", etc.
    default: ''
  },
  // Contenido Visual (Video)
  visualContent: {
    type: {
      type: String,
      enum: ['video', 'none'],
      default: 'none'
    },
    nombre: {
      type: String, // Nombre del video
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    videoId: {
      type: String // Para Vimeo u otro proveedor
    },
    thumbnailUrl: {
      type: String // URL de thumbnail para preview
    },
    duration: {
      type: Number // Duración en segundos
    },
    title: {
      type: String // Título del contenido visual
    },
    description: {
      type: String // Descripción del contenido visual
    }
  },
  // Contenido Audio + Texto
  audioTextContent: {
    nombre: {
      type: String, // Nombre del audio
      default: ''
    },
    audioUrl: {
      type: String,
      default: ''
    },
    audioDuration: {
      type: Number // Duración en segundos
    },
    text: {
      type: String,
      default: ''
    },
    title: {
      type: String // Título del contenido audio+texto
    },
    subtitle: {
      type: String // Subtítulo adicional
    }
  },
  publishDate: {
    type: Date,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isUnlocked: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Item de contenido dentro de una semana (varios por semana: videos + opcional audio, nivel, módulo, submódulo)
const weekContentItemSchema = new mongoose.Schema({
  // Video
  videoUrl: { type: String, default: '' },
  videoId: { type: String },
  videoName: { type: String, default: '' },
  videoThumbnail: { type: String, default: '' },
  videoDuration: { type: Number },
  title: { type: String },
  description: { type: String },
  // Audio opcional
  audioUrl: { type: String, default: '' },
  audioTitle: { type: String, default: '' },
  audioDuration: { type: Number },
  audioText: { type: String, default: '' },
  // Nivel 1-10, módulo y submódulo (clase)
  level: { type: Number, min: 1, max: 10, default: 1 },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassModule' },
  submoduleSlug: { type: String, default: '' },
  submoduleName: { type: String, default: '' },
  orden: { type: Number, default: 0 }
}, { _id: true });

// Schema para contenido semanal (mantiene compatibilidad con estructura anterior)
const weeklyContentSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  moduleName: {
    type: String, // Nombre del módulo al que pertenece esta semana
    default: ''
  },
  weekTitle: {
    type: String, // Ej: "Semana 1: Fundamentos"
    default: ''
  },
  weekDescription: {
    type: String // Descripción de la semana
  },
  /** Contenidos de la semana (varios videos por semana; cada uno con nivel, módulo, submódulo; audio opcional) */
  contents: {
    type: [weekContentItemSchema],
    default: []
  },
  // Contenido diario (7 días)
  dailyContents: [dailyContentSchema],
  // Contenido semanal legacy (para compatibilidad con versión anterior)
  videoUrl: {
    type: String,
    default: ''
  },
  videoId: {
    type: String // Para Vimeo u otro proveedor
  },
  videoName: {
    type: String,
    default: ''
  },
  videoThumbnail: {
    type: String,
    default: ''
  },
  videoDuration: {
    type: Number // Duración en segundos (legacy semanal o derivada del primer día con video)
  },
  audioUrl: {
    type: String,
    default: ''
  },
  audioTitle: {
    type: String,
    default: ''
  },
  audioDuration: {
    type: Number
  },
  text: {
    type: String,
    default: ''
  },
  publishDate: {
    type: Date,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isUnlocked: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Schema principal para la Camino Mensual
const weeklyLogbookSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: 'Camino'
  },
  description: {
    type: String,
    default: ''
  },
  weeklyContents: [weeklyContentSchema],
  // Evita generar clases individuales duplicadas al publicar la última semana
  individualClassesCreated: {
    type: Boolean,
    default: false
  },
  // Indica si es la camino base (Primer Círculo)
  isBaseBitacora: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Índice único para caminos regulares (no base)
// Solo aplica unicidad cuando isBaseBitacora es false
// Las caminos base (isBaseBitacora: true) pueden tener cualquier fecha sin restricción
// y pueden coexistir con caminos regulares de la misma fecha
weeklyLogbookSchema.index(
  { year: 1, month: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      isBaseBitacora: false
    },
    name: 'year_month_unique_non_base'
  }
);

// Índice para buscar la camino base
weeklyLogbookSchema.index({ isBaseBitacora: 1 });

// Método estático para obtener la camino base
weeklyLogbookSchema.statics.getBaseBitacora = async function() {
  return await this.findOne({ isBaseBitacora: true })
    .sort({ createdAt: -1 })
    .lean();
};

// Método para obtener la camino de la semana actual
weeklyLogbookSchema.statics.getCurrentWeekLogbook = async function() {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalizar a medianoche
  
  // Buscar todas las caminos regulares (excluir caminos base) y ordenarlas por fecha (más reciente primero)
  const logbooks = await this.find({ isBaseBitacora: { $ne: true } })
    .sort({ year: -1, month: -1 })
    .lean();
  
  if (!logbooks || logbooks.length === 0) {
    return null;
  }
  
  // Buscar el contenido publicado más reciente que corresponda a la semana actual
  let currentContent = null;
  let currentLogbook = null;
  
  for (const logbook of logbooks) {
    if (!logbook.weeklyContents || logbook.weeklyContents.length === 0) {
      continue;
    }
    
    // Buscar contenido que:
    // 1. Esté publicado
    // 2. Su fecha de publicación ya haya pasado
    // 3. Sea el más reciente para esta semana
    const publishedContents = logbook.weeklyContents
      .filter(content => {
        const publishDate = new Date(content.publishDate);
        publishDate.setHours(0, 0, 0, 0);
        return content.isPublished && publishDate <= now;
      })
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    
    if (publishedContents.length > 0) {
      // Calcular qué semana es esta (basado en lunes)
      const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const currentMonday = new Date(now);
      currentMonday.setDate(now.getDate() - daysToMonday);
      currentMonday.setHours(0, 0, 0, 0);
      
      // Buscar el contenido cuya fecha de publicación sea el lunes más cercano o anterior
      for (const content of publishedContents) {
        const contentPublishDate = new Date(content.publishDate);
        contentPublishDate.setHours(0, 0, 0, 0);
        
        // Si la fecha de publicación es igual o anterior al lunes actual
        if (contentPublishDate <= currentMonday) {
          currentContent = content;
          currentLogbook = logbook;
          break;
        }
      }
      
      // Si no encontramos uno específico para este lunes, usar el más reciente
      if (!currentContent && publishedContents.length > 0) {
        currentContent = publishedContents[0];
        currentLogbook = logbook;
      }
      
      if (currentContent) {
        break;
      }
    }
  }
  
  if (!currentContent || !currentLogbook) {
    return null;
  }
  
  return {
    logbook: currentLogbook,
    weeklyContent: currentContent
  };
};

const WeeklyLogbook = mongoose.models.WeeklyLogbook || mongoose.model('WeeklyLogbook', weeklyLogbookSchema);

export default WeeklyLogbook;
