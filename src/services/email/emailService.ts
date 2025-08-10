import mailchimp from '@mailchimp/mailchimp_transactional';
import { colors } from '../../constants/colors';

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || "");

// Tipos de email disponibles
export enum EmailType {
  MENTORSHIP_REQUEST_NOTIFICATION = 'mentorship_request_notification',
  MENTORSHIP_APPROVAL = 'mentorship_approval',
  CONTACT_FORM = 'contact_form',
  SUBSCRIPTION_UPDATE = 'subscription_update',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PASSWORD_RESET = 'password_reset',
  NEW_CLASS_NOTIFICATION = 'new_class_notification',
  WELCOME_EMAIL = 'welcome_email',
  WELCOME_MENTORSHIP = 'welcome_mentorship',
  WELCOME_MEMBERSHIP = 'welcome_membership',
  COURSE_COMPLETION = 'course_completion',
  REMINDER_EMAIL = 'reminder_email',
  TRANSFORMATIONAL_PROGRAM_WEEK = 'transformational_program_week',
  EVENT_CONFIRMATION = 'event_confirmation',
  PRODUCT_CONFIRMATION = 'product_confirmation',
  ADMIN_NOTIFICATION = 'admin_notification'
}

// Interfaz para datos de email
export interface EmailData {
  [key: string]: any;
}

// Interfaz para configuración de email
export interface EmailConfig {
  type: EmailType;
  to: string | string[];
  subject: string;
  data: EmailData;
  cc?: string[];
  bcc?: string[];
}

// Base template HTML
const getBaseTemplate = (content: string) => `
  <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: ${colors.background.secondary}; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: ${colors.background.primary}; padding: 20px; border-radius: 8px; box-shadow: ${colors.shadow.md};">
      ${content}
      <p style="font-size: 14px; color: ${colors.text.tertiary}; text-align: center; margin-top: 30px;">
        El equipo de MForMove
      </p>
      <hr style="border: none; border-top: 1px solid ${colors.border.light}; margin: 20px 0;">
      <p style="font-size: 12px; color: ${colors.text.tertiary}; text-align: center;">
        © 2025 MForMove. Todos los derechos reservados.
      </p>
    </div>
  </div>
`;

// Templates específicos
const emailTemplates = {
  [EmailType.MENTORSHIP_REQUEST_NOTIFICATION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Solicitud de Mentoría</h2>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Información del Solicitante:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Nombre:</strong> ${data.nombre}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Email:</strong> ${data.email}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Ubicación:</strong> ${data.paisCiudad}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>WhatsApp:</strong> ${data.whatsapp}</p>
      </div>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Detalles de la Solicitud:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Intereses:</strong> ${data.interesadoEn.join(', ')}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Donde entrena:</strong> ${data.dondeEntrena}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Nivel actual:</strong> ${data.nivelActual}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Principal freno:</strong> ${data.principalFreno}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Presupuesto:</strong> ${data.presupuesto}</p>
      </div>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">¿Por qué te eligió?</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; line-height: 1.6;">${data.porQueElegirme}</p>
      </div>
      
      ${data.comentarios ? `
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Comentarios adicionales:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; line-height: 1.6;">${data.comentarios}</p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.adminUrl || 'https://mateomove.com/admin/mentorship/requests'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Ver Solicitud en el Panel
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.MENTORSHIP_APPROVAL]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Solicitud de Mentoría Aprobada</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.nombre}</strong>, hemos revisado tu solicitud de mentoría y estamos listos para comenzar.
      </p>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Agenda tu llamada de consulta inicial para evaluar tus objetivos y crear tu plan personalizado:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.calendlyLink || 'https://calendly.com/mformovers/consulta-mentoria'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Agendar Consulta
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.CONTACT_FORM]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">${data.subject}</h2>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Nombre:</strong> ${data.name}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Email:</strong> ${data.email}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Asunto:</strong> ${data.subject}</p>
      </div>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Mensaje:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; line-height: 1.6;">${data.message.replace(/\r\n/g, '<br>')}</p>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.SUBSCRIPTION_UPDATE]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.text.primary}; text-align: center; font-size: 24px; margin-bottom: 20px;">${data.title}</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; text-align: center; line-height: 1.6; margin-bottom: 30px;">
        ${data.message}
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.buttonLink}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          ${data.buttonText}
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.PASSWORD_RESET]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Restablecer Contraseña</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; text-align: center; line-height: 1.6; margin-bottom: 30px;">
        Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para proceder:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Restablecer Contraseña
        </a>
      </div>
      <p style="font-size: 14px; color: ${colors.text.tertiary}; text-align: center; margin-top: 20px;">
        Si no solicitaste este cambio, puedes ignorar este correo.
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.NEW_CLASS_NOTIFICATION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Nueva Clase Disponible!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; text-align: center; line-height: 1.6; margin-bottom: 30px;">
        Una nueva clase ha sido subida y está disponible para ti. ¡Revisa los detalles a continuación y continúa tu aprendizaje!
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <a href="${data.classUrl}" style="color: ${colors.primary.blue}; text-decoration: none; font-size: 18px; font-weight: bold;">
          ${data.className}
        </a>
        <p style="font-size: 14px; color: ${colors.text.secondary}; margin-top: 10px;">${data.classDescription}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.classUrl}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Ver Clase
        </a>
      </div>
      <p style="font-size: 14px; color: ${colors.text.tertiary}; text-align: center;">
        Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.WELCOME_EMAIL]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido a MForMove!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Nos alegra darte la bienvenida a nuestra comunidad.
      </p>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Estamos aquí para ayudarte a alcanzar tus objetivos de fitness y bienestar.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl || 'https://mateomove.com/account'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Ir a Mi Cuenta
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.SUBSCRIPTION_CANCELLED]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.status.error}; text-align: center; font-size: 24px; margin-bottom: 20px;">Suscripción Cancelada</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.name}</strong>, tu suscripción ha sido cancelada exitosamente.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Detalles de la cancelación:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Plan:</strong> ${data.planName}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Fecha de cancelación:</strong> ${data.cancellationDate}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Acceso hasta:</strong> ${data.accessUntil}</p>
      </div>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Si cambias de opinión, puedes reactivar tu suscripción en cualquier momento.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.reactivateUrl || 'https://mateomove.com/membership'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Reactivar Suscripción
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.PAYMENT_SUCCESS]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.status.success}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Pago Exitoso!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Tu pago ha sido procesado exitosamente.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Detalles del pago:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Producto:</strong> ${data.productName}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Monto:</strong> $${data.amount}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Fecha:</strong> ${data.paymentDate}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>ID de transacción:</strong> ${data.transactionId}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.accessUrl || 'https://mateomove.com/account'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Acceder al Contenido
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.PAYMENT_FAILED]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.status.error}; text-align: center; font-size: 24px; margin-bottom: 20px;">Pago Fallido</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.name}</strong>, hubo un problema con tu pago.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Detalles del intento:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Producto:</strong> ${data.productName}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Monto:</strong> $${data.amount}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Fecha:</strong> ${data.paymentDate}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Error:</strong> ${data.errorMessage}</p>
      </div>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Por favor, verifica tu información de pago e intenta nuevamente.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.retryUrl || 'https://mateomove.com/membership'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Intentar Nuevamente
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.WELCOME_MENTORSHIP]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido al Programa de Mentoría!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Nos emociona que hayas decidido comenzar tu viaje de transformación con nuestro programa de mentoría.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Próximos pasos:</h3>
        <ul style="margin: 0; padding-left: 20px; color: ${colors.text.secondary};">
          <li style="margin: 5px 0;">Agenda tu primera llamada de consulta</li>
          <li style="margin: 5px 0;">Completa tu evaluación inicial</li>
          <li style="margin: 5px 0;">Recibe tu plan personalizado</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.calendlyLink || 'https://calendly.com/mformovers/consulta-mentoria'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Agendar Primera Consulta
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.WELCOME_MEMBERSHIP]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido a la Membresía MForMove!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Ya tienes acceso completo a nuestra plataforma de entrenamiento.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Lo que incluye tu membresía:</h3>
        <ul style="margin: 0; padding-left: 20px; color: ${colors.text.secondary};">
          <li style="margin: 5px 0;">Acceso a todas las clases y cursos</li>
          <li style="margin: 5px 0;">Contenido exclusivo de entrenamiento</li>
          <li style="margin: 5px 0;">Comunidad de miembros</li>
          <li style="margin: 5px 0;">Soporte personalizado</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl || 'https://mateomove.com/account/myCourses'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Explorar Cursos
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.COURSE_COMPLETION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.status.success}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Curso Completado!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Felicitaciones <strong>${data.name}</strong>! Has completado exitosamente el curso.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Detalles del curso:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Curso:</strong> ${data.courseName}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Fecha de finalización:</strong> ${data.completionDate}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Calificación:</strong> ${data.grade || 'N/A'}</p>
      </div>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        ¡Sigue así! Tu dedicación y esfuerzo te están llevando a alcanzar tus objetivos.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.nextCourseUrl || 'https://mateomove.com/courses'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Explorar Próximo Curso
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.REMINDER_EMAIL]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Recordatorio de Entrenamiento</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Te recordamos que tienes contenido pendiente por revisar.
      </p>
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Contenido pendiente:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Curso:</strong> ${data.courseName}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Clase:</strong> ${data.className}</p>
        <p style="margin: 5px 0; color: ${colors.text.secondary};"><strong>Duración estimada:</strong> ${data.duration}</p>
      </div>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Mantén la consistencia en tu entrenamiento para ver los mejores resultados.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.classUrl}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Continuar Entrenamiento
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.EVENT_CONFIRMATION]: (data: EmailData) => {
    const isOnline = data.isOnline;
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Reserva Confirmada</h2>
      
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.customerName}</strong>, tu reserva para <strong>${data.eventName}</strong> ha sido confirmada exitosamente.
      </p>

      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Detalles del Evento</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Fecha:</strong> ${data.eventDate}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Hora:</strong> ${data.eventTime}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Modalidad:</strong> ${isOnline ? 'Online' : 'Presencial'}</p>
          ${!isOnline ? `<p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Ubicación:</strong> ${data.eventLocation}</p>` : ''}
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Monto pagado:</strong> ${data.amount}</p>
        </div>
      </div>

      ${isOnline ? `
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información para Evento Online</h3>
        <div style="text-align: center;">
          ${data.eventLink ? `<p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Link de acceso:</strong> <a href="${data.eventLink}" style="color: ${colors.primary.blue}; text-decoration: underline;">Acceder al evento</a></p>` : '<p style="margin: 8px 0; color: ${colors.text.secondary};">El link de acceso se enviará 15 minutos antes del evento</p>'}
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Grabación:</strong> ${data.recordingInfo}</p>
        </div>
      </div>
      ` : `
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información para Evento Presencial</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Llegada:</strong> ${data.arrivalInstructions}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Traer:</strong> ${data.whatToBring}</p>
        </div>
      </div>
      `}

      ${data.beneficios && data.beneficios.length > 0 ? `
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Tu Reserva Incluye</h3>
        <ul style="margin: 0; padding-left: 20px; text-align: left;">
          ${data.beneficios.map((beneficio: string) => `
            <li style="margin: 8px 0; color: ${colors.text.secondary};">• ${beneficio}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.eventPageUrl}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; margin: 0 10px;">
          Ver Detalles del Evento
        </a>
      </div>

      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">¿Necesitas ayuda?</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; text-align: center;">
          Si tienes alguna pregunta, no dudes en contactarnos:
        </p>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; text-align: center;">
          <strong>Email:</strong> <a href="mailto:${data.supportEmail}" style="color: ${colors.primary.blue}; text-decoration: underline;">${data.supportEmail}</a>
        </p>
      </div>

      <p style="font-size: 14px; color: ${colors.text.tertiary}; text-align: center; margin-top: 20px;">
        <strong>ID de reserva:</strong> ${data.sessionId}
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.PRODUCT_CONFIRMATION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Compra Confirmada</h2>
      
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.customerName}</strong>, tu compra de <strong>${data.productName}</strong> ha sido confirmada exitosamente.
      </p>

      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Detalles de la Compra</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Producto:</strong> ${data.productName}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Descripción:</strong> ${data.productDescription}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Monto pagado:</strong> ${data.amount}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.productPageUrl}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; margin: 0 10px;">
          Ver Producto
        </a>
      </div>

      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">¿Necesitas ayuda?</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; text-align: center;">
          Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos:
        </p>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; text-align: center;">
          <strong>Email:</strong> <a href="mailto:${data.supportEmail}" style="color: ${colors.primary.blue}; text-decoration: underline;">${data.supportEmail}</a>
        </p>
      </div>

      <p style="font-size: 14px; color: ${colors.text.tertiary}; text-align: center; margin-top: 20px;">
        <strong>ID de compra:</strong> ${data.sessionId}
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.TRANSFORMATIONAL_PROGRAM_WEEK]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Nuevo Contenido Disponible!</h2>
      
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Tu contenido de la <strong>Semana ${data.semana}</strong> ya está disponible.
      </p>

      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Esta Semana: ${data.titulo}</h3>
        <p style="margin: 8px 0; color: ${colors.text.secondary}; text-align: center; line-height: 1.6;">
          Es momento de continuar tu viaje de transformación. Tu nuevo contenido ya está disponible y listo para que lo explores.
        </p>
      </div>

      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 16px; text-align: center;">🎯 Lo que aprenderás esta semana:</h4>
        <ul style="margin: 0; padding-left: 20px; text-align: left;">
          <li style="margin: 8px 0; color: ${colors.text.secondary};">Fundamentos sólidos para tu práctica</li>
          <li style="margin: 8px 0; color: ${colors.text.secondary};">Ejercicios específicos para tu nivel</li>
          <li style="margin: 8px 0; color: ${colors.text.secondary};">Reflexiones para profundizar tu conexión</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mateomove.com/programa-transformacional/semana-${data.semana}" 
           style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          🎬 Ver Contenido de la Semana ${data.semana}
        </a>
      </div>

      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">💡 Recuerda:</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; text-align: center; line-height: 1.6;">
          La consistencia es clave. Dedica al menos 30 minutos diarios a tu práctica para obtener los mejores resultados.
        </p>
      </div>

      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">👥 Comunidad</h3>
        <p style="margin: 5px 0; color: ${colors.text.secondary}; text-align: center; line-height: 1.6;">
          ¡No estás solo en este viaje! Únete a la comunidad para compartir experiencias y recibir apoyo.
        </p>
      </div>

      <p style="font-size: 14px; color: ${colors.text.tertiary}; text-align: center; margin-top: 20px;">
        ¡Nos vemos en la próxima sesión en vivo!
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.ADMIN_NOTIFICATION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Compra Realizada</h2>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información del Cliente</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Nombre:</strong> ${data.customerName}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Email:</strong> ${data.customerEmail}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Teléfono:</strong> ${data.customerPhone}</p>
        </div>
      </div>

      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Detalles de la Compra</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Producto:</strong> ${data.productName}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Tipo:</strong> ${data.productType}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Monto:</strong> ${data.amount}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Fecha de pago:</strong> ${data.paymentDate}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>ID de sesión:</strong> ${data.sessionId}</p>
        </div>
      </div>

      ${data.productType === 'evento' ? `
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información del Evento</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Fecha del evento:</strong> ${data.eventDate}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Ubicación:</strong> ${data.eventLocation}</p>
          <p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Modalidad:</strong> ${data.isOnline ? 'Online' : 'Presencial'}</p>
          ${data.cupo ? `<p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Cupo:</strong> ${data.cupo} personas</p>` : ''}
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mateomove.com/admin" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Ver en el Panel de Admin
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  }
};

// Servicio principal de emails
export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Método principal para enviar emails
  public async sendEmail(config: EmailConfig): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const template = emailTemplates[config.type];
      if (!template) {
        throw new Error(`Template no encontrado para el tipo: ${config.type}`);
      }

      const html = template(config.data);
      const recipients = Array.isArray(config.to) ? config.to : [config.to];

      const toRecipients = recipients.map(email => ({ email, type: 'to' as const }));
      const ccRecipients = config.cc?.map(email => ({ email, type: 'cc' as const })) || [];
      const bccRecipients = config.bcc?.map(email => ({ email, type: 'bcc' as const })) || [];

      const allRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients];

      await mailchimpClient.messages.send({
        message: {
          from_email: "noreply@mateomove.com",
          subject: config.subject,
          html: html,
          to: allRecipients,
        },
      });

  
      
      return {
        success: true,
        message: `Email enviado exitosamente a ${recipients.join(', ')}`
      };

    } catch (error: any) {
      console.error(`❌ Error al enviar email ${config.type}:`, error);
      
      return {
        success: false,
        message: 'Error al enviar email',
        error: error.message
      };
    }
  }

  // Métodos específicos para cada tipo de email
  public async sendMentorshipRequestNotification(data: EmailData, adminEmail: string = 'mateomolfino09@gmail.com') {
    return this.sendEmail({
      type: EmailType.MENTORSHIP_REQUEST_NOTIFICATION,
      to: adminEmail,
      subject: 'Nueva solicitud de mentoría',
      data
    });
  }

  public async sendMentorshipApproval(data: EmailData) {
    return this.sendEmail({
      type: EmailType.MENTORSHIP_APPROVAL,
      to: data.email,
      subject: 'Tu solicitud de mentoría fue aprobada - Agenda tu consulta',
      data
    });
  }

  public async sendContactForm(data: EmailData) {
    return this.sendEmail({
      type: EmailType.CONTACT_FORM,
      to: data.email,
      subject: data.subject,
      data,
      cc: ['hello@mateomolfino.com'],
      bcc: ['mateomolfino09@gmail.com']
    });
  }

  public async sendPasswordReset(data: EmailData) {
    return this.sendEmail({
      type: EmailType.PASSWORD_RESET,
      to: data.email,
      subject: 'Restablecer contraseña',
      data
    });
  }

  public async sendNewClassNotification(data: EmailData, users: string[]) {
    return this.sendEmail({
      type: EmailType.NEW_CLASS_NOTIFICATION,
      to: users,
      subject: 'Nueva Clase Disponible',
      data
    });
  }

  public async sendWelcomeEmail(data: EmailData) {
    return this.sendEmail({
      type: EmailType.WELCOME_EMAIL,
      to: data.email,
      subject: '¡Bienvenido a MForMove!',
      data
    });
  }

  public async sendSubscriptionCancelled(data: EmailData) {
    return this.sendEmail({
      type: EmailType.SUBSCRIPTION_CANCELLED,
      to: data.email,
      subject: 'Suscripción Cancelada',
      data
    });
  }

  public async sendPaymentSuccess(data: EmailData) {
    return this.sendEmail({
      type: EmailType.PAYMENT_SUCCESS,
      to: data.email,
      subject: '¡Pago Exitoso!',
      data
    });
  }

  public async sendPaymentFailed(data: EmailData) {
    return this.sendEmail({
      type: EmailType.PAYMENT_FAILED,
      to: data.email,
      subject: 'Pago Fallido - Acción Requerida',
      data
    });
  }

  public async sendWelcomeMentorship(data: EmailData) {
    return this.sendEmail({
      type: EmailType.WELCOME_MENTORSHIP,
      to: data.email,
      subject: '¡Bienvenido al Programa de Mentoría!',
      data
    });
  }

  public async sendWelcomeMembership(data: EmailData) {
    return this.sendEmail({
      type: EmailType.WELCOME_MEMBERSHIP,
      to: data.email,
      subject: '¡Bienvenido a la Membresía MForMove!',
      data
    });
  }

  public async sendCourseCompletion(data: EmailData) {
    return this.sendEmail({
      type: EmailType.COURSE_COMPLETION,
      to: data.email,
      subject: '¡Curso Completado!',
      data
    });
  }

  public async sendReminderEmail(data: EmailData) {
    return this.sendEmail({
      type: EmailType.REMINDER_EMAIL,
      to: data.email,
      subject: 'Recordatorio de Entrenamiento',
      data
    });
  }
}

// Exportar instancia singleton
export const emailService = EmailService.getInstance(); 