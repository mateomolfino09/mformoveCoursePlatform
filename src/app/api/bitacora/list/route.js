import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import User from '../../../../models/userModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req) {
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
      // Usar NEXTAUTH_SECRET como en otros endpoints de camino
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener el userId del token
    const userId = decoded.userId || decoded._id || decoded.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido: no se pudo obtener el ID de usuario' },
        { status: 401 }
      );
    }

    // Obtener el usuario de la base de datos para verificar su rol
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Verificar que sea Admin
    if (user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden acceder.' },
        { status: 403 }
      );
    }

    // Obtener todas las caminos ordenadas por año y mes (más recientes primero)
    const logbooks = await WeeklyLogbook.find({})
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      { 
        success: true,
        logbooks: logbooks || []
      },
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
    console.error('Error obteniendo lista de caminos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al obtener la lista de caminos' 
      },
      { status: 500 }
    );
  }
}

