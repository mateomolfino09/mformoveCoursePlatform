import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import VirtualClass from '../../../../../models/virtualClassModel';
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
        { error: 'Este usuario no tiene permisos para eliminar grupos de clases virtuales' },
        { status: 422 }
      );
    }

    // Buscar y eliminar la clase
    const deletedClass = await VirtualClass.findOneAndDelete({ id: parseInt(id) });

    if (!deletedClass) {
      return NextResponse.json(
        { error: 'Grupo de clases virtuales no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Grupo de clases virtuales eliminado con éxito' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting virtual class:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el grupo de clases virtuales' },
      { status: 500 }
    );
  }
}


