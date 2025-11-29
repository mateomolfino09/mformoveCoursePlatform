import { NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
import VirtualClass from '../../../../../../models/virtualClassModel';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const virtualClass = await VirtualClass.findOne({ id: parseInt(id) });

    if (!virtualClass) {
      return NextResponse.json(
        { error: 'Grupo de clases virtuales no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(virtualClass, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching virtual class:', error);
    return NextResponse.json(
      { message: 'Error fetching virtual class', error: error.message },
      { status: 500 }
    );
  }
}


