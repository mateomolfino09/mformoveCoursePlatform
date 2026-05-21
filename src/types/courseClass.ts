import { MODULE_CLASS_MATERIALS, type ModuleClassMaterial } from '../constants/moduleClassMaterials';

export type CourseClassMaterial = ModuleClassMaterial;

export const COURSE_CLASS_MATERIALS = MODULE_CLASS_MATERIALS;

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
};

export type CourseClassDocument = CourseClassFields & {
  _id: string;
  productId: string;
  timelineIndex: number;
  createdAt?: string;
  updatedAt?: string;
};
