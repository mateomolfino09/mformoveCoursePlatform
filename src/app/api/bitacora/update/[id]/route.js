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
    const mappedWeeklyContents = weeklyContents.map(wc => {
      const mappedWc = {
        weekNumber: wc.weekNumber,
        moduleName: (wc.moduleName?.trim() || ''),
        weekTitle: wc.weekTitle || `Semana ${wc.weekNumber}`,
        weekDescription: wc.weekDescription || '',
        // Contenido legacy (semanal)
        videoUrl: wc.videoUrl || '',
        videoId: wc.videoId || '',
        audioUrl: wc.audioUrl || '',
        text: wc.text || '',
        // Contenido diario - procesar correctamente los campos nombre
        dailyContents: (wc.dailyContents || []).map(dc => {
          const mappedDc = {
            dayNumber: dc.dayNumber || 1,
            dayTitle: dc.dayTitle || '',
            visualContent: dc.visualContent ? {
              type: dc.visualContent.type || 'video',
              nombre: (dc.visualContent.nombre?.trim() || ''),
              videoUrl: dc.visualContent.videoUrl || '',
              videoId: dc.visualContent.videoId || '',
              thumbnailUrl: dc.visualContent.thumbnailUrl || '',
              duration: dc.visualContent.duration || undefined,
              title: dc.visualContent.title || '',
              description: dc.visualContent.description || ''
            } : {
              type: 'none',
              nombre: '',
              videoUrl: '',
              videoId: '',
              thumbnailUrl: '',
              duration: undefined,
              title: '',
              description: ''
            },
            audioTextContent: dc.audioTextContent ? {
              nombre: (dc.audioTextContent.nombre?.trim() || ''),
              audioUrl: dc.audioTextContent.audioUrl || '',
              audioDuration: dc.audioTextContent.audioDuration || undefined,
              text: dc.audioTextContent.text || '',
              title: dc.audioTextContent.title || '',
              subtitle: dc.audioTextContent.subtitle || ''
            } : {
              nombre: '',
              audioUrl: '',
              audioDuration: undefined,
              text: '',
              title: '',
              subtitle: ''
            },
            publishDate: new Date(dc.publishDate),
            isPublished: dc.isPublished || false,
            isUnlocked: dc.isUnlocked || false
          };
          
          // DEBUG: Log de los nombres procesados
          console.log(`Semana ${wc.weekNumber} - Video nombre procesado:`, mappedDc.visualContent.nombre);
          console.log(`Semana ${wc.weekNumber} - Audio nombre procesado:`, mappedDc.audioTextContent.nombre);
          
          return mappedDc;
        }),
        publishDate: new Date(wc.publishDate),
        isPublished: wc.isPublished || false,
        isUnlocked: wc.isUnlocked || false
      };
      
      // DEBUG: Log del moduleName procesado
      console.log(`Semana ${wc.weekNumber} - ModuleName procesado:`, mappedWc.moduleName);
      
      return mappedWc;
    });

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

