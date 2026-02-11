import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';
import InstagramService from '../../../../services/instagram/instagramService';

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { videoId, caption, type = 'reflection' } = requestBody;

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

    const whatsappContent = await aiService.generateWhatsAppMessage({
      content: videoContent.caption,
      type: type as 'story' | 'promotion' | 'tip' | 'reflection'
    });


    // Parsear el mensaje de WhatsApp
    const messageLines = whatsappContent.message.split('\n').filter(line => line.trim());
    
    // Separar en mensajes individuales (basado en líneas vacías)
    const messages: string[] = [];
    let currentMessage = '';
    
    for (const line of messageLines) {
      if (line.trim() === '') {
        if (currentMessage.trim()) {
          messages.push(currentMessage.trim());
          currentMessage = '';
        }
      } else {
        currentMessage += (currentMessage ? '\n' : '') + line;
      }
    }
    
    // Agregar el último mensaje si existe
    if (currentMessage.trim()) {
      messages.push(currentMessage.trim());
    }

    // Si no se separaron mensajes, crear uno solo
    if (messages.length === 0) {
      messages.push(whatsappContent.message);
    }

    const response = {
      success: true,
      whatsapp: {
        messages: messages,
        fullMessage: whatsappContent.message,
        type: type,
        aiProvider: whatsappContent.aiProvider,
        estimatedCost: whatsappContent.estimatedCost
      },
      videoSource: {
        tema: "Mensaje de WhatsApp desde video",
        caption: videoContent.caption.substring(0, 100) + '...',
        videoId: videoContent.mediaId,
        timestamp: videoContent.timestamp
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [ERROR] Error generating WhatsApp message:', error);
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