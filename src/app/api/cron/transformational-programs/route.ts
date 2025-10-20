import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import ProgramaTransformacionalUser from '../../../../models/programaTransformacionalUserModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verificar que es una llamada autorizada (puedes agregar un token secreto)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    // Buscar todos los programas transformacionales activos con automatización
                    const programas = await Product.find({
                  tipo: 'programa_transformacional',
                  activo: true,
                  'programaTransformacional.automatizacion.activa': true
                });

    const emailService = EmailService.getInstance();
    const ahora = new Date();
    let totalEmailsEnviados = 0;
    let totalContenidoDesbloqueado = 0;
    const resultados = [];

    // Procesar cada programa
    for (const programa of programas) {
      const semanas = programa.programaTransformacional.semanas || [];
      let emailsEnviados = 0;
      let contenidoDesbloqueado = 0;

      // Procesar cada semana del programa
      for (const semana of semanas) {
        const fechaDesbloqueo = new Date(semana.fechaDesbloqueo);
        
        // Verificar si es momento de desbloquear esta semana
        if (fechaDesbloqueo <= ahora && !semana.desbloqueado) {
          
          // 1. Desbloquear la semana
          await Product.findByIdAndUpdate(programa._id, {
            $set: {
              [`programaTransformacional.semanas.${semanas.indexOf(semana)}.desbloqueado`]: true
            }
          });
          
          contenidoDesbloqueado++;

          // 2. Enviar email automático si está configurado
          if (programa.programaTransformacional.automatizacion.emailsAutomaticos && 
              semana.emailTemplate?.asunto && 
              semana.emailTemplate?.contenido &&
              !semana.emailTemplate.enviado) {
            
            // Obtener todos los usuarios inscritos en este programa
            const usuariosInscritos = await ProgramaTransformacionalUser.find({
              programId: programa._id,
              estado: { $in: ['inscrito', 'en_curso'] }
            }).populate('userId', 'email name');

            // Enviar email a cada usuario
            for (const inscripcion of usuariosInscritos) {
              const userEmail = inscripcion.userId.email;
              const userName = inscripcion.userId.name || 'Participante';

              try {
                // Personalizar el contenido del email
                const contenidoPersonalizado = semana.emailTemplate.contenido
                  .replace(/{nombre}/g, userName)
                  .replace(/{semana}/g, semana.numero.toString())
                  .replace(/{titulo}/g, semana.titulo)
                  .replace(/{vimeoId}/g, semana.vimeoVideoId || '');

                               await emailService.sendEmail({
                 type: EmailType.TRANSFORMATIONAL_PROGRAM_WEEK,
                 to: userEmail,
                 subject: semana.emailTemplate.asunto,
                 data: {
                   name: userName,
                   email: userEmail,
                   semana: semana.numero,
                   titulo: semana.titulo,
                   contenido: contenidoPersonalizado,
                   vimeoVideoId: semana.vimeoVideoId
                 }
               });

                emailsEnviados++;
              } catch (error) {
                console.error(`Error enviando email a ${userEmail}:`, error);
              }
            }

            // Marcar el email como enviado
            await Product.findByIdAndUpdate(programa._id, {
              $set: {
                [`programaTransformacional.semanas.${semanas.indexOf(semana)}.emailTemplate.enviado`]: true,
                [`programaTransformacional.semanas.${semanas.indexOf(semana)}.emailTemplate.fechaEnvio`]: ahora
              }
            });
          }
        }
      }

      totalEmailsEnviados += emailsEnviados;
      totalContenidoDesbloqueado += contenidoDesbloqueado;

      resultados.push({
        programaId: programa._id,
        nombre: programa.nombre,
        emailsEnviados,
        contenidoDesbloqueado
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cron job ejecutado exitosamente',
      fechaEjecucion: ahora,
      resumen: {
        programasProcesados: programas.length,
        totalEmailsEnviados,
        totalContenidoDesbloqueado
      },
      resultados
    });

  } catch (error) {
    console.error('Error en cron job de programas transformacionales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 