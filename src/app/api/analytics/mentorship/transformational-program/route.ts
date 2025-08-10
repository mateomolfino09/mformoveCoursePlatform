import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Product from '../../../../../models/productModel';
import ProgramaTransformacionalUser from '../../../../../models/programaTransformacionalUserModel';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      return NextResponse.json(
        { success: false, error: 'ID del programa es requerido' },
        { status: 400 }
      );
    }

    // Obtener el programa
    const programa = await Product.findById(programId);
    if (!programa) {
      return NextResponse.json(
        { success: false, error: 'Programa no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los participantes
    const participantes = await ProgramaTransformacionalUser.find({
      programId: programId
    });

    // Calcular estadísticas
    const totalParticipantes = participantes.length;
    const completados = participantes.filter(p => p.estado === 'completado').length;
    const enCurso = participantes.filter(p => p.estado === 'en_curso').length;
    const inscritos = participantes.filter(p => p.estado === 'inscrito').length;

    const tasaCompletacion = totalParticipantes > 0 ? Math.round((completados / totalParticipantes) * 100) : 0;
    const promedioProgreso = totalParticipantes > 0 ? 
      Math.round(participantes.reduce((sum, p) => sum + (p.progreso || 0), 0) / totalParticipantes) : 0;

    // Calcular progreso por semana
    const progresoSemanas: any = {};
    for (let i = 1; i <= 8; i++) {
      const semanaCompletada = participantes.filter(p => (p.semanasCompletadas || 0) >= i).length;
      progresoSemanas[i] = totalParticipantes > 0 ? Math.round((semanaCompletada / totalParticipantes) * 100) : 0;
    }

    // Contar semanas activas (con contenido desbloqueado)
    const semanasActivas = programa.programaTransformacional?.semanas?.filter((s: any) => s.desbloqueado).length || 0;

    // Estados de participantes
    const estados = {
      inscrito: inscritos,
      en_curso: enCurso,
      completado: completados,
      abandonado: participantes.filter(p => p.estado === 'abandonado').length
    };

    // Actividad reciente (últimas 5 actividades)
    const actividadReciente = participantes
      .filter(p => p.ultimaActividad)
      .sort((a, b) => new Date(b.ultimaActividad).getTime() - new Date(a.ultimaActividad).getTime())
      .slice(0, 5)
      .map(p => ({
        descripcion: `${p.userId?.name || 'Usuario'} completó actividad`,
        fecha: new Date(p.ultimaActividad).toLocaleDateString()
      }));

    const analytics = {
      totalParticipantes,
      tasaCompletacion,
      promedioProgreso,
      semanasActivas,
      progresoSemanas,
      estados,
      actividadReciente
    };

    return NextResponse.json({
      success: true,
      analytics: analytics
    });

  } catch (error) {
    console.error('Error obteniendo analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 