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
  ACCOUNT_CREATED = 'account_created',
  NEW_CLASS_NOTIFICATION = 'new_class_notification',
  WELCOME_EMAIL = 'welcome_email',
  WELCOME_MENTORSHIP = 'welcome_mentorship',
  WELCOME_MEMBERSHIP = 'welcome_membership',
  COURSE_COMPLETION = 'course_completion',
  REMINDER_EMAIL = 'reminder_email',
  TRANSFORMATIONAL_PROGRAM_WEEK = 'transformational_program_week',
  EVENT_CONFIRMATION = 'event_confirmation',
  PRODUCT_CONFIRMATION = 'product_confirmation',
  ADMIN_NOTIFICATION = 'admin_notification',
  ADMIN_MEMBERSHIP_NOTIFICATION = 'admin_membership_notification',
  ADMIN_SUBSCRIPTION_CANCELLED = 'admin_subscription_cancelled',
  ADMIN_PAYMENT_FAILED = 'admin_payment_failed',
  WEEKLY_LOGBOOK_RELEASE = 'weekly_logbook_release'
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

// Base template HTML para usuarios (fondo blanco, minimalista)
const getBaseTemplateUser = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    <style>
      /* @import para Montserrat con todos los weights - compatible con Gmail */
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap');
      
      /* @font-face adicionales para mejor compatibilidad */
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 200;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 800;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 900;
        font-display: swap;
        src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2') format('woff2');
      }
      /* Fallback para Gmail móvil */
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      /* Forzar Montserrat en títulos para Gmail */
      h1 {
        font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important;
        font-weight: 800 !important;
      }
      h2, h3 {
        font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <div style="background-color: #f9fafb; padding: 20px 10px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);">
      ${content}
        <div style="padding: 24px 20px; text-align: center; border-top: 1px solid rgba(0, 0, 0, 0.08);">
          <p style="font-size: 13px; color: rgba(0, 0, 0, 0.6); margin: 0 0 8px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            El equipo de MforMove
      </p>
          <p style="font-size: 11px; color: rgba(0, 0, 0, 0.4); margin: 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
        © 2025 MForMove. Todos los derechos reservados.
      </p>
    </div>
  </div>
    </div>
  </body>
  </html>
`;

// Base template HTML para admin (fondo oscuro)
const getBaseTemplateAdmin = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <div style="background-color: #000000; padding: 20px 10px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #141414; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
        ${content}
        <div style="padding: 24px 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 13px; color: rgba(255, 255, 255, 0.6); margin: 0 0 8px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            El equipo de MforMove
          </p>
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            © 2025 MForMove. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

// Mantener compatibilidad con código existente
const getBaseTemplate = getBaseTemplateUser;

// Templates específicos
const emailTemplates = {
  [EmailType.MENTORSHIP_REQUEST_NOTIFICATION]: (data: EmailData) => {
    const textClean = (data.text || '').trim();
    const durationSec = Number(data.videoDurationSeconds || 0);
    const formattedDuration = (() => {
      if (!durationSec || durationSec <= 0) return '';
      const hrs = Math.floor(durationSec / 3600);
      const mins = Math.floor((durationSec % 3600) / 60);
      const secs = Math.floor(durationSec % 60);
      const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      if (hrs > 0) return `${hrs}:${two(mins)}:${two(secs)}`;
      return `${mins}:${two(secs)}`;
    })();
    
    const content = `
      <h2 style="color: #ffffff; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Solicitud de Mentoría</h2>
      
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
    return getBaseTemplateAdmin(content);
  },

  [EmailType.MENTORSHIP_APPROVAL]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">Solicitud de Mentoría Aprobada</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.nombre}</strong>, hemos revisado tu solicitud de mentoría y estamos listos para comenzar.
      </p>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Para preparar tu consulta inicial, te comparto el documento de evaluaciones que necesitarás completar:
      </p>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px;">📋 Evaluación Inicial</h3>
        <p style="margin: 8px 0; color: ${colors.text.secondary}; line-height: 1.6;">
          Descarga y completa este documento antes de nuestra primera sesión. Nos ayudará a crear tu plan personalizado.
        </p>
                 <a href="https://asset.cloudinary.com/dbeem2avp/f6931c6ea72bb31622b8872d47b7ec5e" 
            style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block; margin-top: 10px;">
           📄 Descargar Evaluación
         </a>
       </div>
       
       <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Una vez completado, agenda tu llamada de consulta inicial para evaluar tus objetivos y crear tu plan personalizado:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.calendlyLink || 'https://calendly.com/mformovers/consulta-mentoria'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Agendar Consulta
        </a>
      </div>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">💡 Próximos pasos:</h3>
        <ol style="margin: 0; padding-left: 20px; color: ${colors.text.secondary}; text-align: left;">
          <li style="margin: 5px 0;">Descarga y completa la evaluación inicial</li>
          <li style="margin: 5px 0;">Agenda tu consulta de 30 minutos</li>
          <li style="margin: 5px 0;">Recibe tu plan personalizado</li>
          <li style="margin: 5px 0;">¡Comienza tu transformación!</li>
        </ol>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.CONTACT_FORM]: (data: EmailData) => {
    const content = `
      <!-- Header de notificación admin -->
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 50%, rgba(29, 78, 216, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
          Nuevo Mensaje de Contacto
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del usuario -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(59, 130, 246, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(59, 130, 246, 0.4);">
            Información del Usuario
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.name || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.email}" style="color: #3b82f6; font-size: 14px; text-decoration: none; font-weight: 500;">${data.email}</a></p>
            </div>
            ${data.reason ? `
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Motivo</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.reason}</p>
            </div>
            ` : ''}
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Asunto</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px;">${data.subject || 'Sin asunto'}</p>
            </div>
          </div>
      </div>
      
        <!-- Mensaje -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(59, 130, 246, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(59, 130, 246, 0.4);">
            Mensaje
          </h3>
          <div style="text-align: left;">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; line-height: 1.7; font-weight: 300; white-space: pre-wrap;">${data.message.replace(/\r\n/g, '\n')}</p>
          </div>
        </div>

        <!-- Footer informativo -->
        <div style="background: rgba(255, 255, 255, 0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 0; font-weight: 300; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            Este es un email automático del sistema de contacto de Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateAdmin(content);
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
      <!-- Header con acento Move Crew -->
      <div style="padding: 32px 20px 20px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08); background: linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(249, 115, 22, 0.06) 50%, rgba(251, 113, 133, 0.06) 100%);">
        <div style="color: #000000; font-size: 28px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">Restablecer contraseña</div>
        <p style="color: rgba(0, 0, 0, 0.65); font-size: 14px; margin: 0; font-weight: 400; line-height: 1.6;">Recibimos una solicitud para actualizar tu acceso. Usá el enlace seguro para continuar.</p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 26px 20px;">
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.75); line-height: 1.6; margin: 0 0 20px 0; text-align: center; font-weight: 400;">
          Si hiciste esta solicitud, tocá el botón para crear tu nueva contraseña. El enlace caduca en <strong style="font-weight: 600;">60 minutos</strong>.
        </p>

        <div style="text-align: center; margin: 10px 0 16px;">
          <a href="${data.resetLink}" style="
            display: inline-block;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%);
            color: #000000;
            padding: 14px 26px;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
            border: 1px solid rgba(245, 158, 11, 0.2);
            box-shadow: 0 2px 10px rgba(245, 158, 11, 0.12);
          ">
            Restablecer contraseña
          </a>
        </div>

        <p style="font-size: 13px; color: rgba(0, 0, 0, 0.6); line-height: 1.5; margin: 12px 0 0 0; text-align: center; font-weight: 400;">
          Si no solicitaste este cambio, ignorá este correo. Tu contraseña actual seguirá funcionando.
        </p>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.ACCOUNT_CREATED]: (data: EmailData) => {
    const content = `
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: #000000; font-size: 30px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.3px;">Tu acceso</div>
        <p style="color: rgba(0, 0, 0, 0.65); font-size: 14px; margin: 0; font-weight: 400;">Hola ${data.name || 'Mover'}, acá van tus datos de ingreso.</p>
      </div>

      <div style="padding: 24px 20px;">
        <div style="background: #f9fafb; padding: 18px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); margin-bottom: 18px;">
          <h3 style="color: #000; margin: 0 0 12px 0; font-size: 16px; font-weight: 700; text-align:center;">Credenciales</h3>
          <p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Contraseña temporal:</strong> ${data.password}</p>
        </div>

        <div style="text-align: center; margin: 22px 0 10px;">
          <a href="${data.resetLink}" style="
            display: inline-block;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%);
            color: #000000;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            border: 1px solid rgba(245, 158, 11, 0.2);
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
          ">
            Cambiar mi contraseña
          </a>
        </div>

        <p style="font-size: 13px; color: rgba(0,0,0,0.6); line-height: 1.5; margin: 10px 0 0 0; text-align: center;">
          Te sugerimos actualizarla al ingresar. Si no solicitaste este usuario, ignorá este correo.
        </p>
      </div>
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
    const primaryActionLink = data.confirmLink || data.dashboardUrl || 'https://mateomove.com/account';
    const primaryActionText = data.buttonText || (data.confirmLink ? 'Confirmar email' : 'Ir a mi cuenta');
    const message = data.message || 'Gracias por completar tu registro. Activá tu acceso y seguí el flujo sin perder tiempo.';

    const content = `
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: #000000; font-size: 30px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.3px;">¡Bienvenido!</div>
        <p style="color: rgba(0, 0, 0, 0.65); font-size: 14px; margin: 0; font-weight: 400;">Hola ${data.name || 'Mover'}, ${message}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 18px auto 0; max-width: 420px; width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1764363987/my_uploads/mails/fondoMoveCrew_1_k98l1d.png" 
                   alt="Bienvenida MForMove" 
                   width="420"
                   height="260"
                   style="width: 100%; max-width: 420px; height: auto; border-radius: 14px; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
                   border="0" />
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 24px 20px;">
        <div style="background: #f9fafb; padding: 18px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); margin-bottom: 18px;">
          <h3 style="color: #000; margin: 0 0 12px 0; font-size: 16px; font-weight: 700; text-align:center;">Tu acceso</h3>
          ${data.email ? `<p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Email:</strong> ${data.email}</p>` : ''}
          ${data.password ? `<p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Contraseña:</strong> ${data.password}</p>` : ''}
          ${!data.password ? `<p style="margin: 6px 0; color: rgba(0,0,0,0.6); font-size: 13px; text-align:center;">Usá la clave que creaste durante el registro.</p>` : ''}
        </div>

        <div style="text-align: center; margin: 22px 0 10px;">
          <a href="${primaryActionLink}" style="
            display: inline-block;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%);
            color: #000000;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            border: 1px solid rgba(245, 158, 11, 0.2);
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
          ">
            ${primaryActionText}
          </a>
        </div>

        ${data.secondaryMessage ? `<p style="font-size: 13px; color: rgba(0,0,0,0.6); line-height: 1.5; margin: 10px 0 0 0; text-align: center;">${data.secondaryMessage}</p>` : ''}
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.SUBSCRIPTION_CANCELLED]: (data: EmailData) => {
    const feedbackUrl = data.feedbackUrl || `https://mateomove.com/contact?reason=cancellation&email=${encodeURIComponent(data.email || '')}`;
    const reactivateUrl = data.reactivateUrl || 'https://mateomove.com/move-crew';
    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: #000000; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important; line-height: 1.2; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; display: block;">Tu viaje continúa</div>
        <!-- Imagen debajo del título -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto 0; max-width: 400px; width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1764426772/my_uploads/mails/fondoMoveCrew_2_do594q.png" 
                   alt="Move Crew" 
                   width="400"
                   height="267"
                   style="width: 100%; max-width: 400px; height: auto; border-radius: 10px; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
                   border="0" />
            </td>
          </tr>
        </table>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          ¡Hola <strong style="font-weight: 600;">${data.name}</strong>! Entiendo que cada camino es único y respetamos tu decisión.
        </p>

        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          Tu membresía ha sido cancelada. ${data.accessUntil ? `Tendrás acceso completo hasta el ${data.accessUntil}.` : 'Agradecemos haber sido parte de tu proceso.'}
        </p>

        <!-- Sección de feedback persuasiva -->
        <div style="background: #f9fafb; padding: 24px 20px; border-radius: 12px; margin: 24px 0;">
          <p style="font-size: 15px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 16px 0; text-align: center; font-weight: 400; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
            Tu experiencia es valiosa para nosotros. Si compartís con nosotros qué podríamos mejorar o qué te llevó a tomar esta decisión, nos ayudás a seguir creciendo y a poder ayudar a más personas en su proceso de bienestar.
          </p>
          
          <div style="text-align: center; margin: 20px 0 0;">
            <a href="${feedbackUrl}" 
               style="display: inline-block; 
                      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%); 
                      color: #000000; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 12px; 
                      font-size: 14px; 
                      font-weight: 500; 
                      font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                      border: 1px solid rgba(245, 158, 11, 0.2);
                      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);">
              Compartir mi experiencia
            </a>
      </div>
        </div>

        <!-- Mensaje de reactivación -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          Si en algún momento querés retomar tu proceso con nosotros, estaremos acá. Las puertas de Move Crew siempre están abiertas.
      </p>

        <!-- Botón CTA para reactivar -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${reactivateUrl}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%); 
                    color: #000000; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 15px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);">
            Explorar planes nuevamente
          </a>
        </div>

        <!-- Mensaje final -->
        <p style="font-size: 14px; color: rgba(0, 0, 0, 0.6); line-height: 1.6; margin: 24px 0 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          Simple, claro y sostenible. <strong style="font-weight: 600;">Hecho para acompañar tu día a día.</strong>
        </p>
      </div>
    `;
    return getBaseTemplateUser(content);
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
    const retryUrl = data.retryUrl || 'https://mateomove.com/move-crew';
    const feedbackUrl = data.feedbackUrl || `https://mateomove.com/contact?reason=payment&email=${encodeURIComponent(data.email || '')}`;
    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: #000000; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important; line-height: 1.2; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; display: block;">Tu proceso es importante</div>
        <!-- Imagen debajo del título -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto 0; max-width: 400px; width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1764426772/my_uploads/mails/fondoMoveCrew_2_do594q.png" 
                   alt="Move Crew" 
                   width="400"
                   height="267"
                   style="width: 100%; max-width: 400px; height: auto; border-radius: 10px; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
                   border="0" />
            </td>
          </tr>
        </table>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          ¡Hola <strong style="font-weight: 600;">${data.name}</strong>! Notamos que hubo un inconveniente al procesar tu pago.
      </p>

        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          Esto puede suceder por diferentes motivos: datos de tarjeta incorrectos, fondos insuficientes, o restricciones de tu banco. No te preocupes, estamos acá para ayudarte.
        </p>

        <!-- Información del intento -->
        ${data.amount || data.productName ? `
        <div style="background: #f9fafb; padding: 20px 16px; border-radius: 12px; margin: 24px 0;">
          <h3 style="color: #000000; font-size: 15px; font-weight: 500; margin: 0 0 12px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
            Detalles del intento
          </h3>
          <div style="text-align: center;">
            ${data.productName ? `<p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 6px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;"><strong style="font-weight: 500;">Plan:</strong> ${data.productName}</p>` : ''}
            ${data.amount ? `<p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 6px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;"><strong style="font-weight: 500;">Monto:</strong> $${data.amount}</p>` : ''}
            ${data.paymentDate ? `<p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 6px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;"><strong style="font-weight: 500;">Fecha:</strong> ${data.paymentDate}</p>` : ''}
      </div>
        </div>
        ` : ''}

        <!-- Sección de ayuda -->
        <div style="background: #f9fafb; padding: 24px 20px; border-radius: 12px; margin: 24px 0;">
          <p style="font-size: 15px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 16px 0; text-align: center; font-weight: 400; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
            Si necesitás ayuda o querés contarnos qué pasó, estamos acá para escucharte. Tu feedback nos ayuda a mejorar y a poder ayudar a más personas.
      </p>
          
          <div style="text-align: center; margin: 20px 0 0;">
            <a href="${feedbackUrl}" 
               style="display: inline-block; 
                      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%); 
                      color: #000000; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 12px; 
                      font-size: 14px; 
                      font-weight: 500; 
                      font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                      border: 1px solid rgba(245, 158, 11, 0.2);
                      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);">
              Necesito ayuda
            </a>
          </div>
        </div>

        <!-- Botón CTA para reintentar -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${retryUrl}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%); 
                    color: #000000; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 15px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);">
            Intentar nuevamente
          </a>
        </div>

        <!-- Mensaje final -->
        <p style="font-size: 14px; color: rgba(0, 0, 0, 0.6); line-height: 1.6; margin: 24px 0 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          Simple, claro y sostenible. <strong style="font-weight: 600;">Hecho para acompañar tu día a día.</strong>
        </p>
      </div>
    `;
    return getBaseTemplateUser(content);
  },

  [EmailType.WELCOME_MENTORSHIP]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${colors.primary.blue}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido al Programa de Mentoría!</h2>
      <p style="font-size: 16px; color: ${colors.text.secondary}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola <strong>${data.name}</strong>! Nos emociona que hayas decidido comenzar tu viaje de transformación con nuestro programa de mentoría.
      </p>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 15px 0; font-size: 18px;">📋 Evaluación Inicial</h3>
        <p style="margin: 8px 0; color: ${colors.text.secondary}; line-height: 1.6;">
          Para comenzar, descarga y completa este documento de evaluación. Nos ayudará a crear tu plan personalizado.
        </p>
                 <a href="https://asset.cloudinary.com/dbeem2avp/f6931c6ea72bb31622b8872d47b7ec5e" 
            style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block; margin-top: 10px;">
           📄 Descargar Evaluación
         </a>
      </div>
      
      <div style="background-color: ${colors.background.tertiary}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${colors.text.primary}; margin: 0 0 10px 0; font-size: 18px;">Próximos pasos:</h3>
        <ol style="margin: 0; padding-left: 20px; color: ${colors.text.secondary}; text-align: left;">
          <li style="margin: 5px 0;">Descarga y completa la evaluación inicial</li>
          <li style="margin: 5px 0;">Agenda tu primera llamada de consulta</li>
          <li style="margin: 5px 0;">Recibe tu plan personalizado</li>
          <li style="margin: 5px 0;">¡Comienza tu transformación!</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.calendlyLink || 'https://calendly.com/mformovers/consulta-mentoria'}" style="background-color: ${colors.primary.blue}; color: ${colors.text.inverse}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          📅 Agendar Primera Consulta
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.WELCOME_MEMBERSHIP]: (data: EmailData) => {
    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: #000000; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important; line-height: 1.2; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; display: block; text-align: center;">¡Bienvenido a la Move Crew!</div>
        <!-- Imagen debajo del título -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px auto 0; max-width: 400px; width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1764363987/my_uploads/mails/fondoMoveCrew_1_k98l1d.png" 
                   alt="Move Crew" 
                   width="400"
                   height="267"
                   style="width: 100%; max-width: 400px; height: auto; border-radius: 10px; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
                   border="0" />
            </td>
          </tr>
        </table>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          ¡Hola <strong style="font-weight: 600;">${data.name}</strong>! Emprendemos viaje hacia
el bienestar fisico y emocional. 
        </p>

        <!-- Sección de beneficios minimalista -->
        <div style="background: #f9fafb; padding: 20px 16px; border-radius: 12px; margin: 24px 0;">
          <h3 style="color: #000000; font-size: 17px; font-weight: 500; margin: 0 0 18px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
            Lo que incluye tu membresía
          </h3>
          <div style="text-align: left; max-width: 360px; margin: 0 auto;">
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">Acceso completo a prácticas y biblioteca de recursos</p>
      </div>
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">Comunidad privada y desafíos trimestrales</p>
            </div>
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">Material educativo y recordatorios para sostener tu proceso</p>
            </div>
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">Sesiones de entrenamiento semanales</p>
            </div>
          </div>
        </div>

        <!-- Mensaje inspiracional -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0; text-align: center; font-weight: 500; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          Simple, claro y sostenible. <strong style="font-weight: 600;">Hecho para acompañar tu día a día.</strong>
        </p>

        <!-- Botón CTA estilo MoveCrew con gradiente sutil -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${data.dashboardUrl || 'https://mateomove.com/home'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%); 
                    color: #000000; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 15px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);">
            Empezar ahora
        </a>
        </div>

        <!-- Invitación a la comunidad de Telegram -->
        <div style="text-align: center; margin: 18px 0 0;">
          <a href="${data.telegramInviteUrl || 'https://t.me/+_9hJulwT690yNWFh'}"
             style="display: inline-block;
                    background: linear-gradient(135deg, #229ED9 0%, #1a8dc5 100%);
                    color: #ffffff;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(34, 158, 217, 0.3);
                    box-shadow: 0 2px 10px rgba(34, 158, 217, 0.25);">
            Únite a la Comunidad
          </a>
          <p style="font-size: 13px; color: rgba(0, 0, 0, 0.6); line-height: 1.5; margin: 10px 0 0; text-align: center; font-weight: 400; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
            Allí compartimos avisos, soporte y las novedades de la Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateUser(content);
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
          ${data.eventLink ? `<p style="margin: 8px 0; color: ${colors.text.secondary};"><strong>Link de acceso:</strong> <a href="${data.eventLink}" style="color: ${colors.primary.blue}; text-decoration: underline;">Acceder al evento</a></p>` : `<p style="margin: 8px 0; color: ${colors.text.secondary};">El link de acceso se enviará 15 minutos antes del evento</p>`}
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
  },

  [EmailType.ADMIN_MEMBERSHIP_NOTIFICATION]: (data: EmailData) => {
    const content = `
      <!-- Header de notificación admin -->
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 50%, rgba(251, 113, 133, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
          Nueva Membresía Activa
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del nuevo miembro -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(245, 158, 11, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(245, 158, 11, 0.4);">
            Información del Nuevo Miembro
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.userName || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.userEmail}" style="color: #f59e0b; font-size: 14px; text-decoration: none; font-weight: 500;">${data.userEmail}</a></p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Usuario</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace;">${data.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Detalles de la membresía -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(245, 158, 11, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(245, 158, 11, 0.4);">
            Detalles de la Membresía
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Plan</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.planName || 'Move Crew'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Estado</p>
              <p style="margin: 0;">
                <span style="display: inline-block; background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 3px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3);">
                  Activa
                </span>
              </p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Fecha de Activación</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">${data.activationDate || new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Suscripción</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace; word-break: break-all;">${data.subscriptionId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Acción sugerida -->
        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%); padding: 16px 18px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid #f59e0b;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-align: center; font-weight: 400;">
            <strong style="color: #f59e0b; font-weight: 600;">Acción sugerida:</strong> Revisá el perfil del usuario en el panel de administración para verificar que todo esté correcto.
          </p>
        </div>

        <!-- Botones de acción -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.adminUrl || 'https://mateomove.com/admin'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 50%, rgba(251, 113, 133, 0.2) 100%); 
                    color: #ffffff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(245, 158, 11, 0.4);
                    margin: 5px;
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
            Ver en el Panel de Admin
          </a>
          <a href="mailto:${data.userEmail}" 
             style="display: inline-block; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: #ffffff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin: 5px;">
            Contactar al Usuario
          </a>
        </div>

        <!-- Footer de notificación -->
        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            Este es un email automático del sistema de notificaciones de Move Crew.
          </p>
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            Si recibiste este email por error, por favor ignorálo.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateAdmin(content);
  },

  [EmailType.ADMIN_SUBSCRIPTION_CANCELLED]: (data: EmailData) => {
    const content = `
      <!-- Header de notificación admin -->
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 50%, rgba(185, 28, 28, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
          Suscripción Cancelada
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del usuario -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(239, 68, 68, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(239, 68, 68, 0.4);">
            Información del Usuario
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.userName || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.userEmail}" style="color: #ef4444; font-size: 14px; text-decoration: none; font-weight: 500;">${data.userEmail}</a></p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Usuario</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace;">${data.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Detalles de la cancelación -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(239, 68, 68, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(239, 68, 68, 0.4);">
            Detalles de la Cancelación
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Plan</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.planName || 'Move Crew'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Fecha de Cancelación</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">${data.cancellationDate || new Date().toLocaleDateString('es-ES')}</p>
            </div>
            ${data.accessUntil ? `
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Acceso hasta</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">${data.accessUntil}</p>
            </div>
            ` : ''}
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Suscripción</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace; word-break: break-all;">${data.subscriptionId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Acción sugerida -->
        <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); padding: 16px 18px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid #ef4444;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-align: center; font-weight: 400;">
            <strong style="color: #ef4444; font-weight: 600;">Acción sugerida:</strong> Considerá contactar al usuario para entender las razones de la cancelación y ofrecer ayuda si es necesario.
          </p>
        </div>

        <!-- Botones de acción -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.adminUrl || 'https://mateomove.com/admin'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 50%, rgba(185, 28, 28, 0.2) 100%); 
                    color: #ffffff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    margin: 5px;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);">
            Ver en el Panel de Admin
          </a>
          <a href="mailto:${data.userEmail}" 
             style="display: inline-block; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: #ffffff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin: 5px;">
            Contactar al Usuario
          </a>
        </div>

        <!-- Footer de notificación -->
        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            Este es un email automático del sistema de notificaciones de Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateAdmin(content);
  },

  [EmailType.ADMIN_PAYMENT_FAILED]: (data: EmailData) => {
    const content = `
      <!-- Header de notificación admin -->
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.2) 50%, rgba(217, 119, 6, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
          Pago Fallido
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del usuario -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(245, 158, 11, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(245, 158, 11, 0.4);">
            Información del Usuario
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.userName || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.userEmail}" style="color: #f59e0b; font-size: 14px; text-decoration: none; font-weight: 500;">${data.userEmail}</a></p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Usuario</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace;">${data.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Detalles del pago fallido -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(245, 158, 11, 0.2);">
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(245, 158, 11, 0.4);">
            Detalles del Pago Fallido
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Plan</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">${data.planName || data.productName || 'Move Crew'}</p>
            </div>
            ${data.amount ? `
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Monto</p>
              <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">$${data.amount}</p>
            </div>
            ` : ''}
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Fecha del Intento</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">${data.paymentDate || new Date().toLocaleDateString('es-ES')}</p>
            </div>
            ${data.errorMessage ? `
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Error</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 13px;">${data.errorMessage}</p>
            </div>
            ` : ''}
            ${data.subscriptionId || data.invoiceId ? `
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de ${data.subscriptionId ? 'Suscripción' : 'Factura'}</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace; word-break: break-all;">${data.subscriptionId || data.invoiceId || 'N/A'}</p>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Acción sugerida -->
        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%); padding: 16px 18px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid #f59e0b;">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-align: center; font-weight: 400;">
            <strong style="color: #f59e0b; font-weight: 600;">Acción sugerida:</strong> Contactá al usuario para ayudarlo a resolver el problema de pago y evitar la pérdida de la membresía.
          </p>
        </div>

        <!-- Botones de acción -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.adminUrl || 'https://mateomove.com/admin'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.2) 50%, rgba(217, 119, 6, 0.2) 100%); 
                    color: #ffffff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(245, 158, 11, 0.4);
                    margin: 5px;
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
            Ver en el Panel de Admin
          </a>
          <a href="mailto:${data.userEmail}" 
             style="display: inline-block; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: #ffffff; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin: 5px;">
            Contactar al Usuario
          </a>
        </div>

        <!-- Footer de notificación -->
        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">
            Este es un email automático del sistema de notificaciones de Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateAdmin(content);
  },

  [EmailType.WEEKLY_LOGBOOK_RELEASE]: (data: EmailData) => {
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const monthName = monthNames[(data.month || 1) - 1];
    // Limpia nbsp y espacios múltiples
    const textClean = (data.text || '')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const durationSec = Number(data.videoDurationSeconds || 0);
    const formattedDuration = (() => {
      if (!durationSec || durationSec <= 0) return '';
      const hrs = Math.floor(durationSec / 3600);
      const mins = Math.floor((durationSec % 3600) / 60);
      const secs = Math.floor(durationSec % 60);
      const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      if (hrs > 0) return `${hrs}:${two(mins)}:${two(secs)}`;
      return `${mins}:${two(secs)}`;
    })();

    const isFirstWeek = data.isFirstWeek || data.weekNumber === 1 || data.weekNumber === '1';
    const buttonText = isFirstWeek ? 'Empezar Camino' : 'Ver Clases';
    
    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: #000000; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.3px; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important; line-height: 1.2; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; display: block; text-align: center;">El Camino del Gorila</div>
        <div style="color: rgba(0, 0, 0, 0.6); font-size: 18px; font-weight: 500; margin: 0; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif !important;">
          Semana ${data.weekNumber}
        </div>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          ¡Hola <strong style="font-weight: 600;">${data.name}</strong>! Tu contenido semanal del Camino del Gorila está listo.
        </p>

        ${data.coverImage ? `
          <div style="margin: 8px 0 24px 0;">
            <a href="${data.bitacoraLink || 'https://mateomove.com/bitacora'}" style="text-decoration: none; display: block; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; max-width: 560px; margin: 0 auto;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td style="background-image: url(${data.coverImage}); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 100px 0; position: relative; text-align: center;">
                    <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                      <tr>
                        <td style="width: 74px; height: 74px; background: rgba(0,0,0,0.65); border-radius: 50%; box-shadow: 0 6px 18px rgba(0,0,0,0.25); text-align: center; vertical-align: middle;">
                          <div style="width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 18px solid #ffffff; margin-left: 4px; display: inline-block;"></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 10px;text-align:center;">
                    <div
                      style="
                        height:5px;
                        width:100%;
                        max-width:560px;
                        margin:0 auto;
                        background: linear-gradient(90deg, rgba(245,158,11,0.35) 0%, rgba(249,115,22,0.5) 50%, rgba(251,113,133,0.35) 100%);
                        border-radius: 999px;
                      "
                    ></div>
                  </td>
                </tr>
                ${formattedDuration ? `
                <tr>
                  <td style="padding: 6px 10px 10px 10px; text-align: right;">
                    <span style="font-size: 12px; color: rgba(0,0,0,0.7); font-weight: 500; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;">0:00 / ${formattedDuration}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </a>
          </div>
        ` : ''}

        ${textClean ? `
          <div style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 auto 24px auto; text-align: center; font-weight: 300; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly; white-space: normal; max-width: 640px;">
            ${textClean.trim()}
          </div>
        ` : ''}

        <!-- Mensaje motivacional -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0; text-align: center; font-weight: 500; font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; mso-line-height-rule: exactly;">
          La constancia se recompensa, porque ahí están los resultados en el movimiento.
        </p>

        <!-- Botón CTA para ir a la bitácora -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${data.bitacoraLink || 'https://mateomove.com/bitacora'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%); 
                    color: #000000; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);">
            ${buttonText}
          </a>
        </div>
      </div>
    `;
    return getBaseTemplateUser(content);
  }
};

// Servicio principal de emails
export class EmailService {
  private static instance: any;

  private constructor() {
    // Constructor privado para patrón singleton - previene instanciación directa
    if (EmailService.instance) {
      throw new Error('Use EmailService.getInstance() instead');
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance as EmailService;
  }

  public static renderTemplate(type: EmailType, data: EmailData): string {
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Template no encontrado para el tipo: ${type}`);
    }
    return template(data);
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

      const personalTypes: EmailType[] = [
        EmailType.WEEKLY_LOGBOOK_RELEASE,
        EmailType.WELCOME_EMAIL,
        EmailType.WELCOME_MEMBERSHIP,
        EmailType.WELCOME_MENTORSHIP,
        EmailType.COURSE_COMPLETION,
        EmailType.TRANSFORMATIONAL_PROGRAM_WEEK,
        EmailType.EVENT_CONFIRMATION,
        EmailType.PRODUCT_CONFIRMATION,
        EmailType.MENTORSHIP_APPROVAL,
      ];

      const sender =
        personalTypes.includes(config.type)
          ? { from_email: 'mateo@mateomove.com', from_name: 'Mateo Molfino' }
          : { from_email: 'noreply@mateomove.com' };

      await mailchimpClient.messages.send({
        message: {
          ...sender,
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

  public async sendContactForm(data: EmailData, adminEmail: string = 'mateomolfino09@gmail.com') {
    return this.sendEmail({
      type: EmailType.CONTACT_FORM,
      to: adminEmail,
      subject: data.subject,
      data
      // NO enviar copia al usuario - este email es solo para el administrador
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

  public async sendAccountCreated(data: EmailData) {
    return this.sendEmail({
      type: EmailType.ACCOUNT_CREATED,
      to: data.email,
      subject: 'Tu acceso a MForMove',
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
      subject: 'Tu viaje continúa - Move Crew',
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
      subject: 'Tu proceso es importante - Move Crew',
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

  public async sendAdminMembershipNotification(data: EmailData, adminEmail: string = 'mateomolfino09@gmail.com') {
    return this.sendEmail({
      type: EmailType.ADMIN_MEMBERSHIP_NOTIFICATION,
      to: adminEmail,
      subject: `Nueva Membresía Activa - ${data.userName || data.userEmail}`,
      data
    });
  }

  public async sendAdminSubscriptionCancelled(data: EmailData, adminEmail: string = 'mateomolfino09@gmail.com') {
    return this.sendEmail({
      type: EmailType.ADMIN_SUBSCRIPTION_CANCELLED,
      to: adminEmail,
      subject: `Suscripción Cancelada - ${data.userName || data.userEmail}`,
      data
    });
  }

  public async sendAdminPaymentFailed(data: EmailData, adminEmail: string = 'mateomolfino09@gmail.com') {
    return this.sendEmail({
      type: EmailType.ADMIN_PAYMENT_FAILED,
      to: adminEmail,
      subject: `Pago Fallido - ${data.userName || data.userEmail}`,
      data
    });
  }
}

// Exportar instancia singleton
export const emailService = EmailService.getInstance(); 