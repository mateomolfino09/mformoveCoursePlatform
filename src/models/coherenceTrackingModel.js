import mongoose from 'mongoose';

// Schema para logros (achievements)
const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Iconos de gorila para cada evolución (cada 10 niveles)
const GORILLA_EVOLUTIONS = [
  '🦍', // Niveles 1-9: Gorila bebé
  '🦧', // Niveles 10-19: Gorila joven (orangután)
  '🦍', // Niveles 20-29: Gorila adulto (gorila más grande)
  '🐒', // Niveles 30-39: Gorila fuerte (mono)
  '🦁', // Niveles 40-49: Gorila maestro (león - evolución poderosa)
  '👑', // Niveles 50+: Gorila legendario (corona - máximo nivel)
];

// Nombres de evolución para cada etapa
const EVOLUTION_NAMES = [
  'Gorila Bebé',
  'Gorila Joven',
  'Gorila Adulto',
  'Gorila Fuerte',
  'Gorila Maestro',
  'Gorila Legendario'
];

// Obtener icono de gorila según el nivel
const getGorillaIcon = (level) => {
  const evolutionIndex = Math.floor((level - 1) / 10);
  return GORILLA_EVOLUTIONS[Math.min(evolutionIndex, GORILLA_EVOLUTIONS.length - 1)];
};

// Obtener nombre de evolución según el nivel
const getEvolutionName = (level) => {
  const evolutionIndex = Math.floor((level - 1) / 10);
  return EVOLUTION_NAMES[Math.min(evolutionIndex, EVOLUTION_NAMES.length - 1)];
};

// Calcular progreso hacia el siguiente nivel (0-100%)
const getProgressToNextLevel = (levelProgress) => {
  // El progreso es levelProgress / 8 * 100
  // Ejemplo: levelProgress = 4 → 4/8 * 100 = 50%
  // Ejemplo: levelProgress = 8 → 8/8 * 100 = 100% (listo para subir de nivel)
  return Math.round((levelProgress / 8) * 100);
};

// Definición de logros estratégicos en puntos clave del camino
const ACHIEVEMENTS = {
  // ============================================
  // PRIMEROS PASOS
  // ============================================
  SEMILLA_PLANTADA: {
    name: 'Semilla Plantada',
    description: 'Cultivaste tu primera Unidad de Coherencia',
    icon: '🌱',
    threshold: 1,
    type: 'first_steps'
  },
  PRIMER_MES: {
    name: 'Primer Mes Completado',
    description: 'Completaste tu primer Camino al 100%',
    icon: '🎯',
    threshold: 1, // 1 mes completado
    type: 'milestone'
  },
  
  // ============================================
  // CONSTANCIA - RUTAS INTERMEDIAS
  // ============================================
  NUCLEO_ESTABLE: {
    name: 'Núcleo Estable',
    description: 'Mantuviste 4 semanas consecutivas',
    icon: '💪',
    threshold: 4,
    type: 'consistency'
  },
  RAICES_FUERTES: {
    name: 'Raíces Fuertes',
    description: 'Completaste 8 semanas consecutivas',
    icon: '🌳',
    threshold: 8,
    type: 'consistency'
  },
  DISIPLINA_SOLIDA: {
    name: 'Disciplina Sólida',
    description: 'Alcanzaste 12 semanas consecutivas',
    icon: '🏆',
    threshold: 12,
    type: 'consistency'
  },
  MOMENTUM_CONSTRUIDO: {
    name: 'Momentum Construido',
    description: 'Mantuviste 16 semanas consecutivas',
    icon: '⚡',
    threshold: 16,
    type: 'consistency'
  },
  RUTINA_ESTABLECIDA: {
    name: 'Rutina Establecida',
    description: 'Completaste 20 semanas consecutivas',
    icon: '🔄',
    threshold: 20,
    type: 'consistency'
  },
  MEDIO_ANO: {
    name: 'Medio Año de Constancia',
    description: 'Mantuviste 24 semanas consecutivas (6 meses)',
    icon: '📅',
    threshold: 24,
    type: 'consistency'
  },
  CONSTANCIA_AVANZADA: {
    name: 'Constancia Avanzada',
    description: 'Completaste 32 semanas consecutivas',
    icon: '🎖️',
    threshold: 32,
    type: 'consistency'
  },
  DISCIPLINA_MAESTRA: {
    name: 'Disciplina Maestra',
    description: 'Mantuviste 40 semanas consecutivas',
    icon: '⭐',
    threshold: 40,
    type: 'consistency'
  },
  UN_ANO_COMPLETO: {
    name: 'Un Año Completo',
    description: 'Completaste 48 semanas consecutivas (1 año)',
    icon: '🎊',
    threshold: 48,
    type: 'consistency'
  },
  
  // ============================================
  // HITOS DE NIVEL - RUTAS INTERMEDIAS
  // ============================================
  NIVEL_3: {
    name: 'Gorila en Desarrollo',
    description: 'Alcanzaste el nivel 3',
    icon: '🌿',
    threshold: 3,
    type: 'level_milestone'
  },
  NIVEL_5: {
    name: 'Gorila en Crecimiento',
    description: 'Alcanzaste el nivel 5',
    icon: '🌟',
    threshold: 5,
    type: 'level_milestone'
  },
  NIVEL_7: {
    name: 'Gorila Fortaleciéndose',
    description: 'Alcanzaste el nivel 7',
    icon: '💫',
    threshold: 7,
    type: 'level_milestone'
  },
  NIVEL_10: {
    name: 'Primera Evolución',
    description: 'Alcanzaste el nivel 10 - Tu gorila evoluciona',
    icon: '✨',
    threshold: 10,
    type: 'evolution'
  },
  NIVEL_15: {
    name: 'Gorila Consolidado',
    description: 'Alcanzaste el nivel 15',
    icon: '🌲',
    threshold: 15,
    type: 'level_milestone'
  },
  NIVEL_20: {
    name: 'Segunda Evolución',
    description: 'Alcanzaste el nivel 20 - Tu gorila evoluciona nuevamente',
    icon: '🔮',
    threshold: 20,
    type: 'evolution'
  },
  NIVEL_24: {
    name: 'Experto del Movimiento',
    description: 'Alcanzaste el nivel 24 - 2 años de constancia',
    icon: '🏅',
    threshold: 24,
    type: 'level_milestone'
  },
  NIVEL_25: {
    name: 'Gorila Experto',
    description: 'Alcanzaste el nivel 25',
    icon: '🔥',
    threshold: 25,
    type: 'level_milestone'
  },
  NIVEL_30: {
    name: 'Tercera Evolución',
    description: 'Alcanzaste el nivel 30 - Tu gorila alcanza una nueva forma',
    icon: '💎',
    threshold: 30,
    type: 'evolution'
  },
  NIVEL_36: {
    name: 'Gorila Legendario',
    description: 'Alcanzaste el nivel 36 - 3 años de dedicación',
    icon: '🌟',
    threshold: 36,
    type: 'level_milestone'
  },
  NIVEL_40: {
    name: 'Cuarta Evolución',
    description: 'Alcanzaste el nivel 40 - Tu gorila alcanza la maestría',
    icon: '⚡',
    threshold: 40,
    type: 'evolution'
  },
  NIVEL_48: {
    name: 'Gorila Épico',
    description: 'Alcanzaste el nivel 48 - 4 años de constancia',
    icon: '👑',
    threshold: 48,
    type: 'level_milestone'
  },
  NIVEL_50: {
    name: 'Gorila Maestro',
    description: 'Alcanzaste el nivel 50',
    icon: '👑',
    threshold: 50,
    type: 'level_milestone'
  },
  NIVEL_60: {
    name: 'Quinta Evolución',
    description: 'Alcanzaste el nivel 60 - Tu gorila alcanza la perfección',
    icon: '🌌',
    threshold: 60,
    type: 'evolution'
  }
};

// Schema principal para tracking de coherencia
const coherenceTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalUnits: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date
  },
  achievements: [achievementSchema],
  // Sistema de niveles y evolución
  level: {
    type: Number,
    default: 1
  },
  levelProgress: {
    type: Number,
    default: 0, // Progreso dentro del nivel actual (0-8, donde 8 sube de nivel)
    min: 0,
    max: 8
  },
  monthsCompleted: {
    type: Number,
    default: 0
  },
  characterEvolution: {
    type: Number,
    default: 0 // 0 = primera evolución, 1 = segunda evolución (nivel 10), etc.
  },
  completedMonths: [{
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    logbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyLogbook'
    }
  }],
  weeklyCompletions: [{
    weekStartDate: {
      type: Date,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    logbookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyLogbook'
    },
    // Array de semanas del programa completadas en esta semana calendario
    programWeeks: [{
      weekNumber: {
        type: Number,
        required: true
      },
      completedVideo: {
        type: Boolean,
        default: false
      },
      completedAudio: {
        type: Boolean,
        default: false
      },
      // U.C. otorgadas para esta semana del programa en esta semana calendario
      ucsOtorgadas: {
        type: Number,
        default: 0
      }
    }],
    // Campos legacy (mantener para compatibilidad con documentos antiguos)
    completedVideo: {
      type: Boolean,
      default: false
    },
    completedAudio: {
      type: Boolean,
      default: false
    },
    ucsOtorgadas: {
      type: Number,
      default: 0
    }
  }],
  // Arrays para almacenar claves de completado (para verificación rápida)
  completedDays: {
    type: [String],
    default: []
  },
  completedWeeks: {
    type: [String],
    default: []
  },
  completedVideos: {
    type: [String],
    default: []
  },
  completedAudios: {
    type: [String],
    default: []
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

// Índice para búsqueda rápida por usuario
coherenceTrackingSchema.index({ userId: 1 });

// Progreso de nivel: 8 = 100% del círculo (4 semanas × 25% = 1 nivel).
// Cada contenido completado suma (2 / contenidosDeLaSemana); una semana completa = 25%.
coherenceTrackingSchema.methods.addLevelProgressByContent = function (increment) {
  if (this.levelProgress === undefined || this.levelProgress === null) {
    this.levelProgress = 0;
  }
  this.levelProgress += Number(increment) || 0;
  let levelUp = false;
  let newLevel = this.level;
  let evolution = false;
  let gorillaIcon = getGorillaIcon(this.level);
  let evolutionName = getEvolutionName(this.level);
  const previousEvolution = this.characterEvolution !== undefined && this.characterEvolution !== null ? this.characterEvolution : 0;

  while (this.levelProgress >= 8) {
    this.levelProgress -= 8;
    this.level = (this.level || 1) + 1;
    this.monthsCompleted = (this.monthsCompleted || 0) + 1;
    levelUp = true;
    newLevel = this.level;
    const newEvolution = Math.floor((this.level - 1) / 10);
    const currentEvolution = this.characterEvolution !== undefined && this.characterEvolution !== null ? this.characterEvolution : 0;
    if (newEvolution > currentEvolution) {
      evolution = true;
      this.characterEvolution = newEvolution;
    }
    gorillaIcon = getGorillaIcon(this.level);
    evolutionName = getEvolutionName(this.level);
  }

  return {
    levelUp,
    newLevel,
    evolution,
    gorillaIcon,
    evolutionName,
    levelProgress: this.levelProgress,
    level: this.level,
    characterEvolution: this.characterEvolution
  };
};

// Método para agregar una Unidad de Coherencia
coherenceTrackingSchema.methods.addCoherenceUnit = async function(logbookId, contentType, weekNumber, programId = null, semanaActualDelLogbook = 0) {
  if (!weekNumber) {
    return {
      success: false,
      message: 'weekNumber es requerido'
    };
  }
  
  const now = new Date();
  
  // Calcular el inicio de la semana calendario (lunes)
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - daysToMonday);
  weekStartDate.setHours(0, 0, 0, 0);
  
  
  // Verificar tipo de contenido
  const isVideo = contentType === 'visual';
  const isAudio = contentType === 'audio' || contentType === 'audioText';
  
  // Buscar si ya existe una entrada para esta weekNumber del programa en CUALQUIER semana calendario
  // Esto es importante porque el usuario puede completar semana 1 en cualquier momento,
  // y debe asociarse a la semana 1 del programa, no a la semana calendario actual
  let existingProgramWeek = null;
  let existingCompletion = null;
  
  
  for (const completion of this.weeklyCompletions || []) {
    // Inicializar programWeeks si no existe (para documentos antiguos)
    if (!completion.programWeeks) {
      completion.programWeeks = [];
    }
    
    
    const programWeek = completion.programWeeks?.find(pw => pw.weekNumber === weekNumber);
    if (programWeek) {
      existingProgramWeek = programWeek;
      existingCompletion = completion;
      break; // Encontramos la semana del programa, salir del loop
    }
  }
  
  // Si no encontramos la semana del programa en ninguna semana calendario,
  // buscar la semana calendario actual para crear la nueva entrada
  if (!existingCompletion) {
    existingCompletion = this.weeklyCompletions.find(completion => {
      const completionWeekStart = new Date(completion.weekStartDate);
      completionWeekStart.setHours(0, 0, 0, 0);
      const currentWeekStart = new Date(weekStartDate);
      currentWeekStart.setHours(0, 0, 0, 0);
      return completionWeekStart.getTime() === currentWeekStart.getTime();
    });
    
    // Inicializar programWeeks si no existe
    if (existingCompletion && !existingCompletion.programWeeks) {
      existingCompletion.programWeeks = [];
    }
  }
  
  // CRÍTICO: Si encontramos existingCompletion pero NO existingProgramWeek,
  // significa que esta weekNumber NO ha sido completada antes.
  // Los campos legacy (completedVideo, completedAudio) se ignoran completamente.
  // NO debemos usar existingCompletion.completedVideo o completedAudio para esta weekNumber.
  
  
  // ============================================================================
  // LÓGICA DE CONSTANCIA Y LIMITACIÓN POR ATRASO
  // ============================================================================
  // Sistema de Unidades de Coherencia (U.C.) con limitación por falta de constancia:
  //
  // 1. CONSTANCIA IDEAL: 2 U.C. por semana calendario (1 video + 1 audio) para la primera semana del programa
  //    - Si completas exactamente 2 U.C. en una semana: obtienes las 2 U.C. completas
  //
  // 2. LIMITACIÓN POR ATRASO: Si te atrasas y acumulas contenido de múltiples semanas del programa
  //    - Si completas más de 2 U.C. en una semana calendario, cada semana adicional del programa
  //      solo puede otorgar 1 U.C. en total (no 2)
  //    - Ejemplo: Si completas 3 semanas del programa en una semana calendario:
  //      → Semana 1 del programa: 2 U.C. (1 video + 1 audio) ✅
  //      → Semana 2 del programa: 1 U.C. (solo 1, aunque completes video y audio) ⚠️
  //      → Semana 3 del programa: 1 U.C. (solo 1, aunque completes video y audio) ⚠️
  //      → Total: 4 U.C. en lugar de 6
  //
  // 3. OBJETIVO: Fomentar constancia semanal y desincentivar acumular contenido para completarlo de golpe
  // ============================================================================
  
  // Determinar si es la primera vez que se completa esta weekNumber del programa
  // Si ya existe una entrada para esta weekNumber en cualquier semana calendario, no es la primera vez
  const esPrimeraSemanaPrograma = !existingProgramWeek;
  
  // Usar la semana actual del logbook que se calculó en el API route
  const semanaActualDelPrograma = semanaActualDelLogbook;
  
  // Determinar si es una semana adicional:
  // Solo si la semana del programa que se está completando es MENOR O MAYOR que la semana actual del logbook
  // según las fechas de publicación (significa que está completando una semana que no corresponde al calendario)
  const esSemanaAdicional = semanaActualDelPrograma > 0 && (weekNumber < semanaActualDelPrograma || weekNumber > semanaActualDelPrograma);
  
  // Verificar si ya completó este tipo de contenido para esta weekNumber
  // Si ya está completado, no otorgar U.C. (el levelProgress se actualiza por contenido en la ruta complete)
  let yaCompletado = false;
  let ucsAOtorgar = 0;
  
  if (existingProgramWeek) {
    if (isVideo && existingProgramWeek.completedVideo === true) {
      yaCompletado = true;
      ucsAOtorgar = 0; // No otorgar U.C. adicional
    } else if (isAudio && existingProgramWeek.completedAudio === true) {
      yaCompletado = true;
      ucsAOtorgar = 0; // No otorgar U.C. adicional
    } else if (esSemanaAdicional && existingProgramWeek.ucsOtorgadas >= 1) {
      // Si es semana adicional y ya tiene 1 U.C. otorgada, no otorgar más U.C.
      yaCompletado = false; // No está completamente completado, solo no otorga U.C.
      ucsAOtorgar = 0;
    } else {
      // Determinar cuántas U.C. otorgar
      if (esPrimeraSemanaPrograma) {
        // Primera semana del programa: permite hasta 2 U.C. (1 video + 1 audio)
        ucsAOtorgar = 1; // Siempre otorga 1 por completación, pero puede obtener hasta 2
      } else {
        // Semana adicional: solo 1 U.C. en total para esta weekNumber
        ucsAOtorgar = 1;
      }
    }
  } else {
    // No existe la semana del programa, otorgar U.C. normalmente
    if (esPrimeraSemanaPrograma) {
      ucsAOtorgar = 1;
    } else {
      ucsAOtorgar = 1;
    }
  }
  
  
  // Guardar la fecha anterior antes de actualizar
  const previousLastDate = this.lastCompletedDate;
  
  // Agregar la nueva unidad solo si se otorga U.C.
  if (ucsAOtorgar > 0) {
    this.totalUnits += ucsAOtorgar;
  }
  
  // El progreso de nivel (levelProgress) ya no se actualiza aquí:
  // se actualiza por contenido en la ruta bitacora/complete con addLevelProgressByContent.
  let levelUp = false;
  let evolution = false;
  
  // La racha siempre aumenta cuando se agrega una U.C.
  // Verificar si es continuación de la racha (basado en la última fecha de completación)
  if (previousLastDate) {
    const daysSinceLastCompletion = Math.floor(
      (now - previousLastDate) / (1000 * 60 * 60 * 24)
    );
    
    // Si la última completación fue hace menos de 8 días (permite un margen de error)
    if (daysSinceLastCompletion <= 8) {
      this.currentStreak += 1;
    } else {
      // Se rompió la racha, reiniciar
      this.currentStreak = 1;
    }
  } else {
    // Primera completación
    this.currentStreak = 1;
  }
  
  // Actualizar la fecha de última completación
  this.lastCompletedDate = now;
  
  // Actualizar la racha más larga
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  // Agregar o actualizar la completación semanal
  if (existingCompletion) {
    // Actualizar la completación existente
    existingCompletion.completedAt = now;
    
    // Inicializar programWeeks si no existe
    if (!existingCompletion.programWeeks) {
      existingCompletion.programWeeks = [];
    }
    
    if (existingProgramWeek) {
      // Actualizar la semana del programa existente
      // Marcar como completado incluso si no se otorga U.C. adicional
      if (isVideo) {
        existingProgramWeek.completedVideo = true;
      }
      if (isAudio) {
        existingProgramWeek.completedAudio = true;
      }
      // Solo incrementar U.C. si se otorga
      if (ucsAOtorgar > 0) {
        existingProgramWeek.ucsOtorgadas += ucsAOtorgar;
      }
      
    } else {
      // Crear nueva entrada para esta semana del programa
      existingCompletion.programWeeks.push({
        weekNumber,
        completedVideo: isVideo,
        completedAudio: isAudio,
        ucsOtorgadas: ucsAOtorgar
      });
      
    }
    
    // Marcar como modificado para que Mongoose guarde los cambios
    this.markModified('weeklyCompletions');
    
  } else {
    // Crear nueva completación semanal
    this.weeklyCompletions.push({
      weekStartDate,
      completedAt: now,
      logbookId,
      programWeeks: [{
        weekNumber,
        completedVideo: isVideo,
        completedAudio: isAudio,
        ucsOtorgadas: ucsAOtorgar
      }]
    });
  }
  
  // Verificar y desbloquear logros
  const newAchievements = this.checkAndUnlockAchievements();
  
  // Asegurar que los arrays se preserven al guardar
  if (this.completedDays && Array.isArray(this.completedDays)) {
    this.markModified('completedDays');
  }
  if (this.completedWeeks && Array.isArray(this.completedWeeks)) {
    this.markModified('completedWeeks');
  }
  if (this.completedVideos && Array.isArray(this.completedVideos)) {
    this.markModified('completedVideos');
  }
  if (this.completedAudios && Array.isArray(this.completedAudios)) {
    this.markModified('completedAudios');
  }
  
  
  // Usar findOneAndUpdate para asegurar que los arrays se guarden correctamente
  const updateData = {
    totalUnits: this.totalUnits,
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    lastCompletedDate: this.lastCompletedDate,
    weeklyCompletions: this.weeklyCompletions,
    achievements: this.achievements,
    level: this.level || 1,
    levelProgress: this.levelProgress !== undefined && this.levelProgress !== null ? this.levelProgress : 0,
    monthsCompleted: this.monthsCompleted || 0,
    characterEvolution: this.characterEvolution || 0,
    completedMonths: this.completedMonths || [],
    completedDays: this.completedDays || [],
    completedWeeks: this.completedWeeks || [],
    completedVideos: this.completedVideos || [],
    completedAudios: this.completedAudios || []
  };
  
  const updated = await this.constructor.findOneAndUpdate(
    { userId: this.userId },
    { $set: updateData },
    { new: true }
  );
  
  // Actualizar el documento actual con los valores guardados
  if (updated) {
    this.totalUnits = updated.totalUnits;
    this.currentStreak = updated.currentStreak;
    this.longestStreak = updated.longestStreak;
    this.lastCompletedDate = updated.lastCompletedDate;
    this.weeklyCompletions = updated.weeklyCompletions;
    this.achievements = updated.achievements;
    this.level = updated.level || 1;
    this.levelProgress = updated.levelProgress !== undefined && updated.levelProgress !== null ? updated.levelProgress : 0;
    this.monthsCompleted = updated.monthsCompleted || 0;
    this.characterEvolution = updated.characterEvolution || 0;
    this.completedMonths = updated.completedMonths || [];
    this.completedDays = updated.completedDays || [];
    this.completedWeeks = updated.completedWeeks || [];
    this.completedVideos = updated.completedVideos || [];
    this.completedAudios = updated.completedAudios || [];
  }
  
  
  return {
    success: true,
    totalUnits: this.totalUnits,
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    newAchievements,
    esSemanaAdicional,
    ucsOtorgadas: ucsAOtorgar,
    levelUp: levelUp,
    newLevel: levelUp ? this.level : undefined,
    evolution: evolution,
    gorillaIcon: levelUp ? getGorillaIcon(this.level) : undefined,
    evolutionName: levelUp ? getEvolutionName(this.level) : undefined,
    levelProgress: this.levelProgress !== undefined && this.levelProgress !== null ? this.levelProgress : 0,
    ucGranted: ucsAOtorgar > 0
  };
};

// Método para verificar y desbloquear logros
coherenceTrackingSchema.methods.checkAndUnlockAchievements = function() {
  const newAchievements = [];
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    // Verificar si el usuario ya tiene este logro
    const alreadyHasAchievement = this.achievements.some(
      ach => ach.name === achievement.name
    );
    
    // Determinar el valor a comparar según el tipo de logro
    let valueToCompare = 0;
    if (achievement.type === 'consistency' || achievement.type === 'first_steps') {
      valueToCompare = this.currentStreak;
    } else if (achievement.type === 'milestone' || achievement.type === 'level_milestone' || achievement.type === 'evolution') {
      valueToCompare = this.monthsCompleted;
    }
    
    // Verificar si cumple el umbral
    if (!alreadyHasAchievement && valueToCompare >= achievement.threshold) {
      this.achievements.push({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        unlockedAt: new Date()
      });
      
      newAchievements.push(achievement);
    }
  });
  
  return newAchievements;
};

// Método para completar un mes y subir de nivel
coherenceTrackingSchema.methods.completeMonth = function(month, year, logbookId) {
  // Verificar si este mes ya fue completado
  const alreadyCompleted = this.completedMonths.some(
    cm => cm.month === month && cm.year === year
  );
  
  if (alreadyCompleted) {
    return {
      levelUp: false,
      evolution: false,
      newLevel: this.level,
      newEvolution: this.characterEvolution
    };
  }
  
  // Agregar el mes completado
  this.completedMonths.push({
    month,
    year,
    completedAt: new Date(),
    logbookId
  });
  
  // Incrementar meses completados
  this.monthsCompleted += 1;
  
  console.log('monthsCompleted', this.monthsCompleted);
  console.log('level', this.level);
  // Subir de nivel (1 nivel por mes completado)
  // Usar el máximo entre el nivel actual y el nivel basado en meses
  // para no sobrescribir niveles ganados por addCoherenceUnit
  const previousLevel = this.level;
  const levelFromMonths = this.monthsCompleted;
  this.level = Math.max(this.level, levelFromMonths);
  
  // Verificar si hay evolución (cada 10 niveles)
  const previousEvolution = this.characterEvolution;
  this.characterEvolution = Math.floor((this.level - 1) / 10);
  
  const levelUp = this.level > previousLevel;
  const evolution = this.characterEvolution > previousEvolution;
  
  return {
    levelUp,
    evolution,
    newLevel: this.level,
    newEvolution: this.characterEvolution,
    gorillaIcon: getGorillaIcon(this.level)
  };
};

// Método para obtener el icono del gorila actual
coherenceTrackingSchema.methods.getGorillaIcon = function() {
  return getGorillaIcon(this.level);
};

// Método estático para obtener o crear tracking para un usuario
coherenceTrackingSchema.statics.getOrCreate = async function(userId) {
  // Evita race conditions usando upsert atómico
  const defaults = {
    userId,
    totalUnits: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    level: 1,
    levelProgress: 0,
    monthsCompleted: 0,
    characterEvolution: 0,
    completedMonths: [],
    weeklyCompletions: [],
    completedDays: [],
    completedWeeks: [],
    completedVideos: [],
    completedAudios: []
  };

  let tracking = await this.findOneAndUpdate(
    { userId },
    { $setOnInsert: defaults },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  // Sanitizar campos faltantes en documentos antiguos
  let needsSave = false;
  if (!tracking.completedDays || !Array.isArray(tracking.completedDays)) {
    tracking.completedDays = [];
    needsSave = true;
  }
  if (!tracking.completedWeeks || !Array.isArray(tracking.completedWeeks)) {
    tracking.completedWeeks = [];
    needsSave = true;
  }
  if (!tracking.completedVideos || !Array.isArray(tracking.completedVideos)) {
    tracking.completedVideos = [];
    needsSave = true;
  }
  if (!tracking.completedAudios || !Array.isArray(tracking.completedAudios)) {
    tracking.completedAudios = [];
    needsSave = true;
  }
  if (!tracking.completedMonths || !Array.isArray(tracking.completedMonths)) {
    tracking.completedMonths = [];
    needsSave = true;
  }
  if (tracking.level === undefined || tracking.level === null) {
    tracking.level = tracking.monthsCompleted || 1;
    needsSave = true;
  }
  if (tracking.levelProgress === undefined || tracking.levelProgress === null) {
    tracking.levelProgress = 0;
    needsSave = true;
  }
  if (tracking.monthsCompleted === undefined || tracking.monthsCompleted === null) {
    tracking.monthsCompleted = tracking.completedMonths?.length || 0;
    needsSave = true;
  }
  if (tracking.characterEvolution === undefined || tracking.characterEvolution === null) {
    tracking.characterEvolution = Math.floor((tracking.level - 1) / 10);
    needsSave = true;
  }

  if (needsSave) {
    tracking.markModified('completedDays');
    tracking.markModified('completedWeeks');
    tracking.markModified('completedVideos');
    tracking.markModified('completedAudios');
    tracking.markModified('completedMonths');
    await tracking.save();
  }

  return tracking;
};

const attachStaticsIfMissing = (model) => {
  // Asegura que las statics se encuentren incluso si el modelo ya existía
  if (!model?.getOrCreate) {
    model.schema.statics.getOrCreate = coherenceTrackingSchema.statics.getOrCreate;
  }
  return model;
};

const CoherenceTracking = attachStaticsIfMissing(
  mongoose.models.CoherenceTracking || mongoose.model('CoherenceTracking', coherenceTrackingSchema)
);

export default CoherenceTracking;
export { ACHIEVEMENTS, getGorillaIcon, getEvolutionName, getProgressToNextLevel, GORILLA_EVOLUTIONS, EVOLUTION_NAMES };
