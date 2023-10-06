import { NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
import User from '../../../../../../models/userModel';
import jwt from 'jsonwebtoken';

connectDB();

export async function PUT(req, { params }) {
    try {
    if (req.method === 'PUT') {
    const { token } = params;
    const { email } = await req.json();

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
      }

      const user = await User.findById(req.user._id);

      if (user) {
        user.email = email;

        user.resetToken = undefined;
        user.notifications.push({
          title: 'Email reseteado',
          message: `Has cambiado tu email con éxito.`,
          status: 'green'
        });
        await user.save();

        return NextResponse.json({ message: 'Se ha actualizado tu email con éxito!'}, { status: 200 })
      }
    }
  } catch (error) {
    return NextResponse.json({ message: `Error al cambiar el mail. Porfavor vuelva a intentarlo`, type: 'error'}, { status: 500 })
  }
};
