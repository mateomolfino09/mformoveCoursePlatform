import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import { revalidateTag } from 'next/cache';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const populateModule = searchParams.get('populateModule') === '1';
  const moduleId = searchParams.get('moduleId') || '';
  const submoduleSlug = searchParams.get('submoduleSlug') || '';

  try {
    await connectDB();
    let query = {};
    if (search !== '') {
      query.name = { $regex: search, $options: 'i' };
    }
    if (moduleId) {
      const mongoose = await import('mongoose');
      if (mongoose.default.Types.ObjectId.isValid(moduleId)) {
        query.moduleId = new mongoose.default.Types.ObjectId(moduleId);
      }
    }
    if (submoduleSlug) {
      query.submoduleSlug = submoduleSlug;
    }
    let classes = await IndividualClass.find(query)
      .populate(populateModule ? 'moduleId' : null)
      .lean();

    // No asignar un módulo por defecto a las clases sin moduleId: así se distinguen
    // las "clases individuales" (sin moduleId) de las que pertenecen a un módulo.

    revalidateTag('classes');
    return NextResponse.json(classes, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss', // Forzar a Vercel a evitar el caché
      },
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ message: 'Error fetching classes' }, { status: 500 });
  }
}
