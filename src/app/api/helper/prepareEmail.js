import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import Question from '../../../models/questionModel';
import Users from '../../../models/userModel';

connectDB();

export const prepareEmail = async (titulo, link, action, user, contenido, subject ) => {
  try {
    const title = `<h1>${titulo}</h1>`;

    const message = `
    <div>     
        <div>
        <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
        <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">${action}</a>
        </button>
        </div>
        <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de MForMove.</p>
        <hr style="height:2px;background-color:#221f1f;border:none">       
    </div> `;

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
    console.log(error.message);
  }
};
