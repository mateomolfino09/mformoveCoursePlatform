export type MentorshipBillingInterval = 'mensual' | 'anual' | 'trimestral';

export type MentorshipPlanPagoOption = {
  proveedor: 'stripe' | 'dlocalgo';
  etiqueta: string;
  descripcion: string;
  monto: number;
  moneda: string;
  paymentLink: string;
  activo: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  dlocalOrderId?: string;
  dlocalPaymentId?: string;
  merchantCheckoutToken?: string;
};

export type PlanPrice = {
  interval: MentorshipBillingInterval;
  price: number;
  currency: string;
  stripePriceId: string;
  opcionesPago?: MentorshipPlanPagoOption[];
};

export type MentorshipPlan = {
  _id: string;
  name: string;
  description: string;
  features: string[];
  level: string;
  active: boolean;
  prices: PlanPrice[];
};

export interface MentorshipProps {
  plans: MentorshipPlan[];
  origin: string;
} 