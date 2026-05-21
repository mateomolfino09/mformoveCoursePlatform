export const CURSO_TRANSFERENCIA_WHATSAPP_PHONE = '59898964142';

export const CURSO_TRANSFERENCIA_BANCARIA = {
  banco: 'Itaú Uruguay',
  cuentaPesos: '3228196',
  cuentaDolares: '3228188',
  titular: 'Mateo Molfino',
} as const;

/** wa.me con mensaje prellenado: comprobante de transferencia + activar acceso al curso. */
export function buildCourseTransferWhatsAppUrl(courseName: string): string {
  const program = courseName.trim() || 'Cuerpo Autónomo';
  const text = `Hola Mateo! Acabo de realizar la transferencia por ${program} y quiero enviarte el comprobante para activar mi acceso. Mi nombre es:`;
  return `https://wa.me/${CURSO_TRANSFERENCIA_WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}
