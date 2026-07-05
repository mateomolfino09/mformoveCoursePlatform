/**
 * Resolución de la descripción de una clase de curso según el contexto.
 * Cada contexto prioriza una de las tres descripciones y, si falta, cae en las otras.
 */

type ClaseDescripcionCampos = {
  descripcionGeneral?: string;
  descripcionCorta?: string;
  descripcionCompleta?: string;
  /** Descripción legacy de la clase. */
  description?: string;
};

const clean = (value?: string) => (value ? value.trim() : '');

/** Checkout / listado de clases: corta → general → completa → legacy. */
export function resolveClaseDescripcionCorta(clase: ClaseDescripcionCampos): string {
  return (
    clean(clase.descripcionCorta) ||
    clean(clase.descripcionGeneral) ||
    clean(clase.descripcionCompleta) ||
    clean(clase.description)
  );
}

/** Visualización de la clase adquirida: completa → general → corta → legacy. */
export function resolveClaseDescripcionCompleta(clase: ClaseDescripcionCampos): string {
  return (
    clean(clase.descripcionCompleta) ||
    clean(clase.descripcionGeneral) ||
    clean(clase.descripcionCorta) ||
    clean(clase.description)
  );
}

/** Detalles del curso (admin): general → completa → corta → legacy. */
export function resolveClaseDescripcionGeneral(clase: ClaseDescripcionCampos): string {
  return (
    clean(clase.descripcionGeneral) ||
    clean(clase.descripcionCompleta) ||
    clean(clase.descripcionCorta) ||
    clean(clase.description)
  );
}
