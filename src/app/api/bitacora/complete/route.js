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
      return NextResponse.json(
        { error: 'No autorizado: userId no encontrado en el token' },
        { status: 401 }
      );
    }

    // Obtener el body de la petición
    const body = await req.json();
    const { logbookId, weekNumber, dayNumber, contentType, contentIndex } = body;

    if (!logbookId) {
      return NextResponse.json(
        { error: 'logbookId es requerido' },
        { status: 400 }
      );
    }

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
          
        }
      } catch (error) {
        // Error silencioso al obtener logbook
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
    const useContentIndex = contentIndex !== undefined && contentIndex !== null && !dayKey;

    // Claves específicas por tipo de contenido (video y audio son independientes)
    // Con contentIndex: una clave por ítem de la semana (varios contenidos por semana)
    const videoKey = contentType === 'visual'
      ? (useContentIndex ? `${logbookId}-${weekNumber}-content-${contentIndex}` : (dayKey ? `${dayKey}-video` : `${logbookId}-${weekNumber}-week-video`))
      : null;
    const audioKey = (contentType === 'audio' || contentType === 'audioText')
      ? (useContentIndex ? `${logbookId}-${weekNumber}-content-${contentIndex}` : (dayKey ? `${dayKey}-audio` : `${logbookId}-${weekNumber}-week-audio`))
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
    let ucGranted = false; // Flag para saber si realmente se otorgó U.C.
    
    // Agregar a los arrays de completados solo si no está completado
    if (!alreadyCompleted) {
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
      if (isVideo && videoKey) {
        tracking.completedVideos.push(videoKey);
      } else if (isAudio && audioKey) {
        tracking.completedAudios.push(audioKey);
      }
    }

    // Progreso de nivel por contenido: 25% de la barra por semana completa = 2/8.
    // Cada contenido completado suma (2 / contenidosDeLaSemana).
    let levelProgressResult = null;
    if (!alreadyCompleted && (videoKey || audioKey)) {
      let contentsLength = 2; // legacy: 2 contenidos por semana
      if (useContentIndex && logbookId && weekNumber !== undefined && weekNumber !== null) {
        try {
          const logbookDoc = await WeeklyLogbook.findById(logbookId).lean();
          const week = logbookDoc?.weeklyContents?.find((w) => w.weekNumber === weekNumber);
          const contents = week?.contents;
          if (Array.isArray(contents) && contents.length > 0) {
            contentsLength = contents.length;
          }
        } catch (_) {}
      }
      const increment = contentsLength > 0 ? 2 / contentsLength : 0;
      if (increment > 0) {
        levelProgressResult = tracking.addLevelProgressByContent(increment);
      }
    }
    
    // U.C.: con contentIndex (varios contenidos por semana) solo se otorga 1 U.C. cuando la semana está completa.
    // Sin contentIndex (legacy): se llama addCoherenceUnit por cada contenido.
    const shouldCallAddUC = (videoKey && contentType === 'visual') || (audioKey && (contentType === 'audio' || contentType === 'audioText'));
    if (shouldCallAddUC) {
      try {
        let callAddUC = false;
        if (useContentIndex) {
          const logbookDoc = await WeeklyLogbook.findById(logbookId).lean();
          const week = logbookDoc?.weeklyContents?.find((w) => w.weekNumber === weekNumber);
          const contents = week?.contents;
          if (Array.isArray(contents) && contents.length > 0) {
            let completedCount = 0;
            for (let i = 0; i < contents.length; i++) {
              const key = `${logbookId}-${weekNumber}-content-${i}`;
              if ((tracking.completedVideos || []).includes(key) || (tracking.completedAudios || []).includes(key)) completedCount++;
            }
            if (completedCount === contents.length) callAddUC = true;
          } else {
            callAddUC = true;
          }
        } else {
          callAddUC = true;
        }
        if (callAddUC) {
          const result = await tracking.addCoherenceUnit(logbookId, contentType, weekNumber, null, semanaActualDelLogbook);
          ucResult = result; // Guardar el resultado
        
        if (result.success) {
          newAchievements = result.newAchievements || [];
          ucGranted = (result.ucsOtorgadas || 0) > 0;
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
          // Actualizar levelProgress y level si están en el resultado
          if (result.levelProgress !== undefined && result.levelProgress !== null) {
            tracking.levelProgress = result.levelProgress;
          }
          if (result.newLevel !== undefined && result.newLevel !== null) {
            tracking.level = result.newLevel;
          } else if (result.levelUp && result.newLevel !== undefined) {
            // Si hubo level up, usar el nuevo nivel
            tracking.level = result.newLevel;
          }
          if (result.characterEvolution !== undefined) {
            tracking.characterEvolution = result.characterEvolution;
          }
        }
        }
      } catch (error) {
        // Error silencioso al agregar U.C.
      }
    }

    // Guardar el tracking actualizado usando findOneAndUpdate para asegurar que los arrays se guarden
    
    // Usar findOneAndUpdate para asegurar que los arrays se guarden correctamente
    // Asegurar que levelProgress y level se incluyan siempre
    const updateData = {
      totalUnits: tracking.totalUnits,
      currentStreak: tracking.currentStreak,
      longestStreak: tracking.longestStreak,
      lastCompletedDate: tracking.lastCompletedDate,
      level: tracking.level !== undefined && tracking.level !== null ? tracking.level : 1,
      levelProgress: tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0,
      monthsCompleted: tracking.monthsCompleted !== undefined && tracking.monthsCompleted !== null ? tracking.monthsCompleted : 0,
      characterEvolution: tracking.characterEvolution !== undefined && tracking.characterEvolution !== null ? tracking.characterEvolution : 0,
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
        // Error silencioso al incrementar práctica
      }
    }
    
    // Obtener información de level up: addCoherenceUnit ya no sube nivel; viene de addLevelProgressByContent (levelProgressResult)
    const levelUp = (ucResult?.levelUp || levelProgressResult?.levelUp) || false;
    const newLevel = ucResult?.newLevel ?? levelProgressResult?.newLevel;
    const evolution = (ucResult?.evolution || levelProgressResult?.evolution) || false;
    const gorillaIcon = ucResult?.gorillaIcon ?? levelProgressResult?.gorillaIcon;
    const evolutionName = ucResult?.evolutionName ?? levelProgressResult?.evolutionName;

    // Construir mensaje según el resultado
    const esSemanaAdicional = ucResult?.esSemanaAdicional || false;
    const ucsOtorgadas = ucResult?.ucsOtorgadas || 0;
    
    let message = '';
    let responseSuccess = true;
    let reason = undefined;
    let tip = undefined;
    
    if (ucGranted) {
      message = ucsOtorgadas === 1
        ? '¡Semana completada! Obtuviste 1 U.C.'
        : `¡Semana completada! Obtuviste ${ucsOtorgadas} U.C.`;
      responseSuccess = true;
    } else {
      // No se otorgó U.C. (contenido ya estaba completado o límite de semana adicional)
      responseSuccess = false;
      reason = ucResult?.reason || 'ALREADY_COMPLETED_NO_UC';
      tip = ucResult?.tip || 'Una semana completada = 1 U.C. Este contenido ya estaba completado.';
      message = ucResult?.message || 'Contenido ya completado. Una semana completada = 1 U.C.';
      // Si hubo level up (por U.C. o por contenido), seguir considerándolo éxito para que se procese el efecto
      if (levelUp) {
        responseSuccess = true;
      }
    }

    console.log('ucResult', ucResult);
    console.log('levelUp', levelUp);
    
    // Si hay level up, obtener el tracking actualizado para obtener la información completa
    let finalTracking = trackingParaRespuesta;
    if (levelUp) {
      const updatedTracking = await CoherenceTracking.findOne({ userId });
      if (updatedTracking) {
        finalTracking = updatedTracking;
      }
    }
    
    // Obtener levelProgress del tracking final o del resultado por contenido
    const levelProgress = (finalTracking?.levelProgress !== undefined && finalTracking?.levelProgress !== null)
      ? finalTracking.levelProgress
      : (levelProgressResult?.levelProgress !== undefined && levelProgressResult?.levelProgress !== null)
        ? levelProgressResult.levelProgress
        : (ucResult?.levelProgress !== undefined && ucResult?.levelProgress !== null ? ucResult.levelProgress : 0);

    console.log('levelProgress', levelProgress);
    
    return NextResponse.json(
      {
        success: responseSuccess,
        ucGranted,
        message,
        reason,
        tip,
        tracking: {
          totalUnits: finalTracking.totalUnits,
          currentStreak: finalTracking.currentStreak,
          longestStreak: finalTracking.longestStreak,
        },
        completedDays: finalTracking.completedDays || [],
        completedWeeks: finalTracking.completedWeeks || [],
        completedVideos: finalTracking.completedVideos || [],
        completedAudios: finalTracking.completedAudios || [],
        newAchievements: newAchievements.map(ach => ({
          name: ach.name,
          description: ach.description,
          icon: ach.icon
        })),
        esSemanaAdicional,
        ucsOtorgadas,
        weekNumber,
        contentType,
        necesitaReporte,
        levelUp: levelUp,
        newLevel: newLevel,
        evolution: evolution,
        gorillaIcon: gorillaIcon,
        evolutionName: evolutionName,
        levelProgress: levelProgress,
        progressToNextLevel: Math.round((levelProgress / 8) * 100)
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al completar la camino', message: error.message },
      { status: 500 }
    );
  }
}

