import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import ClassModule from '../../../../models/classModuleModel';
import { revalidateTag } from 'next/cache';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const populateModule = searchParams.get('populateModule') === '1';

  try {
    let query = {};
    if (search !== '') {
      query.name = { $regex: search, $options: 'i' };
    }
    let classes = await IndividualClass.find(query)
      .populate(populateModule ? 'moduleId' : null)
      .lean();

    if (populateModule && classes.length > 0) {
      const firstModule = await ClassModule.findOne({ isActive: true }).sort({ createdAt: 1 }).lean();
      if (firstModule) {
        classes = classes.map((c) => {
          if (!c.moduleId) {
            return { ...c, moduleId: firstModule };
          }
          return c;
        });
      }
    }

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
