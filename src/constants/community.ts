/** Link único de la comunidad MMove | Comunidad de Movimiento en WhatsApp */
const COMMUNITY_WHATSAPP_LINK = 'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo';

/**
 * Link fijo al grupo general de la comunidad MMove (no cambia por curso/evento).
 * Para el grupo de un curso o evento concreto, usar `invitacionGrupoWhatsapp` del producto.
 */
export const WHATSAPP_GROUP_LINK =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || COMMUNITY_WHATSAPP_LINK;
