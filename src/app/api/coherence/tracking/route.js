import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import CoherenceTracking, { getGorillaIcon, getEvolutionName, getProgressToNextLevel } from '../../../../models/coherenceTrackingModel';
import Users from '../../../../models/userModel';

export async function GET(req) {
  try {
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

    // Normalizar userId desde el token
    const userId = decoded?.userId 
      || decoded?._id 
      || decoded?.id 
      || decoded?.user?._id 
      || decoded?.user?.id 
      || null;

    if (!userId) {
      console.warn('[API /coherence/tracking] Token sin userId', {
        decodedKeys: Object.keys(decoded || {})
      });
      return NextResponse.json(
        { error: 'No autorizado: userId no encontrado en el token' },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Obtener o crear el tracking de coherencia (si el usuario entra a camino sin tenerlo)
    const tracking = await (CoherenceTracking.getOrCreate 
      ? CoherenceTracking.getOrCreate(user._id) 
      : (CoherenceTracking.schema?.statics?.getOrCreate 
          ? CoherenceTracking.schema.statics.getOrCreate.call(CoherenceTracking, user._id)
          : CoherenceTracking.findOne({ userId: user._id })));
    
    if (!tracking) {
      throw new Error('No se pudo inicializar el tracking de coherencia');
    }
    
    // Calcular información de nivel y evolución
    const level = tracking.level || 1;
    const levelProgress = tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0;
    const monthsCompleted = tracking.monthsCompleted || 0;
    const characterEvolution = tracking.characterEvolution || 0;
    const gorillaIcon = getGorillaIcon(level);
    const evolutionName = getEvolutionName(level);
    const progressToNextLevel = getProgressToNextLevel(levelProgress);
    
    const responseData = {
      success: true,
      tracking: {
        totalUnits: tracking.totalUnits,
        currentStreak: tracking.currentStreak,
        longestStreak: tracking.longestStreak,
        lastCompletedDate: tracking.lastCompletedDate,
        achievements: tracking.achievements,
        level: level,
        levelProgress: levelProgress,
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
    
    return NextResponse.json(responseData, { status: 200 });
    
  } catch (error) {
    console.error('Error obteniendo tracking:', error);
    return NextResponse.json(
      { error: 'Error al obtener el tracking de coherencia' },
      { status: 500 }
    );
  }
}
