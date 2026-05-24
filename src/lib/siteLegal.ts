/**
 * Datos para publicación legal (deben coincidir con tu registro en dLocal Go).
 *
 * Persona física en dLocal Go:
 *   NEXT_PUBLIC_LEGAL_ADMIN_NAME   — nombre completo del titular
 *   NEXT_PUBLIC_LEGAL_ADMIN_DOC    — documento de identificación, o
 *   NEXT_PUBLIC_LEGAL_ADMIN_EMAIL  — email con el que te registraste en dLocal Go (alternativa al doc)
 *
 * Persona jurídica en dLocal Go:
 *   NEXT_PUBLIC_LEGAL_COMPANY_NAME — razón social
 *   NEXT_PUBLIC_LEGAL_TAX_ID       — RUT / NIT / CUIT / RUC / CNPJ / etc.
 *
 * Solo completá uno de los dos bloques según cómo registraste la cuenta.
 */
export type LegalRegistry =
  | {
      kind: 'pf'
      administratorName: string
      identification: string
      identificationKind: 'document' | 'email'
    }
  | { kind: 'pj'; legalName: string; taxId: string }

export function getLegalRegistry(): LegalRegistry | null {
  const pjName = process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME?.trim()
  const pjTax = process.env.NEXT_PUBLIC_LEGAL_TAX_ID?.trim()
  if (pjName && pjTax) return { kind: 'pj', legalName: pjName, taxId: pjTax }

  const pfName = process.env.NEXT_PUBLIC_LEGAL_ADMIN_NAME?.trim()
  const pfDoc = process.env.NEXT_PUBLIC_LEGAL_ADMIN_DOC?.trim()
  const pfEmail = process.env.NEXT_PUBLIC_LEGAL_ADMIN_EMAIL?.trim()
  const identification = pfDoc || pfEmail
  if (pfName && identification) {
    const identificationKind =
      identification.includes('@') || (!pfDoc && Boolean(pfEmail)) ? 'email' : 'document'
    return { kind: 'pf', administratorName: pfName, identification, identificationKind }
  }

  return null
}
