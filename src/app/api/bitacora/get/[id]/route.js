import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../../config/connectDB';
import WeeklyLogbook from '../../../../../models/weeklyLogbookModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userToken = cookieStore.get('userToken')?.value;

    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      // Usar NEXTAUTH_SECRET como en otros endpoints de bitácora
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de bitácora requerido' },
        { status: 400 }
      );
    }

    // Buscar la bitácora por ID
    const logbook = await WeeklyLogbook.findById(id).lean();

    if (!logbook) {
      return NextResponse.json(
        { error: 'Bitácora no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { logbook },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error obteniendo bitácora:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener la bitácora' },
      { status: 500 }
    );
  }
}

