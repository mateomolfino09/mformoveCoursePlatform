import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import Product from '../../../../../models/productModel';
import { resolveCursoBienvenidaFromPopulated, CURSO_BIENVENIDA_PENDIENTE_COOKIE } from '../../../../../lib/cursoBienvenidaPendiente';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();

    const userToken = cookies().get('userToken')?.value;
    if (!userToken) {
      return NextResponse.json({ pendiente: false }, { status: 200 });
    }

    const data = verify(userToken, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };

    const user = await User.findById(data.userId || data._id)
      .select('cursosAdquiridos')
      .populate({
        path: 'cursosAdquiridos.productoId',
        model: Product,
        select: 'nombre name',
      })
      .lean();

    if (!user) {
      return NextResponse.json({ pendiente: false }, { status: 200 });
    }

    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const info = resolveCursoBienvenidaFromPopulated(user.cursosAdquiridos || [], origin);

    if (!info) {
      const response = NextResponse.json({ pendiente: false }, { status: 200 });
      response.cookies.set(CURSO_BIENVENIDA_PENDIENTE_COOKIE, '', {
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    const response = NextResponse.json(
      {
        pendiente: true,
        productId: info.productId,
        nombre: info.nombre,
        successPath: info.successPath,
      },
      { status: 200 }
    );
    response.cookies.set(CURSO_BIENVENIDA_PENDIENTE_COOKIE, info.productId, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch {
    return NextResponse.json({ pendiente: false }, { status: 200 });
  }
}
