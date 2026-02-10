import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';
import ClassModule from '../../../../../models/classModuleModel';
import { revalidateTag } from 'next/cache';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request, { params }) {
  try {
    const { classType } = params;
    const slug = (classType || '').toLowerCase();

    // Si existe un módulo con ese slug, filtrar por moduleId; si no, por type (legacy)
    const module_ = await ClassModule.findOne({ slug, isActive: true }).select('_id').lean();
    const query = module_
      ? { moduleId: module_._id }
      : { type: { $regex: classType, $options: 'i' } };

    const classes = await IndividualClass.find(query).populate('moduleId').lean();

    return NextResponse.json(classes, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching classes' }, { status: 500 });
  }
}
