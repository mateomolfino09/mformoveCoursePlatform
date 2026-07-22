import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import mailchimp from '@mailchimp/mailchimp_transactional';
import { getAdminEmails } from '../../../../lib/getAdminEmails';
const MentorshipRequest = require('../../../../models/mentorshipRequestModel');

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const objetivos = Array.isArray(body.objetivos)
      ? body.objetivos.map((o: unknown) => String(o).trim()).filter(Boolean)
      : [];
    const nivelBuscado =
      String(body.nivelBuscado || '').trim() ||
      (objetivos.length > 0 ? objetivos.join(', ') : '');

    const payload = {
      ...body,
      objetivos,
      nivelBuscado,
      modalidad: String(body.modalidad || '').trim(),
    };

    const requiredFields = [
      'nombre',
      'email',
      'paisCiudad',
      'interesadoEn',
      'dondeEntrena',
      'nivelActual',
      'nivelBuscado',
      'principalFrenoJustificacion',
      'principalFreno',
      'porQueElegirme',
      'whatsapp',
      'modalidad',
      'presupuesto',
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = payload[field as keyof typeof payload];
      if (Array.isArray(value)) return value.length === 0;
      return !value;
    });

    if (missingFields.length > 0) {
      console.error('Campos faltantes:', missingFields);
      return NextResponse.json(
        {
          message: 'Campos faltantes',
          missingFields,
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(payload.interesadoEn)) {
      console.error('interesadoEn no es un array:', payload.interesadoEn);
      return NextResponse.json(
        {
          message: 'interesadoEn debe ser un array',
        },
        { status: 400 },
      );
    }

    const solicitud = await MentorshipRequest.create(payload);

    // Enviar email de notificación a todos los admins
    try {
      const adminEmails = await getAdminEmails();
      if (adminEmails.length === 0) {
        console.warn('No hay admins con email para notificar la solicitud de mentoría');
      } else {
        const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || '');

        const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #234C8C; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Solicitud de Mentoría</h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Información del Solicitante:</h3>
              <p style="margin: 5px 0; color: #666666;"><strong>Nombre:</strong> ${payload.nombre}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Email:</strong> ${payload.email}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Ubicación:</strong> ${payload.paisCiudad}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>WhatsApp:</strong> ${payload.whatsapp}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Detalles de la Solicitud:</h3>
              <p style="margin: 5px 0; color: #666666;"><strong>Intereses:</strong> ${payload.interesadoEn.join(', ')}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Donde entrena:</strong> ${payload.dondeEntrena}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Nivel actual:</strong> ${payload.nivelActual}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Objetivos:</strong> ${payload.nivelBuscado}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Inversión mensual:</strong> ${payload.modalidad}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Justificación de la elección:</strong> ${payload.principalFrenoJustificacion}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Principal freno:</strong> ${payload.principalFreno}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Modalidad de plan:</strong> ${payload.presupuesto}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">¿Por qué te eligió?</h3>
              <p style="margin: 5px 0; color: #666666; line-height: 1.6;">${payload.porQueElegirme}</p>
            </div>
            
            ${
              payload.comentarios
                ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Comentarios adicionales:</h3>
              <p style="margin: 5px 0; color: #666666; line-height: 1.6;">${payload.comentarios}</p>
            </div>
            `
                : ''
            }
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com'}/admin/mentorias/solicitudes" style="background-color: #234C8C; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                Ver Solicitud en el Panel
              </a>
            </div>
            
            <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
              Sistema de Mentoría MForMove
            </p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999999; text-align: center;">
              © 2025 MForMove. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `;

        await mailchimpClient.messages.send({
          message: {
            from_email: 'noreply@mateomove.com',
            subject: 'Nueva solicitud de mentoría',
            html: emailHtml,
            to: adminEmails.map((email) => ({ email, type: 'to' as const })),
          },
        });
      }
    } catch (emailError) {
      console.error('Error al enviar email de notificación:', emailError);
      // No fallamos la solicitud si el email falla
    }

    return NextResponse.json(
      {
        message: 'Solicitud enviada correctamente',
        solicitud: { id: solicitud._id, ...payload },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        message: 'Error al guardar la solicitud',
        error: error.message,
        details: error.toString(),
      },
      { status: 500 },
    );
  }
}
