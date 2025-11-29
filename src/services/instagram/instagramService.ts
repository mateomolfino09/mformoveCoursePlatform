interface InstagramMedia {
  id: string;
  media_type: 'VIDEO' | 'IMAGE' | 'CAROUSEL_ALBUM' | 'REELS';
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramAnalysis {
  personalidad: {
    caracteristicasPrincipales: string[];
    valores: string[];
    pasiones: string[];
    mision: string;
    vision: string;
    energia: string;
    autenticidad: string;
  };
  estiloComunicacion: {
    tonoNatural: string;
    conexionEmocional: string;
    historias: string;
    vulnerabilidad: string;
    inspiracion: string;
    humor: string;
    reflexiones: string;
  };
  temasRecurrentes: {
    principales: string[];
    angulos: string[];
    experiencias: string[];
    aprendizajes: string[];
    transformaciones: string[];
  };
  relacionConAudiencia: {
    comoSeDirige: string;
    queOfrece: string;
    confianza: string;
    comunidad: string;
    acompañamiento: string;
  };
  movementSpirit: {
    queEs: string;
    filosofia: string;
    bienestar: string;
    movimiento: string;
    espiritu: string;
  };
  vocabulario: {
    palabrasFavoritas: string[];
    expresiones: string[];
    metáforas: string[];
    conceptos: string[];
  };
  ritmoYFlujo: {
    estructura: string;
    pausas: string;
    intensidad: string;
    climax: string;
  };
  elementosTecnicos: {
    persuasionScore: number;
    emotionalImpactScore: number;
    callToActionEffectiveness: number;
    engagementOptimizationScore: number;
  };
  analyzedAt?: Date;
}

// Información personal y del negocio de Mateo Molfino
const MATEO_PERSONAL_INFO = {
  values: [
    'Autenticidad',
    'Bienestar integral', 
    'Transformación personal',
    'Conexión humana genuina',
    'Crecimiento consciente'
  ],
  mission: 'Inspirar y acompañar a otros en su camino de bienestar auténtico a través del movimiento consciente y la conexión con su esencia',
  personality: [
    'Vulnerable y auténtico',
    'Inspirador desde la experiencia',
    'Empático y comprensivo',
    'Apasionado por la transformación',
    'Conecta desde el corazón'
  ],
  lifePhilosophy: 'Vivir desde la autenticidad, el movimiento consciente y la conexión profunda con uno mismo y los demás. Creo que la vulnerabilidad es fortaleza y que cada persona tiene el poder de transformar su vida.',
  communicationStyle: 'Cercano, vulnerable, conversacional, sin pretensiones. Hablo como un amigo que comparte su camino, no como un guru que tiene todas las respuestas.',
  coreBeliefs: [
    'El movimiento consciente transforma vidas',
    'La vulnerabilidad es una fortaleza',
    'Cada persona tiene su propio ritmo y camino',
    'La autenticidad atrae lo que necesitamos',
    'El bienestar es integral: cuerpo, mente y espíritu'
  ],
  personalStory: 'Mi propia transformación comenzó cuando entendí que el bienestar no es solo físico, sino integral. A través del movimiento consciente, la meditación y la conexión conmigo mismo, descubrí que ser vulnerable y auténtico es lo que realmente conecta con otros. MForMove nació de esta experiencia personal.',
  uniqueTraits: [
    'Capacidad de conectar desde la vulnerabilidad',
    'Filosofía MForMove única',
    'Combinación de movimiento físico y crecimiento espiritual',
    'Enfoque en la autenticidad por encima de la perfección',
    'Habilidad para hacer sentir cómodos a otros siendo ellos mismos'
  ],
      businessInfo: {
      brandName: 'MForMove',
      platformName: 'MForMove',
    businessModel: 'Plataforma de bienestar integral con membresías, mentorías y programas transformacionales',
    services: [
      'Clases de movimiento consciente en vivo',
      'Programas transformacionales personalizados',
      'Mentorías 1:1 de bienestar integral',
      'Membresías con contenido exclusivo',
      'Eventos presenciales y retiros',
      'Comunidad de bienestar y crecimiento'
    ],
    targetAudience: 'Personas que buscan transformación personal auténtica, bienestar integral y conexión con su esencia a través del movimiento consciente',
    uniqueValue: 'Combinamos movimiento físico, crecimiento espiritual y desarrollo personal desde la autenticidad y vulnerabilidad, creando una experiencia transformacional integral',
    methodology: 'MForMove: filosofía que integra cuerpo, mente y espíritu a través del movimiento consciente, la introspección y la conexión auténtica',
    results: [
      'Transformación personal sostenible',
      'Mayor conexión con el cuerpo y emociones',
      'Desarrollo de autenticidad y vulnerabilidad',
      'Comunidad de apoyo genuino',
      'Bienestar integral duradero'
    ],
    differentiators: [
      'Enfoque en autenticidad vs perfección',
      'Vulnerabilidad como fortaleza',
      'Movimiento consciente vs ejercicio tradicional',
      'Transformación integral vs solo física',
      'Comunidad genuina vs networking superficial'
    ]
  }
};

class InstagramService {
  // eslint-disable-next-line no-use-before-define
  private static instance: InstagramService;
  private accessToken: string | null = null;
  private userId: string | null = null;

  private constructor() {
    // Intentar cargar credenciales desde variables de entorno
    if (typeof window === 'undefined') { // Solo en el servidor
      this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || null;
      this.userId = process.env.INSTAGRAM_USER_ID || null;
    }
  }

  static getInstance(): InstagramService {
    if (!InstagramService.instance) {
      InstagramService.instance = new InstagramService();
    }
    return InstagramService.instance;
  }

  setCredentials(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
  }

  // Método para verificar si las credenciales están configuradas
  hasCredentials(): boolean {
    return !!(this.accessToken && this.userId);
  }

  // Método para obtener la información personal fija de Mateo
  getMateoPersonalInfo() {
    return MATEO_PERSONAL_INFO;
  }

  async getRecentVideos(limit: number = 20): Promise<InstagramMedia[]> {
    if (!this.hasCredentials()) {
      throw new Error('Instagram credentials not configured');
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/v12.0/${this.userId}/media?fields=id,media_type,caption,media_url,thumbnail_url,permalink,timestamp&access_token=${this.accessToken}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Instagram videos:', error);
      throw error;
    }
  }

  async getMediaById(mediaId: string): Promise<InstagramMedia | null> {
    if (!this.hasCredentials()) {
      throw new Error('Instagram credentials not configured');
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/v12.0/${mediaId}?fields=id,media_type,caption,media_url,thumbnail_url,permalink,timestamp&access_token=${this.accessToken}`
      );

      if (!response.ok) {
        console.error(`Error fetching media ${mediaId}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching media ${mediaId}:`, error);
      return null;
    }
  }

  async analyzeCaptions(captions: string[], personalInfo?: {
    values?: string[];
    mission?: string;
    personality?: string[];
    lifePhilosophy?: string;
    communicationStyle?: string;
    coreBeliefs?: string[];
    personalStory?: string;
    uniqueTraits?: string[];
  }): Promise<InstagramAnalysis> {
    try {
      const personalContext = personalInfo ? `
        INFORMACIÓN PERSONAL SOBRE MATEO:
        - Valores fundamentales: ${personalInfo.values?.join(', ') || 'No especificado'}
        - Misión personal: ${personalInfo.mission || 'No especificado'}
        - Rasgos de personalidad: ${personalInfo.personality?.join(', ') || 'No especificado'}
        - Filosofía de vida: ${personalInfo.lifePhilosophy || 'No especificado'}
        - Estilo de comunicación preferido: ${personalInfo.communicationStyle || 'No especificado'}
        - Creencias centrales: ${personalInfo.coreBeliefs?.join(', ') || 'No especificado'}
        - Historia personal relevante: ${personalInfo.personalStory || 'No especificado'}
        - Características únicas: ${personalInfo.uniqueTraits?.join(', ') || 'No especificado'}
        
        INFORMACIÓN DEL NEGOCIO MFORMOVE:
        ${(personalInfo as any).businessInfo ? `
        - Marca: ${(personalInfo as any).businessInfo.brandName}
        - Plataforma: ${(personalInfo as any).businessInfo.platformName}
        - Modelo de negocio: ${(personalInfo as any).businessInfo.businessModel}
        - Servicios principales: ${(personalInfo as any).businessInfo.services?.join(', ')}
        - Audiencia objetivo: ${(personalInfo as any).businessInfo.targetAudience}
        - Propuesta de valor única: ${(personalInfo as any).businessInfo.uniqueValue}
        - Metodología: ${(personalInfo as any).businessInfo.methodology}
        - Resultados que ofrecemos: ${(personalInfo as any).businessInfo.results?.join(', ')}
        - Diferenciadores clave: ${(personalInfo as any).businessInfo.differentiators?.join(', ')}
        ` : 'No especificado'}
      ` : '';

      const analysisPrompt = `
        Eres un experto en análisis de personalidad y comunicación. Analiza estos captions de Instagram de Mateo Molfino para entender QUIÉN ES como persona auténtica, sus valores, su esencia y su forma única de ver el mundo.

        ${personalContext}

        CAPTIONS A ANALIZAR:
        ${captions.join('\n\n---\n\n')}

        REALIZA UN ANÁLISIS PROFUNDO DE QUIÉN ES MATEO MOLFINO COMO PERSONA:

        {
          "personalidad": {
            "caracteristicasPrincipales": ["3-5 características que definen su personalidad"],
            "valores": ["valores fundamentales que transmite"],
            "pasiones": ["temas que más le apasionan y energizan"],
            "mision": "cuál es su misión personal y profesional",
            "vision": "cómo ve el mundo y qué quiere cambiar",
            "energia": "tipo de energía que transmite (ej: calmada, intensa, inspiradora)",
            "autenticidad": "cómo se muestra auténtico y vulnerable"
          },
          "estiloComunicacion": {
            "tonoNatural": "cómo habla naturalmente, sin forzar",
            "conexionEmocional": "cómo conecta emocionalmente con su audiencia",
            "historias": "cómo cuenta historias personales",
            "vulnerabilidad": "cómo se muestra vulnerable y real",
            "inspiracion": "cómo inspira sin ser pretencioso",
            "humor": "si usa humor y cómo",
            "reflexiones": "cómo comparte reflexiones profundas"
          },
          "temasRecurrentes": {
            "principales": ["temas que más aborda"],
            "angulos": ["desde qué ángulos los aborda"],
            "experiencias": ["qué experiencias personales comparte"],
            "aprendizajes": ["qué aprendizajes transmite"],
            "transformaciones": ["qué transformaciones personales comparte"]
          },
          "relacionConAudiencia": {
            "comoSeDirige": "cómo se dirige a su audiencia",
            "queOfrece": "qué ofrece de valor real",
            "confianza": "cómo construye confianza",
            "comunidad": "cómo construye comunidad",
            "acompañamiento": "cómo acompaña en el proceso"
          },
          "movementSpirit": {
            "queEs": "qué significa MForMove para él",
            "filosofia": "cuál es su filosofía de vida",
            "bienestar": "cómo entiende el bienestar",
            "movimiento": "qué significa el movimiento para él",
            "espiritu": "qué significa el espíritu en su contexto"
          },
          "vocabulario": {
            "palabrasFavoritas": ["palabras que usa frecuentemente"],
            "expresiones": ["expresiones típicas suyas"],
            "metáforas": ["metáforas que usa"],
            "conceptos": ["conceptos que define a su manera"]
          },
          "ritmoYFlujo": {
            "estructura": "cómo estructura sus mensajes",
            "pausas": "cómo usa pausas y silencios",
            "intensidad": "cómo varía la intensidad",
            "climax": "cómo construye momentos de impacto"
          },
          "elementosTecnicos": {
            "persuasionScore": 8,
            "emotionalImpactScore": 9,
            "callToActionEffectiveness": 7,
            "engagementOptimizationScore": 8
          }
        }

        INSTRUCCIONES ESPECÍFICAS:
        1. PRIORIZA la información personal proporcionada sobre QUIÉN ES Mateo
        2. Combina los captions con su información personal para crear un perfil auténtico
        3. Enfócate en su ESENCIA como persona, no en técnicas de marketing
        4. Identifica cómo sus valores personales se reflejan en su comunicación
        5. Captura su autenticidad y vulnerabilidad REAL como persona
        6. Entiende su filosofía de vida y cómo la vive genuinamente
        7. Detecta cómo su historia personal influye en su mensaje
        8. Identifica qué lo hace ÚNICO como ser humano
        9. Analiza cómo su misión personal se manifiesta naturalmente
        10. Captura la energía y presencia que tiene como PERSONA

        IMPORTANTE: Este análisis debe reflejar quién ES Mateo Molfino como ser humano auténtico, usando tanto sus captions como la información personal proporcionada. Si hay información personal específica, úsala como base fundamental para el análisis.
      `;

      // Usar el servicio de IA
      const aiService = await import('../ai/aiService');
      const response = await aiService.aiService.generateEmail({
        type: 'educational',
        content: analysisPrompt,
        topic: 'Análisis de personalidad'
      });

      let finalAnalysis: InstagramAnalysis;
      try {
        finalAnalysis = JSON.parse(response.html);
      } catch (error) {
        console.error('Error parsing analysis response:', error);
        // Análisis por defecto más personal
        finalAnalysis = {
          personalidad: {
            caracteristicasPrincipales: ['Auténtico', 'Inspirador', 'Vulnerable', 'Apasionado'],
            valores: ['Bienestar integral', 'Autenticidad', 'Transformación personal', 'Comunidad'],
            pasiones: ['Movimiento', 'Bienestar', 'Transformación personal', 'Conexión humana'],
            mision: 'Inspirar y acompañar a otros en su camino de bienestar y transformación personal',
            vision: 'Un mundo donde las personas vivan desde su autenticidad y bienestar integral',
            energia: 'Calmada pero intensa, inspiradora y acogedora',
            autenticidad: 'Se muestra vulnerable, comparte experiencias reales y aprendizajes personales'
          },
          estiloComunicacion: {
            tonoNatural: 'Conversacional, cercano, sin pretensiones',
            conexionEmocional: 'A través de vulnerabilidad y experiencias compartidas',
            historias: 'Comparte historias personales de transformación y aprendizaje',
            vulnerabilidad: 'Se muestra real, con dudas, miedos y aprendizajes',
            inspiracion: 'Inspira desde la autenticidad, no desde la perfección',
            humor: 'Usa humor sutil y autocrítico',
            reflexiones: 'Comparte reflexiones profundas sobre bienestar y vida'
          },
          temasRecurrentes: {
            principales: ['Bienestar integral', 'Movimiento', 'Autenticidad', 'Transformación'],
            angulos: ['Desde la experiencia personal', 'Desde la vulnerabilidad', 'Desde el aprendizaje'],
            experiencias: ['Su propio camino de transformación', 'Aprendizajes de la vida', 'Momentos de vulnerabilidad'],
            aprendizajes: ['Sobre bienestar', 'Sobre autenticidad', 'Sobre movimiento', 'Sobre conexión'],
            transformaciones: ['Su evolución personal', 'Cambios en su perspectiva', 'Crecimiento espiritual']
          },
          relacionConAudiencia: {
            comoSeDirige: 'Como un amigo cercano, sin jerarquías',
            queOfrece: 'Acompañamiento genuino en el camino de bienestar',
            confianza: 'A través de vulnerabilidad y autenticidad',
            comunidad: 'Construye una comunidad basada en valores compartidos',
            acompañamiento: 'Acompaña desde la experiencia, no desde la teoría'
          },
          movementSpirit: {
            queEs: 'Una filosofía de vida basada en movimiento, bienestar y autenticidad',
            filosofia: 'Vivir desde el movimiento interno y externo, conectando cuerpo, mente y espíritu',
            bienestar: 'Bienestar integral que incluye cuerpo, mente, emociones y espíritu',
            movimiento: 'Movimiento como expresión de vida y transformación',
            espiritu: 'Espíritu como conexión con la esencia y propósito personal'
          },
          vocabulario: {
            palabrasFavoritas: ['Bienestar', 'Movimiento', 'Autenticidad', 'Transformación', 'Conexión'],
            expresiones: ['MForMove', 'Bienestar integral', 'Desde la autenticidad'],
            metáforas: ['Movimiento como vida', 'Bienestar como camino', 'Transformación como proceso'],
            conceptos: ['MForMove', 'Bienestar integral', 'Autenticidad']
          },
          ritmoYFlujo: {
            estructura: 'Natural, fluida, como una conversación',
            pausas: 'Usa pausas para crear impacto y reflexión',
            intensidad: 'Varía entre calma y intensidad según el momento',
            climax: 'Construye momentos de impacto a través de vulnerabilidad'
          },
          elementosTecnicos: {
            persuasionScore: 8,
            emotionalImpactScore: 9,
            callToActionEffectiveness: 7,
            engagementOptimizationScore: 8
          }
        } as any;
      }

      return finalAnalysis;
    } catch (error) {
      console.error('Error analyzing captions:', error);
      throw error;
    }
  }

  // Método público que usa automáticamente la información personal fija de Mateo
  async analyzeMateoPersonality(limit: number = 20): Promise<InstagramAnalysis> {
    try {
      // Obtener videos recientes
      const videos = await this.getRecentVideos(limit);
      
      // Extraer captions
      const captions = await this.extractCaptionsFromVideos(videos);
      
      // Realizar análisis con la información personal fija de Mateo
      return await this.analyzeCaptions(captions, MATEO_PERSONAL_INFO);
    } catch (error) {
      console.error('Error analyzing Mateo personality:', error);
      throw error;
    }
  }

  // Método público para análisis completo con información personal personalizada (opcional)
  async analyzePersonalityWithInfo(personalInfo: {
    values?: string[];
    mission?: string;
    personality?: string[];
    lifePhilosophy?: string;
    communicationStyle?: string;
    coreBeliefs?: string[];
    personalStory?: string;
    uniqueTraits?: string[];
  }, limit: number = 20): Promise<InstagramAnalysis> {
    try {
      // Obtener videos recientes
      const videos = await this.getRecentVideos(limit);
      
      // Extraer captions
      const captions = await this.extractCaptionsFromVideos(videos);
      
      // Realizar análisis con información personal
      return await this.analyzeCaptions(captions, personalInfo);
    } catch (error) {
      console.error('Error analyzing personality with personal info:', error);
      throw error;
    }
  }

  async extractCaptionsFromVideos(videos: InstagramMedia[]): Promise<string[]> {
    // Filtrar videos con captions significativos (más de 10 palabras)
    const significantCaptions = videos
      .filter(video => {
        const caption = video.caption || '';
        const wordCount = caption.split(/\s+/).length;
        return caption.trim().length > 0 && wordCount >= 10;
      })
      .map(video => video.caption!)
      .slice(0, 15); // Aumentar a 15 captions para mejor análisis

    // Si no hay suficientes captions significativos, incluir algunos más cortos
    if (significantCaptions.length < 10) {
      const additionalCaptions = videos
        .filter(video => {
          const caption = video.caption || '';
          return caption.trim().length > 0 && caption.trim().length < 50;
        })
        .map(video => video.caption!)
        .slice(0, 10 - significantCaptions.length);
      
      return [...significantCaptions, ...additionalCaptions];
    }

    return significantCaptions;
  }

  async getInstagramInsights(): Promise<{
    totalVideos: number;
    captionsWithText: number;
    averageCaptionLength: number;
    mostUsedEmojis: string[];
    engagementMetrics: {
      averageLikes: number;
      averageComments: number;
      bestPerformingCaptions: string[];
      engagementRate: number;
    };
    contentAnalysis: {
      topPerformingTopics: string[];
      bestPostingTimes: string[];
      captionLengthPerformance: {
        short: number;
        medium: number;
        long: number;
      };
    };
  }> {
    try {
      const videos = await this.getRecentVideos(50);
      const captions = await this.extractCaptionsFromVideos(videos);
      
      const totalLength = captions.reduce((sum, caption) => sum + caption.length, 0);
      const averageLength = captions.length > 0 ? Math.round(totalLength / captions.length) : 0;

      // Extraer emojis más usados
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const allEmojis = captions.join('').match(emojiRegex) || [];
      const emojiCounts = allEmojis.reduce((acc, emoji) => {
        acc[emoji] = (acc[emoji] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostUsedEmojis = Object.entries(emojiCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emoji]) => emoji);

      // Análisis de engagement basado en datos reales
      const engagementMetrics = {
        averageLikes: 0, // Se calcularía con datos reales de engagement si estuvieran disponibles
        averageComments: 0, // Se calcularía con datos reales de engagement si estuvieran disponibles
        bestPerformingCaptions: captions.slice(0, 3), // Top 3 captions por longitud
        engagementRate: 0 // Se calcularía con datos reales si estuvieran disponibles
      };

      // Análisis de contenido basado en datos reales
      const contentAnalysis = {
        topPerformingTopics: this.extractTopicsFromCaptions(captions),
        bestPostingTimes: this.extractPostingTimesFromVideos(videos),
        captionLengthPerformance: this.analyzeCaptionLengthPerformance(captions)
      };

      return {
        totalVideos: videos.length,
        captionsWithText: captions.length,
        averageCaptionLength: averageLength,
        mostUsedEmojis,
        engagementMetrics,
        contentAnalysis
      };
    } catch (error) {
      console.error('Error getting Instagram insights:', error);
      throw error;
    }
  }

  // Método auxiliar para extraer temas de los captions
  private extractTopicsFromCaptions(captions: string[]): string[] {
    const commonTopics = [
      'movimiento', 'bienestar', 'transformación', 'consciencia', 'energía',
      'fluir', 'conectar', 'sentir', 'despertar', 'liberar', 'expandir',
      'autenticidad', 'crecimiento', 'desarrollo', 'inspiración', 'motivación'
    ];

    const topicCounts: Record<string, number> = {};
    
    captions.forEach(caption => {
      const lowerCaption = caption.toLowerCase();
      commonTopics.forEach(topic => {
        if (lowerCaption.includes(topic)) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  // Método auxiliar para extraer horarios de publicación
  private extractPostingTimesFromVideos(videos: InstagramMedia[]): string[] {
    const hourCounts: Record<number, number> = {};
    
    videos.forEach(video => {
      const date = new Date(video.timestamp);
      const hour = date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return sortedHours.map(hour => {
      if (hour >= 6 && hour < 12) return 'Mañana (6-12am)';
      if (hour >= 12 && hour < 18) return 'Tarde (12-6pm)';
      if (hour >= 18 && hour < 24) return 'Noche (6-12pm)';
      return 'Madrugada (12-6am)';
    });
  }

  // Método auxiliar para analizar performance por longitud de caption
  private analyzeCaptionLengthPerformance(captions: string[]): {
    short: number;
    medium: number;
    long: number;
  } {
    let short = 0;
    let medium = 0;
    let long = 0;
    
    captions.forEach(caption => {
      const wordCount = caption.split(/\s+/).length;
      if (wordCount < 20) short++;
      else if (wordCount < 50) medium++;
      else long++;
    });

    return { short, medium, long };
  }

  // Método que genera sugerencias usando automáticamente la información personal fija de Mateo
  async generateMateoSuggestions(topic: string): Promise<{
    hooks: string[];
    bodyTemplates: string[];
    closings: string[];
    hashtagSuggestions: string[];
    toneGuidelines: string;
    // Nuevos campos para copywriting avanzado
    painPointHooks: string[];
    benefitFocusedHooks: string[];
    urgencyHooks: string[];
    socialProofHooks: string[];
    transformationHooks: string[];
    psychologicalTriggers: string[];
    objectionHandlers: string[];
    trustBuilders: string[];
    conversionOptimizers: string[];
    emotionalAppeals: string[];
  }> {
    try {
      // Realizar análisis con información personal fija
      const analysis = await this.analyzeMateoPersonality(15);
      
      // Generar sugerencias
      return await this.generateCopywritingSuggestions(analysis, topic);
    } catch (error) {
      console.error('Error generating Mateo suggestions:', error);
      throw error;
    }
  }

  async generateCopywritingSuggestions(analysis: InstagramAnalysis, topic: string): Promise<{
    hooks: string[];
    bodyTemplates: string[];
    closings: string[];
    hashtagSuggestions: string[];
    toneGuidelines: string;
    // Nuevos campos para copywriting avanzado
    painPointHooks: string[];
    benefitFocusedHooks: string[];
    urgencyHooks: string[];
    socialProofHooks: string[];
    transformationHooks: string[];
    psychologicalTriggers: string[];
    objectionHandlers: string[];
    trustBuilders: string[];
    conversionOptimizers: string[];
    emotionalAppeals: string[];
  }> {
    try {
      const copywritingPrompt = `
        Basándote en este análisis profundo de Instagram, genera sugerencias específicas de copywriting para el tema: "${topic}"

        ANÁLISIS DISPONIBLE:
        ${JSON.stringify(analysis, null, 2)}

        GENERA SUGERENCIAS EN FORMATO JSON:

        {
          "hooks": ["5 ganchos de apertura que capten atención inmediata usando el estilo analizado"],
          "bodyTemplates": ["3 plantillas de cuerpo de texto que mantengan engagement"],
          "closings": ["5 cierres efectivos que motiven acción"],
          "hashtagSuggestions": ["hashtags relevantes para el tema"],
          "toneGuidelines": "guía específica del tono a usar basada en el análisis",
          "painPointHooks": ["3 ganchos que identifiquen puntos de dolor específicos"],
          "benefitFocusedHooks": ["3 ganchos enfocados en beneficios y resultados"],
          "urgencyHooks": ["3 ganchos que creen urgencia y acción inmediata"],
          "socialProofHooks": ["3 ganchos que usen prueba social y credibilidad"],
          "transformationHooks": ["3 ganchos que prometan transformación"],
          "psychologicalTriggers": ["5 disparadores psicológicos específicos para usar"],
          "objectionHandlers": ["5 maneras de anticipar y manejar objeciones comunes"],
          "trustBuilders": ["5 elementos para construir confianza y credibilidad"],
          "conversionOptimizers": ["5 técnicas para optimizar conversión"],
          "emotionalAppeals": ["5 apelaciones emocionales específicas"]
        }

        INSTRUCCIONES:
        1. Usa el vocabulario y frases identificadas en el análisis
        2. Mantén el tono y estilo detectados
        3. Incorpora los elementos de persuasión identificados
        4. Aplica las técnicas psicológicas detectadas
        5. Usa los emojis y elementos visuales identificados
        6. Enfócate en el contexto de bienestar y movimiento
        7. Asegúrate de que cada sugerencia sea específica y accionable
        8. Considera la propuesta de valor única identificada
        9. Incorpora elementos de autoridad y credibilidad
        10. Optimiza para engagement y conversión
      `;

      // Usar el servicio de IA directamente en lugar de hacer una llamada HTTP
      const aiService = await import('../ai/aiService');
      const response = await aiService.aiService.generateEmail({
        type: 'educational',
        content: copywritingPrompt,
        topic: topic
      });

      // Parsear la respuesta JSON
      let suggestions;
      try {
        suggestions = JSON.parse(response.html);
      } catch (error) {
        // Si no se puede parsear como JSON, crear sugerencias por defecto
        suggestions = {
          hooks: [`Gancho para ${topic}`, `Apertura impactante sobre ${topic}`, `Introducción sobre ${topic}`],
          bodyTemplates: [`Plantilla de contenido para ${topic}`, `Desarrollo sobre ${topic}`, `Cuerpo del mensaje sobre ${topic}`],
          closings: [`Cierre para ${topic}`, `Call to action sobre ${topic}`, `Final motivacional sobre ${topic}`],
          hashtagSuggestions: [`#${topic.replace(/\s+/g, '')}`, `#bienestar`, `#movimiento`],
          toneGuidelines: `Usar tono inspiracional y educativo para ${topic}`,
          painPointHooks: [`¿Te sientes estancado con ${topic}?`, `¿Luchas con ${topic}?`, `¿Necesitas ayuda con ${topic}?`],
          benefitFocusedHooks: [`Descubre cómo ${topic} puede transformarte`, `Los beneficios de ${topic}`, `Transforma tu vida con ${topic}`],
          urgencyHooks: [`No esperes más para ${topic}`, `Oportunidad limitada en ${topic}`, `Actúa ahora en ${topic}`],
          socialProofHooks: [`Miles ya han transformado su vida con ${topic}`, `Testimonios sobre ${topic}`, `Casos de éxito con ${topic}`],
          transformationHooks: [`Transforma tu vida con ${topic}`, `Cambia tu realidad con ${topic}`, `Evoluciona a través de ${topic}`],
          psychologicalTriggers: [`Autoridad en ${topic}`, `Prueba social de ${topic}`, `Escasez en ${topic}`, `Reciprocidad con ${topic}`, `Compromiso con ${topic}`],
          objectionHandlers: [`Supera las dudas sobre ${topic}`, `Resuelve objeciones sobre ${topic}`, `Elimina miedos sobre ${topic}`],
          trustBuilders: [`Construye confianza en ${topic}`, `Establece credibilidad en ${topic}`, `Demuestra autoridad en ${topic}`],
          conversionOptimizers: [`Optimiza conversión en ${topic}`, `Mejora resultados en ${topic}`, `Maximiza engagement en ${topic}`],
          emotionalAppeals: [`Conecta emocionalmente con ${topic}`, `Toca el corazón con ${topic}`, `Inspira a través de ${topic}`]
        };
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating copywriting suggestions:', error);
      
      // Retornar sugerencias por defecto en caso de error
      return {
        hooks: [`Gancho para ${topic}`, `Apertura impactante sobre ${topic}`],
        bodyTemplates: [`Plantilla de contenido para ${topic}`],
        closings: [`Cierre para ${topic}`],
        hashtagSuggestions: [`#${topic.replace(/\s+/g, '')}`],
        toneGuidelines: `Usar tono inspiracional para ${topic}`,
        painPointHooks: [`¿Te sientes estancado con ${topic}?`],
        benefitFocusedHooks: [`Descubre cómo ${topic} puede transformarte`],
        urgencyHooks: [`No esperes más para ${topic}`],
        socialProofHooks: [`Miles ya han transformado su vida con ${topic}`],
        transformationHooks: [`Transforma tu vida con ${topic}`],
        psychologicalTriggers: [`Autoridad en ${topic}`],
        objectionHandlers: [`Supera las dudas sobre ${topic}`],
        trustBuilders: [`Construye confianza en ${topic}`],
        conversionOptimizers: [`Optimiza conversión en ${topic}`],
        emotionalAppeals: [`Conecta emocionalmente con ${topic}`]
      };
    }
  }

  // Método que genera email usando automáticamente la información personal fija de Mateo
  async generateMateoEmail(topic: string, emailType: string = 'pain-point'): Promise<{
    subject: string;
    hook: string;
    body: string;
    closing: string;
    hashtags: string[];
    psychologicalTriggers: string[];
    emotionalAppeals: string[];
    tone: string;
    type: string;
  }> {
    try {
      // Realizar análisis con información personal fija
      const analysis = await this.analyzeMateoPersonality(15);
      
      // Generar email completo
      return await this.generateCompleteEmail(analysis, topic, emailType);
    } catch (error) {
      console.error('Error generating Mateo email:', error);
      throw error;
    }
  }

  async generateCompleteEmail(analysis: InstagramAnalysis, topic: string, emailType: string = 'pain-point'): Promise<{
    subject: string;
    hook: string;
    body: string;
    closing: string;
    hashtags: string[];
    psychologicalTriggers: string[];
    emotionalAppeals: string[];
    tone: string;
    type: string;
  }> {
    try {
      const emailPrompt = `
        Eres Mateo Molfino. Basándote en tu personalidad, valores y estilo de comunicación, genera un email auténtico y personal para el tema: "${topic}"
        
        TIPO DE EMAIL: ${emailType}
        
        TU PERFIL PERSONAL:
        - Personalidad: ${JSON.stringify(analysis.personalidad)}
        - Estilo de comunicación: ${JSON.stringify(analysis.estiloComunicacion)}
        - Vocabulario: ${JSON.stringify(analysis.vocabulario)}
        - Relación con audiencia: ${JSON.stringify(analysis.relacionConAudiencia)}

        GENERA UN EMAIL QUE SUENE COMO TÚ, MATEO MOLFINO:

        {
          "subject": "Asunto que refleje tu estilo natural y auténtico",
          "hook": "Apertura que conecte emocionalmente, usando tu vulnerabilidad y autenticidad",
          "body": "Cuerpo del email que refleje tu filosofía de MForMove, usando tu vocabulario natural y compartiendo desde la experiencia personal",
          "closing": "Cierre que inspire desde la autenticidad, no desde la perfección",
          "hashtags": ["5 hashtags que uses naturalmente"],
          "psychologicalTriggers": ["3 elementos que reflejen tu forma de conectar"],
          "emotionalAppeals": ["2 apelaciones emocionales que uses naturalmente"],
          "tone": "Descripción del tono que usas naturalmente",
          "type": "${emailType}"
        }

        INSTRUCCIONES ESPECÍFICAS:
        1. Suena como MATEO MOLFINO, no como un copywriter genérico
        2. Usa tu vocabulario natural y expresiones típicas
        3. Refleja tu filosofía de MForMove
        4. Conecta desde la vulnerabilidad y autenticidad
        5. Comparte desde la experiencia personal, no desde la teoría
        6. Usa tu energía natural y auténtica
        7. Refleja tu misión de inspirar y acompañar
        8. Conecta como un amigo cercano
        9. Usa tu tono conversacional y cercano
        10. Inspira desde la autenticidad, no desde la perfección

        CRÍTICO - CÓMO DEBE SONAR EL EMAIL:
        
        ❌ NO HAGAS ESTO (ejemplos del email problemático):
        - "En MForMove, hemos descubierto que [tema] no es solo una práctica..."
        - "Te invito a que explores [tema] desde la autenticidad..."
        - Repetir el tema mecánicamente múltiples veces
        - Usar lenguaje corporativo o de marketing
      
        ✅ SÍ HAZ ESTO (como Mateo realmente habla):
        - "Ayer estuve practicando y me di cuenta de algo..."
        - "¿Te ha pasado que cuando haces [actividad] sientes...?"
        - "Quería contarte algo que me movió mucho esta semana..."
        - Ser conversacional, como hablándole a un amigo
        - Compartir experiencias personales reales
        - Mostrar vulnerabilidad auténtica
        
        IMPORTANTE: Debe sonar como MATEO hablando naturalmente, NO como un email de marketing.
      `;

      // Usar el servicio de IA
      const aiService = await import('../ai/aiService');
      const response = await aiService.aiService.generateEmail({
        type: 'educational',
        content: emailPrompt,
        topic: topic
      });

      // Parsear la respuesta JSON
      let completeEmail;
      try {
        completeEmail = JSON.parse(response.html);
      } catch (error) {
        // Email por defecto que refleje el estilo de Mateo
        completeEmail = {
          subject: `Reflexionando sobre ${topic} desde MForMove`,
          hook: `Hoy quiero compartirte algo que he estado pensando mucho sobre ${topic}.`,
          body: `En MForMove, hemos descubierto que ${topic} no es solo una práctica, sino una forma de conectar con nuestra esencia más profunda.\n\nCuando me encuentro con ${topic}, siento que es una oportunidad para recordar quién soy realmente, más allá de las expectativas y las presiones externas.\n\nTe invito a que explores ${topic} desde la autenticidad, desde ese lugar donde tu cuerpo, mente y espíritu se encuentran en armonía.`,
          closing: `¿Te animas a explorar ${topic} desde esta perspectiva? Te acompaño en el camino.\n\nCon amor,\nMateo`,
          hashtags: [`#${topic.replace(/\s+/g, '')}`, `#mformove`, `#bienestar`, `#autenticidad`, `#transformacion`],
          psychologicalTriggers: [`Conexión personal`, `Vulnerabilidad auténtica`, `Acompañamiento genuino`],
          emotionalAppeals: [`Conexión con la esencia`, `Inspiración desde la autenticidad`],
          tone: `Conversacional, cercano, auténtico, inspirador desde la vulnerabilidad`,
          type: emailType
        };
      }

      return completeEmail;
    } catch (error) {
      console.error('Error generating complete email:', error);
      
      // Retornar email por defecto que refleje el estilo de Mateo
      return {
        subject: `Reflexionando sobre ${topic}`,
        hook: `Hoy quiero compartirte algo sobre ${topic} que me ha estado moviendo.`,
        body: `En MForMove creemos que ${topic} es más que una práctica, es una forma de conectar con nuestra autenticidad.`,
        closing: `Te acompaño en este camino de ${topic}.\n\nCon amor,\nMateo`,
        hashtags: [`#${topic.replace(/\s+/g, '')}`, `#mformove`, `#bienestar`],
        psychologicalTriggers: [`Conexión personal`, `Acompañamiento`],
        emotionalAppeals: [`Autenticidad`, `Inspiración`],
        tone: `Conversacional y auténtico`,
        type: emailType
      };
    }
  }
}

export default InstagramService;
export type { InstagramMedia, InstagramAnalysis }; 