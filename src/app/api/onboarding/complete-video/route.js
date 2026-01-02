import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import jwt from 'jsonwebtoken';
import { EmailService } from '../../../../services/email/emailService';
import CoherenceTracking from '../../../../models/coherenceTrackingModel';

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
    const user = await Users.findById(decoded.userId);

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

    // Verificar secuencialidad
    const progreso = user.subscription.onboarding?.bitacoraBaseProgreso || {};
    const videoIndex = VIDEOS_ORDER.indexOf(videoId);
    
    if (videoIndex > 0) {
      const videoAnterior = VIDEOS_ORDER[videoIndex - 1];
      if (!progreso[videoAnterior]) {
        return NextResponse.json(
          { error: 'Debes completar el video anterior primero' },
          { status: 403 }
        );
      }
    }

    // Marcar video como completado
    user.subscription.onboarding = user.subscription.onboarding || {};
    user.subscription.onboarding.bitacoraBaseProgreso = user.subscription.onboarding.bitacoraBaseProgreso || {};
    user.subscription.onboarding.bitacoraBaseProgreso[videoId] = true;

    // Verificar si se completó toda la bitácora
    const todosCompletados = VIDEOS_ORDER.every(vid => 
      user.subscription.onboarding.bitacoraBaseProgreso[vid] === true
    );

    if (todosCompletados && !user.subscription.onboarding.bitacoraBaseCompletada) {
      user.subscription.onboarding.bitacoraBaseCompletada = true;
      user.subscription.onboarding.fechaCompletacionBitacora = new Date();
      
      // Enviar email de completación de bitácora base
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
        console.error('Error enviando email de completación de bitácora base:', emailErr);
      }
    }

    await user.save();

    // Otorgar U.C. por completar el video
    let ucResult = null;
    let tracking = null;
    try {
      // Obtener o crear tracking
      tracking = await CoherenceTracking.findOne({ userId: decoded.userId });
      if (!tracking) {
        // Crear tracking si no existe
        tracking = new CoherenceTracking({
          userId: decoded.userId,
          totalUnits: 0,
          currentStreak: 0,
          longestStreak: 0,
          completedDays: [],
          completedWeeks: [],
          completedVideos: [],
          completedAudios: []
        });
        await tracking.save();
      }

      // Crear una clave única para el video de bitácora base
      const videoKey = `bitacora-base-${videoId}`;
      
      // Verificar si ya está completado este video
      if (!tracking.completedVideos.includes(videoKey)) {
        tracking.completedVideos.push(videoKey);
        
        // Otorgar 1 U.C. por cada video de bitácora base
        tracking.totalUnits = (tracking.totalUnits || 0) + 1;
        
        // Actualizar racha si es necesario
        const now = new Date();
        const lastCompleted = tracking.lastCompletedDate ? new Date(tracking.lastCompletedDate) : null;
        const daysDiff = lastCompleted ? Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24)) : null;
        
        if (!lastCompleted || daysDiff === 0) {
          // Mismo día o primera vez
          tracking.currentStreak = (tracking.currentStreak || 0) + 1;
        } else if (daysDiff === 1) {
          // Día siguiente - continuar racha
          tracking.currentStreak = (tracking.currentStreak || 0) + 1;
        } else {
          // Más de un día - resetear racha
          tracking.currentStreak = 1;
        }
        
        if (tracking.currentStreak > (tracking.longestStreak || 0)) {
          tracking.longestStreak = tracking.currentStreak;
        }
        
        tracking.lastCompletedDate = now;
        
        await tracking.save();
        
        ucResult = {
          success: true,
          ucsOtorgadas: 1,
          totalUnits: tracking.totalUnits,
          currentStreak: tracking.currentStreak,
          longestStreak: tracking.longestStreak,
          esSemanaAdicional: false,
          newAchievements: []
        };
      } else {
        // Ya estaba completado
        ucResult = {
          success: false,
          message: 'Este video ya fue completado anteriormente',
          totalUnits: tracking.totalUnits || 0,
          currentStreak: tracking.currentStreak || 0,
          longestStreak: tracking.longestStreak || 0
        };
      }
    } catch (ucError) {
      console.error('Error otorgando U.C. en bitácora base:', ucError);
      ucResult = {
        success: false,
        message: 'Error al otorgar U.C.',
        totalUnits: tracking?.totalUnits || 0,
        currentStreak: tracking?.currentStreak || 0,
        longestStreak: tracking?.longestStreak || 0
      };
    }

    return NextResponse.json({
      success: true,
      videoCompletado: videoId,
      bitacoraCompletada: todosCompletados,
      siguienteVideo: videoIndex < VIDEOS_ORDER.length - 1 
        ? VIDEOS_ORDER[videoIndex + 1] 
        : null,
      // Datos de U.C. para el modal
      ucsOtorgadas: ucResult?.ucsOtorgadas || 0,
      tracking: ucResult ? {
        totalUnits: ucResult.totalUnits,
        currentStreak: ucResult.currentStreak,
        longestStreak: ucResult.longestStreak
      } : null,
      esSemanaAdicional: ucResult?.esSemanaAdicional || false,
      newAchievements: ucResult?.newAchievements || []
    }, { status: 200 });

  } catch (error) {
    console.error('Error completando video:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

