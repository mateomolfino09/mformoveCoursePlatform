import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import CoherenceTracking, { getGorillaIcon, getEvolutionName, getProgressToNextLevel } from '../../../../models/coherenceTrackingModel';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';

export async function POST(req) {
  try {
    await connectDB();
    
    const cookieStore = cookies();
    const userToken = cookieStore.get('userToken')?.value;
    
    if (!userToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await req.json();
    const { logbookId, month, year } = body;

    if (!logbookId || month === undefined || year === undefined) {
      return NextResponse.json(
        { error: 'logbookId, month y year son requeridos' },
        { status: 400 }
      );
    }

    console.log('[bitacora/complete-month] Completando mes', { userId, logbookId, month, year });

    // Obtener tracking existente (se crea al suscribirse)
    const tracking = await CoherenceTracking.findOne({ userId });
    if (!tracking) {
      return NextResponse.json(
        { error: 'Tracking no inicializado para este usuario' },
        { status: 404 }
      );
    }
    
    // Completar el mes (esto subirá de nivel si corresponde)
    const result = tracking.completeMonth(month, year, logbookId);
    
    // Verificar y desbloquear logros relacionados con niveles
    const newAchievements = tracking.checkAndUnlockAchievements();
    
    // Guardar el tracking actualizado
    await tracking.save();
    
    console.log('[bitacora/complete-month] Resultado', {
      levelUp: result.levelUp,
      evolution: result.evolution,
      newLevel: result.newLevel,
      newEvolution: result.newEvolution,
      gorillaIcon: result.gorillaIcon,
      newAchievements: newAchievements.length
    });

    return NextResponse.json({
      success: true,
      levelUp: result.levelUp,
      evolution: result.evolution,
      newLevel: result.newLevel,
      newEvolution: result.newEvolution,
      gorillaIcon: result.gorillaIcon,
      monthsCompleted: tracking.monthsCompleted,
      newAchievements: newAchievements.map(ach => ({
        name: ach.name,
        description: ach.description,
        icon: ach.icon
      })),
      tracking: {
        totalUnits: tracking.totalUnits,
        currentStreak: tracking.currentStreak,
        longestStreak: tracking.longestStreak,
        level: tracking.level,
        levelProgress: tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0,
        monthsCompleted: tracking.monthsCompleted,
        characterEvolution: tracking.characterEvolution,
        gorillaIcon: getGorillaIcon(tracking.level),
        evolutionName: getEvolutionName(tracking.level),
        progressToNextLevel: getProgressToNextLevel(tracking.levelProgress !== undefined && tracking.levelProgress !== null ? tracking.levelProgress : 0)
      }
    });
  } catch (error) {
    console.error('[bitacora/complete-month] Error', error.message);
    return NextResponse.json(
      { error: 'Error al completar el mes', message: error.message },
      { status: 500 }
    );
  }
}



