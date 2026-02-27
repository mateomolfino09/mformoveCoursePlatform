/** Link único de la comunidad MMove | Comunidad de Movimiento en WhatsApp */
const COMMUNITY_WHATSAPP_LINK = 'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo';

/**
 * Link al grupo de WhatsApp de la comunidad Move Crew.
 * Se usa este link en toda la app (perfil, navegadores, emails, etc.).
 */
export const WHATSAPP_GROUP_LINK =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || COMMUNITY_WHATSAPP_LINK;
