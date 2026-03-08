import mailchimp from '@mailchimp/mailchimp_transactional';
import { palette } from '../../constants/colors';

const p = palette;
const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || "");

// Logo MMOVE fino: imagen (reemplazar URL por tu asset) o texto fino
const LOGO_URLS = {
  DARK: 'https://res.cloudinary.com/dbeem2avp/image/upload/logo/MMOVE_fino_negro.png',
  LIGHT: 'https://res.cloudinary.com/dbeem2avp/image/upload/logo/MMOVE_fino_blanco.png'
} as const;

// Estilo minimalista Move Crew: tipografía fina, botones pill
const EMAIL_BRAND = {
  teamName: 'Move Crew',
  copyright: 'MMOVE',
  font: "'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontWeightLight: 300,
  fontWeightNormal: 400,
  // Botón fino: borde sutil, texto ink/sage, pill
  btnStyle: (href: string, label: string, isDarkBg = false) =>
    `<a href="${href}" style="display:inline-block;color:${isDarkBg ? p.white : p.ink};background:transparent;border:1px solid ${isDarkBg ? 'rgba(250,248,244,0.4)' : 'rgba(20,20,17,0.25)'};text-decoration:none;font-weight:400;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;padding:12px 28px;border-radius:9999px;font-family:${EMAIL_BRAND.font};transition:opacity 0.2s;">${label}</a>`,
  btnStyleFilled: (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;color:${p.white};background:${p.ink};text-decoration:none;font-weight:400;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;padding:12px 28px;border-radius:9999px;font-family:${EMAIL_BRAND.font};border:none;">${label}</a>`,
};

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
  WEEKLY_LOGBOOK_RELEASE = 'weekly_logbook_release',
  ONBOARDING_WELCOME = 'onboarding_welcome',
  MOVE_CREW_EVENT_REMINDER = 'move_crew_event_reminder',
  MOVE_CREW_EVENT_REMINDER_15M = 'move_crew_event_reminder_15m',
  /** Grabación de sesión en vivo disponible en el camino (tras reemplazar evento por clase individual). */
  LIVE_SESSION_RECORDING_AVAILABLE = 'live_session_recording_available',
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
  /** Fecha/hora UTC en ISO para envío programado (Mandrill send_at). Si se indica, el email se programa en lugar de enviarse de inmediato. */
  sendAt?: string;
}

// Fuente fina Move Crew (minimalista, alineada al sitio)
const EMAIL_FONT = EMAIL_BRAND.font;

// Logo MMOVE en texto fino (sin depender de imagen; estética minimalista)
const LOGO_HTML_DARK = `<span style="font-family:${EMAIL_FONT};font-weight:300;letter-spacing:0.2em;font-size:16px;color:${p.ink};text-transform:uppercase;">MMOVE</span>`;
const LOGO_HTML_LIGHT = `<span style="font-family:${EMAIL_FONT};font-weight:300;letter-spacing:0.2em;font-size:16px;color:${p.white};text-transform:uppercase;">MMOVE</span>`;

// Base template HTML para usuarios (minimalista, fino, Move Crew)
const getBaseTemplateUser = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]>
    <style type="text/css">body, table, td { font-family: Arial, sans-serif !important; }</style>
    <![endif]-->
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
      body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      h1, h2, h3, p, span, a { font-family: ${EMAIL_FONT} !important; font-weight: 300 !important; }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${p.cream}; font-family: ${EMAIL_FONT}; font-weight: 300; -webkit-font-smoothing: antialiased;">
    <div style="background-color: ${p.cream}; padding: 32px 16px;">
      <div style="max-width: 520px; margin: 0 auto; background-color: ${p.white}; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(20, 20, 17, 0.04);">
        <div style="padding: 28px 24px 24px; text-align: center; border-bottom: 1px solid rgba(120, 120, 103, 0.12);">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr><td style="text-align: center;">${LOGO_HTML_DARK}</td></tr>
          </table>
        </div>
      ${content}
        <div style="padding: 24px; text-align: center; border-top: 1px solid rgba(120, 120, 103, 0.12);">
          <p style="font-size: 12px; color: ${p.stone}; margin: 0 0 6px 0; font-weight: 300; letter-spacing: 0.02em;">El equipo de ${EMAIL_BRAND.teamName}</p>
          <p style="font-size: 11px; color: ${p.stone}; margin: 0; font-weight: 300; opacity: 0.7;">© 2025 ${EMAIL_BRAND.copyright}. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

// Base template HTML para admin (fondo ink, minimalista, Move Crew)
const getBaseTemplateAdmin = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500&display=swap" rel="stylesheet">
  </head>
  <body style="margin: 0; padding: 0; background-color: ${p.ink}; font-family: ${EMAIL_FONT}; font-weight: 300;">
    <div style="background-color: ${p.ink}; padding: 32px 16px;">
      <div style="max-width: 520px; margin: 0 auto; background-color: rgba(250, 248, 244, 0.03); padding: 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(250, 248, 244, 0.08);">
        <div style="padding: 28px 24px 24px; text-align: center; border-bottom: 1px solid rgba(250, 248, 244, 0.08);">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr><td style="text-align: center;">${LOGO_HTML_LIGHT}</td></tr>
          </table>
        </div>
        ${content}
        <div style="padding: 24px; text-align: center; border-top: 1px solid rgba(250, 248, 244, 0.08);">
          <p style="font-size: 12px; color: ${p.white}; margin: 0 0 6px 0; font-weight: 300; opacity: 0.8; letter-spacing: 0.02em;">El equipo de ${EMAIL_BRAND.teamName}</p>
          <p style="font-size: 11px; color: ${p.white}; margin: 0; font-weight: 300; opacity: 0.5;">© 2025 ${EMAIL_BRAND.copyright}. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

// Mantener compatibilidad con código existente
const getBaseTemplate = getBaseTemplateUser;

/** Mail crudo/minimalista: fondo del dispositivo (sin color), texto oscuro, alineado a la izquierda (estilo personal). */
const getMinimalPersonalTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;font-family:'Source Sans 3',Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;text-align:left;">
      ${content}
    </div>
  </body>
  </html>
`;

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
      <h2 style="color: ${p.white}; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Solicitud de Mentoría</h2>
      
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">Información del Solicitante:</h3>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Nombre:</strong> ${data.nombre}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Email:</strong> ${data.email}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Ubicación:</strong> ${data.paisCiudad}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>WhatsApp:</strong> ${data.whatsapp}</p>
      </div>
      
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">Detalles de la Solicitud:</h3>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Intereses:</strong> ${data.interesadoEn.join(', ')}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Donde entrena:</strong> ${data.dondeEntrena}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Nivel actual:</strong> ${data.nivelActual}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Principal freno:</strong> ${data.principalFreno}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Presupuesto:</strong> ${data.presupuesto}</p>
      </div>
      
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">¿Por qué te eligió?</h3>
        <p style="margin: 5px 0; color: ${p.stone}; line-height: 1.6;">${data.porQueElegirme}</p>
      </div>
      
      ${data.comentarios ? `
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">Comentarios adicionales:</h3>
        <p style="margin: 5px 0; color: ${p.stone}; line-height: 1.6;">${data.comentarios}</p>
      </div>
      ` : ''}
      
      <div style="text-align: center; margin: 28px 0;">
        ${EMAIL_BRAND.btnStyleFilled(data.adminUrl || 'https://mateomove.com/admin/mentorship/requests', 'Ver solicitud en el panel')}
      </div>
    `;
    return getBaseTemplateAdmin(content);
  },

  [EmailType.MENTORSHIP_APPROVAL]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">Solicitud de Mentoría Aprobada</h2>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.nombre}</strong>, hemos revisado tu solicitud de mentoría y estamos listos para comenzar.
      </p>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Para preparar tu consulta inicial, te comparto el documento de evaluaciones que necesitarás completar:
      </p>
      
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px;">📋 Evaluación Inicial</h3>
        <p style="margin: 8px 0; color: ${p.stone}; line-height: 1.6;">
          Descarga y completa este documento antes de nuestra primera sesión. Nos ayudará a crear tu plan personalizado.
        </p>
        <div style="margin-top: 12px;">${EMAIL_BRAND.btnStyleFilled('https://asset.cloudinary.com/dbeem2avp/f6931c6ea72bb31622b8872d47b7ec5e', 'Descargar evaluación')}</div>
       </div>
       
       <p style="font-size: 14px; color: ${p.stone}; line-height: 1.6; margin-bottom: 28px; text-align: center; font-weight: 300;">
        Una vez completado, agenda tu llamada de consulta inicial para evaluar tus objetivos y crear tu plan personalizado:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        ${EMAIL_BRAND.btnStyleFilled(data.calendlyLink || 'https://calendly.com/mformovers/consulta-mentoria', 'Agendar consulta')}
      </div>
      
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">💡 Próximos pasos:</h3>
        <ol style="margin: 0; padding-left: 20px; color: ${p.stone}; text-align: left;">
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
      <div style="background: linear-gradient(135deg, rgba(7, 70, 71, 0.25) 0%, rgba(0, 27, 28, 0.3) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: ${p.white}; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Nuevo Mensaje de Contacto
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del usuario -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(250, 248, 244, 0.15);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Información del Usuario
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.name || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.email}" style="color: ${p.sage}; font-size: 14px; text-decoration: none; font-weight: 500;">${data.email}</a></p>
            </div>
            ${data.reason ? `
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Motivo</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.reason}</p>
            </div>
            ` : ''}
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Asunto</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px;">${data.subject || 'Sin asunto'}</p>
            </div>
          </div>
      </div>
      
        <!-- Mensaje -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(250, 248, 244, 0.15);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Mensaje
          </h3>
          <div style="text-align: left;">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; line-height: 1.7; font-weight: 300; white-space: pre-wrap;">${data.message.replace(/\r\n/g, '\n')}</p>
          </div>
        </div>

        <!-- Footer informativo -->
        <div style="background: rgba(255, 255, 255, 0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 0; font-weight: 300; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            Este es un email automático del sistema de contacto de Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateAdmin(content);
  },

  [EmailType.SUBSCRIPTION_UPDATE]: (data: EmailData) => {
    const content = `
      <div style="padding: 32px 24px;">
        <h2 style="color: ${p.ink}; text-align: center; font-size: 20px; font-weight: 400; margin: 0 0 12px 0; letter-spacing: 0.02em;">${data.title}</h2>
        <p style="font-size: 14px; color: ${p.stone}; text-align: center; line-height: 1.65; margin: 0 0 28px 0; font-weight: 300;">
          ${data.message}
        </p>
        <div style="text-align: center;">
          ${EMAIL_BRAND.btnStyleFilled(data.buttonLink, data.buttonText)}
        </div>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.PASSWORD_RESET]: (data: EmailData) => {
    const content = `
      <div style="padding: 32px 24px;">
        <h2 style="color: ${p.ink}; text-align: center; font-size: 18px; font-weight: 400; margin: 0 0 8px 0; letter-spacing: 0.02em;">Restablecer contraseña</h2>
        <p style="color: ${p.stone}; font-size: 13px; margin: 0 0 24px 0; font-weight: 300; line-height: 1.6; text-align: center;">Recibimos una solicitud para actualizar tu acceso. Usá el enlace seguro para continuar.</p>
        <p style="font-size: 13px; color: ${p.stone}; line-height: 1.6; margin: 0 0 20px 0; text-align: center; font-weight: 300;">
          Si hiciste esta solicitud, tocá el botón para crear tu nueva contraseña. El enlace caduca en <strong style="font-weight: 400;">60 minutos</strong>.
        </p>
        <div style="text-align: center; margin: 0 0 20px 0;">
          ${EMAIL_BRAND.btnStyleFilled(data.resetLink, 'Restablecer contraseña')}
        </div>
        <p style="font-size: 12px; color: ${p.stone}; line-height: 1.5; margin: 0; text-align: center; font-weight: 300; opacity: 0.9;">
          Si no solicitaste este cambio, ignorá este correo. Tu contraseña actual seguirá funcionando.
        </p>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.ACCOUNT_CREATED]: (data: EmailData) => {
    const content = `
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 12px 0; letter-spacing: 0.02em;">Tu acceso</div>
        <p style="color: rgba(0, 0, 0, 0.65); font-size: 14px; margin: 0; font-weight: 300;">Hola ${data.name || 'Mover'}, acá van tus datos de ingreso.</p>
      </div>

      <div style="padding: 24px 20px;">
        <div style="background: ${p.cream}; padding: 18px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); margin-bottom: 18px;">
          <h3 style="color: ${p.ink}; margin: 0 0 12px 0; font-size: 16px; font-weight: 700; text-align:center;">Credenciales</h3>
          <p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Contraseña temporal:</strong> ${data.password}</p>
        </div>

        <div style="text-align: center; margin: 22px 0 10px;">
          <a href="${data.resetLink}" style="
            display: inline-block;
            background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%);
            color: ${p.ink};
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            border: 1px solid rgba(7, 70, 71, 0.2);
            box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);
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
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Nueva Clase Disponible!</h2>
      <p style="font-size: 16px; color: ${p.stone}; text-align: center; line-height: 1.6; margin-bottom: 30px;">
        Una nueva clase ha sido subida y está disponible para ti. ¡Revisa los detalles a continuación y continúa tu aprendizaje!
      </p>
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <a href="${data.classUrl}" style="color: ${p.sage}; text-decoration: none; font-size: 18px; font-weight: bold;">
          ${data.className}
        </a>
        <p style="font-size: 14px; color: ${p.stone}; margin-top: 10px;">${data.classDescription}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.classUrl}" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Ver Clase
        </a>
      </div>
      <p style="font-size: 14px; color: ${p.stone}; text-align: center;">
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
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 12px 0; letter-spacing: 0.02em;">¡Bienvenido!</div>
        <p style="color: rgba(0, 0, 0, 0.65); font-size: 14px; margin: 0; font-weight: 300;">Hola ${data.name || 'Mover'}, ${message}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 18px auto 0; max-width: 420px; width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0;">
              <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1764363987/my_uploads/mails/fondoMoveCrew_1_k98l1d.png" 
                   alt="Bienvenida Move Crew" 
                   width="420"
                   height="260"
                   style="width: 100%; max-width: 420px; height: auto; border-radius: 14px; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;"
                   border="0" />
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 24px 20px;">
        <div style="background: ${p.cream}; padding: 18px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); margin-bottom: 18px;">
          <h3 style="color: ${p.ink}; margin: 0 0 12px 0; font-size: 16px; font-weight: 700; text-align:center;">Tu acceso</h3>
          ${data.email ? `<p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Email:</strong> ${data.email}</p>` : ''}
          ${data.password ? `<p style="margin: 6px 0; color: rgba(0,0,0,0.75); font-size: 14px; text-align:center;"><strong>Contraseña:</strong> ${data.password}</p>` : ''}
          ${!data.password ? `<p style="margin: 6px 0; color: rgba(0,0,0,0.6); font-size: 13px; text-align:center;">Usá la clave que creaste durante el registro.</p>` : ''}
        </div>

        <div style="text-align: center; margin: 22px 0 10px;">
          <a href="${primaryActionLink}" style="
            display: inline-block;
            background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%);
            color: ${p.ink};
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            border: 1px solid rgba(7, 70, 71, 0.2);
            box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);
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
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 16px 0; letter-spacing: 0.02em; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; line-height: 1.2;">Tu viaje continúa</div>
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
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          ¡Hola ${data.name}! Entiendo que cada camino es único y respetamos tu decisión.
        </p>

        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Tu membresía ha sido cancelada. ${data.accessUntil ? `Tendrás acceso completo hasta el ${data.accessUntil}.` : 'Agradecemos haber sido parte de tu proceso.'}
        </p>

        <!-- Sección de feedback persuasiva -->
        <div style="background: ${p.cream}; padding: 24px 20px; border-radius: 12px; margin: 24px 0;">
          <p style="font-size: 15px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 16px 0; text-align: center; font-weight: 400; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
            Tu experiencia es valiosa para nosotros. Si compartís con nosotros qué podríamos mejorar o qué te llevó a tomar esta decisión, nos ayudás a seguir creciendo y a poder ayudar a más personas en su proceso de bienestar.
          </p>
          
          <div style="text-align: center; margin: 20px 0 0;">
            <a href="${feedbackUrl}" 
               style="display: inline-block; 
                      background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                      color: ${p.ink}; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 12px; 
                      font-size: 14px; 
                      font-weight: 500; 
                      font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                      border: 1px solid rgba(7, 70, 71, 0.2);
                      box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
              Compartir mi experiencia
            </a>
      </div>
        </div>

        <!-- Mensaje de reactivación -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Si en algún momento querés retomar tu proceso con nosotros, estaremos acá. Las puertas de Move Crew siempre están abiertas.
      </p>

        <!-- Botón CTA para reactivar -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${reactivateUrl}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                    color: ${p.ink}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 15px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(7, 70, 71, 0.2);
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
            Explorar planes nuevamente
          </a>
        </div>

        <!-- Mensaje final -->
        <p style="font-size: 14px; color: rgba(0, 0, 0, 0.6); line-height: 1.6; margin: 24px 0 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Simple, claro y sostenible. <strong style="font-weight: 600;">Hecho para acompañar tu día a día.</strong>
        </p>
      </div>
    `;
    return getBaseTemplateUser(content);
  },

  [EmailType.PAYMENT_SUCCESS]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Pago Exitoso!</h2>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola ${data.name}! Tu pago ha sido procesado exitosamente.
      </p>
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">Detalles del pago:</h3>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Producto:</strong> ${data.productName}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Monto:</strong> $${data.amount}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Fecha:</strong> ${data.paymentDate}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>ID de transacción:</strong> ${data.transactionId}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.accessUrl || 'https://mateomove.com/account'}" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
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
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 16px 0; letter-spacing: 0.02em; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; line-height: 1.2;">Tu proceso es importante</div>
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
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          ¡Hola ${data.name}! Notamos que hubo un inconveniente al procesar tu pago.
      </p>

        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Esto puede suceder por diferentes motivos: datos de tarjeta incorrectos, fondos insuficientes, o restricciones de tu banco. No te preocupes, estamos acá para ayudarte.
        </p>

        <!-- Información del intento -->
        ${data.amount || data.productName ? `
        <div style="background: ${p.cream}; padding: 20px 16px; border-radius: 12px; margin: 24px 0;">
          <h3 style="color: ${p.ink}; font-size: 15px; font-weight: 500; margin: 0 0 12px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
            Detalles del intento
          </h3>
          <div style="text-align: center;">
            ${data.productName ? `<p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 6px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;"><strong style="font-weight: 500;">Plan:</strong> ${data.productName}</p>` : ''}
            ${data.amount ? `<p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 6px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;"><strong style="font-weight: 500;">Monto:</strong> $${data.amount}</p>` : ''}
            ${data.paymentDate ? `<p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 6px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;"><strong style="font-weight: 500;">Fecha:</strong> ${data.paymentDate}</p>` : ''}
      </div>
        </div>
        ` : ''}

        <!-- Sección de ayuda -->
        <div style="background: ${p.cream}; padding: 24px 20px; border-radius: 12px; margin: 24px 0;">
          <p style="font-size: 15px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 16px 0; text-align: center; font-weight: 400; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
            Si necesitás ayuda o querés contarnos qué pasó, estamos acá para escucharte. Tu feedback nos ayuda a mejorar y a poder ayudar a más personas.
      </p>
          
          <div style="text-align: center; margin: 20px 0 0;">
            <a href="${feedbackUrl}" 
               style="display: inline-block; 
                      background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                      color: ${p.ink}; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 12px; 
                      font-size: 14px; 
                      font-weight: 500; 
                      font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                      border: 1px solid rgba(7, 70, 71, 0.2);
                      box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
              Necesito ayuda
            </a>
          </div>
        </div>

        <!-- Botón CTA para reintentar -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${retryUrl}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                    color: ${p.ink}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 15px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(7, 70, 71, 0.2);
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
            Intentar nuevamente
          </a>
        </div>

        <!-- Mensaje final -->
        <p style="font-size: 14px; color: rgba(0, 0, 0, 0.6); line-height: 1.6; margin: 24px 0 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Simple, claro y sostenible. <strong style="font-weight: 600;">Hecho para acompañar tu día a día.</strong>
        </p>
      </div>
    `;
    return getBaseTemplateUser(content);
  },

  [EmailType.WELCOME_MENTORSHIP]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Bienvenido al Programa de Mentoría!</h2>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola ${data.name}! Nos emociona que hayas decidido comenzar tu viaje de transformación con nuestro programa de mentoría.
      </p>
      
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px;">📋 Evaluación Inicial</h3>
        <p style="margin: 8px 0; color: ${p.stone}; line-height: 1.6;">
          Para comenzar, descarga y completa este documento de evaluación. Nos ayudará a crear tu plan personalizado.
        </p>
        <div style="margin-top: 12px;">${EMAIL_BRAND.btnStyleFilled('https://asset.cloudinary.com/dbeem2avp/f6931c6ea72bb31622b8872d47b7ec5e', 'Descargar evaluación')}</div>
      </div>
      
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 16px; font-weight: 400;">Próximos pasos:</h3>
        <ol style="margin: 0; padding-left: 20px; color: ${p.stone}; text-align: left;">
          <li style="margin: 5px 0;">Descarga y completa la evaluación inicial</li>
          <li style="margin: 5px 0;">Agenda tu primera llamada de consulta</li>
          <li style="margin: 5px 0;">Recibe tu plan personalizado</li>
          <li style="margin: 5px 0;">¡Comienza tu transformación!</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin: 28px 0;">
        ${EMAIL_BRAND.btnStyleFilled(data.calendlyLink || 'https://calendly.com/mformovers/consulta-mentoria', 'Agendar consulta')}
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.WELCOME_MEMBERSHIP]: (data: EmailData) => {
    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 16px 0; letter-spacing: 0.02em; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; line-height: 1.2; text-align: center;">¡Bienvenido a la Move Crew!</div>
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
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          ¡Hola ${data.name}! Emprendemos viaje hacia
el bienestar fisico y emocional. 
        </p>

        <!-- Sección de beneficios minimalista -->
        <div style="background: ${p.cream}; padding: 20px 16px; border-radius: 12px; margin: 24px 0;">
          <h3 style="color: ${p.ink}; font-size: 17px; font-weight: 500; margin: 0 0 18px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
            Lo que incluye tu membresía
          </h3>
          <div style="text-align: left; max-width: 360px; margin: 0 auto;">
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">Acceso completo a prácticas y biblioteca de recursos</p>
      </div>
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">Comunidad privada y desafíos trimestrales</p>
            </div>
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">Material educativo y recordatorios para sostener tu proceso</p>
            </div>
            <div style="margin: 12px 0; display: flex; align-items: flex-start;">
              <span style="color: rgba(0, 0, 0, 0.4); font-size: 14px; margin-right: 10px; line-height: 1.4;">•</span>
              <p style="color: rgba(0, 0, 0, 0.7); font-size: 14px; margin: 0; line-height: 1.5; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">Sesiones de entrenamiento semanales</p>
            </div>
          </div>
        </div>

        <!-- Mensaje inspiracional -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0; text-align: center; font-weight: 500; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Simple, claro y sostenible. <strong style="font-weight: 600;">Hecho para acompañar tu día a día.</strong>
        </p>

        <!-- Botón CTA estilo MoveCrew con gradiente sutil -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${data.dashboardUrl || 'https://mateomove.com/library'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                    color: ${p.ink}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 15px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(7, 70, 71, 0.2);
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
            Empezar ahora
        </a>
        </div>

        <!-- Invitación a la comunidad de WhatsApp -->
        <div style="text-align: center; margin: 18px 0 0;">
          <a href="${data.whatsappInviteUrl || data.telegramInviteUrl || 'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo'}"
             style="display: inline-block;
                    background: ${p.sage};
                    color: ${p.ink};
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(172, 174, 137, 0.5);
                    box-shadow: 0 2px 10px rgba(172, 174, 137, 0.3);">
            Comunidad WhatsApp
          </a>
          <p style="font-size: 13px; color: rgba(0, 0, 0, 0.6); line-height: 1.5; margin: 10px 0 0; text-align: center; font-weight: 400; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
            Allí compartimos avisos, soporte y las novedades de la Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateUser(content);
  },

  [EmailType.COURSE_COMPLETION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Curso Completado!</h2>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Felicitaciones ${data.name}! Has completado exitosamente el curso.
      </p>
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">Detalles del curso:</h3>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Curso:</strong> ${data.courseName}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Fecha de finalización:</strong> ${data.completionDate}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Calificación:</strong> ${data.grade || 'N/A'}</p>
      </div>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        ¡Sigue así! Tu dedicación y esfuerzo te están llevando a alcanzar tus objetivos.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.nextCourseUrl || 'https://mateomove.com/courses'}" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Explorar Próximo Curso
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.REMINDER_EMAIL]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">Recordatorio de Entrenamiento</h2>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola ${data.name}! Te recordamos que tienes contenido pendiente por revisar.
      </p>
      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 18px;">Contenido pendiente:</h3>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Curso:</strong> ${data.courseName}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Clase:</strong> ${data.className}</p>
        <p style="margin: 5px 0; color: ${p.stone};"><strong>Duración estimada:</strong> ${data.duration}</p>
      </div>
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        Mantén la consistencia en tu entrenamiento para ver los mejores resultados.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.classUrl}" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Continuar Entrenamiento
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.EVENT_CONFIRMATION]: (data: EmailData) => {
    const isOnline = data.isOnline;
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">Reserva Confirmada</h2>
      
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.customerName}</strong>, tu reserva para <strong>${data.eventName}</strong> ha sido confirmada exitosamente.
      </p>

      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Detalles del Evento</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Fecha:</strong> ${data.eventDate}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Hora:</strong> ${data.eventTime}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Modalidad:</strong> ${isOnline ? 'Online' : 'Presencial'}</p>
          ${!isOnline ? `<p style="margin: 8px 0; color: ${p.stone};"><strong>Ubicación:</strong> ${data.eventLocation}</p>` : ''}
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Monto pagado:</strong> ${data.amount}</p>
        </div>
      </div>

      ${isOnline ? `
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información para Evento Online</h3>
        <div style="text-align: center;">
          ${data.eventLink ? `<p style="margin: 8px 0; color: ${p.stone};"><strong>Link de acceso:</strong> <a href="${data.eventLink}" style="color: ${p.sage}; text-decoration: underline;">Acceder al evento</a></p>` : `<p style="margin: 8px 0; color: ${p.stone};">El link de acceso se enviará 15 minutos antes del evento</p>`}
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Grabación:</strong> ${data.recordingInfo}</p>
        </div>
      </div>
      ` : `
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información para Evento Presencial</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Llegada:</strong> ${data.arrivalInstructions}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Traer:</strong> ${data.whatToBring}</p>
        </div>
      </div>
      `}

      ${data.beneficios && data.beneficios.length > 0 ? `
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Tu Reserva Incluye</h3>
        <ul style="margin: 0; padding-left: 20px; text-align: left;">
          ${data.beneficios.map((beneficio: string) => `
            <li style="margin: 8px 0; color: ${p.stone};">• ${beneficio}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.eventPageUrl}" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; margin: 0 10px;">
          Ver Detalles del Evento
        </a>
      </div>

      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">¿Necesitas ayuda?</h3>
        <p style="margin: 5px 0; color: ${p.stone}; text-align: center;">
          Si tienes alguna pregunta, no dudes en contactarnos:
        </p>
        <p style="margin: 5px 0; color: ${p.stone}; text-align: center;">
          <strong>Email:</strong> <a href="mailto:${data.supportEmail}" style="color: ${p.sage}; text-decoration: underline;">${data.supportEmail}</a>
        </p>
      </div>

      <p style="font-size: 14px; color: ${p.stone}; text-align: center; margin-top: 20px;">
        <strong>ID de reserva:</strong> ${data.sessionId}
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.PRODUCT_CONFIRMATION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">Compra Confirmada</h2>
      
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        Hola <strong>${data.customerName}</strong>, tu compra de <strong>${data.productName}</strong> ha sido confirmada exitosamente.
      </p>

      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Detalles de la Compra</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Producto:</strong> ${data.productName}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Descripción:</strong> ${data.productDescription}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Monto pagado:</strong> ${data.amount}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.productPageUrl}" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; margin: 0 10px;">
          Ver Producto
        </a>
      </div>

      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">¿Necesitas ayuda?</h3>
        <p style="margin: 5px 0; color: ${p.stone}; text-align: center;">
          Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos:
        </p>
        <p style="margin: 5px 0; color: ${p.stone}; text-align: center;">
          <strong>Email:</strong> <a href="mailto:${data.supportEmail}" style="color: ${p.sage}; text-decoration: underline;">${data.supportEmail}</a>
        </p>
      </div>

      <p style="font-size: 14px; color: ${p.stone}; text-align: center; margin-top: 20px;">
        <strong>ID de compra:</strong> ${data.sessionId}
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.TRANSFORMATIONAL_PROGRAM_WEEK]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Nuevo Contenido Disponible!</h2>
      
      <p style="font-size: 16px; color: ${p.stone}; line-height: 1.6; margin-bottom: 20px; text-align: center;">
        ¡Hola ${data.name}! Tu contenido de la Semana ${data.semana} ya está disponible.
      </p>

      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Esta Semana: ${data.titulo}</h3>
        <p style="margin: 8px 0; color: ${p.stone}; text-align: center; line-height: 1.6;">
          Es momento de continuar tu viaje de transformación. Tu nuevo contenido ya está disponible y listo para que lo explores.
        </p>
      </div>

      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 16px; text-align: center;">🎯 Lo que aprenderás esta semana:</h4>
        <ul style="margin: 0; padding-left: 20px; text-align: left;">
          <li style="margin: 8px 0; color: ${p.stone};">Fundamentos sólidos para tu práctica</li>
          <li style="margin: 8px 0; color: ${p.stone};">Ejercicios específicos para tu nivel</li>
          <li style="margin: 8px 0; color: ${p.stone};">Reflexiones para profundizar tu conexión</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mateomove.com/programa-transformacional/semana-${data.semana}" 
           style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          🎬 Ver Contenido de la Semana ${data.semana}
        </a>
      </div>

      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">💡 Recuerda:</h3>
        <p style="margin: 5px 0; color: ${p.stone}; text-align: center; line-height: 1.6;">
          La consistencia es clave. Dedica al menos 30 minutos diarios a tu práctica para obtener los mejores resultados.
        </p>
      </div>

      <div style="background-color: ${p.cream}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 10px 0; font-size: 16px; text-align: center;">👥 Comunidad</h3>
        <p style="margin: 5px 0; color: ${p.stone}; text-align: center; line-height: 1.6;">
          ¡No estás solo en este viaje! Únete a la comunidad para compartir experiencias y recibir apoyo.
        </p>
      </div>

      <p style="font-size: 14px; color: ${p.stone}; text-align: center; margin-top: 20px;">
        ¡Nos vemos en la próxima sesión en vivo!
      </p>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.ADMIN_NOTIFICATION]: (data: EmailData) => {
    const content = `
      <h2 style="color: ${p.sage}; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Compra Realizada</h2>
      
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información del Cliente</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Nombre:</strong> ${data.customerName}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Email:</strong> ${data.customerEmail}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Teléfono:</strong> ${data.customerPhone}</p>
        </div>
      </div>

      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Detalles de la Compra</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Producto:</strong> ${data.productName}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Tipo:</strong> ${data.productType}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Monto:</strong> ${data.amount}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Fecha de pago:</strong> ${data.paymentDate}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>ID de sesión:</strong> ${data.sessionId}</p>
        </div>
      </div>

      ${data.productType === 'evento' ? `
      <div style="background-color: ${p.cream}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: ${p.ink}; margin: 0 0 15px 0; font-size: 18px; text-align: center;">Información del Evento</h3>
        <div style="text-align: center;">
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Fecha del evento:</strong> ${data.eventDate}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Ubicación:</strong> ${data.eventLocation}</p>
          <p style="margin: 8px 0; color: ${p.stone};"><strong>Modalidad:</strong> ${data.isOnline ? 'Online' : 'Presencial'}</p>
          ${data.cupo ? `<p style="margin: 8px 0; color: ${p.stone};"><strong>Cupo:</strong> ${data.cupo} personas</p>` : ''}
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mateomove.com/admin" style="background-color: ${p.sage}; color: ${p.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
          Ver en el Panel de Admin
        </a>
      </div>
    `;
    return getBaseTemplate(content);
  },

  [EmailType.ADMIN_MEMBERSHIP_NOTIFICATION]: (data: EmailData) => {
    const content = `
      <!-- Header de notificación admin -->
      <div style="background: linear-gradient(135deg, rgba(7, 70, 71, 0.25) 0%, rgba(172, 174, 137, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: ${p.white}; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Nueva Membresía Activa
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del nuevo miembro -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(7, 70, 71, 0.2);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Información del Nuevo Miembro
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.userName || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.userEmail}" style="color: ${p.sage}; font-size: 14px; text-decoration: none; font-weight: 500;">${data.userEmail}</a></p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Usuario</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace;">${data.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Detalles de la membresía -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(7, 70, 71, 0.2);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Detalles de la Membresía
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Plan</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.planName || 'Move Crew'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Estado</p>
              <p style="margin: 0;">
                <span style="display: inline-block; background: rgba(172, 174, 137, 0.25); color: ${p.sage}; padding: 3px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid rgba(172, 174, 137, 0.4);">
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
        <div style="background: linear-gradient(135deg, rgba(7, 70, 71, 0.1) 0%, rgba(172, 174, 137, 0.12) 100%); padding: 16px 18px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid ${p.sage};">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-align: center; font-weight: 400;">
            <strong style="color: ${p.sage}; font-weight: 600;">Acción sugerida:</strong> Revisá el perfil del usuario en el panel de administración para verificar que todo esté correcto.
          </p>
        </div>

        <!-- Botones de acción -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.adminUrl || 'https://mateomove.com/admin'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.25) 0%, rgba(172, 174, 137, 0.2) 100%); 
                    color: ${p.white}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(250, 248, 244, 0.25);
                    margin: 5px;
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.12);">
            Ver en el Panel de Admin
          </a>
          <a href="mailto:${data.userEmail}" 
             style="display: inline-block; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: ${p.white}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin: 5px;">
            Contactar al Usuario
          </a>
        </div>

        <!-- Footer de notificación -->
        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            Este es un email automático del sistema de notificaciones de Move Crew.
          </p>
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
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
      <div style="background: linear-gradient(135deg, rgba(120, 120, 103, 0.2) 0%, rgba(7, 70, 71, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: ${p.white}; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Suscripción Cancelada
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del usuario -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(250, 248, 244, 0.15);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Información del Usuario
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.userName || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.userEmail}" style="color: ${p.stone}; font-size: 14px; text-decoration: none; font-weight: 500;">${data.userEmail}</a></p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Usuario</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace;">${data.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Detalles de la cancelación -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(250, 248, 244, 0.15);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Detalles de la Cancelación
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Plan</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.planName || 'Move Crew'}</p>
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
        <div style="background: linear-gradient(135deg, rgba(120, 120, 103, 0.15) 0%, rgba(7, 70, 71, 0.1) 100%); padding: 16px 18px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid ${p.stone};">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-align: center; font-weight: 400;">
            <strong style="color: ${p.stone}; font-weight: 600;">Acción sugerida:</strong> Considerá contactar al usuario para entender las razones de la cancelación y ofrecer ayuda si es necesario.
          </p>
        </div>

        <!-- Botones de acción -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.adminUrl || 'https://mateomove.com/admin'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(120, 120, 103, 0.2) 0%, rgba(7, 70, 71, 0.2) 100%); 
                    color: ${p.white}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(250, 248, 244, 0.25);
                    margin: 5px;
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.12);">
            Ver en el Panel de Admin
          </a>
          <a href="mailto:${data.userEmail}" 
             style="display: inline-block; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: ${p.white}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin: 5px;">
            Contactar al Usuario
          </a>
        </div>

        <!-- Footer de notificación -->
        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
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
      <div style="background: linear-gradient(135deg, rgba(7, 70, 71, 0.25) 0%, rgba(172, 174, 137, 0.2) 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <h1 style="color: ${p.white}; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.3px; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Pago Fallido
        </h1>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0; font-weight: 300; text-transform: uppercase; letter-spacing: 0.8px;">
          Notificación para Administrador
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <!-- Información del usuario -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(7, 70, 71, 0.2);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Información del Usuario
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Nombre</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.userName || 'No disponible'}</p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Email</p>
              <p style="margin: 0;"><a href="mailto:${data.userEmail}" style="color: ${p.sage}; font-size: 14px; text-decoration: none; font-weight: 500;">${data.userEmail}</a></p>
            </div>
            <div style="margin: 10px 0; padding: 10px 0;">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">ID de Usuario</p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 13px; font-family: monospace;">${data.userId || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Detalles del pago fallido -->
        <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%); padding: 20px 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(7, 70, 71, 0.2);">
          <h3 style="color: ${p.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding-bottom: 10px; border-bottom: 2px solid rgba(250, 248, 244, 0.25);">
            Detalles del Pago Fallido
          </h3>
          <div style="text-align: left;">
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Plan</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">${data.planName || data.productName || 'Move Crew'}</p>
            </div>
            ${data.amount ? `
            <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 3px 0; color: rgba(255, 255, 255, 0.5); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">Monto</p>
              <p style="margin: 0; color: ${p.white}; font-size: 14px; font-weight: 500;">$${data.amount}</p>
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
        <div style="background: linear-gradient(135deg, rgba(7, 70, 71, 0.1) 0%, rgba(172, 174, 137, 0.12) 100%); padding: 16px 18px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid ${p.sage};">
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; text-align: center; font-weight: 400;">
            <strong style="color: ${p.sage}; font-weight: 600;">Acción sugerida:</strong> Contactá al usuario para ayudarlo a resolver el problema de pago y evitar la pérdida de la membresía.
          </p>
        </div>

        <!-- Botones de acción -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.adminUrl || 'https://mateomove.com/admin'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.25) 0%, rgba(172, 174, 137, 0.2) 100%); 
                    color: ${p.white}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(250, 248, 244, 0.25);
                    margin: 5px;
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.12);">
            Ver en el Panel de Admin
          </a>
          <a href="mailto:${data.userEmail}" 
             style="display: inline-block; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: ${p.white}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin: 5px;">
            Contactar al Usuario
          </a>
        </div>

        <!-- Footer de notificación -->
        <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <p style="font-size: 11px; color: rgba(255, 255, 255, 0.4); margin: 3px 0; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            Este es un email automático del sistema de notificaciones de Move Crew.
          </p>
        </div>
      </div>
    `;
    return getBaseTemplateAdmin(content);
  },

  [EmailType.MOVE_CREW_EVENT_REMINDER]: (data: EmailData) => {
    const escapeHtml = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const name = escapeHtml(data.name || 'Miembro');
    const fecha = escapeHtml(data.eventDateFormatted || '');
    const zoomLink = (data.zoomLink || '').trim();
    const linkHtml = zoomLink ? `<a href="${escapeHtml(zoomLink)}" style="color:#074647;text-decoration:underline;">${escapeHtml(zoomLink)}</a>` : '';
    const content = `
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Hola ${name},</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Te recuerdo - tenemos clase hoy ${fecha} - empezamos en una hora.</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;"><strong>Sumate acá:</strong> ${linkHtml}</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">¡Nos vemos ahí!</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 24px 0;">Mateo</p>
    `;
    return getMinimalPersonalTemplate(content);
  },

  [EmailType.MOVE_CREW_EVENT_REMINDER_15M]: (data: EmailData) => {
    const escapeHtml = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const name = escapeHtml(data.name || 'Miembro');
    const zoomLink = (data.zoomLink || '').trim();
    const linkHtml = zoomLink ? `<a href="${escapeHtml(zoomLink)}" style="color:#074647;text-decoration:underline;">${escapeHtml(zoomLink)}</a>` : '';
    const content = `
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Hola ${name},</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Empezamos en 15 minutos.</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;"><strong>Sumate acá:</strong> ${linkHtml}</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">¡Nos vemos ahí!</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 24px 0;">Mateo</p>
    `;
    return getMinimalPersonalTemplate(content);
  },

  [EmailType.LIVE_SESSION_RECORDING_AVAILABLE]: (data: EmailData) => {
    const escapeHtml = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const fullName = (data.name || 'Miembro').toString().trim();
    const firstName = fullName ? fullName.split(/\s+/)[0]?.trim() || fullName : '';
    const name = escapeHtml(firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : 'Miembro');
    const pathUrl = (data.pathUrl || '').trim() || 'https://mateomove.com/weekly-path';
    const content = `
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Hola ${name},</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Acabamos de terminar la sesión en vivo, y estuvo genial. Si estuviste presente, gracias. Si no pudiste venir, no te preocupes, habrá más.</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">Estoy comprometido a ofrecer al menos una sesión en vivo por semana. Estas sesiones son una parte fundamental de la comunidad: una oportunidad para practicar juntos, hacer preguntas y recibir orientación en tiempo real. Quiero verlos a todos ahí.</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 16px 0;">La sesión en vivo está disponible en la plataforma. La podés ver en el camino semanal y cuando termine el camino quedará publicada como clase para que veas cuando quieras.</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 24px 0;">¡Qué placer compartir el movimiento juntos!</p>
      <p style="font-size:16px;color:#1a1a1a;line-height:1.6;margin:0 0 24px 0;">Mateo</p>
      <div style="text-align: left; margin: 28px 0 0 0;">
        <a href="${escapeHtml(pathUrl)}" style="display:inline-block;color:#fff;background:#1a1a1a;text-decoration:none;font-weight:400;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;padding:12px 28px;border-radius:9999px;font-family:'Source Sans 3',Helvetica,Arial,sans-serif;">Ver la clase en el camino</a>
      </div>
    `;
    return getMinimalPersonalTemplate(content);
  },

  [EmailType.WEEKLY_LOGBOOK_RELEASE]: (data: EmailData) => {
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const monthName = monthNames[(data.month || 1) - 1];
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

    const escapeHtml = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const weekContentsDetail = (data.weekContentsDetail || []) as Array<{ type: string; title: string; description?: string; moduleName?: string; dayLabel?: string }>;
    const hasContentsList = weekContentsDetail.length > 0;
    const contentsListHtml = hasContentsList
      ? `
        <div style="margin: 0 auto 24px auto; max-width: 560px;">
          ${weekContentsDetail
            .map(
              (item) => `
            <div style="border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; background: rgba(0,0,0,0.02);">
              ${(item as any).dayLabel ? `<div style="font-size: 11px; color: rgba(0,0,0,0.55); font-weight: 600; margin-bottom: 4px;">${escapeHtml((item as any).dayLabel)}</div>` : ''}
              ${item.moduleName ? `<div style="font-size: 11px; color: rgba(0,0,0,0.55); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${escapeHtml(item.moduleName)}</div>` : ''}
              <div style="font-size: 15px; font-weight: 600; color: ${p.ink}; margin-bottom: ${item.description ? '6px' : '0'}; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${escapeHtml(item.title)}</div>
              ${item.description ? `<div style="font-size: 14px; color: rgba(0,0,0,0.75); line-height: 1.5; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${escapeHtml(item.description)}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      `
      : '';

    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 16px 0; letter-spacing: 0.02em; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; line-height: 1.2; text-align: center;">El Camino</div>
        <div style="color: rgba(0, 0, 0, 0.6); font-size: 16px; font-weight: 300; margin: 0; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; letter-spacing: 0.02em;">
          Semana ${data.weekNumber}
        </div>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          Hola ${data.name}, ya está disponible la semana ${data.weekNumber} del Camino. Acá te dejo todo para que organices tu semana :)
        </p>

        ${data.coverImage ? `
          <div style="margin: 8px 0 24px 0;">
            <a href="${data.bitacoraLink || 'https://mateomove.com/weekly-path'}" style="text-decoration: none; display: block; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; max-width: 560px; margin: 0 auto;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td style="background-image: url(${data.coverImage}); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 100px 0; position: relative; text-align: center;">
                    <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin: 0 auto;">
                      <tr>
                        <td style="width: 74px; height: 74px; background: rgba(0,0,0,0.65); border-radius: 50%; box-shadow: 0 6px 18px rgba(0,0,0,0.25); text-align: center; vertical-align: middle;">
                          <div style="width: 0; height: 0; border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-left: 18px solid ${p.white}; margin-left: 4px; display: inline-block;"></div>
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
                        background: linear-gradient(90deg, rgba(7,70,71,0.25) 0%, rgba(172,174,137,0.35) 50%, rgba(7,70,71,0.25) 100%);
                        border-radius: 999px;
                      "
                    ></div>
                  </td>
                </tr>
                ${formattedDuration ? `
                <tr>
                  <td style="padding: 6px 10px 10px 10px; text-align: right;">
                    <span style="font-size: 12px; color: rgba(0,0,0,0.7); font-weight: 500; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">0:00 / ${formattedDuration}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </a>
          </div>
        ` : ''}

        ${hasContentsList ? contentsListHtml : textClean ? `
          <div style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 auto 24px auto; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly; white-space: normal; max-width: 640px;">
            ${textClean.trim()}
          </div>
        ` : ''}

        <!-- Cierre en voz de Mateo -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0 8px 0; text-align: center; font-weight: 500; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          La constancia hace la diferencia. Nos vemos ahí.
        </p>
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">Mateo</p>

        <!-- Botón CTA para ir al camino -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${data.bitacoraLink || 'https://mateomove.com/weekly-path'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                    color: ${p.ink}; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(7, 70, 71, 0.2);
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
            ${buttonText}
          </a>
        </div>
      </div>
    `;
    return getBaseTemplateUser(content);
  },

  [EmailType.ONBOARDING_WELCOME]: (data: EmailData) => {
    const content = `
      <!-- Header minimalista -->
      <div style="padding: 32px 20px 24px; text-align: center; border-bottom: 1px solid rgba(0, 0, 0, 0.08);">
        <div style="color: ${p.ink}; font-size: 28px; font-weight: 300; margin: 0 0 16px 0; letter-spacing: 0.02em; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important; line-height: 1.2; text-align: center;">¡Bienvenido a la Move Crew!</div>
        <div style="color: rgba(0, 0, 0, 0.6); font-size: 18px; font-weight: 500; margin: 0; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;">
          Primer Círculo
        </div>
        <div style="margin: 18px auto 0; text-align: center;">
          <img src="https://res.cloudinary.com/dbeem2avp/image/upload/v1764363987/my_uploads/mails/moveCrewBienvenida_bipiwj.png"
               alt="Move Crew"
               width="520"
               height="320"
               style="display: block; width: 100%; max-width: 520px; height: auto; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); margin: 0 auto;" />
        </div>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 28px 20px;">
        <p style="font-size: 16px; color: rgba(0, 0, 0, 0.8); line-height: 1.6; margin: 0 0 24px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          ¡Hola ${data.name}! Tu viaje en Move Crew comienza ahora.
        </p>

        <!-- Mensaje motivacional -->
        <p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.6; margin: 24px 0; text-align: center; font-weight: 500; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
          La constancia se recompensa, porque ahí están los resultados en el movimiento.
        </p>

        <!-- Botón CTA para comenzar onboarding -->
        <div style="text-align: center; margin: 28px 0 0;">
          <a href="${data.onboardingLink || 'https://mateomove.com/onboarding/bienvenida'}" 
             style="display: inline-block; 
                    background: linear-gradient(135deg, rgba(7, 70, 71, 0.08) 0%, rgba(172, 174, 137, 0.12) 100%); 
                    color: ${p.ink}; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 12px; 
                    font-size: 16px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    border: 1px solid rgba(7, 70, 71, 0.2);
                    box-shadow: 0 2px 8px rgba(7, 70, 71, 0.08);">
            Comenzar Primer Círculo
          </a>
        </div>

        <!-- Link a WhatsApp -->
        <div style="text-align: center; margin: 24px 0 0; padding-top: 24px; border-top: 1px solid rgba(0, 0, 0, 0.08);">
          <p style="font-size: 13px; color: rgba(0, 0, 0, 0.7); line-height: 1.5; margin: 0 0 10px 0; text-align: center; font-weight: 300; font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif; mso-line-height-rule: exactly;">
            Solicitá acceso a El Camino, Biblioteca y Laboratorio.
          </p>
          <a href="${data.whatsappInviteUrl || data.telegramInviteUrl || 'https://chat.whatsapp.com/LgVResfArGjIn9qByXXUSo'}" 
             target="_blank"
             rel="noopener noreferrer"
             style="display: inline-block; 
                    background: ${p.sage}; 
                    color: ${p.ink}; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-size: 14px; 
                    font-weight: 600; 
                    font-family: 'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            Unite a la Crew (WhatsApp)
          </a>
          <p style="font-size: 12px; color: rgba(0, 0, 0, 0.6); margin: 8px 0 0 0; line-height: 1.4;">
            Acceso directo al grupo privado para soporte, avisos y novedades.
          </p>
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
  public async sendEmail(config: EmailConfig): Promise<{ success: boolean; message: string; error?: string; scheduledId?: string }> {
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
        EmailType.MOVE_CREW_EVENT_REMINDER,
        EmailType.MOVE_CREW_EVENT_REMINDER_15M,
        EmailType.LIVE_SESSION_RECORDING_AVAILABLE,
        EmailType.WELCOME_EMAIL,
        EmailType.ONBOARDING_WELCOME,
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

      const payload: { message: any; send_at?: string } = {
        message: {
          ...sender,
          subject: config.subject,
          html: html,
          to: allRecipients,
        },
      };
      // Mandrill espera send_at en formato "YYYY-MM-DD HH:MM:SS" (UTC), no ISO con T y Z
      if (config.sendAt) {
        const d = new Date(config.sendAt);
        if (!Number.isNaN(d.getTime())) {
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          const h = String(d.getUTCHours()).padStart(2, '0');
          const min = String(d.getUTCMinutes()).padStart(2, '0');
          const s = String(d.getUTCSeconds()).padStart(2, '0');
          payload.send_at = `${y}-${m}-${day} ${h}:${min}:${s}`;
        } else {
          payload.send_at = config.sendAt;
        }
      }
      const response = await mailchimpClient.messages.send(payload);
      const scheduledId = config.sendAt && Array.isArray(response) && response[0] && (response[0] as any)._id
        ? (response[0] as any)._id
        : undefined;

      return {
        success: true,
        message: `Email enviado exitosamente a ${recipients.join(', ')}`,
        ...(scheduledId && { scheduledId })
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

  /** Cancela un email programado en Mandrill por su id (devuelto al programar con send_at). */
  public async cancelScheduledEmail(mandrillScheduledId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await mailchimpClient.messages.cancelScheduled({ id: mandrillScheduledId });
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error al cancelar email programado:', error);
      return { success: false, error: error?.message };
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
      subject: 'Tu acceso a Move Crew',
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
      subject: '¡Bienvenido a Move Crew!',
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
      subject: '¡Bienvenido a la Move Crew!',
      data
    });
  }

  public async sendOnboardingWelcome(data: EmailData) {
    return this.sendEmail({
      type: EmailType.ONBOARDING_WELCOME,
      to: data.email,
      subject: '¡Bienvenido a Move Crew! - El Primer Círculo',
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