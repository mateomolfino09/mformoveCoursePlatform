/** Payload público para la home: último curso publicado (index-latest-curso). */
export type IndexLatestCursoModulo = {
  titulo: string;
  descripcion: string;
  imagenPublicId: string;
};

export type IndexLatestCursoPayload = {
  slug: string;
  titulo: string;
  subtitulo: string;
  cuerpoIntro: string;
  imagenIntroPublicId: string;
  temarioTitulo: string;
  modulos: IndexLatestCursoModulo[];
};
