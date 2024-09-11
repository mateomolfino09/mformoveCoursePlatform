import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import User from '../../../models/userModel';
import validateCaptcha from './validateCaptcha';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { getCurrentURL } from '../assets/getCurrentURL';

connectDB();
const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);


const forget = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { email, captcha } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ error: 'No hemos encontrado ningún usuario con ese email' });
      }

      const validCaptcha = await validateCaptcha(captcha);

      if (!validCaptcha) {
        return res.status(422).json({
          error: 'Captcha Invalido'
        });
      }

      const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d'
      });

      user.resetToken = token;
      await user.save();

      let origin = getCurrentURL(); 
         const link = `${origin}/reset/${token}`;
      const title = `<h1>Restablece tu contraseña</h1>`;

      const message = `
      <div>     
       <div>
       <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
        <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Restablecer contraseña</a>
       </button>
       </div>
       <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
       <hr style="height:2px;background-color:#221f1f;border:none">       
      </div> `;

      const response = await mailchimpClient.messages.send({
        message: {
          from_email: 'noreply@mateomove.com', // Replace with your sender email
          subject: 'Resetear contraseña',
          text: message,
          to: [
            {
              email: 'noreply@mateomove.com',
              type: 'to',
            },
          ],
        },
      });

      console.log(response)

      // let resp = sendEmail({
      //   title: title,
      //   name: `Hola, ${user.name}:`,
      //   content:
      //     'Restablezcamos tu contraseña para que puedas seguir disfrutando Video Stream.',
      //   message: message,
      //   to: `Video Stream te envió este mensaje a [${user.email}] como parte de tu membresía.`,
      //   subject: 'Resetear contraseña'
      // });

      return res.status(200).json({
        message: `Se ha enviado un mail a ${user.email}, revisa tu correo porfavor.`
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Hubo un error al enviar un mail a tu cuenta`
    });
  }
};

export default forget;
