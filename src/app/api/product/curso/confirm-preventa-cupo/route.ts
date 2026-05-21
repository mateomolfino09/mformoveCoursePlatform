import { NextResponse } from 'next/server';
import { incrementCursoPreventaCupo } from '../../../../../lib/cursoPreventaCupos';

export const dynamic = 'force-dynamic';

type Body = {
  productId?: string;
  preventaTier?: number;
  sessionId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const productId = body.productId?.trim();
    if (!productId) {
      return NextResponse.json({ error: 'productId requerido' }, { status: 400 });
    }

    const preventaTier =
      body.preventaTier != null && !Number.isNaN(Number(body.preventaTier))
        ? Number(body.preventaTier)
        : undefined;

    const sessionId = body.sessionId?.trim() || undefined;

    const result = await incrementCursoPreventaCupo(productId, preventaTier, sessionId);

    if (!result.ok && result.reason === 'sold_out') {
      return NextResponse.json(
        { error: 'Este tier de preventa ya no tiene cupos disponibles', ...result },
        { status: 409 }
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        { error: 'No se pudo registrar el cupo de preventa', ...result },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[confirm-preventa-cupo]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
