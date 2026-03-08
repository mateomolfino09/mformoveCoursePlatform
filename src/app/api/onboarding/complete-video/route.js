import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import jwt from 'jsonwebtoken';
import { EmailService } from '../../../../services/email/emailService';
import CoherenceTracking, { getGorillaIcon, getEvolutionName, getProgressToNextLevel } from '../../../../models/coherenceTrackingModel';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';

const VIDEOS_ORDER = ['elCinturon', 'laEspiral', 'elRango', 'elCuerpoUtil'];

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.cookies.get('userToken')?.value;
    const { videoId } = await req.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!videoId || !VIDEOS_ORDER.includes(videoId)) {
      return NextResponse.json(
        { error: 'Video ID inválido' },
        { status: 400 }
      );
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    const userId = decoded._id || decoded.userId || decoded.id;
    const user = await Users.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga suscripción activa
    if (!user.subscription?.active) {
      return NextResponse.json(
        { error: 'Solo usuarios con suscripción activa pueden completar el onboarding' },
        { status: 403 }
      );
    }

    // Verificar que el contrato esté aceptado
    if (!user.subscription.onboarding?.contratoAceptado) {
      return NextResponse.json(
        { error: 'Debes aceptar el contrato primero' },
        { status: 403 }
      );
    }

    // Verificar secuencialidad y si el video ya estaba completado
    const progreso = user.subscription.onboarding?.bitacoraBaseProgreso || {};
    const videoIndex = VIDEOS_ORDER.indexOf(videoId);
    const videoYaCompletado = progreso[videoId] === true;
    
    if (videoIndex > 0) {
      const videoAnterior = VIDEOS_ORDER[videoIndex - 1];
      if (!progreso[videoAnterior]) {
        return NextResponse.json(
          { error: 'Debes completar el video anterior primero' },
          { status: 403 }
        );
      }
    }
    
    // Si ya estaba completado, no hacer nada más
    if (videoYaCompletado) {
      return NextResponse.json({
        success: true,
        videoCompletado: videoId,
        bitacoraCompletada: VIDEOS_ORDER.every(vid => user.subscription.onboarding.bitacoraBaseProgreso?.[vid] === true),
        siguienteVideo: null,
        ucsOtorgadas: 0,
        tracking: null,
        esSemanaAdicional: false,
        newAchievements: [],
        message: 'Este video ya fue completado anteriormente'
      }, { status: 200 });
    }
    
    // Marcar video como completado
    user.subscription.onboarding = user.subscription.onboarding || {};
    user.subscription.onboarding.bitacoraBaseProgreso = user.subscription.onboarding.bitacoraBaseProgreso || {};
    user.subscription.onboarding.bitacoraBaseProgreso[videoId] = true;

    // Verificar si se completó toda la camino
    const todosCompletados = VIDEOS_ORDER.every(vid => 
      user.subscription.onboarding.bitacoraBaseProgreso[vid] === true
    );

    if (todosCompletados && !user.subscription.onboarding.bitacoraBaseCompletada) {
      user.subscription.onboarding.bitacoraBaseCompletada = true;
      user.subscription.onboarding.fechaCompletacionBitacora = new Date();
      
      // Enviar email de completación de camino base
      try {
        const emailService = EmailService.getInstance();
        const origin = process.env.NEXT_PUBLIC_URL || 'https://mateomove.com';
        await emailService.sendBitacoraBaseCompleted({
          email: user.email,
          name: user.name || 'Miembro',
          dashboardLink: `${origin}/home`,
          buttonText: 'Ir al Dashboard'
        });
      } catch (emailErr) {
        console.error('Error enviando email de completación de camino base:', emailErr);
      }
    }

    await user.save();

    // Otorgar U.C. por completar el video usando addCoherenceUnit
    let ucResult = null;
    let tracking = null;
    let newAchievements = [];
    try {
      // Obtener el logbookId de la camino base
      const bitacoraBase = await WeeklyLogbook.findOne({ isBaseBitacora: true })
        .sort({ createdAt: -1 })
        .lean();
      
      if (!bitacoraBase) {
        throw new Error('Camino base no encontrada');
      }

      const logbookId = bitacoraBase._id.toString();
      
      // Obtener o crear tracking usando el método estático
      tracking = await CoherenceTracking.getOrCreate(userId);

      // Usar addCoherenceUnit para otorgar U.C. (weekNumber = videoIndex + 1 para que coincida con el orden)
      const weekNumber = videoIndex + 1;
      
      // Guardar el nivel y evolución antes de agregar la unidad de coherencia
      const levelBefore = tracking.level || 1;
      const evolutionBefore = tracking.characterEvolution || 0;
      const levelProgressBefore = tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0;
      
      ucResult = await tracking.addCoherenceUnit(logbookId, 'visual', weekNumber, null, 0);
      
      let levelUp = false;
      let evolution = false;
      
      if (ucResult.success) {
        newAchievements = ucResult.newAchievements || [];
        await tracking.save();
        
        // Para camino base, si addCoherenceUnit no otorgó U.C. (porque detectó que ya estaba completado),
        // pero el video NO estaba completado en el User, entonces otorgar 1 U.C. manualmente
        if ((ucResult.ucsOtorgadas || 0) === 0) {
          // El video no estaba completado en el User, pero addCoherenceUnit detectó que ya estaba completado
          // en weeklyCompletions. Para camino base, siempre otorgar 1 U.C. la primera vez según el User
          tracking.totalUnits = (tracking.totalUnits || 0) + 1;
          await tracking.save();
          // Actualizar ucResult para reflejar que se otorgó 1 U.C.
          ucResult.ucsOtorgadas = 1;
        }
        
        // En camino base, cada video otorga 2 unidades de levelProgress (2/8 = 25%)
        // addCoherenceUnit ya otorgó 1, así que incrementamos 1 más
        if (tracking.levelProgress === undefined || tracking.levelProgress === null) {
          tracking.levelProgress = 0;
        }
        tracking.levelProgress += 1;
        
        // Verificar si al incrementar llega a 8, subir de nivel
        if (tracking.levelProgress >= 8) {
          tracking.level += 1;
          tracking.levelProgress = 0; // Reiniciar a 0
          levelUp = true;
          // Incrementar meses completados cuando subes de nivel
          if (tracking.monthsCompleted === undefined || tracking.monthsCompleted === null) {
            tracking.monthsCompleted = 0;
          }
          tracking.monthsCompleted += 1;
          
          // Verificar si hay evolución (cada 10 niveles)
          const newEvolution = Math.floor((tracking.level - 1) / 10);
          if (newEvolution > evolutionBefore) {
            tracking.characterEvolution = newEvolution;
            evolution = true;
          }
        }
        
        await tracking.save();
        
        // Verificar y desbloquear logros
        const unlockedAchievements = tracking.checkAndUnlockAchievements();
        if (unlockedAchievements.length > 0) {
          newAchievements = [...newAchievements, ...unlockedAchievements];
          await tracking.save();
        }
      }
      
      // Obtener el tracking actualizado para incluir todos los campos
      const trackingUpdated = await CoherenceTracking.findOne({ userId: userId });
      
      // Preparar respuesta con todos los campos necesarios
      const level = trackingUpdated?.level || 1;
      const levelProgress = trackingUpdated?.levelProgress !== undefined && trackingUpdated?.levelProgress !== null 
        ? trackingUpdated?.levelProgress 
        : 0;
      const gorillaIcon = getGorillaIcon(level);
      const evolutionName = getEvolutionName(level);
      const progressToNextLevel = getProgressToNextLevel(levelProgress);
      const newLevel = level;
      const monthsCompleted = trackingUpdated?.monthsCompleted || 0;

      return NextResponse.json({
        success: true,
        videoCompletado: videoId,
        bitacoraCompletada: todosCompletados,
        siguienteVideo: videoIndex < VIDEOS_ORDER.length - 1 
          ? VIDEOS_ORDER[videoIndex + 1] 
          : null,
        // Datos de U.C. para el modal
        ucsOtorgadas: ucResult?.ucsOtorgadas || 0,
        tracking: {
          totalUnits: trackingUpdated?.totalUnits || 0,
          currentStreak: trackingUpdated?.currentStreak || 0,
          longestStreak: trackingUpdated?.longestStreak || 0,
          level: level,
          levelProgress: levelProgress,
          monthsCompleted: monthsCompleted,
          characterEvolution: trackingUpdated?.characterEvolution || 0,
          gorillaIcon: gorillaIcon,
          evolutionName: evolutionName,
          progressToNextLevel: progressToNextLevel
        },
        esSemanaAdicional: ucResult?.esSemanaAdicional || false,
        newAchievements: newAchievements.map(ach => ({
          name: ach.name,
          description: ach.description,
          icon: ach.icon
        })),
        levelUp: levelUp || ucResult?.levelUp || false,
        newLevel: newLevel,
        evolution: evolution || ucResult?.evolution || false,
        gorillaIcon: gorillaIcon,
        evolutionName: evolutionName,
        levelProgress: levelProgress,
        progressToNextLevel: progressToNextLevel
      }, { status: 200 });
      
    } catch (ucError) {
      console.error('Error otorgando U.C. en camino base:', ucError);
      
      // Si hay error, intentar obtener el tracking actual para devolver datos básicos
      try {
        tracking = await CoherenceTracking.findOne({ userId: userId });
      } catch (e) {
        // Ignorar error
      }
      
      return NextResponse.json({
        success: true,
        videoCompletado: videoId,
        bitacoraCompletada: todosCompletados,
        siguienteVideo: videoIndex < VIDEOS_ORDER.length - 1 
          ? VIDEOS_ORDER[videoIndex + 1] 
          : null,
        ucsOtorgadas: 0,
        tracking: tracking ? {
          totalUnits: tracking.totalUnits || 0,
          currentStreak: tracking.currentStreak || 0,
          longestStreak: tracking.longestStreak || 0,
          level: tracking.level || 1,
          levelProgress: tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0,
          monthsCompleted: tracking.monthsCompleted || 0,
          characterEvolution: tracking.characterEvolution || 0,
          gorillaIcon: getGorillaIcon(tracking.level || 1),
          evolutionName: getEvolutionName(tracking.level || 1),
          progressToNextLevel: getProgressToNextLevel(tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0)
        } : null,
        esSemanaAdicional: false,
        newAchievements: []
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error completando video:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

