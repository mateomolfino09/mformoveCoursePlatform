export type CursoPublicationConfig = {
  publicado?: boolean;
  fechaPublicacion?: string | Date | null;
};

export function parseCursoPublicationDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isCursoLandingPublished(
  config?: CursoPublicationConfig | null,
  now = new Date()
): boolean {
  if (!config) return false;
  if (config.publicado) return true;

  const publicationDate = parseCursoPublicationDate(config.fechaPublicacion);
  if (!publicationDate) return false;

  // Con fecha de lanzamiento programada la landing es accesible (preventa antes del lanzamiento).
  return true;
}

/** true mientras la fecha de lanzamiento siga en el futuro. */
export function isCursoEnPreventa(
  config?: CursoPublicationConfig | null,
  now = new Date()
): boolean {
  const publicationDate = parseCursoPublicationDate(config?.fechaPublicacion);
  if (!publicationDate) return false;
  return publicationDate.getTime() > now.getTime();
}

export function toDatetimeLocalValue(value?: string | Date | null): string {
  const date = parseCursoPublicationDate(value);
  if (!date) return '';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}
