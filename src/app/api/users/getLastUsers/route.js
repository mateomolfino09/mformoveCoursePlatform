import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../../models/userModel';

/**
 * Endpoint para obtener los emails de los últimos 10 usuarios creados
 * GET /api/users/getLastUsers
 * Query params: ?isProd=true (opcional, para usar base de producción)
 */
export async function GET(req) {
  try {
    // Obtener parámetro isProd de la query string
    const { searchParams } = new URL(req.url);
    const isProd = searchParams.get('isProd') === 'true';

    // Determinar qué conexión usar según isProd
    let mongoUri;
    if (isProd === true) {
      // Usar conexión de producción específica
      mongoUri = 'mongodb://admin:abcd*1234@3.224.88.8:27017/MForMoveProduccion';
      console.log('🔗 Usando conexión de producción específica');
    } else {
      // Usar MONGODB_URI del .env
      if (!process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: 'MONGODB_URI no está configurada en las variables de entorno' },
          { status: 500 }
        );
      }
      mongoUri = process.env.MONGODB_URI;
      console.log('🔗 Usando conexión del .env');
    }

    // Conectar a la base de datos
    if (mongoose.connections[0].readyState !== 1) {
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoUri);
      console.log('✅ Conectado a la base de datos');
    }

    // Obtener los últimos 10 usuarios ordenados por fecha de creación (más recientes primero)
    const lastUsers = await User.find({})
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
      .limit(10) // Limitar a 10 usuarios
      .select('email name createdAt') // Solo seleccionar email, name y createdAt
      .lean(); // Usar lean() para obtener objetos planos más rápidos

    // Extraer solo los emails
    const emails = lastUsers.map(user => ({
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }));

    return NextResponse.json(
      {
        success: true,
        count: emails.length,
        users: emails,
        isProd: isProd
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener últimos usuarios:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener últimos usuarios',
        message: error.message
      },
      { status: 500 }
    );
  }
}


