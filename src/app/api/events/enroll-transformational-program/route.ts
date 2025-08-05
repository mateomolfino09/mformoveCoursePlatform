import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import ProgramaTransformacionalUser from '../../../../models/programaTransformacionalUserModel';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { programId } = await req.json();
    
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para inscribirte' },
        { status: 401 }
      );
    }

    // Verificar que el programa existe y es transformacional
    const programa = await Product.findOne({
      _id: programId,
      esProgramaTransformacional: true,
      activo: true
    });

    if (!programa) {
      return NextResponse.json(
        { error: 'Programa no encontrado o no disponible' },
        { status: 404 }
      );
    }

    // Verificar cupo disponible
    if (programa.programaTransformacional?.cupoDisponible !== undefined && 
        programa.programaTransformacional.cupoDisponible <= 0) {
      return NextResponse.json(
        { error: 'No hay cupos disponibles para este programa' },
        { status: 400 }
      );
    }

    // Verificar que el usuario no esté ya inscrito
    const existingEnrollment = await ProgramaTransformacionalUser.findOne({
      userId: session.user.email,
      programId: programId
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este programa' },
        { status: 400 }
      );
    }

    // Crear la inscripción
    const enrollment = new ProgramaTransformacionalUser({
      userId: session.user.email,
      programId: programId,
      estado: 'inscrito',
      fechaInscripcion: new Date(),
      fechaInicio: programa.fecha,
      progresoSemanas: programa.programaTransformacional?.semanas?.map((semana: any) => ({
        numeroSemana: semana.numero,
        completada: false
      })) || [],
      sesionesEnVivo: programa.programaTransformacional?.sesionesEnVivo?.map((sesion: any) => ({
        fecha: sesion.fecha,
        asistio: false
      })) || []
    });

    await enrollment.save();

    // Actualizar cupo disponible
    if (programa.programaTransformacional?.cupoDisponible !== undefined) {
      await Product.findByIdAndUpdate(programId, {
        $inc: { 'programaTransformacional.cupoDisponible': -1 }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Inscripción exitosa',
      enrollment: {
        id: enrollment._id,
        estado: enrollment.estado,
        fechaInscripcion: enrollment.fechaInscripcion
      }
    });

  } catch (error) {
    console.error('Error al inscribir en programa transformacional:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');
    
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Debes estar autenticado' },
        { status: 401 }
      );
    }

    if (!programId) {
      return NextResponse.json(
        { error: 'ID del programa requerido' },
        { status: 400 }
      );
    }

    // Buscar la inscripción del usuario
    const enrollment = await ProgramaTransformacionalUser.findOne({
      userId: session.user.email,
      programId: programId
    }).populate('programId');

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No estás inscrito en este programa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Error al obtener inscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 