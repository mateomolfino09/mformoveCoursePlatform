import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import Users from '../../../models/userModel';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();

const resendTokenValidate = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { email } = req.body;

      const user = await Users.findOne({ email: email });

      if (!user) {
        return res.status(404).json({ error: 'No se encontró este usuario' });
      }
      if (!user.validEmail === 'not') {
        return res
          .status(422)
          .json({ error: 'Este usuario ya fue verificado' });
      }

      const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d'
      });

      user.emailToken = token;

      await user.save();

      const { origin } = absoluteUrl(req);
      const link = `${origin}/src/user/email/${token}`;
      const title = `<h1>Confirma tu email</h1>`;
      const message = `
        <div>     
        <div>
        <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
         <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Confirmar email </a>
        </button>
        </div>
        <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
        <hr style="height:2px;background-color:#221f1f;border:none">       
       </div>`;

      let resp = sendEmail({
        title: title,
        name: `Hola, ${user.name}:`,
        content:
          'Confirma tu email para poder empezar a disfrutar de Video Stream.',
        message: message,
        to: `Video Stream te envió este mensaje a [${user.email}] como parte de tu membresía.`,
        subject: 'Confirmar Mail'
      });

      return res.status(200).json({
        message: `Email enviado a ${user.email}, porfavor chequea tu correo.`
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export default resendTokenValidate;
