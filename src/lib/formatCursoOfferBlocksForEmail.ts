import type { CursoOfferBlock } from '../types/cursoLanding';

export type CursoOfferBlockEmailItem = {
  title: string;
  hint: string;
};

/** Título visible del bloque (líneas unidas). */
export function formatOfferBlockTitle(lineas: string[] | undefined): string {
  return (lineas || []).map((l) => l.trim()).filter(Boolean).join(' ');
}

export function mapOfferBlocksForEmail(
  blocks: CursoOfferBlock[] | undefined
): CursoOfferBlockEmailItem[] {
  return (blocks || [])
    .map((block) => ({
      title: formatOfferBlockTitle(block.lineas),
      hint: (block.hint || '').trim(),
    }))
    .filter((block) => block.title);
}
