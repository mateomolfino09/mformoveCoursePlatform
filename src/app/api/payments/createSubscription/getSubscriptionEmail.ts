import mailchimp from "@mailchimp/mailchimp_transactional";

// Inicializa Mailchimp
const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY!);

// Define los posibles estados de Stripe
type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export const sendSubscriptionEmail = async (
  status: SubscriptionStatus,
  email: string,
  origin: string
): Promise<void> => {
  // Map de estados con su respectiva info
  const statuses: Record<SubscriptionStatus, { title: string; message: string; buttonText: string; buttonLink: string }> = {
    trialing: {
      title: "Tu prueba gratuita ha comenzado 🎉",
      message: "¡Disfruta de todos los beneficios de tu membresía! Te avisaremos cuando termine el período de prueba.",
      buttonText: "Ver mi cuenta",
      buttonLink: `${origin}/biblioteca`,
    },
    active: {
      title: "¡Se activó tu subscripción!",
      message: "Gracias por elegirnos. Accede a tus clases y avanza en tu entrenamiento.",
      buttonText: "Empezar a moverme",
      buttonLink: `${origin}/biblioteca`,
    },
    past_due: {
      title: "Pago pendiente ⏳",
      message: "No pudimos procesar tu pago. Verifica tu método de pago para evitar interrupciones.",
      buttonText: "Actualizar pago",
      buttonLink: `${origin}/cuenta`,
    },
    unpaid: {
      title: "subscripción suspendida ❌",
      message: "Tu pago ha fallado varias veces y tu subscripción ha sido suspendida. Puedes reactivarla actualizando tu información de pago.",
      buttonText: "Reactivar subscripción",
      buttonLink: `${origin}/cuenta`,
    },
    canceled: {
      title: "Tu subscripción ha sido cancelada 😢",
      message: "Lamentamos verte partir. Puedes seguir disfrutando de los beneficios hasta el final del período actual.",
      buttonText: "Explorar planes",
      buttonLink: `${origin}/elegir-plan`,
    },
    incomplete: {
      title: "Falta completar tu subscripción ⚠️",
      message: "Parece que no terminaste de configurar tu subscripción. Completa el proceso para acceder a todos los beneficios.",
      buttonText: "Finalizar subscripción",
      buttonLink: `${origin}/cuenta`,
    },
    incomplete_expired: {
      title: "Tu intento de subscripción ha expirado ⏳",
      message: "No pudimos completar tu subscripción y el intento ha expirado. Inténtalo nuevamente.",
      buttonText: "Suscribirme otra vez",
      buttonLink: `${origin}/elegir-plan`,
    },
    paused: {
        title: "Tu subscripción se ha pausado",
        message: "No pudimos completar tu subscripción y el intento ha expirado. Inténtalo nuevamente.",
        buttonText: "Suscribirme otra vez",
        buttonLink: `${origin}/elegir-plan`,
      }
  };

  // Obtiene el contenido basado en el estado
  const { title, message, buttonText, buttonLink } = statuses[status] ?? {
    title: "Actualización de tu subscripción",
    message: "Hubo un cambio en tu cuenta. Accede a tu panel para más detalles.",
    buttonText: "Ver detalles",
    buttonLink: `${origin}/dashboard`,
  };

  // Plantilla minimalista Cuerpo autónomo (fino, paleta ink/cream/stone)
  const font = "'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const emailHtml = `
  <div style="font-family:${font};font-weight:300;background-color:#FAF8F4;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#fff;padding:0;border-radius:8px;box-shadow:0 1px 2px rgba(20,20,17,0.04);">
      <div style="padding:28px 24px 24px;text-align:center;border-bottom:1px solid rgba(120,120,103,0.12);">
        <span style="font-family:${font};font-weight:300;letter-spacing:0.2em;font-size:16px;color:#141411;text-transform:uppercase;">MMOVE</span>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#141411;text-align:center;font-size:20px;font-weight:400;margin:0 0 12px 0;letter-spacing:0.02em;">${title}</h2>
        <p style="font-size:14px;color:#787867;text-align:center;line-height:1.65;margin:0 0 28px 0;font-weight:300;">${message}</p>
        <div style="text-align:center;">
          <a href="${buttonLink}" style="display:inline-block;color:#FAF8F4;background:#141411;text-decoration:none;font-weight:400;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;padding:12px 28px;border-radius:9999px;font-family:${font};border:none;">${buttonText}</a>
        </div>
      </div>
      <div style="padding:24px;text-align:center;border-top:1px solid rgba(120,120,103,0.12);">
        <p style="font-size:12px;color:#787867;margin:0 0 6px 0;font-weight:300;letter-spacing:0.02em;">El equipo de Cuerpo autónomo</p>
        <p style="font-size:11px;color:#787867;margin:0;font-weight:300;opacity:0.7;">© 2026 MMOVE. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
  `;

  try {
    // Enviar el email usando Mailchimp
    await mailchimpClient.messages.send({
      message: {
        from_email: "noreply@mateomove.com",
        subject: "Actualización de tu subscripción",
        html: emailHtml,
        to: [{ email, type: "to" }],
      },
    });

    } catch (error) {
    console.error(`❌ Error al enviar el email:`, error);
  }
};