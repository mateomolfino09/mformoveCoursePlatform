import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import WeeklyLogbook from '../../../../../models/weeklyLogbookModel';
import Users from '../../../../../models/userModel';
import ClassModule from '../../../../../models/classModuleModel';

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
      // Usar NEXTAUTH_SECRET como en otros endpoints de camino
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
        { error: 'ID de camino requerido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { month, year, title, description, weeklyContents, isBaseBitacora, userEmail } = body;

    // Validar campos requeridos
    if (!weeklyContents || !Array.isArray(weeklyContents)) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Si es camino base, no requiere month/year
    if (!isBaseBitacora && (!month || !year)) {
      return NextResponse.json(
        { error: 'Month y year son requeridos para caminos regulares' },
        { status: 400 }
      );
    }

    // Verificar permisos de admin
    if (userEmail) {
      const user = await Users.findOne({ email: userEmail });
      if (!user || user.rol !== 'Admin') {
        return NextResponse.json(
          { error: 'Solo administradores pueden actualizar caminos' },
          { status: 403 }
        );
      }
    }

    // Buscar la camino existente
    const existingLogbook = await WeeklyLogbook.findById(id);

    if (!existingLogbook) {
      return NextResponse.json(
        { error: 'Camino no encontrada' },
        { status: 404 }
      );
    }

    // Si se está marcando como camino base, desactivar cualquier otra camino base existente
    if (isBaseBitacora && !existingLogbook.isBaseBitacora) {
      await WeeklyLogbook.updateMany(
        { isBaseBitacora: true, _id: { $ne: id } },
        { $set: { isBaseBitacora: false } }
      );
    }

    // Verificar si hay conflicto con otra camino del mismo mes/año (solo para caminos regulares)
    if (!isBaseBitacora) {
    const conflictingLogbook = await WeeklyLogbook.findOne({
      month,
      year,
        isBaseBitacora: false,
      _id: { $ne: id }
    });

    if (conflictingLogbook) {
      return NextResponse.json(
        { error: 'Ya existe otra camino para este mes y año' },
        { status: 409 }
      );
      }
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

    const ensureSubmodule = async (moduleId, submoduleSlug, submoduleName) => {
      if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) return;
      const mod = await ClassModule.findById(moduleId);
      if (!mod || !mod.submodules) return;
      const slug = (submoduleSlug || '').trim() || (submoduleName || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const name = (submoduleName || '').trim() || (submoduleSlug || '').replace(/-/g, ' ');
      if (!slug) return;
      const exists = mod.submodules.some(s => (s.slug || s.name) === slug);
      if (!exists) {
        mod.submodules.push({ name: name || slug, slug });
        await mod.save();
      }
    };

    // Solo guardamos IDs en contents; la hidratación (videoUrl, videoName, etc.) se hace al leer en /api/bitacora/month
    const emptyVideoFields = {
      videoUrl: '',
      videoId: undefined,
      videoName: '',
      videoThumbnail: '',
      videoDuration: undefined,
      title: undefined,
      description: undefined,
      audioUrl: '',
      audioTitle: '',
      audioDuration: undefined,
      audioText: '',
      level: 1,
      moduleId: undefined,
      submoduleSlug: '',
      submoduleName: ''
    };

    const mapContentItem = async (item, orden) => {
      const contentType = ['moduleClass', 'individualClass', 'audio'].includes(item.contentType) ? item.contentType : 'moduleClass';
      const ordenNum = Number(item.orden) || orden;

      if (contentType === 'individualClass') {
        const individualClassId = item.individualClassId && mongoose.Types.ObjectId.isValid(item.individualClassId) ? item.individualClassId : undefined;
        return {
          contentType: 'individualClass',
          individualClassId: individualClassId || undefined,
          moduleClassId: undefined,
          orden: ordenNum,
          ...emptyVideoFields
        };
      }

      if (contentType === 'moduleClass') {
        if (item.moduleId && (item.submoduleSlug || item.submoduleName)) {
          await ensureSubmodule(item.moduleId, item.submoduleSlug, item.submoduleName);
        }
        const moduleClassId = item.moduleClassId && mongoose.Types.ObjectId.isValid(item.moduleClassId) ? item.moduleClassId : undefined;
        return {
          contentType: 'moduleClass',
          individualClassId: undefined,
          moduleClassId: moduleClassId || undefined,
          orden: ordenNum,
          ...emptyVideoFields
        };
      }

      // audio: no hay entidad por ID, guardamos solo los datos del audio
      const audioMeta = item.audioUrl ? await fetchCloudinaryAudioMeta(item.audioUrl) : {};
      return {
        contentType: 'audio',
        individualClassId: undefined,
        moduleClassId: undefined,
        videoUrl: '',
        videoId: undefined,
        videoName: '',
        videoThumbnail: '',
        videoDuration: undefined,
        title: undefined,
        description: undefined,
        audioUrl: item.audioUrl || '',
        audioTitle: (item.audioTitle || '').trim(),
        audioDuration: item.audioDuration ?? audioMeta.duration,
        audioText: item.audioText || '',
        level: 1,
        moduleId: undefined,
        submoduleSlug: '',
        submoduleName: '',
        orden: ordenNum
      };
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const mappedWeeklyContents = await Promise.all(weeklyContents.map(async wc => {
      const publishDate = new Date(wc.publishDate);
      publishDate.setHours(0, 0, 0, 0);
      const weekTitle = (wc.weekTitle || '').trim() || `Semana ${wc.weekNumber}`;
      const isUnlockedByDate = publishDate <= now;
      const base = {
        weekNumber: wc.weekNumber,
        moduleName: (wc.moduleName?.trim() || weekTitle || '').trim() || '',
        weekTitle,
        weekDescription: wc.weekDescription || '',
        dailyContents: [],
        publishDate,
        isPublished: wc.isPublished || false,
        isUnlocked: isUnlockedByDate || wc.isUnlocked || false
      };

      if (wc.contents && Array.isArray(wc.contents) && wc.contents.length > 0) {
        base.contents = await Promise.all(wc.contents.map((item, idx) => mapContentItem(item, idx)));
        // No duplicar datos a nivel semana; la hidratación al leer rellena desde IndividualClass/ModuleClass
        const first = base.contents[0];
        base.videoUrl = first?.videoUrl || '';
        base.videoId = first?.videoId || '';
        base.videoName = first?.videoName || base.weekTitle;
        base.videoThumbnail = first?.videoThumbnail || '';
        base.videoDuration = first?.videoDuration || undefined;
        base.audioUrl = first?.audioUrl || '';
        base.audioTitle = first?.audioTitle || '';
        base.audioDuration = first?.audioDuration || undefined;
        base.text = first?.audioText || wc.text || '';
        return base;
      }

      const meta = await fetchVimeoMeta(wc.videoUrl);
      const audioMeta = await fetchCloudinaryAudioMeta(wc.audioUrl);
      const videoThumbnail = wc.videoThumbnail || wc.thumbnailUrl || meta.thumbnail || '';
      const videoDuration = wc.videoDuration || wc.duration || meta.duration || undefined;
      const audioDuration = wc.audioDuration || audioMeta.duration || undefined;

      return {
        ...base,
        videoUrl: wc.videoUrl || '',
        videoId: wc.videoId || '',
        videoName: wc.videoName?.trim() || wc.weekTitle || '',
        videoThumbnail,
        videoDuration,
        audioUrl: wc.audioUrl || '',
        audioTitle: wc.audioTitle?.trim() || wc.weekTitle || '',
        audioDuration,
        text: wc.text || ''
      };
    }));

    // Preparar datos de actualización
    const updateData = {
      title: title || (isBaseBitacora ? 'Camino Base - Primer Círculo' : 'Camino'),
      description: description || '',
      weeklyContents: mappedWeeklyContents,
      updatedAt: new Date(),
      isBaseBitacora: isBaseBitacora || false
    };

    // Solo actualizar month/year si no es camino base
    if (!isBaseBitacora) {
      updateData.month = month;
      updateData.year = year;
    }

    // Actualizar la camino usando findByIdAndUpdate para asegurar que los cambios se guarden
    const updatedLogbook = await WeeklyLogbook.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { 
        message: 'Camino actualizada exitosamente',
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
    console.error('Error actualizando camino:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar la camino' },
      { status: 500 }
    );
  }
}

