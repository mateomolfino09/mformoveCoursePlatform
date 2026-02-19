import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../../config/connectDB';
import ClassModule from '../../../../../models/classModuleModel';
import ModuleClass from '../../../../../models/moduleClassModel';
import Users from '../../../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** DELETE: eliminar un submódulo (admin). Quita el submódulo del módulo y borra todas sus clases de módulo. */
export async function DELETE(req, { params }) {
  try {
    const { id, slug } = params;
    const submoduleSlug = decodeURIComponent(slug || '').toLowerCase().trim();
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'id de módulo inválido' }, { status: 400 });
    }
    if (!submoduleSlug) {
      return NextResponse.json({ error: 'slug de submódulo requerido' }, { status: 400 });
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
      return NextResponse.json({ error: 'Solo administradores pueden eliminar submódulos' }, { status: 403 });
    }

    const module_ = await ClassModule.findById(id);
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    const before = (module_.submodules || []).length;
    module_.submodules = (module_.submodules || []).filter(
      (s) => (s.slug || '').toLowerCase() !== submoduleSlug && (s.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') !== submoduleSlug
    );
    if (module_.submodules.length === before) {
      return NextResponse.json({ error: 'Submódulo no encontrado en este módulo' }, { status: 404 });
    }
    await module_.save();

    await ModuleClass.deleteMany({
      moduleId: new mongoose.Types.ObjectId(id),
      submoduleSlug
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting submodule:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar el submódulo' },
      { status: 500 }
    );
  }
}
