import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import { sendEmail } from '../../../../../helpers/sendEmail';
import User from '../../../../../models/userModel';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { getCurrentURL } from '../../../assets/getCurrentURL';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
      const { email } = await req.json();
      const user = await User.findOne({ email });
      console.log(email)

      if (!user) {
        return NextResponse.json({ message: 'No se ha encontrado ningun usuario con ese email', type: 'error'}, { status: 404 })
      }

      const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d'
      });
      console.log(user);

      user.resetToken = token;
      await user.save();

      let origin = getCurrentURL();    
      
      const link = `${origin}/resetEmail/${token}`;
      const title = `<h1 style="color:black">Restablece tu email</h1>`;
      const message = `
      <div>     
      <div>
      <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
       <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Resetear email </a>
      </button>
      </div>
      <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
      <hr style="height:2px;background-color:#221f1f;border:none">       
     </div>`;

      let resp = sendEmail({
        title: title,
        name: `Hola, ${user.name}:`,
        content:
          'Restablezcamos tu email para que puedas seguir disfrutando de Video Stream.',
        message: message,
        to: [{
          email: user.email,
          name: user.name
        }], 
        subject: 'Resetear Email'
      });
      return NextResponse.json({ message: `Email enviado a ${user.email}, porfavor checkea tu email`}, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`, type: 'error'}, { status: 500 })
  }
};
