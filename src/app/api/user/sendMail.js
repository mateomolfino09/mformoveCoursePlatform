import mailchimp from '@mailchimp/mailchimp_transactional';

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || "");

export default async function sendMailGrid(name, email, msg, subject) {
  try {
    const message = `
        Nombre : ${name} \r\n
        Email : ${email} \r\n
        Subject : ${subject} \r\n
        Mensaje : ${msg} \r\n
        `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #234C8C; text-align: center; font-size: 24px; margin-bottom: 20px;">${subject}</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0; color: #666666;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 5px 0; color: #666666;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0; color: #666666;"><strong>Asunto:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Mensaje:</h3>
            <p style="margin: 5px 0; color: #666666; line-height: 1.6;">${msg.replace(/\r\n/g, '<br>')}</p>
          </div>
          
          <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
            Sistema de Contacto MForMove
          </p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999999; text-align: center;">
            © 2025 MForMove. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;

    await mailchimpClient.messages.send({
      message: {
        from_email: "noreply@mateomove.com",
        subject: subject,
        html: emailHtml,
        to: [
          { email: email, type: "to" },
          { email: 'hello@mateomolfino.com', type: "cc" },
          { email: 'mateomolfino09@gmail.com', type: "bcc" }
        ],
      },
    });
    
    return 'Ok';
  } catch (error) {
    console.error('Error al enviar email:', error);
    return error;
  }
}
