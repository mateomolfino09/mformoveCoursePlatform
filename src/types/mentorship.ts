export type MentorshipBillingInterval = 'mensual' | 'anual' | 'trimestral';

export type MentorshipPlanPagoOption = {
  proveedor: 'stripe' | 'dlocalgo' | 'mercadopago';
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
  mercadoPagoPreferenceId?: string;
  mercadoPagoExternalReference?: string;
  originBase?: string;
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
  /** stripe | dlocalgo | mercadopago */
  proveedoresHabilitados?: Array<'stripe' | 'dlocalgo' | 'mercadopago'>;
};

export interface MentorshipProps {
  plans: MentorshipPlan[];
  origin: string;
  /** Mientras cargan planes, la landing (hero+) ya se muestra. */
  plansLoading?: boolean;
  plansError?: string | null;
} 