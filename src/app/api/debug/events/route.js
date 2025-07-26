import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { NextResponse } from 'next/server';

connectDB();

export async function GET(req) {
  try {
    // Obtener todos los eventos
    const eventos = await Product.find({ tipo: 'evento' }).select('nombre tipo online fecha').lean();
    
    // Obtener todos los productos para comparar
    const allProducts = await Product.find({}).select('nombre tipo').lean();
    
    return NextResponse.json({
      eventos: eventos,
      totalEventos: eventos.length,
      todosLosProductos: allProducts,
      totalProductos: allProducts.length
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 