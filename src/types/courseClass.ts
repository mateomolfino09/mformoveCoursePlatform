/** Materiales disponibles para las clases de un producto tipo curso. */
export const COURSE_CLASS_MATERIALS = [
  'pelota',
  'baston',
  'banda elastica',
  'banco',
  'bloque',
  'libreta',
  'lapicera',
] as const;

export type CourseClassMaterial = (typeof COURSE_CLASS_MATERIALS)[number];

/** Misma forma que ModuleClass para reutilizar la vista de práctica/biblioteca. */
export type CourseClassFields = {
  courseClassId?: string;
  name: string;
  description: string;
  videoUrl: string;
  videoId: string;
  videoThumbnail: string;
  /** Duración en segundos (como ModuleClass). */
  duration: number;
  level: number;
  order: number;
  materials: CourseClassMaterial[];
  visibleInLibrary: boolean;
  /** URL del PDF descargable asociado a la clase (Cloudinary u otra). */
  pdfUrl?: string;
};

export type CourseClassDocument = CourseClassFields & {
  _id: string;
  productId: string;
  timelineIndex: number;
  createdAt?: string;
  updatedAt?: string;
};
