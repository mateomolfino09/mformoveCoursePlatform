export type UserCursoResumen = {
  productoId?: string;
  slug?: string;
  rutaContenido?: string | null;
  bienvenidaPendiente?: boolean;
};

export function findOwnedCurso(
  cursos: UserCursoResumen[] | undefined,
  opts: { productId?: string; slug?: string }
): UserCursoResumen | undefined {
  const list = cursos || [];
  const productId = opts.productId?.trim();
  const slug = opts.slug?.trim().toLowerCase();

  if (productId) {
    const byId = list.find((c) => c.productoId === productId);
    if (byId) return byId;
  }

  if (slug) {
    return list.find((c) => (c.slug || '').trim().toLowerCase() === slug);
  }

  return undefined;
}

/** Ruta a la que redirigir si el usuario ya tiene el curso. */
export function resolveOwnedCursoRedirectPath(
  curso: UserCursoResumen,
  slugFallback?: string
): string {
  if (curso.bienvenidaPendiente && curso.productoId) {
    return `/pago/exito?productId=${curso.productoId}&tipo=curso`;
  }

  if (curso.rutaContenido) return curso.rutaContenido;

  const slug = curso.slug || slugFallback;
  if (slug) return `/${encodeURIComponent(slug)}/contenido`;

  return '/';
}

export async function fetchOwnedCursoRedirectPath(opts: {
  productId?: string;
  slug?: string;
}): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!opts.productId && !opts.slug) return null;

  const hasToken = document.cookie.split('; ').some((row) => row.startsWith('userToken='));
  if (!hasToken) return null;

  try {
    const res = await fetch('/api/user/cursos', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = await res.json();
    const owned = findOwnedCurso(data.cursos, opts);
    if (!owned) return null;

    return resolveOwnedCursoRedirectPath(owned, opts.slug);
  } catch {
    return null;
  }
}
