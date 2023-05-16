import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import Users from '../../../models/userModel';
import validateCaptcha from './validateCaptcha';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();

const register = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { email, password, firstname, lastname, gender, country, captcha } =
        req.body;

      const validCaptcha = await validateCaptcha(captcha);

      if (!validCaptcha) {
        return res.status(422).json({
          error: 'Unprocessable request, Invalid captcha code.'
        });
      }

      const user = await Users.findOne({ email: email });
      if (user) {
        return res
          .status(422)
          .json({ error: 'Este usuario ya fue registrado' });
      }

      const HashedPassword = await bcrypt.hash(password, 12);
      const newUser = await new Users({
        email: email,
        password: HashedPassword,
        name: `${firstname} ${lastname}`,
        gender: gender,
        country: country
      }).save();

      const token = jwt.sign(
        { _id: newUser._id },
        process.env.NEXTAUTH_SECRET,
        {
          expiresIn: '30d'
        }
      );

      newUser.emailToken = token;

      await newUser.save();

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
        name: `Hola, ${newUser.name}:`,
        content:
          'Confirma tu email para poder empezar a disfrutar de Video Stream.',
        message: message,
        to: `Video Stream te envió este mensaje a [${newUser.email}] como parte de tu membresía.`,
        subject: 'Confirmar Mail'
      });

      return res.status(200).json({
        message: `Email enviado a ${newUser.email}, porfavor chequea tu correo.`
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: `Error al enviar un mail a ${newUser.email}. Porfavor vuelva a intentarlo`
    });
  }
};

export default register;
