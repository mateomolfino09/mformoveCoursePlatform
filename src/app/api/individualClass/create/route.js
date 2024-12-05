import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import Exam from '../../../../models/examModel'
import { courseTypeConst } from '../../../../constants/courseType';
import { NextResponse } from 'next/server';
import getVimeoVideo from '../getVimeoVideo.ts'
import { ObjectId } from 'mongodb';
import { getConfirmedUsers } from '../../user/getConfirmedUsers';
import Mailchimp from '@mailchimp/mailchimp_transactional';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
      const {
        name,
        image_url,
        totalTime,
        level,
        typeId,
        userEmail,
        description,
        videoId,
        isFree
      } = await req.json();

      console.log(level)


      const mailchimpClient = Mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);

      const usuarios = await getConfirmedUsers();
      const message = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333333; text-align: center;">¡Nueva Clase Disponible!</h2>
          <p style="font-size: 16px; color: #666666; text-align: center;">
            Una nueva clase ha sido subida y está disponible para ti. ¡Revisa los detalles a continuación y continúa tu aprendizaje!
          </p>
          <div style="margin: 20px 0; text-align: center;">
            <h3 style="color: #007BFF; margin-bottom: 10px;">${name}</h3>
            <p style="font-size: 14px; color: #333333;">${description}</p>
          </div>
          <p style="font-size: 14px; color: #999999; text-align: center;">
            Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
          </p>
          <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
            El equipo de MForMove
          </p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999999; text-align: center;">
            © 2024 MForMove. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;
    
    const envioMail = await Promise.all(
      usuarios.map(async (user) => {
        if (user.isVip) {
          try {
            return await mailchimpClient.messages.send({
              message: {
                from_email: 'noreply@mateomove.com', // Reemplazar con tu correo de remitente
                subject: 'Nueva Clase Disponible',  // Cambia el asunto
                html: message,
                to: [{ email: user.email, type: 'to' }],
              },
            });
          } catch (error) {
            console.error(`Error enviando email a ${user.email}:`, error);
            return null; // Opcional: Para evitar que se rompa el flujo
          }
        }
        return null;
      })
    );

      let user = await Users.findOne({ email: userEmail }); 
      const users = await Users.find({});

      //Es Admin?

      if (user.rol !== 'Admin' || user?.admin?.coursesAvailable <= 0) {
        return NextResponse.json({error: 'Este usuario no tiene permisos para crear un curso'}, { status: 422 })

      }
      user.admin.active = true;

      //Busco video subido a Vimeo

      const vimeoVideo = await getVimeoVideo(videoId)

      const hours = Math.floor(vimeoVideo.duration / 3600);
      const minutes = Math.floor((vimeoVideo.duration % 3600) / 60);
      const seconds = vimeoVideo.duration % 60;

      const lastClass = await IndividualClass.find().sort({ _id: -1 }).limit(1);

      const newClass = await new IndividualClass({
        id: JSON.stringify(lastClass) != '[]' ? lastClass[0].id + 1 : 1,
        name,
        image_url,
        description,
        totalTime: vimeoVideo.duration.toString(),
        seconds,
        minutes,
        hours,
        level,
        type: typeId,
        isFree: isFree,
        image_base_link: vimeoVideo.pictures.base_link,
        html: vimeoVideo.embed.html,
        link: videoId,

      }).save();

      let notNewClass = await IndividualClass.findOne().skip(9).exec();
      if(notNewClass) {
        notNewClass.new = false
        await notNewClass.save()
      }

      
          
    


      


      return NextResponse.json({ message: 'Clase individual creada con éxito'}, { status: 200 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 401 })
  }
};

