import type { Metadata } from 'next';
import { GLOBAL_SITE_DESCRIPTION } from './siteMetadata';

/** Título de pestaña = nombre de la ruta (sin repetir MMOVE en cada página). */
export function pageMetadata(title: string, description = GLOBAL_SITE_DESCRIPTION): Metadata {
  return {
    title,
    description,
  };
}
