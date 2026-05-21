import { NextRequest, NextResponse } from 'next/server';
import { getCursoCommunitySnippet } from '../../../../lib/cursoCommunitySnippet';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    const snippet = await getCursoCommunitySnippet(slug);
    if (!snippet) {
      return NextResponse.json({ snippet: null }, { status: 200 });
    }
    return NextResponse.json({ snippet }, { status: 200 });
  } catch (e) {
    console.error('[curso-community]', e);
    return NextResponse.json({ snippet: null }, { status: 200 });
  }
}
