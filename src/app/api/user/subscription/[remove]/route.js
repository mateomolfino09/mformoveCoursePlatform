import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import { NextResponse } from 'next/server';

connectDB();

// ✅ Usamos PATCH porque estamos actualizando datos
export async function PATCH(req) {
  try {
    const { userId } = await req.json();

    // Validamos que userId esté presente y sea válido
    if (!userId) {
      return NextResponse.json(
        { error: 'El ID del usuario es requerido' },
        { status: 400 }
      );
    }

    // Buscamos el usuario en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminamos la suscripción VIP
    user.subscription = null ;
    await user.save();

    return NextResponse.json(
      { message: `La suscripción VIP de ${user.name} fue eliminada correctamente` },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error en la eliminación de la suscripción VIP:', err);
    return NextResponse.json(
      { error: 'Hubo un problema al eliminar la suscripción VIP' },
      { status: 500 }
    );
  }
}
