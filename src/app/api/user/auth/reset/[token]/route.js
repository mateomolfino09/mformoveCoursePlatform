import { NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
import User from '../../../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

connectDB();

export async function PUT(req, { params }) {
    try {
    if (req.method === 'PUT') {
      const { token } = params;
      const { password, conPassword } = await req.json();

      console.log(password, conPassword, token)

      if (password !== conPassword) {
        return NextResponse.json({ error: 'Las contraseñas no coinciden'}, { status: 400 })
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'La contraseña debe tener almenos 6 caracteres'}, { status: 400 })

      }

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
      }

      const user = await User.findById(req.user._id);

      if (user) {
        user.password = await bcrypt.hash(password, 12);

        user.resetToken = undefined;
        user.notifications.push({
          title: 'Password reseteada',
          message: `Has cambiado tu contraseña con éxito.`,
          status: 'green'
        });
        await user.save();
        return NextResponse.json({ 
          message: 'Se ha actualizado tu contraseña con éxito!', 
          user: user 
        }, { status: 200 });
      }
    }
  } catch (error) {
    return NextResponse.json({ message: `Error al cambiar la password. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};
