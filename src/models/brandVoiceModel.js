const mongoose = require('mongoose');

const brandVoiceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  // Análisis de Instagram mejorado
  instagramAnalysis: {
    vocabulary: {
      powerWords: [String],
      technicalTerms: [String],
      emotionalWords: [String],
      actionWords: [String],
      brandWords: [String]
    },
    commonPhrases: {
      hooks: [String],
      transitions: [String],
      closings: [String],
      questions: [String],
      callsToAction: [String]
    },
    tone: {
      primary: String,
      secondary: String,
      emotionalRange: [String],
      authorityLevel: String
    },
    emojis: {
      mostUsed: [String],
      contextual: [String],
      emotional: [String]
    },
    writingStyle: {
      sentenceStructure: String,
      paragraphStyle: String,
      punctation: String,
      capitalization: String,
      hashtagStyle: String
    },
    contentPatterns: {
      storytelling: String,
      personalStories: String,
      educationalContent: String,
      motivationalContent: String,
      interactiveElements: String
    },
    audienceEngagement: {
      engagementStyle: String,
      responsePatterns: String,
      communityBuilding: String
    },
    metrics: {
      averageLength: Number,
      averageWordsPerCaption: Number,
      hashtagFrequency: String,
      emojiFrequency: String,
      questionFrequency: String
    },
    brandPersonality: {
      personalityTraits: [String],
      values: [String],
      mission: String,
      uniqueVoice: String
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    },
    videosAnalyzed: Number,
    captionsAnalyzed: Number
  },
  // Configuración personalizada
  brandVoice: {
    tone: {
      type: String,
      enum: ['inspirational', 'educational', 'conversational', 'professional', 'energetic', 'friendly'],
      default: 'inspirational'
    },
    style: {
      type: String,
      enum: ['casual', 'formal', 'friendly', 'authoritative', 'conversational'],
      default: 'friendly'
    },
    vocabulary: [String],
    phrases: [String],
    emojis: [String],
    customInstructions: String
  },
  // Configuración de IA
  aiSettings: {
    preferredAI: {
      type: String,
      enum: ['openai', 'gemini', 'claude', 'auto'],
      default: 'auto'
    },
    emailTemplates: {
      transformationalProgram: String,
      newsletter: String,
      reminder: String
    }
  },
  // Estadísticas
  stats: {
    emailsGenerated: {
      type: Number,
      default: 0
    },
    lastGenerated: Date,
    totalTokensUsed: {
      type: Number,
      default: 0
    }
  },
  // Metadatos
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
brandVoiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método estático para encontrar por userId
brandVoiceSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

// Método para incrementar contador de emails
brandVoiceSchema.methods.incrementEmailCount = function() {
  this.stats.emailsGenerated += 1;
  this.stats.lastGenerated = new Date();
  return this.save();
};

// Método para agregar tokens usados
brandVoiceSchema.methods.addTokensUsed = function(tokens) {
  this.stats.totalTokensUsed += tokens;
  return this.save();
};

module.exports = mongoose.models.BrandVoice || mongoose.model('BrandVoice', brandVoiceSchema); 