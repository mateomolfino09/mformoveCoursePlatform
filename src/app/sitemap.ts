import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/siteMetadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    '',
    '/mentoria',
    '/productos',
    '/eventos',
    '/nosotros',
    '/contacto',
    '/terminos',
    '/privacidad',
    '/preguntas-frecuentes',
    '/bio',
    '/cuerpo-autonomo',
  ];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
