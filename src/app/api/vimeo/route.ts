import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { vimeoInput } = await req.json();
    if (!vimeoInput) {
      return NextResponse.json({ error: 'Falta el ID o link de Vimeo.' }, { status: 400 });
    }

    const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
    if (!VIMEO_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'No se encontró el token de Vimeo en las variables de entorno.' }, { status: 500 });
    }

    // Detectar si es galería/álbum/showcase/folder o video individual
    let isGallery = false;
    let galleryId = '';
    let videoId = '';

    // Si es link de galería/álbum/showcase/folder
    const galleryMatch = vimeoInput.match(/vimeo\.com\/(?:album|showcase|folder)\/(\d+)/);
    if (galleryMatch && galleryMatch[1]) {
      isGallery = true;
      galleryId = galleryMatch[1];
    }
    // Si es solo el ID numérico y se espera galería
    else if (/^\d+$/.test(vimeoInput) && vimeoInput.length >= 6) {
      // Por defecto, tratamos como galería si el frontend lo usa así
      isGallery = true;
      galleryId = vimeoInput;
    }
    // Si es link de video individual
    const videoMatch = vimeoInput.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (!isGallery && videoMatch && videoMatch[1]) {
      videoId = videoMatch[1];
    }
    // Si es solo el ID numérico y no es galería
    else if (!isGallery && /^\d+$/.test(vimeoInput)) {
      videoId = vimeoInput;
    }

    if (isGallery && galleryId) {
      // Buscar videos de la galería
      const vimeoRes = await fetch(`https://api.vimeo.com/albums/${galleryId}/videos`, {
        headers: {
          Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
          Accept: 'application/vnd.vimeo.*+json;version=3.4',
        },
      });
      if (!vimeoRes.ok) {
        const error = await vimeoRes.json();
        return NextResponse.json({ error: error.error || 'Error al consultar galería de Vimeo', details: error }, { status: vimeoRes.status });
      }
      const data = await vimeoRes.json();
      return NextResponse.json({ data });
    } else if (videoId) {
      // Buscar video individual
      const vimeoRes = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (!vimeoRes.ok) {
        const error = await vimeoRes.json();
        return NextResponse.json({ error: error.error || 'Error al consultar video de Vimeo', details: error }, { status: vimeoRes.status });
      }
      const data = await vimeoRes.json();
      return NextResponse.json({ data });
    } else {
      return NextResponse.json({ error: 'No se pudo interpretar el ID o link de Vimeo.' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
} 