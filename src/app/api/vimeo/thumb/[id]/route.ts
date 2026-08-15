import { NextResponse } from 'next/server';
import { fetchVimeoThumbnail } from '../../../../../lib/vimeoMeta';

/**
 * Miniatura de un video de Vimeo, servida desde nuestro propio dominio.
 *
 * Resolver en vivo (en vez de guardar el link en Mongo) hace que cambiar la
 * miniatura en Vimeo se propague solo, dentro de la ventana de cache.
 *
 * GET /api/vimeo/thumb/1212826028?w=640
 */

const ALLOWED_WIDTHS = [100, 200, 295, 640, 960, 1280, 1920];
const DEFAULT_WIDTH = 640;

const BROWSER_MAX_AGE = 3600; // 1 h
const CDN_MAX_AGE = 21600; // 6 h
const STALE_WHILE_REVALIDATE = 604800; // 7 días

/** Evita repegarle a la API de Vimeo dentro de la misma instancia de lambda. */
const linkCache = new Map<string, { link: string; expiresAt: number }>();
const LINK_CACHE_TTL_MS = CDN_MAX_AGE * 1000;

const notFound = () =>
  NextResponse.json(
    { error: 'Miniatura no disponible' },
    { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } }
  );

function pickWidth(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_WIDTH;
  return (
    ALLOWED_WIDTHS.find((w) => w >= parsed) ||
    ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1]
  );
}

async function resolveThumbnailLink(
  videoId: string,
  width: number
): Promise<string> {
  const cacheKey = `${videoId}:${width}`;
  const cached = linkCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.link;

  const link = await fetchVimeoThumbnail(videoId, width);
  if (link) {
    linkCache.set(cacheKey, { link, expiresAt: Date.now() + LINK_CACHE_TTL_MS });
  }
  return link;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const videoId = (params.id || '').trim();
  if (!/^\d+$/.test(videoId)) {
    return NextResponse.json({ error: 'Video id inválido' }, { status: 400 });
  }

  const width = pickWidth(new URL(request.url).searchParams.get('w'));

  try {
    const link = await resolveThumbnailLink(videoId, width);
    if (!link) return notFound();

    const image = await fetch(link);
    if (!image.ok || !image.body) return notFound();

    return new NextResponse(image.body, {
      status: 200,
      headers: {
        'Content-Type': image.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': `public, max-age=${BROWSER_MAX_AGE}, s-maxage=${CDN_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
      },
    });
  } catch (error) {
    console.error('[vimeo thumb] error', videoId, error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
