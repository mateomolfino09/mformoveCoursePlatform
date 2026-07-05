import type { CursoLandingConfig } from '../types/cursoLanding';

/** Parte aboutDescription en líneas (párrafos numerados o separados por \\n\\n). */
export function splitAboutDescriptionText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const byDoubleNewline = trimmed
    .split(/\n\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (byDoubleNewline.length > 1) return byDoubleNewline;

  const byNumberedList = trimmed
    .split(/(?=\d+\.\s)/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (byNumberedList.length > 1) return byNumberedList;

  return byDoubleNewline.length ? byDoubleNewline : [trimmed];
}

function normalizeParrafosInput(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((item) =>
      typeof item === 'string' ? splitAboutDescriptionText(item) : []
    );
  }
  if (typeof raw === 'string') {
    return splitAboutDescriptionText(raw);
  }
  return [];
}

/** Líneas de la sección "Sobre este curso" (betweenHero.parrafos o fallback). */
export function resolveCursoAboutDescriptionLines(
  cursoConfig: Pick<CursoLandingConfig, 'betweenHero' | 'introHighlights' | 'highlights'>
): string[] {
  const fromParrafos = normalizeParrafosInput(cursoConfig.betweenHero?.parrafos);
  if (fromParrafos.length) return fromParrafos;

  const fallback =
    cursoConfig.introHighlights?.cuerpo?.trim() ||
    cursoConfig.highlights?.puente?.trim() ||
    '';
  return splitAboutDescriptionText(fallback);
}

export function joinAboutDescriptionLines(lines: string[]): string {
  return lines.join('\n\n');
}
