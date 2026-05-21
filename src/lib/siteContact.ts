/** Email de soporte y contacto público (visible en el sitio). */
export const SITE_CONTACT_EMAIL = 'info@mateomove.com'

const DEFAULT_WA_CHAT = 'https://wa.me/59898964142'

/** Igual que en MoveCrewWhatsAppBanner: enlace efectivo para WhatsApp */
export function getSiteWhatsappUrl(): string {
  const env = process.env.NEXT_PUBLIC_MOVECREW_WA_CHAT?.trim()
  if (env && /^https:\/\//i.test(env)) return env
  return DEFAULT_WA_CHAT
}

/**
 * Teléfono solo para texto visible (ej. footer).
 * Definí `NEXT_PUBLIC_SITE_PHONE_DISPLAY` si querés otro formato o número alternativo.
 */
export function getSitePhoneDisplay(): string | null {
  const direct = process.env.NEXT_PUBLIC_SITE_PHONE_DISPLAY?.trim()
  if (direct) return direct

  const waSrc = process.env.NEXT_PUBLIC_MOVECREW_WA_CHAT?.trim() || DEFAULT_WA_CHAT
  const m = waSrc.match(/wa\.me\/([\d]+)/i)
  if (!m?.[1]) return null
  const digits = m[1].replace(/\D/g, '')
  if (digits.startsWith('598') && digits.length >= 11) {
    const rest = digits.slice(3)
    return `+598 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`.trim()
  }
  return `+${digits}`
}
