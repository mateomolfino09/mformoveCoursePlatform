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
  const publicId = cloudinaryPublicIdHasExtension(trimmed) ? trimmed : `${trimmed}.jpg`;
  // Sin transformaciones en la ruta: IDs con carpeta (my_uploads/…) rompen f_auto,q_auto,w_1200.
  return `https://res.cloudinary.com/${cloud}/image/upload/${publicId}`;
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

export function vimeoThumbnailUrl(vimeoId: string | null | undefined): string {
  const id = (vimeoId || '').trim();
  if (!id) return '';
  return `https://vumbnail.com/${id}.jpg`;
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
    extractVimeoId(input.videoId) ||
    extractVimeoId(input.videoUrl);

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

/** URL absoluta de portada para emails, WhatsApp OG y previews. */
export function resolveCursoProductCoverUrl(product: ProductImageSource): string {
  const publicId = resolveProductImagePublicId(product);
  if (publicId) {
    return resolveCloudinaryOrHttpUrl(publicId);
  }
  return DEFAULT_COURSE_EMAIL_COVER;
}
