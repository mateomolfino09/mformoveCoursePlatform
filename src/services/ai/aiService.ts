import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Configurar las APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

// Modelos
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface EmailData {
  type: 'newsletter' | 'program_week' | 'live_session' | 'educational';
  subject?: string;
  content?: string;
  participantName?: string;
  programName?: string;
  weekNumber?: number;
  weekTitle?: string;
  weekDescription?: string;
  vimeoVideoId?: string;
  previousWeekProgress?: string;
  topic?: string;
  style?: 'inspirational' | 'educational' | 'newsletter' | 'professional';
  length?: 'short' | 'medium' | 'long';
}

export interface EmailContent {
  subject: string;
  html: string;
  plainText: string;
  aiProvider: string;
  estimatedCost: number;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Genera contenido de email usando la IA más apropiada
   */
  async generateEmail(data: EmailData): Promise<EmailContent> {
    try {
      // Determinar qué IA usar según el tipo de contenido
      const aiProvider = this.selectBestAI(data.type, data.style);
      console.log('aiProvider', aiProvider);
      
      let emailContent: EmailContent;

      switch (aiProvider) {
        case 'openai':
          emailContent = await this.generateWithOpenAI(data);
          break;
        case 'claude':
          emailContent = await this.generateWithClaude(data);
          break;
        case 'gemini':
          emailContent = await this.generateWithGemini(data);
          break;
        default:
          throw new Error('No AI provider available');
      }

      return emailContent;
    } catch (error) {
      console.error('Error generating email:', error);
      throw error;
    }
  }

  /**
   * Selecciona la mejor IA según el tipo de contenido
   */
  private selectBestAI(type: string, style?: string): 'openai' | 'claude' | 'gemini' {
    if (type === 'newsletter') {
      return 'openai'; // OpenAI para creatividad y copywriting
    } else if (type === 'educational') {
      return 'claude'; // Claude para contenido educativo
    } else {
      return 'gemini'; // Gemini para otros tipos
    }
  }

  /**
   * Genera contenido con OpenAI
   */
  private async generateWithOpenAI(data: EmailData): Promise<EmailContent> {
    const prompt = `Eres Mateo Molfino, experto en movimiento, biomecánica, salud postural, fuerza y flexibilidad.

Basándote en este caption de mi último video de Instagram:
"${data.content}"

Crea un email directo y conversacional en mi estilo. Tenés TOTAL LIBERTAD CREATIVA.

MI ESTILO DE EMAIL:
- Saludo directo: "Hola Mateo,"
- Párrafos cortos y potentes (1-3 líneas máximo)
- Frases contundentes que generen impacto
- Revelaciones contraintuitivas que hagan pensar
- Tono cercano pero autoritario
- Uso de "vos" y expresiones uruguayas naturales
- Cierre con insight o reflexión profunda

ESTRUCTURA IDEAL:
1. Hook contundente (problema común)
2. Pattern interrupt (lo que todos creen vs la verdad)
3. Revelación personal (mi experiencia)
4. Explicación simple pero profunda
5. Cierre con reflexión que invite a la acción

EJEMPLO DE TONO:
"La mayoría de la gente está obsesionada con entrenar sus abdominales.
Pero dejame contarte la verdad...
Tus abdominales son irrelevantes si no sabés cómo moverte."

TÉCNICAS A USAR:
- Frases cortas y directas
- Contrastes (pero, sin embargo, la realidad es...)
- Preguntas retóricas
- Revelaciones personales
- Analogías simples
- Cierre con emoji o insight

FORMATO:
- Párrafos de 1-3 líneas máximo
- Espaciado natural entre ideas
- No uses listas ni bullets
- Flujo conversacional natural
- Longitud: 15-25 líneas total

Escribí el email completo como Mateo, con mi voz auténtica y este estilo directo que genera conexión real.`;

    console.log('prompt', prompt);
    
    const completion = await openai?.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8
    });

    const response = completion?.choices[0]?.message?.content || '';
    const parsedContent = this.parseEmailResponse(response);
    
    // Calcular costo estimado
    const inputTokens = completion?.usage?.prompt_tokens || 0;
    const outputTokens = completion?.usage?.completion_tokens || 0;
    const estimatedCost = (inputTokens * 0.005 + outputTokens * 0.015) / 1000;

    return {
      subject: parsedContent.subject,
      html: parsedContent.html,
      plainText: parsedContent.plainText,
      aiProvider: 'OpenAI',
      estimatedCost
    };
  }

  /**
   * Genera mensaje de WhatsApp con OpenAI
   */
  async generateWhatsAppMessage(data: { content: string; type?: 'story' | 'promotion' | 'tip' | 'reflection' }): Promise<{
    message: string;
    aiProvider: string;
    estimatedCost: number;
  }> {
    const prompt = `Eres Mateo Molfino, experto en movimiento, biomecánica, salud postural, fuerza y flexibilidad.

Basándote en este caption de mi último video de Instagram:
"${data.content}"

Crea un mensaje de WhatsApp directo y conversacional en mi estilo. Tenés TOTAL LIBERTAD CREATIVA.

MI ESTILO DE WHATSAPP:
- Mensajes cortos y potentes (máximo 3-4 líneas por mensaje)
- Frases contundentes que generen impacto inmediato
- Revelaciones contraintuitivas que hagan pensar
- Tono cercano pero autoritario
- Uso de "vos" y expresiones uruguayas naturales
- Emojis estratégicos (no excesivos)
- Cierre con insight o pregunta que invite a responder

ESTRUCTURA IDEAL PARA WHATSAPP:
1. Hook contundente (1-2 líneas)
2. Pattern interrupt (lo que todos creen vs la verdad)
3. Revelación personal (mi experiencia)
4. Insight o reflexión profunda
5. Pregunta que invite a la interacción

EJEMPLO DE TONO:
"La mayoría cree que para hacer un press necesitás fuerza de brazos 💪

Pero la verdad es que los secretos están en zonas que ni imaginás...

¿Sabés cuál es la clave real? 🤔"

TÉCNICAS PARA WHATSAPP:
- Frases ultra cortas y directas
- Contrastes (pero, sin embargo, la realidad es...)
- Preguntas retóricas
- Revelaciones personales
- Analogías simples
- Emojis estratégicos (💪 🧠 🔥 🤔 💡)
- Cierre con pregunta que invite a responder

FORMATO:
- Máximo 4-5 mensajes separados
- Cada mensaje de 1-3 líneas máximo
- Emojis estratégicos, no excesivos
- Flujo conversacional natural
- Pregunta final que invite a la interacción

Escribí el mensaje completo como Mateo, con mi voz auténtica y este estilo directo que genera conexión real en WhatsApp.`;

    console.log('WhatsApp prompt:', prompt);
    
    const completion = await openai?.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    const response = completion?.choices[0]?.message?.content || '';
    
    // Calcular costo estimado
    const inputTokens = completion?.usage?.prompt_tokens || 0;
    const outputTokens = completion?.usage?.completion_tokens || 0;
    const estimatedCost = (inputTokens * 0.005 + outputTokens * 0.015) / 1000;

    return {
      message: response,
      aiProvider: 'OpenAI',
      estimatedCost
    };
  }

  /**
   * Genera contenido con Claude
   */
  private async generateWithClaude(data: EmailData): Promise<EmailContent> {
    const prompt = `Genera contenido educativo sobre ${data.topic || 'movimiento y bienestar'}.`;
    
    const message = await anthropic?.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const response = message?.content[0]?.type === 'text' ? (message.content[0] as any).text : '';
    const parsedContent = this.parseEmailResponse(response);
    
    // Calcular costo estimado
    const inputTokens = message?.usage?.input_tokens || 0;
    const outputTokens = message?.usage?.output_tokens || 0;
    const estimatedCost = (inputTokens * 0.008 + outputTokens * 0.024) / 1000;

    return {
      subject: parsedContent.subject,
      html: parsedContent.html,
      plainText: parsedContent.plainText,
      aiProvider: 'Claude',
      estimatedCost
    };
  }

  /**
   * Genera contenido con Gemini
   */
  private async generateWithGemini(data: EmailData): Promise<EmailContent> {
    const prompt = `Genera contenido sobre ${data.topic || 'movimiento y bienestar'}.`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const parsedContent = this.parseEmailResponse(text);
    
    // Calcular costo estimado (aproximado)
    const estimatedCost = (text.length * 0.0015) / 1000;

    return {
      subject: parsedContent.subject,
      html: parsedContent.html,
      plainText: parsedContent.plainText,
      aiProvider: 'Google Gemini',
      estimatedCost
    };
  }

  /**
   * Parsea la respuesta para extraer subject, HTML y texto plano
   */
  private parseEmailResponse(response: string): { subject: string; html: string; plainText: string } {
    try {
      // Si la respuesta ya viene en formato estructurado (con SUBJECT:, etc.)
      const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
      const htmlMatch = response.match(/HTML:\s*([\s\S]*?)(?=TEXT:|$)/i);
      const textMatch = response.match(/TEXT:\s*([\s\S]*?)$/i);

      if (subjectMatch || htmlMatch || textMatch) {
        return {
          subject: subjectMatch?.[1]?.trim() || 'Reflexiones desde el movimiento',
          html: htmlMatch?.[1]?.trim() || response,
          plainText: textMatch?.[1]?.trim() || response
        };
      }

      // Si es un email directo (formato conversacional)
      const lines = response.split('\n').filter(line => line.trim());
      
      // Buscar el saludo para identificar el inicio del email
      const greetingIndex = lines.findIndex(line => 
        line.toLowerCase().includes('hola') || 
        line.toLowerCase().includes('hey') ||
        line.toLowerCase().includes('mateo')
      );

      // Si encontramos un saludo, usar desde ahí
      const emailContent = greetingIndex >= 0 ? lines.slice(greetingIndex) : lines;
      
      // Crear el texto plano
      const plainText = emailContent.join('\n\n');
      
      // Crear HTML básico con párrafos
      const html = emailContent
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');

      return {
        subject: 'Reflexiones desde el movimiento',
        html: html || response,
        plainText: plainText || response
      };
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      return {
        subject: 'Reflexiones desde el movimiento',
        html: response,
        plainText: response
      };
    }
  }

  /**
   * Obtiene estadísticas de uso y costos
   */
  async getUsageStats(): Promise<{
    totalEmails: number;
    totalCost: number;
    breakdown: {
      openai: { count: number; cost: number };
      claude: { count: number; cost: number };
      gemini: { count: number; cost: number };
    };
  }> {
    // Aquí podrías implementar tracking de uso
    // Por ahora retorna datos de ejemplo
    return {
      totalEmails: 0,
      totalCost: 0,
      breakdown: {
        openai: { count: 0, cost: 0 },
        claude: { count: 0, cost: 0 },
        gemini: { count: 0, cost: 0 }
      }
    };
  }
}

// Exportar instancia singleton
export const aiService = AIService.getInstance(); 