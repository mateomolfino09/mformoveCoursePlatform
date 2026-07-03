export type CursoClaseNavItem = {
  _id: string;
  name: string;
  order?: number;
  timelineIndex: number;
  moduloTitulo: string;
};

export type CursoModuloNav = {
  timelineIndex: number;
  titulo: string;
  clases: Array<{ _id: string; name?: string; order?: number }>;
};

export function flattenCursoClasesOrdered(modulos: CursoModuloNav[]): CursoClaseNavItem[] {
  const sorted = [...(modulos || [])].sort((a, b) => a.timelineIndex - b.timelineIndex);
  const flat: CursoClaseNavItem[] = [];

  for (const mod of sorted) {
    const clases = [...(mod.clases || [])]
      .filter((c) => c?._id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (const clase of clases) {
      flat.push({
        _id: clase._id,
        name: clase.name?.trim() || 'Clase',
        order: clase.order,
        timelineIndex: mod.timelineIndex,
        moduloTitulo: mod.titulo?.trim() || `Módulo ${mod.timelineIndex + 1}`,
      });
    }
  }

  return flat;
}

export function findFirstCursoClase(modulos: CursoModuloNav[]): CursoClaseNavItem | null {
  return flattenCursoClasesOrdered(modulos)[0] ?? null;
}
