import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import ProgramaTransformacionalUser from '../../../../models/programaTransformacionalUserModel';

export const dynamic = 'force-dynamic';

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

    const participants = await ProgramaTransformacionalUser.find({
      programId: programId
    }).populate('userId', 'name email');

    return NextResponse.json({
      success: true,
      participants: participants
    });

  } catch (error) {
    console.error('Error obteniendo participantes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 