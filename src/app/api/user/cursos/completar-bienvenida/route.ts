import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import { CURSO_BIENVENIDA_PENDIENTE_COOKIE } from '../../../../../lib/cursoBienvenidaPendiente';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userToken = cookies().get('userToken')?.value;
    if (!userToken) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const data = verify(userToken, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };

    const body = await req.json().catch(() => ({}));
    const productId = String(body?.productId || '').trim();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'productId inválido' }, { status: 400 });
    }

    const user = await User.findById(data.userId || data._id);
    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const entry = (user.cursosAdquiridos || []).find(
      (c: { productoId?: { toString(): string } }) =>
        c?.productoId?.toString() === productId
    );

    if (!entry) {
      return NextResponse.json({ message: 'Curso no encontrado' }, { status: 404 });
    }

    entry.bienvenidaPendiente = false;
    await user.save();

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(CURSO_BIENVENIDA_PENDIENTE_COOKIE, '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }
}
