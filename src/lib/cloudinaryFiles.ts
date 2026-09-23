export type CloudinaryUploadedFile = {
  url: string;
  publicId: string;
  resourceType: string;
  filename: string;
};

const MAX_BYTES = 20 * 1024 * 1024;

async function postToCloudinary(
  file: File,
  folder: string,
  resource: 'auto' | 'raw' | 'image'
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) {
    throw new Error('Falta la configuración de Cloudinary');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'my_uploads');
  formData.append('folder', folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`,
    { method: 'POST', body: formData }
  );
  return res.json();
}

/** Sube un PDF u otro archivo con el preset público que ya usa el admin. */
export async function uploadFileToCloudinary(
  file: File,
  folder = 'cursos/archivos'
): Promise<CloudinaryUploadedFile> {
  if (file.size > MAX_BYTES) {
    throw new Error('El archivo supera 20MB');
  }

  let data = await postToCloudinary(file, folder, 'auto');
  if (!data?.secure_url) data = await postToCloudinary(file, folder, 'raw');
  if (!data?.secure_url) data = await postToCloudinary(file, folder, 'image');
  if (!data?.secure_url) {
    throw new Error(data?.error?.message || 'No se pudo subir el archivo');
  }

  const format = String(data.format || '').trim();
  const original = String(data.original_filename || '').trim();
  const fromFile = file.name.trim();
  let filename = original || fromFile || 'archivo';
  if (format && !filename.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
    filename = `${filename}.${format}`;
  }

  return {
    url: String(data.secure_url),
    publicId: String(data.public_id || ''),
    resourceType: String(data.resource_type || 'image'),
    filename,
  };
}

/** Nombre sin extensión: un punto dentro de fl_attachment invalida la URL de Cloudinary. */
function attachmentFlag(filename?: string) {
  const base = (filename || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\- ]+/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return base ? `fl_attachment:${base}` : 'fl_attachment';
}

/** URL que fuerza la descarga. Conserva la URL de Cloudinary y le agrega fl_attachment. */
export function cloudinaryAttachmentUrl(input: {
  url?: string;
  publicId?: string;
  resourceType?: string;
  filename?: string;
}): string {
  const url = (input.url || '').trim();
  const publicId = (input.publicId || '').trim();
  const flag = attachmentFlag(input.filename);
  const marker = '/upload/';

  if (url.includes('res.cloudinary.com') && url.includes(marker) && !url.includes('/fl_attachment')) {
    const index = url.indexOf(marker);
    return `${url.slice(0, index + marker.length)}${flag}/${url.slice(index + marker.length)}`;
  }

  if (!publicId) return url;

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbeem2avp';
  const resourceType = (input.resourceType || '').trim();
  const type = resourceType === 'raw' || resourceType === 'video' ? resourceType : 'image';
  const extension = (input.filename || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  let id = publicId.replace(/^\/+/, '');
  if (type !== 'raw' && extension && !id.toLowerCase().endsWith(`.${extension}`)) {
    id = `${id}.${extension}`;
  }
  return `https://res.cloudinary.com/${cloud}/${type}/upload/${flag}/${id}`;
}
