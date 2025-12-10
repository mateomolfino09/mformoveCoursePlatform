import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import CoherenceTracking, { getGorillaIcon, getEvolutionName, getProgressToNextLevel } from '../../../../models/coherenceTrackingModel';
import Users from '../../../../models/userModel';

connectDB();

export async function GET(req) {
  try {
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
    
    // Buscar usuario
    const user = await Users.findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Obtener o crear el tracking de coherencia
    const tracking = await CoherenceTracking.getOrCreate(user._id);
    
    console.log('[API /coherence/tracking] Tracking obtenido desde BD', {
      userId: user._id,
      totalUnits: tracking.totalUnits,
      currentStreak: tracking.currentStreak,
      longestStreak: tracking.longestStreak,
      hasCompletedDays: !!tracking.completedDays,
      hasCompletedWeeks: !!tracking.completedWeeks,
      hasCompletedVideos: !!tracking.completedVideos,
      hasCompletedAudios: !!tracking.completedAudios,
      completedDays: tracking.completedDays,
      completedWeeks: tracking.completedWeeks,
      completedVideos: tracking.completedVideos,
      completedAudios: tracking.completedAudios,
      completedDaysType: typeof tracking.completedDays,
      completedWeeksType: typeof tracking.completedWeeks,
      completedVideosType: typeof tracking.completedVideos,
      completedAudiosType: typeof tracking.completedAudios
    });
    
    // Calcular información de nivel y evolución
    const level = tracking.level || 1;
    const monthsCompleted = tracking.monthsCompleted || 0;
    const characterEvolution = tracking.characterEvolution || 0;
    const gorillaIcon = getGorillaIcon(level);
    const evolutionName = getEvolutionName(level);
    const progressToNextLevel = getProgressToNextLevel(level);
    
    const responseData = {
      success: true,
      tracking: {
        totalUnits: tracking.totalUnits,
        currentStreak: tracking.currentStreak,
        longestStreak: tracking.longestStreak,
        lastCompletedDate: tracking.lastCompletedDate,
        achievements: tracking.achievements,
        level: level,
        monthsCompleted: monthsCompleted,
        characterEvolution: characterEvolution,
        gorillaIcon: gorillaIcon,
        evolutionName: evolutionName,
        progressToNextLevel: progressToNextLevel
      },
      completedDays: tracking.completedDays || [],
      completedWeeks: tracking.completedWeeks || [],
      completedVideos: tracking.completedVideos || [],
      completedAudios: tracking.completedAudios || []
    };
    
    console.log('[API /coherence/tracking] Datos enviados al cliente', {
      totalUnits: responseData.tracking.totalUnits,
      completedDaysCount: responseData.completedDays.length,
      completedWeeksCount: responseData.completedWeeks.length,
      completedVideosCount: responseData.completedVideos.length,
      completedAudiosCount: responseData.completedAudios.length
    });
    
    return NextResponse.json(responseData, { status: 200 });
    
  } catch (error) {
    console.error('Error obteniendo tracking:', error);
    return NextResponse.json(
      { error: 'Error al obtener el tracking de coherencia' },
      { status: 500 }
    );
  }
}
