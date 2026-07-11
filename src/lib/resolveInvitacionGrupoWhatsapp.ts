import { WHATSAPP_GROUP_LINK } from '../constants/community';

/** Link fijo de la comunidad general (no cambia por producto). */
export const WHATSAPP_LINK_FIJO = WHATSAPP_GROUP_LINK;

export type InvitacionGrupoSource = {
  invitacionGrupoWhatsapp?: string;
  /** @deprecated usar invitacionGrupoWhatsapp */
  grupoWhatsapp?: string;
  /** Fallback: algunos productos guardan el invite en descripcion */
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

const WHATSAPP_INVITE_CODE_RE = /^https?:\/\/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i;

/** Extrae el primer invite chat.whatsapp.com de un texto (soporta URLs duplicadas pegadas). */
export function extractWhatsappInviteLink(text?: string | null): string {
  if (!text?.trim()) return '';
  const parts = text.split(/(?=https?:\/\/)/i);
  for (const part of parts) {
    const match = part.trim().match(WHATSAPP_INVITE_CODE_RE);
    if (match?.[1]) {
      return `https://chat.whatsapp.com/${match[1]}`;
    }
  }
  return '';
}

function pickInvitacion(...values: Array<string | undefined>): string {
  for (const v of values) {
    const trimmed = v?.trim();
    if (trimmed) return trimmed;
  }
  return '';
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
    data.programaTransformacional?.comunidad?.invitacionGrupoWhatsapp,
    data.programaTransformacional?.comunidad?.grupoWhatsapp,
    extractWhatsappInviteLink(data.descripcion)
  );
}

export function resolveInvitacionGrupoWhatsappFromProduct(
  product: InvitacionGrupoSource | null | undefined
): string {
  if (!product) return '';
  return resolveInvitacionGrupoWhatsappFromPayload({
    invitacionGrupoWhatsapp: product.invitacionGrupoWhatsapp,
    grupoWhatsapp: product.grupoWhatsapp,
    descripcion: product.descripcion,
    cursoConfig: product.cursoConfig,
    programaTransformacional: product.programaTransformacional,
  });
}
