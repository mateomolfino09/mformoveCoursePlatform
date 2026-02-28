import connectDB from '../../../../config/connectDB';
import Exam from '../../../../models/examModel';
import IndividualClass from '../../../../models/individualClassModel';
import Users from '../../../../models/userModel';
import { getConfirmedUsers } from '../../user/getConfirmedUsers';
import getVimeoVideo from '../getVimeoVideo.ts';
import Mailchimp from '@mailchimp/mailchimp_transactional';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

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
        moduleId,
        userEmail,
        description,
        videoId,
        isFree,
        tags
      } = await req.json();

      let user = await Users.findOne({ email: userEmail });
      const users = await Users.find({});

      // Es Admin?

      if (user.rol !== 'Admin' || user?.admin?.coursesAvailable <= 0) {
        return NextResponse.json(
          { error: 'Este usuario no tiene permisos para crear un curso' },
          { status: 422 }
        );
      }

      // Busco video subido a Vimeo

      const vimeoVideo = await getVimeoVideo(videoId);

      const hours = Math.floor(vimeoVideo?.duration / 3600);
      const minutes = Math.floor((vimeoVideo?.duration % 3600) / 60);
      const seconds = vimeoVideo?.duration % 60;

      const lastClass = await IndividualClass.find().sort({ _id: -1 }).limit(1);

      let createdTags = [];
      if (!!tags) {
        createdTags = tags?.map((tag, index) => ({
          id: index + 1, 
          title: tag.trim()
        }));
      }

      const ClassModuleModel = (await import('../../../../models/classModuleModel')).default;
      let effectiveModuleId = moduleId;
      if (!effectiveModuleId) {
        const firstModule = await ClassModuleModel.findOne({ isActive: true }).sort({ createdAt: 1 }).select('_id slug').lean();
        if (firstModule) effectiveModuleId = firstModule._id;
      }
      let typeValue = typeId;
      if (effectiveModuleId) {
        const module_ = await ClassModuleModel.findById(effectiveModuleId).select('slug').lean();
        if (module_) typeValue = module_.slug;
      }
      if (!typeValue) typeValue = 'general';

      const newClass = await new IndividualClass({
        id: JSON.stringify(lastClass) != '[]' ? lastClass[0].id + 1 : 1,
        name,
        image_url,
        description,
        totalTime: vimeoVideo?.duration.toString(),
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        level,
        type: typeValue,
        moduleId: effectiveModuleId || undefined,
        isFree: isFree,
        image_base_link: vimeoVideo?.pictures?.base_link,
        html: vimeoVideo?.embed?.html,
        link: videoId,
        tags: createdTags // Asociamos los tags creados
      }).save();

      let notNewClass = await IndividualClass.findOne().skip(9).exec();
      if (notNewClass) {
        notNewClass.new = false;
        await notNewClass.save();
      }

      const mailchimpClient = Mailchimp(
        process.env.MAILCHIMP_TRANSACTIONAL_API_KEY
      );

      const usuarios = await getConfirmedUsers();
      const baseUrl = process.env.BASE_URL;
      const message = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333333; text-align: center;">¡Nueva Clase Disponible!</h2>
            <p style="font-size: 16px; color: #666666; text-align: center;">
              Una nueva clase ha sido subida y está disponible para ti. ¡Revisa los detalles a continuación y continúa tu aprendizaje!
            </p>
            <div style="margin: 20px 0; text-align: center;">
              <a href="https://www.mateomove.com//classes/${newClass.id}" style="color: #007BFF; text-decoration: none; font-size: 18px; font-weight: bold;">
                ${name}
              </a>
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
              © 2025 MForMove. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `;

      const envioMail = await Promise.all(
        usuarios.users.map(async (user) => {
          if (user?.isVip || user?.subscription?.active) {
            try {
              return await mailchimpClient.messages.send({
                message: {
                  from_email: 'noreply@mateomove.com',
                  subject: 'Nueva Clase Disponible',
                  html: message,
                  to: [{ email: user.email, type: 'to' }]
                }
              });
            } catch (error) {
              console.error(`Error enviando email a ${user.email}:`, error);
              return null;
            }
          }
          return null;
        })
      );

      return NextResponse.json(
        { message: 'Clase individual creada con éxito' },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }
}
