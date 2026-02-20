import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import ClassModule from '../../../../../models/classModuleModel';
import ModuleClass from '../../../../../models/moduleClassModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: obtener un módulo por slug (para URLs amigables). Incluye practicesCount: clases en video de submódulos + video principal del módulo. */
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
    const countModuleClasses = await ModuleClass.countDocuments({ moduleId });
    const hasModuleVideo = !!(module_.videoId || (module_.videoUrl && String(module_.videoUrl).trim()));
    const practicesCount = countModuleClasses + (hasModuleVideo ? 1 : 0);

    const moduleClasses = await ModuleClass.find({ moduleId })
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
