import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

                    const programs = await Product.find({
                  tipo: 'programa_transformacional',
                  activo: true
                }).select('nombre programaTransformacional createdAt');

    return NextResponse.json({
      success: true,
      programs: programs
    });

  } catch (error) {
    console.error('Error obteniendo programas transformacionales:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 