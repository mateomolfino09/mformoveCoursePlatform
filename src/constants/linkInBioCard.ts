/** Proporción de las cards del carrusel en /bio (`aspect-[3/4]`). */
export const LINK_IN_BIO_CARD_ASPECT = {
  width: 3,
  height: 4,
} as const;

/** Tamaño recomendado (3× para pantallas retina sobre ~260px de ancho). */
export const LINK_IN_BIO_CARD_RECOMMENDED_PX = {
  width: 780,
  height: 1040,
} as const;

export const LINK_IN_BIO_CARD_MIN_PX = {
  width: 600,
  height: 800,
} as const;

export const LINK_IN_BIO_CARD_ASPECT_LABEL = '3:4 (vertical)';

export const LINK_IN_BIO_CARD_SIZE_HINT =
  `Proporción ${LINK_IN_BIO_CARD_ASPECT_LABEL} · Recomendado: ${LINK_IN_BIO_CARD_RECOMMENDED_PX.width} × ${LINK_IN_BIO_CARD_RECOMMENDED_PX.height} px · Mínimo: ${LINK_IN_BIO_CARD_MIN_PX.width} × ${LINK_IN_BIO_CARD_MIN_PX.height} px · JPG o PNG`;

export const LINK_IN_BIO_CARD_SIZE_HINT_SHORT =
  `${LINK_IN_BIO_CARD_ASPECT_LABEL} · ${LINK_IN_BIO_CARD_RECOMMENDED_PX.width}×${LINK_IN_BIO_CARD_RECOMMENDED_PX.height} px`;
