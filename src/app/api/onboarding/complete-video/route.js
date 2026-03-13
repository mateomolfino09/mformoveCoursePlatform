import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import jwt from 'jsonwebtoken';
import { EmailService } from '../../../../services/email/emailService';
import CoherenceTracking, { getGorillaIcon, getEvolutionName, getProgressToNextLevel } from '../../../../models/coherenceTrackingModel';

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

    // U.C. deshabilitado: ya no se otorgan unidades por completar videos del camino base
    let tracking = null;
    try {
      tracking = await CoherenceTracking.getOrCreate(userId);
      const trackingUpdated = await CoherenceTracking.findOne({ userId: userId });
      const level = trackingUpdated?.level || 1;
      const levelProgress = trackingUpdated?.levelProgress !== undefined && trackingUpdated?.levelProgress !== null
        ? trackingUpdated?.levelProgress
        : 0;
      const gorillaIcon = getGorillaIcon(level);
      const evolutionName = getEvolutionName(level);
      const progressToNextLevel = getProgressToNextLevel(levelProgress);
      const monthsCompleted = trackingUpdated?.monthsCompleted || 0;

      return NextResponse.json({
        success: true,
        videoCompletado: videoId,
        bitacoraCompletada: todosCompletados,
        siguienteVideo: videoIndex < VIDEOS_ORDER.length - 1
          ? VIDEOS_ORDER[videoIndex + 1]
          : null,
        ucsOtorgadas: 0, // U.C. deshabilitado
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
        esSemanaAdicional: false,
        newAchievements: [],
        levelUp: false,
        newLevel: level,
        evolution: false,
        gorillaIcon: gorillaIcon,
        evolutionName: evolutionName,
        levelProgress: levelProgress,
        progressToNextLevel: progressToNextLevel
      }, { status: 200 });
    } catch (err) {
      console.error('Error obteniendo tracking (U.C. deshabilitado):', err);
      return NextResponse.json({
        success: true,
        videoCompletado: videoId,
        bitacoraCompletada: todosCompletados,
        siguienteVideo: videoIndex < VIDEOS_ORDER.length - 1 ? VIDEOS_ORDER[videoIndex + 1] : null,
        ucsOtorgadas: 0,
        tracking: null,
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

