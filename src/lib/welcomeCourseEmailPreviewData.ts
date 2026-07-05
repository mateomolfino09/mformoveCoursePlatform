import type { CursoOfferBlockEmailItem } from './formatCursoOfferBlocksForEmail';

export type WelcomeCourseEmailPreviewData = {
  email: string;
  name: string;
  courseName: string;
  welcomeUrl: string;
  coverImageUrl: string;
  incluyeTitulo: string;
  offerBlocks: CursoOfferBlockEmailItem[];
  whatsappInviteUrl: string;
  mateoWhatsappUrl: string;
  mateoCtaTexto: string;
  mentoriaUrl: string;
  proximoEncuentro: {
    titulo: string;
    fechaFormateada: string;
    horaFormateada: string;
    zoomLink: string;
    googleCalendarUrl: string;
  };
};

export function buildWelcomeCourseEmailPreviewData(
  overrides: Partial<WelcomeCourseEmailPreviewData> = {}
): WelcomeCourseEmailPreviewData {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    email: 'preview@example.com',
    name: 'Mateo',
    courseName: 'Cuerpo Autónomo',
    welcomeUrl: `${origin}/pago/exito?productId=6a0a4d25d13df40e5d2ecfeb&tipo=curso`,
    coverImageUrl:
      'https://res.cloudinary.com/dbeem2avp/image/upload/my_uploads/vvjbwcqxcrncvk90nmzs.jpg',
    incluyeTitulo: 'Esto es lo que incluye tu programa',
    offerBlocks: [
      {
        title: 'Clases en video',
        hint: 'Progresión guiada para practicar a tu ritmo, cuando te quede cómodo.',
      },
      {
        title: 'Encuentros en vivo mensuales',
        hint: 'Q&A grupal para dudas, correcciones y profundizar técnica.',
      },
      {
        title: 'Comunidad de WhatsApp',
        hint: 'Avisos, soporte y acompañamiento entre alumnos y Mateo.',
      },
    ],
    whatsappInviteUrl:
      process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ||
      'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo',
    mateoWhatsappUrl: 'https://wa.me/59898964142',
    mateoCtaTexto: 'Escribirme por WhatsApp',
    mentoriaUrl: `${origin}/mentoria`,
    proximoEncuentro: {
      titulo: 'Q&A en vivo — Cuerpo Autónomo',
      fechaFormateada: 'jueves, 12 de junio',
      horaFormateada: '18:00',
      zoomLink: 'https://zoom.us/j/ejemplo',
      googleCalendarUrl:
        'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Q%26A%20en%20vivo',
    },
    ...overrides,
  };
}
