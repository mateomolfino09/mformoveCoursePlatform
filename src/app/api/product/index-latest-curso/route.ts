import { NextResponse } from 'next/server';
import { getLatestPublishedCursoPayload } from '../../../../lib/latestPublishedCurso';
import type { IndexLatestCursoPayload } from '../../../../types/indexLatestCurso';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const curso = await getLatestPublishedCursoPayload();
    return NextResponse.json(
      { curso },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    console.error('[index-latest-curso]', e);
    return NextResponse.json({ curso: null as IndexLatestCursoPayload | null }, { status: 200 });
  }
}
