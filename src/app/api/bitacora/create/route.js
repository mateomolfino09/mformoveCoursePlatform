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

    const mapWeek = async (wc) => {
      const vimeoMeta = await fetchVimeoMeta(wc.videoUrl);
      const audioMeta = await fetchCloudinaryAudioMeta(wc.audioUrl);
      const videoThumbnail = wc.videoThumbnail || wc.thumbnailUrl || vimeoMeta.thumbnail || '';
      const videoDuration = wc.videoDuration || wc.duration || vimeoMeta.duration || undefined;
      const audioDuration = wc.audioDuration || audioMeta.duration || undefined;

      return {
        weekNumber: wc.weekNumber,
        moduleName: wc.moduleName?.trim() || undefined,
        weekTitle: wc.weekTitle || `Semana ${wc.weekNumber}`,
        weekDescription: wc.weekDescription || undefined,
        videoUrl: wc.videoUrl || '',
        videoId: wc.videoId || undefined,
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
    };

    // Crear la nueva bitácora
    const newLogbook = await WeeklyLogbook.create({
      month,
      year,
      title: title || 'Camino del Gorila',
      description: description || '',
      weeklyContents: await Promise.all(weeklyContents.map(mapWeek))
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

