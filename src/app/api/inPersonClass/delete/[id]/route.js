import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import InPersonClass from '../../../../../models/inPersonClassModel';
import Users from '../../../../../models/userModel';

connectDB();

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { userEmail } = body;

    // Verificar que el usuario existe y es admin
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email de usuario requerido' },
        { status: 400 }
      );
    }

    const user = await Users.findOne({ email: userEmail });

    if (!user || user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'Este usuario no tiene permisos para eliminar clases presenciales' },
        { status: 422 }
      );
    }

    // Buscar y eliminar la clase
    const deletedClass = await InPersonClass.findOneAndDelete({ id: parseInt(id) });

    if (!deletedClass) {
      return NextResponse.json(
        { error: 'Clase presencial no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Clase presencial eliminada con éxito' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting in-person class:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar la clase presencial' },
      { status: 500 }
    );
  }
}

