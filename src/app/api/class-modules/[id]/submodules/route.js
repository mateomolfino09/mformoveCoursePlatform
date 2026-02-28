import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import ClassModule from '../../../../../models/classModuleModel';
import Users from '../../../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: listar submódulos del módulo */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'id de módulo inválido' }, { status: 400 });
    }
    const module_ = await ClassModule.findById(id).select('submodules').lean();
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }
    return NextResponse.json(module_.submodules || [], { status: 200 });
  } catch (error) {
    console.error('Error listing submodules:', error);
    return NextResponse.json(
      { error: error.message || 'Error al listar submódulos' },
      { status: 500 }
    );
  }
}

/** POST: crear un submódulo en el módulo. Body: { name }. El slug se genera automáticamente. */
export async function POST(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'id de módulo inválido' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('userToken')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    let decoded;
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const user = await Users.findOne({ _id: decoded?.userId || decoded?._id || decoded?.id }).select('rol').lean();
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear submódulos' }, { status: 403 });
    }

    const body = await req.json();
    const name = (body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'name es requerido' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'submodulo';
    const module_ = await ClassModule.findById(id);
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    const submodules = module_.submodules || [];
    const exists = submodules.some((s) => (s.slug || '').toLowerCase() === slug || (s.name || '').toLowerCase() === name.toLowerCase());
    if (exists) {
      return NextResponse.json({ error: 'Ya existe un submódulo con ese nombre o slug' }, { status: 409 });
    }

    submodules.push({ name, slug });
    module_.submodules = submodules;
    await module_.save();

    const created = submodules[submodules.length - 1];
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating submodule:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear submódulo' },
      { status: 500 }
    );
  }
}
