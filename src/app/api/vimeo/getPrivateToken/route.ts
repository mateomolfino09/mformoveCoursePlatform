import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';

/**
 * Endpoint para obtener el token privado de un video de Vimeo
 * Necesario para reproducir videos UNLISTED o PRIVATE
 */

/**
 * El token/thumbnail de un video de Vimeo no cambia salvo que se reemplace el video en sí,
 * así que cachear por 1h evita golpear la API de Vimeo en cada carga de la landing (mismo
 * videoId se pide en cada visita del hero del curso).
 */
const getCachedVimeoVideoInfo = (videoId: string) =>
  unstable_cache(
    async () => {
      const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
      if (!VIMEO_ACCESS_TOKEN) {
        throw new Error('No se encontró el token de Vimeo en las variables de entorno.');
      }

      const vimeoRes = await fetch(`https://api.vimeo.com/videos/${videoId}?fields=embed.html,link,privacy.view,privacy.embed,pictures.sizes`, {
        headers: {
          Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (!vimeoRes.ok) {
        const error = await vimeoRes.json();
        throw Object.assign(new Error(error.error || 'Error al consultar video de Vimeo'), {
          status: vimeoRes.status,
          details: error,
        });
      }

      const data = await vimeoRes.json();

      // Extraer el token privado (hash) del embed HTML
      // El hash está en el parámetro 'h=' de la URL del iframe en embed.html
      const embedHtml = data.embed?.html || '';
      let privateToken = extractPrivateTokenFromEmbed(embedHtml);

      // Si no se encontró en embed.html, intentar extraerlo de la URL del video (link)
      // Para videos UNLISTED, la URL puede ser: https://vimeo.com/123456789/abcdef1234
      if (!privateToken && data.link) {
        const linkHashMatch = data.link.match(/\/([a-zA-Z0-9]+)$/);
        if (linkHashMatch && linkHashMatch[1] && linkHashMatch[1] !== videoId) {
          privateToken = linkHashMatch[1];
        }
      }

      // Thumbnail: usar el tamaño más grande disponible (o el primero si no hay sizes)
      const sizes = data.pictures?.sizes || [];
      const thumbnailUrl = sizes.length > 0
        ? (sizes.find((s: { width: number }) => s.width >= 1280) || sizes[sizes.length - 1])?.link
        : null;

      return {
        videoId,
        privateToken: privateToken,
        thumbnailUrl: thumbnailUrl || null,
        embedUrl: data.embed?.html || null,
        privacy: {
          view: data.privacy?.view || null,
          embed: data.privacy?.embed || null,
        },
        playerUrl: privateToken
          ? `https://player.vimeo.com/video/${videoId}?h=${privateToken}`
          : `https://player.vimeo.com/video/${videoId}`,
      };
    },
    ['vimeo-private-token', videoId],
    { revalidate: 3600 }
  )();

export async function POST(req: Request) {
  try {
    const { videoId } = await req.clone().json();

    if (!videoId) {
      return NextResponse.json({ error: 'Falta el ID del video de Vimeo.' }, { status: 400 });
    }

    const payload = await getCachedVimeoVideoInfo(videoId);
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Error obteniendo token privado de Vimeo:', error);
    return NextResponse.json({
      error: error.message || 'Error interno del servidor',
      details: error.details,
    }, { status: error.status || 500 });
  }
}

/**
 * Extrae el token privado (parámetro 'h') de una URL de embed de Vimeo
 * El hash puede estar en diferentes formatos:
 * - h=abc123 en la URL del iframe
 * - /abc123 al final de la URL del video (vimeo.com/123456789/abc123)
 */
function extractPrivateTokenFromEmbed(embedHtml: string): string | null {
  if (!embedHtml) return null;
  
  // Buscar el parámetro 'h=' en la URL del iframe
  // Puede estar como h=abc123 o h=abc123& (con otros parámetros después)
  const hMatch = embedHtml.match(/[?&]h=([a-zA-Z0-9]+)/);
  if (hMatch && hMatch[1]) {
    return hMatch[1];
  }
  
  // También buscar en el src del iframe directamente
  const srcMatch = embedHtml.match(/src=["']([^"']+)["']/);
  if (srcMatch && srcMatch[1]) {
    const srcHMatch = srcMatch[1].match(/[?&]h=([a-zA-Z0-9]+)/);
    if (srcHMatch && srcHMatch[1]) {
      return srcHMatch[1];
    }
  }
  
  return null;
}
