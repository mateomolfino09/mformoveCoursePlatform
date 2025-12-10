import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userToken = cookieStore.get('userToken')?.value;

    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      // Usar NEXTAUTH_SECRET como en otros endpoints de bitácora
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { month, year, title, description, weeklyContents } = body;

    // Validar campos requeridos
    if (!month || !year || !weeklyContents || !Array.isArray(weeklyContents)) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una bitácora para este mes/año
    const existingLogbook = await WeeklyLogbook.findOne({ month, year });
    if (existingLogbook) {
      return NextResponse.json(
        { error: 'Ya existe una bitácora para este mes y año' },
        { status: 409 }
      );
    }

    // Crear la nueva bitácora
    const newLogbook = await WeeklyLogbook.create({
      month,
      year,
      title: title || 'Camino del Gorila',
      description: description || '',
      weeklyContents: weeklyContents.map(wc => ({
        weekNumber: wc.weekNumber,
        moduleName: wc.moduleName?.trim() || undefined,
        weekTitle: wc.weekTitle || `Semana ${wc.weekNumber}`,
        weekDescription: wc.weekDescription || undefined,
        // Contenido legacy (semanal)
        videoUrl: wc.videoUrl || '',
        videoId: wc.videoId || undefined,
        audioUrl: wc.audioUrl || '',
        text: wc.text || '',
        // Contenido diario - procesar correctamente los campos nombre
        dailyContents: (wc.dailyContents || []).map(dc => ({
          dayNumber: dc.dayNumber || 1,
          dayTitle: dc.dayTitle || '',
          visualContent: dc.visualContent ? {
            type: dc.visualContent.type || 'video',
            nombre: dc.visualContent.nombre?.trim() || undefined,
            videoUrl: dc.visualContent.videoUrl || '',
            videoId: dc.visualContent.videoId || undefined,
            thumbnailUrl: dc.visualContent.thumbnailUrl || undefined,
            duration: dc.visualContent.duration || undefined,
            title: dc.visualContent.title || undefined,
            description: dc.visualContent.description || undefined
          } : undefined,
          audioTextContent: dc.audioTextContent ? {
            nombre: dc.audioTextContent.nombre?.trim() || undefined,
            audioUrl: dc.audioTextContent.audioUrl || '',
            audioDuration: dc.audioTextContent.audioDuration || undefined,
            text: dc.audioTextContent.text || '',
            title: dc.audioTextContent.title || undefined,
            subtitle: dc.audioTextContent.subtitle || undefined
          } : undefined,
          publishDate: new Date(dc.publishDate),
          isPublished: dc.isPublished || false,
          isUnlocked: dc.isUnlocked || false
        })),
        publishDate: new Date(wc.publishDate),
        isPublished: wc.isPublished || false,
        isUnlocked: wc.isUnlocked || false
      }))
    });

    return NextResponse.json(
      { 
        message: 'Bitácora creada exitosamente',
        logbook: newLogbook
      },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error creando bitácora:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la bitácora' },
      { status: 500 }
    );
  }
}

