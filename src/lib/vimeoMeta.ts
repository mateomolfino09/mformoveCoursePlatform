import { extractVimeoId } from './resolveMediaImageUrl';

/**
 * Metadata de Vimeo resuelta con la API oficial (requiere VIMEO_ACCESS_TOKEN).
 *
 * El oEmbed público responde 404 para los videos con privacidad `unlisted`, que
 * son la mayoría del catálogo. Peor todavía: vumbnail.com, que se apoya en ese
 * mismo oEmbed, responde 200 con una imagen genérica de relleno en vez de
 * fallar, así que el thumbnail equivocado se guardaba sin dar ningún error.
 *
 * Solo para server-side: nunca importar desde un componente cliente, el token
 * no debe llegar al browser.
 */

const ANY_WIDTH = 0;

type VimeoSize = { width?: number; link?: string };

export type VimeoMeta = {
  thumbnail: string;
  duration: number | undefined;
};

const EMPTY_META: VimeoMeta = { thumbnail: '', duration: undefined };

function pickSizeLink(sizes: VimeoSize[], width: number): string {
  if (sizes.length === 0) return '';
  if (width === ANY_WIDTH) return sizes[sizes.length - 1]?.link || '';
  const match =
    sizes.find((s) => s.width === width) ||
    sizes.find((s) => (s.width || 0) >= width) ||
    sizes[sizes.length - 1];
  return match?.link || '';
}

/** oEmbed público: solo sirve para videos con privacidad `anybody`. */
async function fetchViaOembed(videoId: string): Promise<VimeoMeta> {
  const res = await fetch(
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${videoId}`)}`
  );
  if (!res.ok) return EMPTY_META;
  const data = await res.json();
  return {
    thumbnail: data?.thumbnail_url || '',
    duration: data?.duration != null ? Number(data.duration) : undefined,
  };
}

/**
 * Thumbnail y duración de un video. Acepta URL completa o id numérico.
 * Devuelve un link absoluto de i.vimeocdn, usable también en emails.
 */
export async function fetchVimeoMeta(
  videoUrlOrId: string | null | undefined,
  width: number = ANY_WIDTH
): Promise<VimeoMeta> {
  const videoId = extractVimeoId(videoUrlOrId);
  if (!videoId) return EMPTY_META;

  const token = process.env.VIMEO_ACCESS_TOKEN;

  try {
    if (!token) {
      console.warn('[vimeoMeta] falta VIMEO_ACCESS_TOKEN, cayendo a oEmbed público');
      return await fetchViaOembed(videoId);
    }

    const res = await fetch(
      `https://api.vimeo.com/videos/${videoId}?fields=duration,pictures.sizes`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) {
      console.warn('[vimeoMeta] API de Vimeo respondió', res.status, 'para', videoId);
      return await fetchViaOembed(videoId);
    }

    const data = await res.json();
    const sizes: VimeoSize[] = Array.isArray(data?.pictures?.sizes)
      ? data.pictures.sizes
      : [];

    return {
      thumbnail: pickSizeLink(sizes, width),
      duration: data?.duration != null ? Number(data.duration) : undefined,
    };
  } catch (error) {
    console.error('[vimeoMeta] error resolviendo', videoId, error);
    return EMPTY_META;
  }
}

/** Solo el link de la miniatura, o string vacío si no se pudo resolver. */
export async function fetchVimeoThumbnail(
  videoUrlOrId: string | null | undefined,
  width: number = ANY_WIDTH
): Promise<string> {
  const meta = await fetchVimeoMeta(videoUrlOrId, width);
  return meta.thumbnail;
}
