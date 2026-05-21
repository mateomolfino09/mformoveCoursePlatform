import { WHATSAPP_GROUP_LINK } from '../constants/community';

/** Link fijo de la comunidad general (no cambia por producto). */
export const WHATSAPP_LINK_FIJO = WHATSAPP_GROUP_LINK;

export type InvitacionGrupoSource = {
  invitacionGrupoWhatsapp?: string;
  /** @deprecated usar invitacionGrupoWhatsapp */
  grupoWhatsapp?: string;
  /** A veces el admin pega el link del grupo en descripción por error. */
  descripcion?: string;
  cursoConfig?: {
    whatsapp?: {
      invitacionGrupoWhatsapp?: string;
      /** @deprecated */
      grupoWhatsapp?: string;
    };
  };
  programaTransformacional?: {
    comunidad?: {
      invitacionGrupoWhatsapp?: string;
      /** @deprecated */
      grupoWhatsapp?: string;
    };
  };
};

function pickInvitacion(...values: Array<string | undefined>): string {
  for (const v of values) {
    const trimmed = v?.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

/** Extrae el primer enlace chat.whatsapp.com de un texto (ej. descripción mal pegada en admin). */
export function extractWhatsappGroupInviteFromText(text?: string | null): string {
  if (!text?.trim()) return '';
  const match = text.match(/https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i);
  return match?.[0] || '';
}

/** Invitación al grupo del curso/evento (chat.whatsapp.com/…). Vacío si no está configurada. */
export function resolveInvitacionGrupoWhatsappFromPayload(
  data: InvitacionGrupoSource
): string {
  return pickInvitacion(
    data.invitacionGrupoWhatsapp,
    data.grupoWhatsapp,
    data.cursoConfig?.whatsapp?.invitacionGrupoWhatsapp,
    data.cursoConfig?.whatsapp?.grupoWhatsapp,
    extractWhatsappGroupInviteFromText(data.descripcion),
    data.programaTransformacional?.comunidad?.invitacionGrupoWhatsapp,
    data.programaTransformacional?.comunidad?.grupoWhatsapp
  );
}

export function resolveInvitacionGrupoWhatsappFromProduct(
  product: InvitacionGrupoSource | null | undefined
): string {
  if (!product) return '';
  return resolveInvitacionGrupoWhatsappFromPayload({
    invitacionGrupoWhatsapp: product.invitacionGrupoWhatsapp,
    grupoWhatsapp: product.grupoWhatsapp,
    cursoConfig: product.cursoConfig,
    programaTransformacional: product.programaTransformacional,
  });
}
