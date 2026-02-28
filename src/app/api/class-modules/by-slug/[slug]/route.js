import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import ClassModule from '../../../../../models/classModuleModel';
import ModuleClass from '../../../../../models/moduleClassModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: obtener un módulo por slug (para URLs amigables). practicesCount = solo clases de submódulos publicadas en biblioteca (visibleInLibrary !== false). */
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

    const moduleId = module_._id;
    // Solo clases publicadas en biblioteca (visibleInLibrary !== false); las creadas desde weekly path quedan ocultas hasta publicar última semana
    const visibleQuery = { moduleId, visibleInLibrary: { $ne: false } };
    const countModuleClasses = await ModuleClass.countDocuments(visibleQuery);
    const practicesCount = countModuleClasses;

    const moduleClasses = await ModuleClass.find(visibleQuery)
      .sort({ submoduleSlug: 1, order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json(
      { ...module_, practicesCountFromSubmodules: countModuleClasses, practicesCount, moduleClasses },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching class module by slug:', error);
    return NextResponse.json(
      { error: 'Error al obtener el módulo' },
      { status: 500 }
    );
  }
}
