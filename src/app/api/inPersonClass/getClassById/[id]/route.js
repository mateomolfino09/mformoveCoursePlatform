import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import InPersonClass from '../../../../../models/inPersonClassModel';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const clase = await InPersonClass.findOne({ id: parseInt(id) });

    if (!clase) {
      return NextResponse.json(
        { message: 'Clase no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(clase, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching in-person class:', error);
    return NextResponse.json(
      { message: 'Error fetching in-person class', error: error.message },
      { status: 500 }
    );
  }
}


