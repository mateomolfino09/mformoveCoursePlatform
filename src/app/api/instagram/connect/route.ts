import { NextRequest, NextResponse } from 'next/server';
import InstagramService from '../../../../services/instagram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, userId, autoConnect } = body;

    const instagramService = InstagramService.getInstance();

    // Si es conexión automática, usar credenciales de variables de entorno
    if (autoConnect) {
      if (!instagramService.hasCredentials()) {
        return NextResponse.json(
          { error: 'No Instagram credentials found in environment variables' },
          { status: 400 }
        );
      }
      // Las credenciales ya están cargadas desde las variables de entorno
    } else {
      // Conexión manual con credenciales proporcionadas
      if (!accessToken || !userId) {
        return NextResponse.json(
          { error: 'Access token and user ID are required' },
          { status: 400 }
        );
      }
      instagramService.setCredentials(accessToken, userId);
    }

    // Obtener insights básicos para verificar la conexión
    const insights = await instagramService.getInstagramInsights();

    return NextResponse.json({
      success: true,
      insights,
      message: autoConnect ? 'Instagram connected automatically' : 'Instagram connected successfully'
    });

  } catch (error) {
    console.error('Error connecting to Instagram:', error);
    return NextResponse.json(
      { error: 'Error connecting to Instagram. Please check your credentials.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const userId = searchParams.get('userId');

    const instagramService = InstagramService.getInstance();
    
    // Si no se proporcionan credenciales, usar las almacenadas
    if (!accessToken || !userId) {
      if (!instagramService.hasCredentials()) {
        return NextResponse.json(
          { error: 'No credentials provided and no stored credentials found' },
          { status: 400 }
        );
      }
      // Las credenciales ya están cargadas desde las variables de entorno
    } else {
      instagramService.setCredentials(accessToken, userId);
    }

    // Obtener insights completos
    const insights = await instagramService.getInstagramInsights();
    
    // Obtener videos recientes para estadísticas adicionales
    const videos = await instagramService.getRecentVideos(10);
    const captions = await instagramService.extractCaptionsFromVideos(videos);

    return NextResponse.json({
      success: true,
      videos: videos.map(video => ({
        id: video.id,
        caption: video.caption,
        permalink: video.permalink,
        timestamp: video.timestamp,
        thumbnail: video.thumbnail_url
      })),
      captions,
      totalVideos: insights.totalVideos,
      captionsWithText: insights.captionsWithText,
      mostUsedEmojis: insights.mostUsedEmojis,
      averageCaptionLength: insights.averageCaptionLength,
      lastSync: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      insights
    });

  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    return NextResponse.json(
      { error: 'Error fetching Instagram data' },
      { status: 500 }
    );
  }
} 