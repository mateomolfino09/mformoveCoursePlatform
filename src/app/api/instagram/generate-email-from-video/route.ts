import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';
import InstagramService from '../../../../services/instagram/instagramService';

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { videoId, caption } = requestBody;

    let videoContent;

    if (videoId && caption) {
      // Usar el video específico enviado desde el frontend
      videoContent = {
        caption: caption,
        videoUrl: `https://www.instagram.com/p/${videoId}/`,
        timestamp: new Date().toISOString(),
        mediaId: videoId
      };
    } else {
      // Fallback: Obtener el último video de Instagram
      const instagramService = InstagramService.getInstance();
      
      if (!instagramService.hasCredentials()) {
        console.error('❌ [ERROR] Instagram credentials not configured');
        throw new Error('Instagram credentials not configured. Please set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in .env');
      }
      const recentVideos = await instagramService.getRecentVideos(5);
      
      if (recentVideos.length === 0) {
        throw new Error('No videos found in Instagram account');
      }

      // Tomar el video más reciente
      const latestVideo = recentVideos[0];
      
      if (!latestVideo.caption) {
        console.error('❌ [ERROR] Latest video has no caption');
        throw new Error('Latest video has no caption to analyze');
      }

      videoContent = {
        caption: latestVideo.caption,
        videoUrl: latestVideo.permalink,
        timestamp: latestVideo.timestamp,
        mediaId: latestVideo.id
      };
    }

    const emailContent = await aiService.generateEmail({
      type: 'newsletter', // OpenAI para creatividad y copywriting
      content: videoContent.caption,
      topic: 'create email from video'
    });

    // Parsear el contenido del AI
    const generatedContent = emailContent.html.trim();
    
    // Intentar extraer contenido estructurado primero
    const subjectMatch = generatedContent.match(/SUBJECT:\s*(.+?)(?=\n|$)/i);
    const bodyMatch = generatedContent.match(/BODY:\s*([\s\S]+?)(?=\n(?:CTA|HASHTAGS|VIDEO_REFERENCE|PSYCHOLOGICAL_TRIGGERS|EMOTIONAL_APPEALS):|$)/i);
    const ctaMatch = generatedContent.match(/CTA:\s*(.+?)(?=\n|$)/i);
    const hashtagsMatch = generatedContent.match(/HASHTAGS:\s*(.+?)(?=\n|$)/i);
    const videoRefMatch = generatedContent.match(/VIDEO_REFERENCE:\s*(.+?)(?=\n|$)/i);
    const triggersMatch = generatedContent.match(/PSYCHOLOGICAL_TRIGGERS:\s*(.+?)(?=\n|$)/i);
    const appealsMatch = generatedContent.match(/EMOTIONAL_APPEALS:\s*(.+?)(?=\n|$)/i);
    
    let subject, emailBody, cta, hashtags, videoReference, psychologicalTriggers, emotionalAppeals;
    
    if (subjectMatch && bodyMatch) {
      // Formato estructurado encontrado
      subject = subjectMatch[1].trim();
      emailBody = bodyMatch[1].trim();
      cta = ctaMatch ? ctaMatch[1].trim() : "Contame: ¿qué te resuena más de esto?";
      hashtags = hashtagsMatch ? hashtagsMatch[1].trim() : "#MForMove #MovimientoConsciente #BiomecánicaReal";
      videoReference = videoRefMatch ? videoRefMatch[1].trim() : "Inspirado en mi último video de Instagram";
      
      psychologicalTriggers = triggersMatch 
        ? triggersMatch[1].split(',').map(t => t.trim()).filter(t => t)
        : ["Conexión personal", "Autenticidad", "Experiencia compartida"];
      
      emotionalAppeals = appealsMatch
        ? appealsMatch[1].split(',').map(a => a.trim()).filter(a => a)
        : ["Inspiración desde la vulnerabilidad", "Acompañamiento genuino"];
    } else {
      // Formato conversacional directo
      const lines = generatedContent.split('\n').filter(line => line.trim());
      
      // Buscar el saludo para identificar el inicio del email
      const greetingIndex = lines.findIndex(line => 
        line.toLowerCase().includes('hola') || 
        line.toLowerCase().includes('hey') ||
        line.toLowerCase().includes('mateo')
      );
      
      const emailContent = greetingIndex >= 0 ? lines.slice(greetingIndex) : lines;
      
      subject = "Reflexiones desde el movimiento";
      emailBody = emailContent.join('\n\n');
      cta = "Contame: ¿qué te resuena más de esto?";
      hashtags = "#MForMove #MovimientoConsciente #BiomecánicaReal";
      videoReference = "Inspirado en mi último video de Instagram";
      psychologicalTriggers = ["Conexión personal", "Autenticidad", "Experiencia compartida"];
      emotionalAppeals = ["Inspiración desde la vulnerabilidad", "Acompañamiento genuino"];
    }
    
    // Crear el objeto email
    const email = {
      subject: subject,
      body: emailBody,
      cta: cta,
      hashtags: hashtags,
      videoReference: videoReference,
      psychologicalTriggers: psychologicalTriggers,
      emotionalAppeals: emotionalAppeals
    };


    const response = {
      success: true,
      email: email,
      videoSource: {
        tema: "Email creativo desde video",
        caption: videoContent.caption.substring(0, 100) + '...',
        videoId: videoContent.mediaId,
        timestamp: videoContent.timestamp
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [ERROR] Error generating email from video:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}