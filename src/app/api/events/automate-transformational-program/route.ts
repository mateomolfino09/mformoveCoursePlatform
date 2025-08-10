import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import ProgramaTransformacionalUser from '../../../../models/programaTransformacionalUserModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';
import { aiService } from '../../../../services/ai/aiService';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { programId } = await req.json();
    
    // Verificar que el programa existe y es transformacional
    const programa = await Product.findOne({
      _id: programId,
      tipo: 'programa_transformacional',
      activo: true
    });

    if (!programa) {
      return NextResponse.json(
        { error: 'Programa no encontrado o no disponible' },
        { status: 404 }
      );
    }

    // Verificar si la automatización está activa
    if (!programa.programaTransformacional?.automatizacion?.activa) {
      return NextResponse.json(
        { message: 'Automatización no activa para este programa' },
        { status: 200 }
      );
    }

    const emailService = EmailService.getInstance();
    const ahora = new Date();
    const semanas = programa.programaTransformacional.semanas || [];
    let emailsEnviados = 0;
    let contenidoDesbloqueado = 0;

    // Procesar cada semana
    for (const semana of semanas) {
      const fechaDesbloqueo = new Date(semana.fechaDesbloqueo);
      
      // Verificar si es momento de desbloquear esta semana
      if (fechaDesbloqueo <= ahora && !semana.desbloqueado) {
        
        // 1. Desbloquear la semana
        await Product.findByIdAndUpdate(programId, {
          $set: {
            [`programaTransformacional.semanas.${semanas.indexOf(semana)}.desbloqueado`]: true
          }
        });
        
        contenidoDesbloqueado++;

        // 2. Enviar email automático si está configurado
        if (programa.programaTransformacional.automatizacion.emailsAutomaticos && 
            !semana.emailTemplate?.enviado) {
          
          // Obtener todos los usuarios inscritos en este programa
          const usuariosInscritos = await ProgramaTransformacionalUser.find({
            programId: programId,
            estado: { $in: ['inscrito', 'en_curso'] }
          }).populate('userId', 'email name');

          // Enviar email a cada usuario
          for (const inscripcion of usuariosInscritos) {
            const userEmail = inscripcion.userId.email;
            const userName = inscripcion.userId.name || 'Participante';

            try {
              // Generar email personalizado con IA
              const emailContent = await aiService.generateEmail({
                type: 'program_week',
                weekNumber: semana.numero,
                weekTitle: semana.titulo,
                weekDescription: semana.descripcion,
                participantName: userName,
                programName: programa.nombre,
                vimeoVideoId: semana.vimeoVideoId,
                previousWeekProgress: inscripcion.progreso?.ultimaSemana || ''
              });

              // Enviar email usando el servicio existente
              await emailService.sendEmail({
                type: EmailType.TRANSFORMATIONAL_PROGRAM_WEEK,
                to: userEmail,
                subject: emailContent.subject,
                data: {
                  name: userName,
                  email: userEmail,
                  semana: semana.numero,
                  titulo: semana.titulo,
                  contenido: emailContent.html,
                  vimeoVideoId: semana.vimeoVideoId,
                  plainText: emailContent.plainText
                }
              });

              emailsEnviados++;
            } catch (error) {
              console.error(`Error enviando email a ${userEmail}:`, error);
            }
          }

          // Marcar el email como enviado
          await Product.findByIdAndUpdate(programId, {
            $set: {
              [`programaTransformacional.semanas.${semanas.indexOf(semana)}.emailTemplate.enviado`]: true,
              [`programaTransformacional.semanas.${semanas.indexOf(semana)}.emailTemplate.fechaEnvio`]: ahora
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Automatización procesada exitosamente',
      resultado: {
        contenidoDesbloqueado,
        emailsEnviados,
        fechaProcesamiento: ahora
      }
    });

  } catch (error) {
    console.error('Error en automatización de programa transformacional:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 