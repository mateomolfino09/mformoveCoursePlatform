import mongoose from 'mongoose';
import CourseClass from '../models/courseClassModel';
import {
  normalizeClaseContenido,
  type CursoModuloContenido,
} from '../types/cursoLanding';

const ALLOWED_MATERIALS = ['pelota', 'baston', 'banda elastica', 'banco', 'bloque', 'libreta', 'lapicera'] as const;

function toCourseClassPayload(
  clase: CursoModuloContenido['clases'][number],
  timelineIndex: number
) {
  const normalized = normalizeClaseContenido(clase, clase?.order ?? 0);
  return {
    timelineIndex,
    name: normalized.name || 'Clase sin título',
    description: normalized.description,
    descripcionGeneral: normalized.descripcionGeneral || '',
    descripcionCorta: normalized.descripcionCorta || '',
    descripcionCompleta: normalized.descripcionCompleta || '',
    pdfUrl: normalized.pdfUrl || '',
    videoUrl: normalized.videoUrl,
    videoId: normalized.videoId || undefined,
    videoThumbnail: normalized.videoThumbnail,
    duration: normalized.duration,
    level: normalized.level,
    order: normalized.order,
    materials: normalized.materials.filter((m) =>
      (ALLOWED_MATERIALS as readonly string[]).includes(m)
    ),
    visibleInLibrary: normalized.visibleInLibrary,
  };
}

/** Persiste clases embebidas como documentos CourseClass y devuelve contenidoModulos actualizado. */
export async function syncCourseClassesFromContenidoModulos(
  productId: string,
  contenidoModulos: CursoModuloContenido[] = []
): Promise<CursoModuloContenido[]> {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('productId inválido para sincronizar CourseClass');
  }

  const productObjectId = new mongoose.Types.ObjectId(productId);
  const keptIds: mongoose.Types.ObjectId[] = [];
  const updatedModulos: CursoModuloContenido[] = [];

  for (const modulo of contenidoModulos) {
    const timelineIndex = Number(modulo.timelineIndex) || 0;
    const clasesOut: CursoModuloContenido['clases'] = [];

    for (let i = 0; i < (modulo.clases || []).length; i++) {
      const payload = toCourseClassPayload(modulo.clases[i], timelineIndex);
      const existingId = modulo.clases[i]?.courseClassId;

      let doc =
        existingId && mongoose.Types.ObjectId.isValid(existingId)
          ? await CourseClass.findByIdAndUpdate(
              existingId,
              { productId: productObjectId, ...payload },
              { new: true }
            )
          : null;

      if (!doc) {
        doc = await CourseClass.create({
          productId: productObjectId,
          ...payload,
        });
      }

      keptIds.push(doc._id);
      clasesOut.push({
        ...normalizeClaseContenido(modulo.clases[i], i),
        courseClassId: String(doc._id),
      });
    }

    updatedModulos.push({
      ...modulo,
      timelineIndex,
      clases: clasesOut,
    });
  }

  if (keptIds.length > 0) {
    await CourseClass.deleteMany({
      productId: productObjectId,
      _id: { $nin: keptIds },
    });
  } else {
    await CourseClass.deleteMany({ productId: productObjectId });
  }

  return updatedModulos;
}
