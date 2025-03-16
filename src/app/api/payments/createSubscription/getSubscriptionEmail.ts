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
      buttonLink: `${origin}/home`,
    },
    active: {
      title: "Tu subscripción está activa",
      message: "Gracias por continuar con nosotros. Accede a tus clases y sigue avanzando en tu entrenamiento.",
      buttonText: "Empezar a moverme",
      buttonLink: `${origin}/home`,
    },
    past_due: {
      title: "Pago pendiente ⏳",
      message: "No pudimos procesar tu pago. Verifica tu método de pago para evitar interrupciones.",
      buttonText: "Actualizar pago",
      buttonLink: `${origin}/account`,
    },
    unpaid: {
      title: "subscripción suspendida ❌",
      message: "Tu pago ha fallado varias veces y tu subscripción ha sido suspendida. Puedes reactivarla actualizando tu información de pago.",
      buttonText: "Reactivar subscripción",
      buttonLink: `${origin}/account`,
    },
    canceled: {
      title: "Tu subscripción ha sido cancelada 😢",
      message: "Lamentamos verte partir. Puedes seguir disfrutando de los beneficios hasta el final del período actual.",
      buttonText: "Explorar planes",
      buttonLink: `${origin}/select-plan`,
    },
    incomplete: {
      title: "Falta completar tu subscripción ⚠️",
      message: "Parece que no terminaste de configurar tu subscripción. Completa el proceso para acceder a todos los beneficios.",
      buttonText: "Finalizar subscripción",
      buttonLink: `${origin}/account`,
    },
    incomplete_expired: {
      title: "Tu intento de subscripción ha expirado ⏳",
      message: "No pudimos completar tu subscripción y el intento ha expirado. Inténtalo nuevamente.",
      buttonText: "Suscribirme otra vez",
      buttonLink: `${origin}/select-plan`,
    },
    paused: {
        title: "Tu subscripción se ha pausado",
        message: "No pudimos completar tu subscripción y el intento ha expirado. Inténtalo nuevamente.",
        buttonText: "Suscribirme otra vez",
        buttonLink: `${origin}/select-plan`,
      }
  };

  // Obtiene el contenido basado en el estado
  const { title, message, buttonText, buttonLink } = statuses[status] ?? {
    title: "Actualización de tu subscripción",
    message: "Hubo un cambio en tu cuenta. Accede a tu panel para más detalles.",
    buttonText: "Ver detalles",
    buttonLink: `${origin}/dashboard`,
  };

  // Plantilla HTML
  const emailHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; text-align: center;">${title}</h2>
      <p style="font-size: 16px; color: #666666; text-align: center;">
        ${message}
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${buttonLink}" style="background-color: #000000; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold; display: inline-block;">
          ${buttonText}
        </a>
      </div>
      <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
        El equipo de MForMove
      </p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999999; text-align: center;">
        © 2025 MForMove. Todos los derechos reservados.
      </p>
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

    console.log(`✅ Email enviado a ${email} para el estado ${status}`);
  } catch (error) {
    console.error(`❌ Error al enviar el email:`, error);
  }
};