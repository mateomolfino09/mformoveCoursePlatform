import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import ClassModule from '../../../../../models/classModuleModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: obtener un módulo por slug (para URLs amigables) */
export async function GET(req, { params }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
    }

    const module_ = await ClassModule.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
    if (!module_) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(module_, { status: 200 });
  } catch (error) {
    console.error('Error fetching class module by slug:', error);
    return NextResponse.json(
      { error: 'Error al obtener el módulo' },
      { status: 500 }
    );
  }
}
