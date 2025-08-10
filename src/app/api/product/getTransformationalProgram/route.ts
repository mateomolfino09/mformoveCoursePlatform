import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del programa es requerido' },
        { status: 400 }
      );
    }

    const program = await Product.findById(id);

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Programa no encontrado' },
        { status: 404 }
      );
    }

                    if (program.tipo !== 'programa_transformacional') {
                  return NextResponse.json(
                    { success: false, error: 'El producto no es un programa transformacional' },
                    { status: 400 }
                  );
                }

    return NextResponse.json({
      success: true,
      program: program
    });

  } catch (error) {
    console.error('Error obteniendo programa transformacional:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 