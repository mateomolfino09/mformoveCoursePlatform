import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';
import Users from '../../../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: obtener una clase individual por _id (MongoDB ObjectId). Solo admin. */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('userToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const user = await Users.findById(decoded?.userId || decoded?._id || decoded?.id).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden ver esta clase' }, { status: 403 });
    }

    const clase = await IndividualClass.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean();
    if (!clase) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 });
    }

    return NextResponse.json(clase, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching individual class by ObjectId:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener la clase' }, { status: 500 });
  }
}
