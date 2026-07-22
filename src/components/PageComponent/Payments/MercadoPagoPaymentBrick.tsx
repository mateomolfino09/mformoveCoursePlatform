'use client';

import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { toast } from '../../../hooks/useToast';
import { humanizeMercadoPagoMessage } from '../../../lib/mercadoPagoErrors';

const MAX_INSTALLMENTS = 12;

/** Paleta MForMove — alineada con tailwind.config.js */
const BRAND = {
  ink: '#141411',
  cream: '#FAF8F4',
  sage: '#dfe0c3',
  sageSoft: '#c5c6a6',
  stone: '#787867',
  error: '#AA6373',
  success: '#519872',
} as const;

const MP_BRICK_CUSTOMIZATION = {
  visual: {
    style: {
      theme: 'flat' as const,
      customVariables: {
        textPrimaryColor: BRAND.ink,
        textSecondaryColor: BRAND.stone,
        inputBackgroundColor: BRAND.cream,
        formBackgroundColor: BRAND.cream,
        baseColor: BRAND.ink,
        baseColorFirstVariant: '#2a2a27',
        baseColorSecondVariant: BRAND.sageSoft,
        buttonTextColor: BRAND.cream,
        outlinePrimaryColor: BRAND.sage,
        outlineSecondaryColor: BRAND.sageSoft,
        errorColor: BRAND.error,
        successColor: BRAND.success,
        successSecondaryColor: BRAND.sage,
        borderRadiusSmall: '8px',
        borderRadiusMedium: '12px',
        borderRadiusLarge: '16px',
        inputFocusedBorderWidth: '2px',
      },
    },
  },
  paymentMethods: {
    minInstallments: 1,
    maxInstallments: MAX_INSTALLMENTS,
    creditCard: 'all' as const,
    debitCard: 'all' as const,
    prepaidCard: 'all' as const,
    mercadoPago: 'all' as const,
  },
};

export type MercadoPagoBrickFormData = {
  paymentType?: string;
  selectedPaymentMethod?: string;
  formData?: Record<string, unknown>;
};

type MercadoPagoPaymentBrickProps = {
  amount: number;
  preferenceId?: string | null;
  payerEmail?: string | null;
  /** POST endpoint that receives brick formData and creates the payment */
  processUrl: string;
  processBody?: Record<string, unknown>;
  onPaymentApproved: (result: {
    paymentId: string;
    status: string;
    redirectUrl?: string;
  }) => void;
  onError?: (message: string) => void;
};

const publicKey =
  process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_API_KEY ||
  '';

const isTestPublicKey = publicKey.startsWith('TEST-');

let mpInitialized = false;

function ensureMercadoPagoInit() {
  if (mpInitialized || !publicKey) return;
  initMercadoPago(publicKey, { locale: 'es-UY' });
  mpInitialized = true;
}

function friendlyBrickError(error: { message?: string; cause?: string } | null): string {
  const cause = String(error?.cause || '').toLowerCase();
  const message = error?.message || 'Error en el formulario de Mercado Pago';
  if (cause.includes('no_payment_method_for_provided_bin') || message.includes('no_payment_method')) {
    return 'Esa tarjeta no está habilitada en Uruguay. En pruebas usá Visa 4509 9535 6623 3704 (CVV 123, 11/30, titular APRO).';
  }
  return humanizeMercadoPagoMessage(message);
}

/**
 * Checkout Bricks — Payment Brick (opción Profesional).
 * Se muestra embebido al elegir Mercado Pago en el checkout.
 */
export default function MercadoPagoPaymentBrick({
  amount,
  preferenceId,
  payerEmail,
  processUrl,
  processBody,
  onPaymentApproved,
  onError,
}: MercadoPagoPaymentBrickProps) {
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mountedKey = useRef(`${amount}-${preferenceId || 'none'}`);

  useEffect(() => {
    ensureMercadoPagoInit();
  }, []);

  useEffect(() => {
    mountedKey.current = `${amount}-${preferenceId || 'none'}`;
    setReady(false);
  }, [amount, preferenceId]);

  const handleSubmit = useCallback(
    async (brickData: MercadoPagoBrickFormData) => {
      setSubmitting(true);
      try {
        const res = await fetch(processUrl, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...processBody,
            ...brickData,
            formData: brickData?.formData,
            paymentType: brickData?.paymentType,
            selectedPaymentMethod: brickData?.selectedPaymentMethod,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = humanizeMercadoPagoMessage(
            data.error || data.message || 'No se pudo procesar el pago con Mercado Pago'
          );
          onError?.(message);
          toast.error(message);
          throw new Error(message);
        }

        const status = String(data.status || '').toLowerCase();
        if (status === 'approved' || status === 'authorized') {
          onPaymentApproved({
            paymentId: String(data.paymentId || data.id),
            status,
            redirectUrl: data.redirectUrl,
          });
          return data;
        }

        if (status === 'in_process' || status === 'pending') {
          toast.success('Pago en proceso. Te avisamos cuando se acredite.');
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
          }
          return data;
        }

        const rejected = humanizeMercadoPagoMessage(
          data.statusDetail || data.error || 'El pago fue rechazado. Probá con otro medio.'
        );
        onError?.(rejected);
        toast.error(rejected);
        throw new Error(rejected);
      } finally {
        setSubmitting(false);
      }
    },
    [onError, onPaymentApproved, processBody, processUrl]
  );

  if (!publicKey) {
    return (
      <p className="mt-3 font-raleway text-sm text-red-700">
        Falta configurar NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY para Checkout Bricks.
      </p>
    );
  }

  if (!amount || amount <= 0) {
    return (
      <p className="mt-3 font-raleway text-sm text-palette-stone">
        No hay un monto válido para iniciar Mercado Pago.
      </p>
    );
  }

  return (
    <div className="relative rounded-xl border border-palette-stone/15 bg-palette-cream md:px-4">
      {submitting ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-palette-cream/80">
          <MiniLoadingSpinner />
        </div>
      ) : null}
      {!ready ? (
        <div className="mb-3 flex items-center gap-2 font-raleway text-sm text-palette-stone">
          <MiniLoadingSpinner />
          <span>Cargando formulario de Mercado Pago…</span>
        </div>
      ) : null}
      <Payment
        key={mountedKey.current}
        locale="es-UY"
        initialization={{
          amount: Number(amount),
          ...(preferenceId ? { preferenceId } : {}),
          ...(payerEmail
            ? {
                payer: {
                  email: payerEmail,
                },
              }
            : {}),
        }}
        customization={MP_BRICK_CUSTOMIZATION}
        onReady={() => setReady(true)}
        onError={(error) => {
          const message = friendlyBrickError(error as { message?: string; cause?: string });
          onError?.(message);
          toast.error(message);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
