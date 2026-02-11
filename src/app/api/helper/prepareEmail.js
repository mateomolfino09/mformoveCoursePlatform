import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import Question from '../../../models/questionModel';
import Users from '../../../models/userModel';

connectDB();

export const prepareEmail = async (titulo, link, action, user, contenido, subject ) => {
  try {
    const title = `<h1>${titulo}</h1>`;

    // Paleta tailwind: ink #141411, stone #787867, cream #FAF8F4, teal #074647
    const message = `
    <div>
        <div>
        <a href="${link}" style="display:inline-block;background-color:#074647;color:#FAF8F4;text-decoration:none;font-weight:500;font-size:14px;padding:12px 24px;border-radius:8px;font-family:'Source Sans 3',Helvetica,Arial,sans-serif">${action}</a>
        </div>
        <p style="font-size:14px;font-weight:400;color:#141411;margin:20px 0 24px;font-family:'Source Sans 3',Helvetica,Arial,sans-serif">El equipo de MForMove.</p>
        <hr style="height:1px;background-color:#787867;border:none;opacity:0.3">
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
