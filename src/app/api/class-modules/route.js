import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '../../../config/connectDB';
import ClassModule from '../../../models/classModuleModel';
import Users from '../../../models/userModel';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** GET: listar módulos. Por defecto solo activos; si ?all=1 y usuario admin, devuelve todos. */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === '1';
    let filter = { isActive: true };
    if (all) {
      const cookieStore = await cookies();
      const token = cookieStore.get('userToken')?.value;
      if (token) {
        const jwt = await import('jsonwebtoken');
        try {
          const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
          const user = await Users.findOne({ _id: decoded._id || decoded.userId || decoded.id }).select('rol').lean();
          if (user?.rol === 'Admin') filter = {};
        } catch (_) {}
      }
    }
    const modules = await ClassModule.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(modules, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss'
      }
    });
  } catch (error) {
    console.error('Error fetching class modules:', error);
    return NextResponse.json(
      { error: 'Error al obtener los módulos de clase' },
      { status: 500 }
    );
  }
}

/** POST: crear módulo (admin) */
export async function POST(req) {
  try {
    const { userEmail, ...body } = await req.json();
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail requerido' }, { status: 400 });
    }

    const user = await Users.findOne({ email: userEmail });
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const slug = (body.slug || (body.name || '').toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')).trim() || undefined;

    if (!body.name || !slug) {
      return NextResponse.json(
        { error: 'name y slug son requeridos' },
        { status: 400 }
      );
    }

    const newModule = await ClassModule.create({
      name: body.name,
      slug,
      description: body.description,
      shortDescription: body.shortDescription,
      imageGallery: Array.isArray(body.imageGallery) ? body.imageGallery : [],
      submodules: Array.isArray(body.submodules) ? body.submodules : [],
      videoUrl: body.videoUrl,
      videoId: body.videoId,
      videoThumbnail: body.videoThumbnail,
      icon: body.icon,
      color: body.color,
      isActive: body.isActive !== false
    });

    return NextResponse.json(newModule.toObject ? newModule.toObject() : newModule, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Ya existe un módulo con ese slug' }, { status: 409 });
    }
    console.error('Error creating class module:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear el módulo' },
      { status: 500 }
    );
  }
}
