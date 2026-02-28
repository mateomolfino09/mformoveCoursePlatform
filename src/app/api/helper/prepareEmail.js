import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import Question from '../../../models/questionModel';
import Users from '../../../models/userModel';

connectDB();

export const prepareEmail = async (titulo, link, action, user, contenido, subject ) => {
  try {
    const title = `<h1>${titulo}</h1>`;

    // Paleta Move Crew: ink #141411, stone #787867, cream #FAF8F4
    const font = "'Source Sans 3', Helvetica, Arial, sans-serif";
    const message = `
    <div style="font-family:${font};font-weight:300;">
        <div style="margin:20px 0 24px;">
        <a href="${link}" style="display:inline-block;color:#FAF8F4;background:#141411;text-decoration:none;font-weight:400;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;padding:12px 28px;border-radius:9999px;font-family:${font}">${action}</a>
        </div>
        <p style="font-size:12px;font-weight:300;color:#787867;margin:20px 0 24px;letter-spacing:0.02em">El equipo de Move Crew.</p>
        <hr style="height:1px;background:#787867;border:none;opacity:0.2">
    </div>`;

    let resp = sendEmail({
    title: title,
    name: `Hola, ${user.name}:`,
    content: contenido,
    message: message,
    to: [{
      email: user.email,
      name: user.name
    }], 
    subject: subject,
    });

    //   let resp = sendEmail({
    //     title: `${title}`,
    //     name: `Hola, ${user.name}:`,
    //     content: `Hubo un error al comprar "${course.name}" con número de órden ${merchant_order_id} e Id de Pago ${payment_id}`,
    //     message: message,
    //     to: `Lavis te envió este mensaje a [${user.email}] como parte de tu membresía.`,
    //     subject: `Órden nro ${merchant_order_id}`
    //   });
  } catch (error) {
    }
};
