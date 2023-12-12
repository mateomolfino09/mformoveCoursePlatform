import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../config/connectDB';
import { sendEmail } from '../../../helpers/sendEmail';
import User from '../../../models/userModel';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();

export async function POST(req: NextRequest) {
    try {
    if (req.method === 'POST') {
        const { courseGroupId, link, titulo, contenido, action, subject } = await req.json();

        const users = await User.find({ "courses.id": courseGroupId }).lean().exec();

        console.log(users)

      const title: string = `<h1>${titulo}</h1>`;

      const message: string = `
      <div>     
       <div>
       <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
        <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">${action}</a>
       </button>
       </div>
       <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
       <hr style="height:2px;background-color:#221f1f;border:none">       
      </div> `;

        users.forEach(user => {
            let resp = sendEmail({
              title: title,
              name: `Hola, ${user.name}:`,
              content: contenido,
              message: message,
              to: `MForMove te envió este mensaje a [${user.email}] como parte de tu membresía.`,
              subject: subject,
            });
        })


      return NextResponse.json({ message: `Se ha enviado el mail al grupo de usuarios correctamente.`}, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ error: `Hubo un error al enviar un mail al grupo de usuarios`}, { status: 500 })
  }
};
