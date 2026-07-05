import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empezar mentoría',
  description: 'Elegí tu plan y método de pago para la mentoría 1:1.',
};

export default function MentoriaEmpezarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
