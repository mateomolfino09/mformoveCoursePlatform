import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Promocion from '../../../../../models/promocionModel';

export const fetchCache = 'force-no-store';

export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get('all') === 'true'; // Para admin: obtener todas las promociones
    
    let promociones;
    
    if (getAll) {
      // Para admin: obtener todas las promociones
      promociones = await Promocion.find({}).sort({ createdAt: -1 });
    } else {
      // Para usuarios: obtener solo promociones activas que no hayan expirado
      const now = new Date();
      promociones = await Promocion.find({
        activa: true,
        fechaFin: { $gte: now },
        fechaInicio: { $lte: now }
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json(
      { success: true, promociones },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error al obtener promociones activas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las promociones', details: error.message },
      { status: 500 }
    );
  }
}

