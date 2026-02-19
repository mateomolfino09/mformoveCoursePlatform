/** Materiales predefinidos para clases de módulo (uso en clase). */
export const MODULE_CLASS_MATERIALS = [
  'baston',
  'banda elastica',
  'banco',
  'pelota'
] as const;

export type ModuleClassMaterial = typeof MODULE_CLASS_MATERIALS[number];
