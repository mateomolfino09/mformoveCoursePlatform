/**
 * Primera letra de cada palabra en mayúscula (es-ES).
 * Ej: "Cuerpo autónomo" → "Cuerpo Autónomo"
 */
export function formatTitleCaseWords(value: string | null | undefined): string {
  if (value == null) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      const lower = word.toLocaleLowerCase('es');
      return lower.charAt(0).toLocaleUpperCase('es') + lower.slice(1);
    })
    .join(' ');
}
