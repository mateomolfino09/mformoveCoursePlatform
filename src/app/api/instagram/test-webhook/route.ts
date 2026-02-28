import { NextRequest, NextResponse } from 'next/server';
import InstagramService from '../../../../services/instagram/instagramService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {

    // Verificar credenciales
    const instagramService = InstagramService.getInstance();
    
    if (!instagramService.hasCredentials()) {
      return NextResponse.json({
        success: false,
        error: 'Instagram credentials not configured',
        message: 'Configura INSTAGRAM_ACCESS_TOKEN y INSTAGRAM_USER_ID en .env'
      }, { status: 400 });
    }

    // Verificar variables de entorno
    const webhookToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
    const notificationEmail = process.env.EMAIL_INFO;
    const notificationWhatsApp = process.env.NOTIFICATION_WHATSAPP;
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const configStatus = {
      webhookToken: !!webhookToken,
      notificationEmail: !!notificationEmail,
      notificationWhatsApp: !!notificationWhatsApp,
      appUrl: !!appUrl
    };

    // Probar conexión con Instagram
    let instagramConnection = false;
    let recentVideos: any[] = [];
    
    try {
      recentVideos = await instagramService.getRecentVideos(1);
      instagramConnection = true;
    } catch (error) {
      console.error('❌ [TEST] Error conectando con Instagram:', error);
    }

    // Verificar endpoint del webhook
    const webhookUrl = `${appUrl || 'http://localhost:3000'}/api/instagram/webhook`;
    
    const testResult = {
      success: true,
      message: 'Configuración del webhook verificada',
      config: {
        instagramCredentials: instagramService.hasCredentials(),
        instagramConnection,
        webhookToken: configStatus.webhookToken,
        notificationEmail: configStatus.notificationEmail,
        notificationWhatsApp: configStatus.notificationWhatsApp,
        appUrl: configStatus.appUrl,
        webhookUrl
      },
      data: {
        recentVideosCount: recentVideos.length,
        lastVideo: recentVideos[0] ? {
          id: recentVideos[0].id,
          mediaType: recentVideos[0].media_type,
          hasCaption: !!recentVideos[0].caption
        } : null
      },
      nextSteps: [
        '1. Configura el webhook en Facebook Developers',
        '2. Usa la URL del webhook en la configuración',
        '3. Usa el verify token: ' + (webhookToken || 'NO_CONFIGURADO'),
        '4. Suscribe a eventos: mentions, media',
        '5. Sube un reel para probar la automatización'
      ]
    };

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('❌ [TEST] Error en la prueba:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 