import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '../../../../config/connectDB';
import ModuleClassCompletion from '../../../../models/moduleClassCompletionModel';

connectDB();
export const revalidate = 0;

function getAuthUser(cookieStore) {
  const token = cookieStore.get('userToken')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET);
    return decoded?.userId || decoded?._id || decoded?.id;
  } catch {
    return null;
  }
}

/** GET: listar classIds completados por el usuario. Query: classIds=id1,id2,id3 */
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const userId = getAuthUser(cookieStore);
    if (!userId) {
      return NextResponse.json({ completedIds: [] }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const classIdsParam = searchParams.get('classIds');
    if (!classIdsParam) {
      return NextResponse.json({ completedIds: [] }, { status: 200 });
    }

    const classIds = classIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
    if (classIds.length === 0) {
      return NextResponse.json({ completedIds: [] }, { status: 200 });
    }

    const validIds = classIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json({ completedIds: [] }, { status: 200 });
    }

    const docs = await ModuleClassCompletion.find({
      userId: new mongoose.Types.ObjectId(userId),
      classId: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .select('classId')
      .lean();

    const completedIds = docs.map((d) => String(d.classId));
    return NextResponse.json({ completedIds }, { status: 200 });
  } catch (error) {
    console.error('Error fetching module class completions:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener clases completadas' },
      { status: 500 }
    );
  }
}

/** POST: marcar clase de módulo como completada para el usuario actual */
export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const userId = getAuthUser(cookieStore);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.clone().json();
    const { classId } = body;
    if (!classId) {
      return NextResponse.json({ error: 'classId es requerido' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'classId inválido' }, { status: 400 });
    }

    const doc = await ModuleClassCompletion.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), classId: new mongoose.Types.ObjectId(classId) },
      { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), classId: new mongoose.Types.ObjectId(classId), completedAt: new Date() } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true, completedAt: doc.completedAt }, { status: 200 });
  } catch (error) {
    console.error('Error marking module class complete:', error);
    return NextResponse.json(
      { error: error.message || 'Error al marcar clase completada' },
      { status: 500 }
    );
  }
}
