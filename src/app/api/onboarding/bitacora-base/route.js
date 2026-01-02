import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';

export async function GET(req) {
  try {
    await connectDB();
    
    // Obtener la bitácora base
    const bitacoraBase = await WeeklyLogbook.findOne({ isBaseBitacora: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!bitacoraBase) {
      return NextResponse.json(
        { error: 'Bitácora base no encontrada' },
        { status: 404 }
      );
    }

    // Mapear los videos de la bitácora base al formato esperado
    // Los IDs deben ser: elCinturon, laEspiral, elRango, elCuerpoUtil (en ese orden)
    const videoIds = ['elCinturon', 'laEspiral', 'elRango', 'elCuerpoUtil'];
    const videoTitles = [
      '1. El Cinturón',
      '2. La Espiral',
      '3. El Rango',
      '4. El Cuerpo Útil'
    ];
    const videoDescriptions = [
      'Fundamentos del movimiento desde el centro del cuerpo. Aprende a activar y estabilizar tu núcleo como base de todo movimiento coherente.',
      'Explora los patrones espirales que conectan todo tu cuerpo. Descubre cómo la rotación y la torsión generan fuerza y movilidad.',
      'Desarrolla tu rango de movimiento completo. Aprende a explorar los límites de tu movilidad de forma segura y progresiva.',
      'Integra todos los fundamentos en movimientos funcionales. Conecta la teoría con la práctica en acciones cotidianas y deportivas.'
    ];

    const videos = bitacoraBase.weeklyContents
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .slice(0, 4) // Solo tomar los primeros 4 videos
      .map((content, index) => {
        // Obtener videoId desde diferentes fuentes posibles
        const videoId = content.videoId || 
          content.dailyContents?.find(d => d.visualContent?.videoId)?.visualContent?.videoId ||
          null;
        
        // Obtener videoUrl desde diferentes fuentes posibles
        const videoUrl = content.videoUrl || 
          content.dailyContents?.find(d => d.visualContent?.videoUrl)?.visualContent?.videoUrl ||
          null;

        return {
          id: videoIds[index] || `video${index + 1}`,
          title: content.weekTitle || videoTitles[index] || `Video ${index + 1}`,
          videoName: content.videoName || content.weekTitle || videoTitles[index] || `Video ${index + 1}`,
          description: content.weekDescription || videoDescriptions[index] || '',
          videoId: videoId,
          videoUrl: videoUrl,
          thumbnailUrl: content.videoThumbnail || 
            content.dailyContents?.find(d => d.visualContent?.thumbnailUrl)?.visualContent?.thumbnailUrl ||
            null,
          duration: content.videoDuration || 
            content.dailyContents?.find(d => d.visualContent?.duration)?.visualContent?.duration ||
            null,
          weekNumber: content.weekNumber
        };
      })
      .filter(video => video.videoId || video.videoUrl); // Solo videos que tengan contenido

    return NextResponse.json({
      bitacoraBase: {
        _id: bitacoraBase._id,
        title: bitacoraBase.title,
        description: bitacoraBase.description
      },
      videos
    }, { status: 200 });

  } catch (error) {
    console.error('Error obteniendo bitácora base:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

