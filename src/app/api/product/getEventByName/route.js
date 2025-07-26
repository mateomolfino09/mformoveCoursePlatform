import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { NextResponse } from 'next/server';

connectDB();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const userEmail = searchParams.get('userEmail'); // Nuevo parámetro para verificar compra

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del evento es requerido' },
        { status: 400 }
      );
    }

    // Buscar el evento por nombre (case insensitive)
    let evento = await Product.findOne({
      nombre: { $regex: new RegExp(name, 'i') },
      tipo: 'evento'
    }).lean();

    // Si no se encuentra, intentar buscar convirtiendo guiones a espacios
    if (!evento) {
      const nameWithSpaces = name.replace(/-/g, ' ');
      evento = await Product.findOne({
        nombre: { $regex: new RegExp(nameWithSpaces, 'i') },
        tipo: 'evento'
      }).lean();
    }

    // Si aún no se encuentra, buscar por patrón más flexible
    if (!evento) {
      const searchPattern = name.replace(/-/g, '.*');
      evento = await Product.findOne({
        nombre: { $regex: new RegExp(searchPattern, 'i') },
        tipo: 'evento'
      }).lean();
    }

    if (!evento) {
      // Listar todos los eventos disponibles para debug
      const allEvents = await Product.find({ tipo: 'evento' }).select('nombre').lean();
      
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario ha comprado el ticket (solo si se proporciona userEmail)
    let hasPurchased = false;
    if (userEmail) {
      // Aquí deberías verificar en tu base de datos de pagos/transacciones
      // Por ahora, esto es un placeholder - necesitarás implementar la lógica real
      try {
        // Importar el modelo de transacciones/pagos
        // const Transaction = require('../../../../models/transactionModel');
        // hasPurchased = await Transaction.findOne({
        //   userEmail: userEmail,
        //   productId: evento._id,
        //   status: 'completed'
        // }).lean();
        
        // Por ahora, retornamos false para ser conservadores
        hasPurchased = false;
      } catch (error) {
        // Si hay error en la verificación, no mostrar el link por seguridad
        hasPurchased = false;
      }
    }

    // Serializar el evento para evitar problemas de ObjectId
    const eventoSerializado = JSON.parse(JSON.stringify(evento));

    // Remover linkEvento SIEMPRE para no exponerlo nunca por la API pública
    delete eventoSerializado.linkEvento;

    return NextResponse.json(
      { 
        evento: eventoSerializado,
        hasPurchased: false // ya no se usa, pero lo dejamos por compatibilidad
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener evento por nombre:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 