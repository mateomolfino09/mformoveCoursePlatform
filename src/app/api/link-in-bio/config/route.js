import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Users from '../../../../models/userModel';
import LinkInBioConfig from '../../../../models/linkInBioConfigModel';
import { revalidateLinkInBio } from '../../../../lib/revalidateLinkInBio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const CONFIG_KEY = 'default';

const MENTORIA_STRING_FIELDS = [
  'imagenBio',
  'imagenBioTrimestral',
  'imagenBioAnual',
  'titulo',
  'subtitulo',
  'tituloTrimestral',
  'subtituloTrimestral',
  'tituloAnual',
  'subtituloAnual',
];

async function getOrCreateConfig() {
  await connectDB();
  let doc = await LinkInBioConfig.findOne({ key: CONFIG_KEY }).lean();
  if (!doc) {
    doc = (
      await LinkInBioConfig.create({
        key: CONFIG_KEY,
        mentoria: {
          activoEnBio: true,
          titulo: 'Mentoría 1:1',
          subtitulo: 'Acompañamiento personalizado',
        },
      })
    ).toObject();
  }
  return doc;
}

export async function GET() {
  try {
    const doc = await getOrCreateConfig();
    return NextResponse.json(
      {
        mentoria: doc.mentoria || {},
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/link-in-bio/config:', error);
    return NextResponse.json({ error: 'No se pudo cargar la configuración de bio' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { userEmail, mentoria } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    await connectDB();
    const user = await Users.findOne({ email: userEmail });
    if (!user || user.rol !== 'Admin') {
      return NextResponse.json({ error: 'Sin permisos para editar la bio' }, { status: 403 });
    }

    const update = {};
    if (mentoria && typeof mentoria === 'object') {
      update['mentoria.activoEnBio'] =
        mentoria.activoEnBio !== undefined ? Boolean(mentoria.activoEnBio) : true;

      for (const field of MENTORIA_STRING_FIELDS) {
        if (typeof mentoria[field] === 'string') {
          update[`mentoria.${field}`] = mentoria[field].trim();
        }
      }
    }

    const doc = await LinkInBioConfig.findOneAndUpdate(
      { key: CONFIG_KEY },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    revalidateLinkInBio();

    return NextResponse.json(
      {
        message: 'Configuración de bio actualizada',
        mentoria: doc?.mentoria || {},
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('PUT /api/link-in-bio/config:', error);
    return NextResponse.json({ error: 'No se pudo guardar la configuración de bio' }, { status: 500 });
  }
}
