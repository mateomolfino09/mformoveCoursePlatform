import { buildCursoBienvenidaSuccessUrl } from './cursoPaymentUrls';
import { formatTitleCaseWords } from './formatDisplayTitle';

export const CURSO_BIENVENIDA_PENDIENTE_COOKIE = 'cursoBienvenidaPendiente';

export type CursoBienvenidaPendienteInfo = {
  productId: string;
  nombre: string;
  successPath: string;
};

type CursoAdquiridoEntry = {
  productoId?: { toString(): string } | string;
  bienvenidaPendiente?: boolean;
};

type ProductPopulated = {
  _id?: { toString(): string };
  nombre?: string;
  name?: string;
};

export function findCursoBienvenidaPendiente(
  cursosAdquiridos: CursoAdquiridoEntry[] | undefined,
  origin: string
): CursoBienvenidaPendienteInfo | null {
  const entry = (cursosAdquiridos || []).find((c) => c?.bienvenidaPendiente === true);
  if (!entry?.productoId) return null;

  const productId =
    typeof entry.productoId === 'string'
      ? entry.productoId
      : entry.productoId.toString();

  const fullUrl = buildCursoBienvenidaSuccessUrl(origin, productId);
  const parsed = new URL(fullUrl);
  const successPath = `${parsed.pathname}${parsed.search}`;

  return {
    productId,
    nombre: 'Curso',
    successPath,
  };
}

export function resolveCursoBienvenidaFromPopulated(
  cursosAdquiridos: Array<CursoAdquiridoEntry & { productoId?: ProductPopulated | string }>,
  origin: string
): CursoBienvenidaPendienteInfo | null {
  const entry = (cursosAdquiridos || []).find((c) => c?.bienvenidaPendiente === true);
  if (!entry?.productoId) return null;

  const producto = entry.productoId;
  const productId =
    typeof producto === 'string' ? producto : producto._id?.toString() || '';
  if (!productId) return null;

  const nombreRaw =
    typeof producto === 'object' && producto !== null
      ? producto.nombre || producto.name || 'Curso'
      : 'Curso';

  const fullUrl = buildCursoBienvenidaSuccessUrl(origin, productId);
  const parsed = new URL(fullUrl);

  return {
    productId,
    nombre: formatTitleCaseWords(nombreRaw),
    successPath: `${parsed.pathname}${parsed.search}`,
  };
}
