import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import mailchimp from '@mailchimp/mailchimp_transactional';
const MentorshipRequest = require('../../../../models/mentorshipRequestModel');

export async function POST(req: NextRequest) {
  try {
  
    
    await connectDB();

    
    const body = await req.json();

    
    // Validar campos requeridos
    const requiredFields = ['nombre', 'email', 'paisCiudad', 'interesadoEn', 'dondeEntrena', 'nivelActual', 'nivelBuscado', 'principalFrenoJustificacion', 'principalFreno', 'porQueElegirme', 'whatsapp', 'presupuesto'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('Campos faltantes:', missingFields);
      return NextResponse.json({ 
        message: 'Campos faltantes', 
        missingFields 
      }, { status: 400 });
    }
    
    // Validar que interesadoEn sea un array
    if (!Array.isArray(body.interesadoEn)) {
      console.error('interesadoEn no es un array:', body.interesadoEn);
      return NextResponse.json({ 
        message: 'interesadoEn debe ser un array' 
      }, { status: 400 });
    }
    

    const solicitud = await MentorshipRequest.create(body);


    // Enviar email de notificación
    try {
      const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || "");
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #234C8C; text-align: center; font-size: 24px; margin-bottom: 20px;">Nueva Solicitud de Mentoría</h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Información del Solicitante:</h3>
              <p style="margin: 5px 0; color: #666666;"><strong>Nombre:</strong> ${body.nombre}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Email:</strong> ${body.email}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Ubicación:</strong> ${body.paisCiudad}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>WhatsApp:</strong> ${body.whatsapp}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Detalles de la Solicitud:</h3>
              <p style="margin: 5px 0; color: #666666;"><strong>Intereses:</strong> ${body.interesadoEn.join(', ')}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Donde entrena:</strong> ${body.dondeEntrena}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Nivel actual:</strong> ${body.nivelActual}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Objetivos con tu cuerpo:</strong> ${body.nivelBuscado}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Justificación de la elección:</strong> ${body.principalFrenoJustificacion}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Principal freno:</strong> ${body.principalFreno}</p>
              <p style="margin: 5px 0; color: #666666;"><strong>Presupuesto:</strong> ${body.presupuesto}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">¿Por qué te eligió?</h3>
              <p style="margin: 5px 0; color: #666666; line-height: 1.6;">${body.porQueElegirme}</p>
            </div>
            
            ${body.comentarios ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">Comentarios adicionales:</h3>
              <p style="margin: 5px 0; color: #666666; line-height: 1.6;">${body.comentarios}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com'}/admin/mentorship/requests" style="background-color: #234C8C; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
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
          from_email: "noreply@mateomove.com",
          subject: "Nueva solicitud de mentoría",
          html: emailHtml,
          to: [{ email: 'mateomolfino09@gmail.com', type: "to" }],
        },
      });
  
    } catch (emailError) {
      console.error('Error al enviar email de notificación:', emailError);
      // No fallamos la solicitud si el email falla
    }

    return NextResponse.json({ 
      message: 'Solicitud enviada correctamente', 
      solicitud: { id: solicitud._id, ...body } 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      message: 'Error al guardar la solicitud', 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
} 