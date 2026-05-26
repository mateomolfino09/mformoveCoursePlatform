/**
 * Rutas públicas de landings y contenido de cursos (sin prefijo /curso).
 * Los slugs no deben coincidir con segmentos reservados del sitio.
 */

const RESERVED_FIRST_SEGMENTS = new Set([
  'admin',
  'api',
  'biblioteca',
  'bio',
  'bitacora',
  'categoria-clases',
  'clases',
  'contacto',
  'cuenta',
  'dev',
  'documents',
  'elegir-plan',
  'eventos',
  'horario-clases',
  'incorporacion',
  'inicio',
  'iniciar-sesion',
  'library',
  'membership',
  'mentoria',
  'mentorship',
  'move-crew',
  'nosotros',
  'onboarding',
  'olvide-contrasena',
  'pago',
  'pago-unico-exito',
  'privacidad',
  'preguntas-frecuentes',
  'productos',
  'registro',
  'restablecer',
  'restablecer-correo',
  'ruta-semanal',
  'terminos',
  'test-email-templates',
  'ui-showcase',
  'verificar-correo',
  'weekly-path',
  '_next',
  'favicon.ico',
])

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/^\/+|\/+$/g, '')
}

export function cursoLandingPath(slug: string): string {
  const s = normalizeSlug(slug)
  return `/${encodeURIComponent(s)}`
}

export function cursoEmpezarPath(slug: string): string {
  return `${cursoLandingPath(slug)}/empezar`
}

export function cursoContenidoPath(slug: string): string {
  return `${cursoLandingPath(slug)}/contenido`
}

export function cursoClasePath(slug: string, classId: string, moduloIndex?: number): string {
  const base = `${cursoContenidoPath(slug)}/clase/${encodeURIComponent(classId)}`
  if (moduloIndex == null) return base
  return `${base}?modulo=${moduloIndex}`
}

export type CursoPublicPath = {
  slug: string
  subpath: 'landing' | 'empezar' | 'contenido' | 'clase'
}

/** true si la URL corresponde a landing, checkout o hub de un curso */
export function parseCursoPublicPath(pathname: string): CursoPublicPath | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null

  const [first, ...rest] = parts
  const slug = decodeURIComponent(first)
  if (!slug || RESERVED_FIRST_SEGMENTS.has(slug.toLowerCase())) return null

  if (rest.length === 0) return { slug, subpath: 'landing' }
  if (rest.length === 1 && rest[0] === 'empezar') return { slug, subpath: 'empezar' }
  if (rest.length === 1 && rest[0] === 'contenido') return { slug, subpath: 'contenido' }
  if (rest.length === 3 && rest[0] === 'contenido' && rest[1] === 'clase' && rest[2]) {
    return { slug, subpath: 'clase' }
  }

  return null
}

export function isCursoPublicPath(pathname: string): boolean {
  return parseCursoPublicPath(pathname) !== null
}
