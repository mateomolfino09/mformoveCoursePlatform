/** Resuelve public ids de Cloudinary o URLs http(s) a URL usable en img/email/OG. */
function cloudinaryPublicIdHasExtension(publicId: string): boolean {
  const last = publicId.split('/').pop() || '';
  return /\.(jpe?g|png|webp|gif|avif)$/i.test(last);
}

/** Extrae public id desde una URL de entrega de Cloudinary (ignora transforms/version). */
function extractCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const uploadMarker = '/image/upload/';
    const uploadIdx = pathname.indexOf(uploadMarker);
    if (uploadIdx === -1) return null;

    const afterUpload = pathname.slice(uploadIdx + uploadMarker.length).split('/');
    const myUploadsIdx = afterUpload.findIndex((segment) => segment.startsWith('my_uploads'));
    if (myUploadsIdx === -1) return null;

    const publicId = afterUpload
      .slice(myUploadsIdx)
      .join('/')
      .replace(/\.(jpe?g|png|webp|gif|avif)$/i, '');

    return publicId || null;
  } catch {
    return null;
  }
}

/**
 * Normaliza un public id de Cloudinary (sin extensión forzada).
 * Forzar `.jpg` rompe assets cuyo public_id no incluye extensión.
 */
function normalizeCloudinaryPublicId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (cloudinaryPublicIdHasExtension(trimmed)) {
    return trimmed.replace(/\.(jpe?g|png|webp|gif|avif)$/i, '');
  }
  return trimmed;
}

/**
 * URL de entrega Cloudinary.
 * Incluye `/v1/` para que carpetas como `my_uploads/...` no se interpreten como
 * transformaciones (sin versión Cloudinary responde 400: Invalid transformation parameter - my).
 */
export function resolveCloudinaryOrHttpUrl(value: string | null | undefined): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const publicId = extractCloudinaryPublicIdFromUrl(trimmed);
    if (publicId) {
      return resolveCloudinaryOrHttpUrl(publicId);
    }
    return trimmed;
  }
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbeem2avp';
  const publicId = normalizeCloudinaryPublicId(trimmed);
  return `https://res.cloudinary.com/${cloud}/image/upload/v1/${publicId}`;
}

/** Cover vertical 3:4 (misma proporción que cards de /bio) para emails. */
export function resolveCloudinaryEmailCoverUrl(value: string | null | undefined): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const extracted = extractCloudinaryPublicIdFromUrl(trimmed);
    if (extracted) return resolveCloudinaryEmailCoverUrl(extracted);
    return trimmed;
  }
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbeem2avp';
  const publicId = normalizeCloudinaryPublicId(trimmed);
  // f_jpg: clientes de mail fallan con webp/avif; g_auto centra el crop como en /bio.
  return `https://res.cloudinary.com/${cloud}/image/upload/c_fill,g_auto,w_800,h_1067,f_jpg,q_auto/v1/${publicId}`;
}

export function extractVimeoId(link: string | null | undefined): string | null {
  if (!link || typeof link !== 'string') return null;
  const trimmed = link.trim();
  const patterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /^(\d+)$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Miniatura de Vimeo vía proxy propio.
 *
 * vumbnail.com y el oEmbed público no sirven acá: los videos `unlisted` no
 * exponen su miniatura y vumbnail responde 200 con una imagen genérica de
 * relleno, así que la clase queda con el thumbnail equivocado sin dar error.
 */
export function vimeoThumbnailUrl(
  vimeoId: string | null | undefined,
  width = 640
): string {
  const id = (vimeoId || '').trim();
  if (!id) return '';
  return `/api/vimeo/thumb/${id}?w=${width}`;
}

type ThumbnailInput = {
  videoThumbnail?: string | null;
  videoId?: string | null;
  videoUrl?: string | null;
};

/** URL de miniatura para tarjetas de clase (Cloudinary, URL directa o Vimeo). */
export function resolveCourseClassThumbnailUrl(input: ThumbnailInput): string {
  const thumb = (input.videoThumbnail || '').trim();
  if (thumb) {
    return resolveCloudinaryOrHttpUrl(thumb);
  }

  const vimeoId =
    extractVimeoId(input.videoId) || extractVimeoId(input.videoUrl);
  return vimeoThumbnailUrl(vimeoId);
}

const DEFAULT_COURSE_EMAIL_COVER =
  'https://res.cloudinary.com/dbeem2avp/image/upload/v1764363987/my_uploads/mails/fondoMoveCrew_1_k98l1d.png';

type ProductImageSource = {
  imagenBio?: string;
  portada?: string;
  portadaMobile?: string;
  image_url?: string;
  imagenes?: unknown;
  cursoConfig?: {
    imagenCheckoutPublicId?: string;
    hero?: {
      imagenPublicId?: string;
      imagenMobilePublicId?: string;
    };
  };
};

/** Misma prioridad que el carrusel de /bio (imagenBio → portada → …). */
export function resolveProductImagePublicId(product: ProductImageSource): string {
  const cfg = product.cursoConfig;
  const hero = cfg?.hero;
  const candidates = [
    product.imagenBio,
    product.portada,
    product.portadaMobile,
    hero?.imagenPublicId,
    hero?.imagenMobilePublicId,
    cfg?.imagenCheckoutPublicId,
    product.image_url,
    Array.isArray(product.imagenes) ? product.imagenes[0] : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

/** URL absoluta de portada para emails, WhatsApp OG y previews (3:4 como /bio). */
export function resolveCursoProductCoverUrl(product: ProductImageSource): string {
  const publicId = resolveProductImagePublicId(product);
  if (publicId) {
    return resolveCloudinaryEmailCoverUrl(publicId);
  }
  return DEFAULT_COURSE_EMAIL_COVER;
}
