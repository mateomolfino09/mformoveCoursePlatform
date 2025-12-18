import connectDB from '../../../../../../config/connectDB';
import User from '../../../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

connectDB();

export async function PUT(req, { params }) {
  try {
    if (req.method === 'PUT') {
      const { token } = params;
      const { password, conPassword } = await req.json();

      if (password !== conPassword) {
        return NextResponse.json(
          { error: 'Las contraseñas no coinciden' },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener almenos 6 caracteres' },
          { status: 400 }
        );
      }

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
      }

      const user = await User.findById(req.user._id);

      if (user) {
        user.password = await bcrypt.hash(password, 12);

        // Si el usuario no había verificado su email, marcarlo como verificado al usar el enlace
        if (user.validEmail !== 'yes') {
          user.validEmail = 'yes';
          user.emailToken = undefined;
          user.notifications.push({
            title: 'Cuenta verificada',
            message: 'Tu cuenta fue verificada al confirmar tu nueva contraseña.',
            status: 'green'
          });
        }

        user.resetToken = undefined;
        user.notifications.push({
          title: 'Password reseteada',
          message: `Has cambiado tu contraseña con éxito.`,
          status: 'green'
        });
        await user.save();

        const hasActiveSub = user?.subscription?.active;
        const redirectUrl = hasActiveSub ? '/home' : '/move-crew';

        return NextResponse.json(
          {
            message: 'Se ha actualizado tu contraseña con éxito! Tu cuenta quedó verificada.',
            user: user,
            redirect: redirectUrl
          },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { message: `Error al cambiar la password. Porfavor vuelva a intentarlo` },
      { status: 500 }
    );
  }
}
