import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';
import User from '../../../../../models/userModel';
import { titles } from '../../../../../constants/emailTitles'
import dLocalApi from '../../dlocalTest';
import { ObjectId } from 'mongodb';
import mailchimp from '@mailchimp/mailchimp_transactional';

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);
connectDB();
export async function PUT(req) {
    try {
    const {
        planId,
        subscriptionId,
        id,
        message
        } = await req.json();
    if (req.method === 'PUT') {

    const user = await User.findOne({ _id: id })

    console.log(user)

    try {
      const response = await dLocalApi.patch(`/subscription/plan/${planId}/subscription/${subscriptionId}/deactivate`, {
        planId,
        subscriptionId
        });  
    } catch (error) {
      console.log(error)

    }

    console.log('hola')
    user.subscription ? user.subscription.active = false : null;
    
    await user.save()

    const messageAdminHTML = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; text-align: center;">${user.name} ${titles.DELETE_SUBSCRIPTION_ADMIN.title}</h2>
        <p style="font-size: 16px; color: #666666; text-align: center;">
          ${titles.DELETE_SUBSCRIPTION_ADMIN.subtitle}
        </p>
        <div style="margin: 20px 0; text-align: center;">
          <p style="font-size: 14px; color: #333333;">${message}</p>
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

  const messageHTML = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; text-align: center;">${titles.DELETE_SUBSCRIPTION_USER.title}</h2>
      <p style="font-size: 16px; color: #666666; text-align: center;">
        ${titles.DELETE_SUBSCRIPTION_USER.subtitle}
      </p>
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

    const res = await mailchimpClient.messages.send({
      message: {
        from_email: 'noreply@mateomove.com', // Reemplazar con tu correo de remitente
        subject: `Has eliminado tu subscripción`,
        html: messageHTML,  // Usamos `html` para enviar contenido formateado en HTML
        to: [{ email: user?.email, type: 'to' }],
      },
    });


    // Utiliza mailchimpClient para enviar el correo
    const resAdmin = await mailchimpClient.messages.send({
      message: {
        from_email: 'noreply@mateomove.com', // Reemplazar con tu correo de remitente
        subject: `${user.name} ha eliminado su subscripción`,
        html: messageAdminHTML,  // Usamos `html` para enviar contenido formateado en HTML
        to: [{ email: process.env.EMAIL_INFO, type: 'to' }],
      },
    });

    return NextResponse.json({ message: `Se ha desactivado la subscripcion del usuario`, success: true, user }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: 'error' }, { status: 500 })
  }
}
