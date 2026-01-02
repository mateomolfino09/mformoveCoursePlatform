import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import CoherenceTracking from '../../../../models/coherenceTrackingModel';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import Users from '../../../../models/userModel';

// Función para obtener el número de semana del año
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${Math.ceil((((d - yearStart) / 86400000) + 1) / 7)}`;
}

export async function POST(req) {
  try {
    // Conectar a la base de datos
    await connectDB();
    // Obtener el token del usuario desde las cookies
    const cookieStore = cookies();
    const userToken = cookieStore.get('userToken')?.value;
    
    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar y decodificar el JWT
    let decoded;
    try {
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = decoded?.userId 
      || decoded?._id 
      || decoded?.id 
      || decoded?.user?._id 
      || decoded?.user?.id 
      || null;

    if (!userId) {
      console.warn('[bitacora/complete] Token decodificado sin userId', {
        decodedKeys: Object.keys(decoded || {})
      });
      return NextResponse.json(
        { error: 'No autorizado: userId no encontrado en el token' },
        { status: 401 }
      );
    }

    // Obtener el body de la petición
    const body = await req.json();
    const { logbookId, weekNumber, dayNumber, contentType } = body;

    if (!logbookId) {
      return NextResponse.json(
        { error: 'logbookId es requerido' },
        { status: 400 }
      );
    }

    console.log('[bitacora/complete] Iniciando', { 
      userId, 
      weekNumber, 
      dayNumber, 
      contentType, 
      logbookId
    });

    // Obtener el logbook para calcular la semana actual
    let semanaActualDelLogbook = 0;
    if (logbookId && mongoose.Types.ObjectId.isValid(logbookId)) {
      try {
        const logbook = await WeeklyLogbook.findById(logbookId);
        if (logbook && logbook.weeklyContents && logbook.weeklyContents.length > 0) {
          const ahora = new Date();
          ahora.setHours(0, 0, 0, 0);
          
          // Encontrar la semana más alta cuya fecha de publicación ya pasó
          for (const semana of logbook.weeklyContents) {
            if (semana.publishDate) {
              const fechaPublicacion = new Date(semana.publishDate);
              fechaPublicacion.setHours(0, 0, 0, 0);
              if (fechaPublicacion <= ahora && semana.weekNumber > semanaActualDelLogbook) {
                semanaActualDelLogbook = semana.weekNumber;
              }
            }
          }
          
          // Si no encontramos ninguna semana con fecha pasada, verificar la primera semana
          if (semanaActualDelLogbook === 0 && logbook.weeklyContents.length > 0) {
            const primeraSemana = logbook.weeklyContents.find(s => s.weekNumber === 1);
            if (primeraSemana && primeraSemana.publishDate) {
              const fechaPrimeraSemana = new Date(primeraSemana.publishDate);
              fechaPrimeraSemana.setHours(0, 0, 0, 0);
              if (fechaPrimeraSemana <= ahora) {
                semanaActualDelLogbook = 1;
              }
            }
          }
          
          console.log('[bitacora/complete] Semana actual del logbook calculada', { 
            semanaActualDelLogbook, 
            weekNumberCompletando: weekNumber,
            esSemanaAdicional: semanaActualDelLogbook > 0 && (weekNumber < semanaActualDelLogbook || weekNumber > semanaActualDelLogbook)
          });
        }
      } catch (error) {
        console.error('[bitacora/complete] Error obteniendo logbook', error.message);
      }
    }

    // Obtener tracking existente (debe haberse creado al suscribirse)
    const tracking = await CoherenceTracking.findOne({ userId });
    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking no inicializado para este usuario' },
        { status: 404 }
      );
    }

    // Generar las claves de completado - SEPARADAS por tipo de contenido
    const dayKey = dayNumber && weekNumber ? `${logbookId}-${weekNumber}-${dayNumber}` : null;
    const weekKey = weekNumber ? `${logbookId}-${weekNumber}` : null;
    
    // Claves específicas por tipo de contenido (video y audio son independientes)
    const videoKey = contentType === 'visual' 
      ? (dayKey ? `${dayKey}-video` : `${logbookId}-${weekNumber}-week-video`)
      : null;
    const audioKey = (contentType === 'audio' || contentType === 'audioText')
      ? (dayKey ? `${dayKey}-audio` : `${logbookId}-${weekNumber}-week-audio`)
      : null;


    // Inicializar arrays de completados si no existen en el tracking
    if (!tracking.completedDays) {
      tracking.completedDays = [];
    }
    if (!tracking.completedWeeks) {
      tracking.completedWeeks = [];
    }
    if (!tracking.completedVideos) {
      tracking.completedVideos = [];
    }
    if (!tracking.completedAudios) {
      tracking.completedAudios = [];
    }

    // Verificar si ya está completado ESTE CONTENIDO ESPECÍFICO (video o audio)
    const isVideo = contentType === 'visual';
    const isAudio = contentType === 'audio' || contentType === 'audioText';
    const contentKey = videoKey || audioKey;
    
    let alreadyCompleted = false;
    if (isVideo && videoKey && tracking.completedVideos.includes(videoKey)) {
      alreadyCompleted = true;
    } else if (isAudio && audioKey && tracking.completedAudios.includes(audioKey)) {
      alreadyCompleted = true;
    }

    let newAchievements = [];
    let ucResult = null; // Guardar el resultado de addCoherenceUnit para usarlo en la respuesta
    
    // Si no está completado, procesar la completación
    if (!alreadyCompleted) {
      // Agregar a los arrays de completados
      if (dayKey) {
        if (!tracking.completedDays.includes(dayKey)) {
          tracking.completedDays.push(dayKey);
        }
      }
      if (weekKey) {
        if (!tracking.completedWeeks.includes(weekKey)) {
          tracking.completedWeeks.push(weekKey);
        }
      }
      // Procesar video o audio para agregar U.C.
      if ((videoKey && contentType === 'visual') || (audioKey && (contentType === 'audio' || contentType === 'audioText'))) {
        const contentKey = videoKey || audioKey;
        
        // Verificar si ya está completado este contenido específico
        const alreadyCompletedContent = isVideo 
          ? tracking.completedVideos.includes(videoKey)
          : tracking.completedAudios.includes(audioKey);
        
        if (!alreadyCompletedContent) {
          if (isVideo && videoKey) {
            tracking.completedVideos.push(videoKey);
          } else if (isAudio && audioKey) {
            tracking.completedAudios.push(audioKey);
          }
          
          // Intentar agregar U.C. (addCoherenceUnit verificará si ya se completó este tipo para esta semana)
          try {
            const result = await tracking.addCoherenceUnit(logbookId, contentType, weekNumber, null, semanaActualDelLogbook);
            ucResult = result; // Guardar el resultado
            console.log('[bitacora/complete] Resultado', { 
              success: result.success, 
              totalUnits: result.totalUnits,
              esSemanaAdicional: result.esSemanaAdicional
            });
            
            if (result.success) {
              newAchievements = result.newAchievements || [];
              // Actualizar el tracking con los valores del resultado
              if (result.totalUnits !== undefined) {
                tracking.totalUnits = result.totalUnits;
              }
              if (result.currentStreak !== undefined) {
                tracking.currentStreak = result.currentStreak;
              }
              if (result.longestStreak !== undefined) {
                tracking.longestStreak = result.longestStreak;
              }
            } else {
              // Si no se pudo agregar U.C., pero el contenido SÍ se completó
              // IMPORTANTE: Guardar el tracking para que se actualice el porcentaje de completado
              console.log('[bitacora/complete] No se agregó U.C., pero guardando completado', { message: result.message, reason: result.reason });
              
              // Guardar el tracking actualizado (aunque no se haya otorgado U.C.)
              const updateData = {
                totalUnits: tracking.totalUnits,
                currentStreak: tracking.currentStreak,
                longestStreak: tracking.longestStreak,
                lastCompletedDate: tracking.lastCompletedDate,
                completedDays: tracking.completedDays || [],
                completedWeeks: tracking.completedWeeks || [],
                completedVideos: tracking.completedVideos || [],
                completedAudios: tracking.completedAudios || []
              };
              
              await CoherenceTracking.findOneAndUpdate(
                { userId },
                { $set: updateData },
                { new: true, upsert: false }
              );
              
              // Devolver respuesta indicando que se completó pero no se otorgó U.C.
              return NextResponse.json(
                {
                  success: false,
                  message: result.message || 'No se pudo agregar la Unidad de Coherencia',
                  reason: result.reason || 'UNKNOWN',
                  tip: result.tip || null,
                  weekNumber: result.weekNumber || weekNumber,
                  contentType: result.contentType || contentType,
                  tracking: {
                    totalUnits: tracking.totalUnits,
                    currentStreak: tracking.currentStreak,
                    longestStreak: tracking.longestStreak,
                  },
                  completedDays: tracking.completedDays || [],
                  completedWeeks: tracking.completedWeeks || [],
                  completedVideos: tracking.completedVideos || [],
                  completedAudios: tracking.completedAudios || []
                },
                { status: 200 } // Status 200 porque la clase se completó, solo que no se otorgó U.C.
              );
            }
          } catch (error) {
            console.error('[bitacora/complete] Error agregando U.C.', error.message);
          }
        }
      }
    }

    // Guardar el tracking actualizado usando findOneAndUpdate para asegurar que los arrays se guarden
    
    // Usar findOneAndUpdate para asegurar que los arrays se guarden correctamente
    const updateData = {
      totalUnits: tracking.totalUnits,
      currentStreak: tracking.currentStreak,
      longestStreak: tracking.longestStreak,
      lastCompletedDate: tracking.lastCompletedDate,
      completedDays: tracking.completedDays || [],
      completedWeeks: tracking.completedWeeks || [],
      completedVideos: tracking.completedVideos || [],
      completedAudios: tracking.completedAudios || []
    };
    
    
    const trackingActualizado = await CoherenceTracking.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: false }
    );
    
    // Verificar que se guardó correctamente leyendo desde la BD
    const trackingVerificado = await CoherenceTracking.findOne({ userId });
    
    // Usar el tracking actualizado para la respuesta
    const trackingParaRespuesta = trackingVerificado || trackingActualizado || tracking;
    
    // Incrementar contador de prácticas semanales si se completó un video (no audio)
    let necesitaReporte = false;
    if (contentType === 'video') {
      try {
        const user = await Users.findById(userId);
        if (user && user.subscription?.active) {
          const semanaActual = getWeekNumber(new Date());
          
          user.subscription.onboarding = user.subscription.onboarding || {};
          user.subscription.onboarding.practicasSemanales = user.subscription.onboarding.practicasSemanales || [];
          
          let semanaEntry = user.subscription.onboarding.practicasSemanales.find(
            p => p.semana === semanaActual
          );
          
          if (!semanaEntry) {
            semanaEntry = {
              semana: semanaActual,
              cantidadPracticas: 0,
              reporteCompletado: false
            };
            user.subscription.onboarding.practicasSemanales.push(semanaEntry);
          }
          
          semanaEntry.cantidadPracticas = (semanaEntry.cantidadPracticas || 0) + 1;
          
          // Verificar si necesita reporte (2 prácticas y no completado)
          if (semanaEntry.cantidadPracticas >= 2 && !semanaEntry.reporteCompletado) {
            necesitaReporte = true;
          }
          
          await user.save();
        }
      } catch (error) {
        console.error('[bitacora/complete] Error incrementando práctica:', error);
      }
    }
    
    // Construir mensaje según el resultado
    const esSemanaAdicional = ucResult?.esSemanaAdicional || false;
    const ucsOtorgadas = ucResult?.ucsOtorgadas || 1;
    
    let message = '';
    if (esSemanaAdicional) {
      message = `¡Clase completada! Obtuviste ${ucsOtorgadas} U.C. (semana adicional).`;
    } else {
      message = `¡Clase completada! Obtuviste ${ucsOtorgadas} U.C.`;
    }

    return NextResponse.json(
      {
        success: true,
        message,
        tracking: {
          totalUnits: trackingParaRespuesta.totalUnits,
          currentStreak: trackingParaRespuesta.currentStreak,
          longestStreak: trackingParaRespuesta.longestStreak,
        },
        completedDays: trackingParaRespuesta.completedDays || [],
        completedWeeks: trackingParaRespuesta.completedWeeks || [],
        completedVideos: trackingParaRespuesta.completedVideos || [],
        completedAudios: trackingParaRespuesta.completedAudios || [],
        newAchievements: newAchievements.map(ach => ({
          name: ach.name,
          description: ach.description,
          icon: ach.icon
        })),
        esSemanaAdicional,
        ucsOtorgadas,
        weekNumber,
        contentType,
        necesitaReporte
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[bitacora/complete] Error', error.message);
    return NextResponse.json(
      { error: 'Error al completar la bitácora', message: error.message },
      { status: 500 }
    );
  }
}

