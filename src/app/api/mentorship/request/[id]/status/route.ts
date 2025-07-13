import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
const MentorshipRequest = require('../../../../../../models/mentorshipRequestModel');
import mailchimp from '@mailchimp/mailchimp_transactional';

const CALENDLY_LINK = 'https://calendly.com/mformovers/consulta-mentoria';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { estado } = await req.json();
    if (!['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }
    const solicitud = await MentorshipRequest.findByIdAndUpdate(
      params.id,
      { estado },
      { new: true }
    );
    if (!solicitud) {
      return NextResponse.json({ message: 'Solicitud no encontrada' }, { status: 404 });
    }

    // Si se aprueba, enviar email con link de Calendly
    if (estado === 'aprobada') {
      const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || "");
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #234C8C; text-align: center; font-size: 24px; margin-bottom: 20px;">Solicitud de Mentoría Aprobada</h2>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; text-align: center;">
              Hola <strong>${solicitud.nombre}</strong>, hemos revisado tu solicitud de mentoría y estamos listos para comenzar.
            </p>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 30px; text-align: center;">
              Agenda tu llamada de consulta inicial para evaluar tus objetivos y crear tu plan personalizado:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${CALENDLY_LINK}" style="background-color: #234C8C; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                Agendar Consulta
              </a>
            </div>
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

      try {
        await mailchimpClient.messages.send({
          message: {
            from_email: "noreply@mateomove.com",
            subject: "Tu solicitud de mentoría fue aprobada - Agenda tu consulta",
            html: emailHtml,
            to: [{ email: solicitud.email, type: "to" }],
          },
        });
        console.log(`Email de aprobación enviado a: ${solicitud.email}`);
      } catch (emailError) {
        console.error('Error al enviar email de aprobación:', emailError);
        // No fallamos la actualización si el email falla
      }
    }

    return NextResponse.json({ message: 'Estado actualizado', solicitud }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al actualizar el estado', error: error.message }, { status: 500 });
  }
} 