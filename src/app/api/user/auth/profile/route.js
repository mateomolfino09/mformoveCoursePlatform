import { cookies } from 'next/headers';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import Product from '../../../../../models/productModel';
import { verify } from 'jsonwebtoken'
import { NextResponse } from 'next/server';

connectDB();

const getUserToken = (req) => {
  const cookieToken = cookies().get('userToken')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  return authHeader.slice('Bearer '.length).trim();
};

export async function GET(req) {
  try {
    await connectDB();

    const userToken = getUserToken(req);
    if (!userToken) {
      return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    const data = verify(userToken, process.env.NEXTAUTH_SECRET);

    const user = await User.findOne({ _id: data.userId ? data.userId : data._id })
      .populate({
        path: 'cursosAdquiridos.productoId',
        model: Product,
        select: 'nombre descripcion tipo cursoConfig.slug imagenes portada',
      });

    if (user) {
      user.password = undefined;
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
  }
};

