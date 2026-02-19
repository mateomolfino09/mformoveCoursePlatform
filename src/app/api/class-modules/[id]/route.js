import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import ClassModule from '../../../../models/classModuleModel';
import ModuleClass from '../../../../models/moduleClassModel';
import Users from '../../../../models/userModel';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: obtener un módulo por id */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }

    const module_ = await ClassModule.findById(id).lean();
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(module_, { status: 200 });
  } catch (error) {
    console.error('Error fetching class module:', error);
    return NextResponse.json(
      { error: 'Error al obtener el módulo' },
      { status: 500 }
    );
  }
}

/** PUT: actualizar módulo (admin) */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
    }

    const { userEmail, ...body } = await req.json();
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail requerido' }, { status: 400 });
    }

    const user = await Users.findOne({ email: userEmail });
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const module_ = await ClassModule.findById(id);
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    if (body.name != null) module_.name = body.name;
    if (body.slug != null) module_.slug = body.slug;
    if (body.description != null) module_.description = body.description;
    if (body.shortDescription != null) module_.shortDescription = body.shortDescription;
    if (body.aboutDescription != null) module_.aboutDescription = body.aboutDescription;
    if (Array.isArray(body.howToUse)) module_.howToUse = body.howToUse;
    if (Array.isArray(body.imageGallery)) module_.imageGallery = body.imageGallery;
    if (Array.isArray(body.submodules)) module_.submodules = body.submodules;
    if (body.videoUrl != null) module_.videoUrl = body.videoUrl;
    if (body.videoId != null) module_.videoId = body.videoId;
    if (body.videoThumbnail != null) module_.videoThumbnail = body.videoThumbnail;
    if (body.icon != null) module_.icon = body.icon;
    if (body.color != null) module_.color = body.color;
    if (typeof body.isActive === 'boolean') module_.isActive = body.isActive;

    await module_.save();

    return NextResponse.json(module_.toObject ? module_.toObject() : module_, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Ya existe un módulo con ese slug' }, { status: 409 });
    }
    console.error('Error updating class module:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el módulo' },
      { status: 500 }
    );
  }
}

/** DELETE: eliminar módulo (admin). Borra también todas las clases de módulo de ese módulo. */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 });
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
      return NextResponse.json({ error: 'Solo administradores pueden eliminar módulos' }, { status: 403 });
    }

    const module_ = await ClassModule.findById(id);
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    await ModuleClass.deleteMany({ moduleId: new mongoose.Types.ObjectId(id) });
    await ClassModule.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting class module:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el módulo' },
      { status: 500 }
    );
  }
}
