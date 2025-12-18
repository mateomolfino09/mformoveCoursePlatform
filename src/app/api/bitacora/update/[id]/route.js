import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../../config/connectDB';
import WeeklyLogbook from '../../../../../models/weeklyLogbookModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function PUT(req, { params }) {
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

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de bitácora requerido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { month, year, title, description, weeklyContents } = body;

    // DEBUG: Log de los datos recibidos
    console.log('=== DEBUG BITÁCORA UPDATE ===');
    console.log('Body recibido:', JSON.stringify(body, null, 2));
    console.log('WeeklyContents:', JSON.stringify(weeklyContents, null, 2));
    if (weeklyContents && weeklyContents.length > 0) {
      console.log('Primera semana:', JSON.stringify(weeklyContents[0], null, 2));
      if (weeklyContents[0].dailyContents && weeklyContents[0].dailyContents.length > 0) {
        console.log('Primer dailyContent:', JSON.stringify(weeklyContents[0].dailyContents[0], null, 2));
        if (weeklyContents[0].dailyContents[0].visualContent) {
          console.log('VisualContent nombre:', weeklyContents[0].dailyContents[0].visualContent.nombre);
        }
        if (weeklyContents[0].dailyContents[0].audioTextContent) {
          console.log('AudioTextContent nombre:', weeklyContents[0].dailyContents[0].audioTextContent.nombre);
        }
      }
      console.log('ModuleName:', weeklyContents[0].moduleName);
    }

    // Validar campos requeridos
    if (!month || !year || !weeklyContents || !Array.isArray(weeklyContents)) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Buscar la bitácora existente
    const existingLogbook = await WeeklyLogbook.findById(id);

    if (!existingLogbook) {
      return NextResponse.json(
        { error: 'Bitácora no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si hay conflicto con otra bitácora del mismo mes/año
    const conflictingLogbook = await WeeklyLogbook.findOne({
      month,
      year,
      _id: { $ne: id }
    });

    if (conflictingLogbook) {
      return NextResponse.json(
        { error: 'Ya existe otra bitácora para este mes y año' },
        { status: 409 }
      );
    }

    // Mapear y preparar los datos para actualizar
    const fetchVimeoMeta = async (videoUrl) => {
      try {
        if (!videoUrl) return { thumbnail: '', duration: undefined };
        const resp = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`);
        if (!resp.ok) return { thumbnail: '', duration: undefined };
        const data = await resp.json();
        return {
          thumbnail: data.thumbnail_url || '',
          duration: data.duration || undefined
        };
      } catch {
        return { thumbnail: '', duration: undefined };
      }
    };

    const fetchCloudinaryAudioMeta = async (audioUrl) => {
      try {
        if (!audioUrl?.includes('res.cloudinary.com')) return { duration: undefined };
        const url = new URL(audioUrl);
        const parts = url.pathname.split('/');
        const last = parts.pop() || '';
        const extIndex = last.lastIndexOf('.');
        const baseName = extIndex >= 0 ? last.substring(0, extIndex) : last;
        const jsonPath = [...parts, `${baseName}.json`].join('/');
        const metaUrl = `${url.origin}${jsonPath}${url.search}`;
        const resp = await fetch(metaUrl);
        if (!resp.ok) return { duration: undefined };
        const data = await resp.json();
        return { duration: data.duration || data.audio?.duration || undefined };
      } catch {
        return { duration: undefined };
      }
    };

    const mappedWeeklyContents = await Promise.all(weeklyContents.map(async wc => {
      const meta = await fetchVimeoMeta(wc.videoUrl);
      const audioMeta = await fetchCloudinaryAudioMeta(wc.audioUrl);
      const videoThumbnail = wc.videoThumbnail || wc.thumbnailUrl || meta.thumbnail || '';
      const videoDuration = wc.videoDuration || wc.duration || meta.duration || undefined;
      const audioDuration = wc.audioDuration || audioMeta.duration || undefined;

      const mappedWc = {
        weekNumber: wc.weekNumber,
        moduleName: (wc.moduleName?.trim() || ''),
        weekTitle: wc.weekTitle || `Semana ${wc.weekNumber}`,
        weekDescription: wc.weekDescription || '',
        videoUrl: wc.videoUrl || '',
        videoId: wc.videoId || '',
        videoName: wc.videoName?.trim() || wc.weekTitle || '',
        videoThumbnail,
        videoDuration,
        audioUrl: wc.audioUrl || '',
        audioTitle: wc.audioTitle?.trim() || wc.weekTitle || '',
        audioDuration,
        text: wc.text || '',
        dailyContents: [],
        publishDate: new Date(wc.publishDate),
        isPublished: wc.isPublished || false,
        isUnlocked: wc.isUnlocked || false
      };
      
      console.log(`Semana ${wc.weekNumber} - ModuleName procesado:`, mappedWc.moduleName);
      
      return mappedWc;
    }));

    // DEBUG: Log antes de asignar
    console.log('Bitácora antes de asignar:');
    console.log('ModuleName semana 1:', mappedWeeklyContents[0]?.moduleName);
    console.log('VisualContent nombre semana 1:', mappedWeeklyContents[0]?.dailyContents[0]?.visualContent?.nombre);
    console.log('AudioTextContent nombre semana 1:', mappedWeeklyContents[0]?.dailyContents[0]?.audioTextContent?.nombre);

    // Actualizar la bitácora usando findByIdAndUpdate para asegurar que los cambios se guarden
    const updatedLogbook = await WeeklyLogbook.findByIdAndUpdate(
      id,
      {
        $set: {
          month,
          year,
          title: title || 'Camino del Gorila',
          description: description || '',
          weeklyContents: mappedWeeklyContents,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    // DEBUG: Log después de guardar
    console.log('Bitácora después de guardar:');
    console.log('ModuleName semana 1:', updatedLogbook?.weeklyContents[0]?.moduleName);
    console.log('VisualContent nombre semana 1:', updatedLogbook?.weeklyContents[0]?.dailyContents[0]?.visualContent?.nombre);
    console.log('AudioTextContent nombre semana 1:', updatedLogbook?.weeklyContents[0]?.dailyContents[0]?.audioTextContent?.nombre);

    return NextResponse.json(
      { 
        message: 'Bitácora actualizada exitosamente',
        logbook: updatedLogbook
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error actualizando bitácora:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar la bitácora' },
      { status: 500 }
    );
  }
}

