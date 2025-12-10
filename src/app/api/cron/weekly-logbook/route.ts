import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import Users from '../../../../models/userModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verificar que es una llamada autorizada (desde Vercel Cron)
    // Vercel automáticamente inyecta CRON_SECRET en el header Authorization
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();
    
    const emailService = EmailService.getInstance();
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    
    let totalPublicaciones = 0;
    let totalEmailsEnviados = 0;
    const resultados = [];
    
    // Buscar todas las bitácoras
    const logbooks = await WeeklyLogbook.find().lean();
    
    // Procesar cada bitácora
    for (const logbook of logbooks) {
      if (!logbook.weeklyContents || logbook.weeklyContents.length === 0) {
        continue;
      }
      
      let publicacionesEnEstaBitacora = 0;
      let emailsEnEstaBitacora = 0;
      
      // Procesar cada semana de contenido
      for (let i = 0; i < logbook.weeklyContents.length; i++) {
        const content = logbook.weeklyContents[i];
        const publishDate = new Date(content.publishDate);
        publishDate.setHours(0, 0, 0, 0);
        
        // Verificar si es momento de publicar este contenido
        // Publicar si la fecha llegó Y aún no está publicado
        if (publishDate <= ahora && !content.isPublished) {
          
          // 1. Marcar como publicado
          await WeeklyLogbook.findByIdAndUpdate(logbook._id, {
            $set: {
              [`weeklyContents.${i}.isPublished`]: true
            }
          });
          
          publicacionesEnEstaBitacora++;
          
          // 2. Obtener todos los miembros activos de Move Crew
          const miembrosActivos = await Users.find({
            $or: [
              { 'subscription.active': true },
              { isVip: true }
            ]
          }).lean();
          
          // 3. Enviar email a cada miembro
          const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com';
          const bitacoraLink = `${baseUrl}/bitacora`;
          
          for (const usuario of miembrosActivos) {
            try {
              // Solo enviar a usuarios con email válido
              if (!usuario.email || usuario.validEmail !== 'yes') {
                continue;
              }
              
              await emailService.sendEmail({
                type: EmailType.WEEKLY_LOGBOOK_RELEASE,
                to: usuario.email,
                subject: `El Camino del Gorila - Semana ${content.weekNumber} está disponible`,
                data: {
                  name: usuario.name || 'Miembro',
                  email: usuario.email,
                  weekNumber: content.weekNumber,
                  month: logbook.month,
                  year: logbook.year,
                  text: content.text,
                  bitacoraLink: bitacoraLink,
                  logbookTitle: logbook.title || 'Camino del Gorila'
                }
              });
              
              emailsEnEstaBitacora++;
            } catch (error) {
              console.error(`Error enviando email a ${usuario.email}:`, error);
            }
          }
        }
      }
      
      totalPublicaciones += publicacionesEnEstaBitacora;
      totalEmailsEnviados += emailsEnEstaBitacora;
      
      if (publicacionesEnEstaBitacora > 0) {
        resultados.push({
          logbookId: logbook._id,
          month: logbook.month,
          year: logbook.year,
          publicaciones: publicacionesEnEstaBitacora,
          emailsEnviados: emailsEnEstaBitacora
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cron job ejecutado exitosamente',
      fechaEjecucion: ahora,
      resumen: {
        totalPublicaciones,
        totalEmailsEnviados,
        bitacorasProcesadas: resultados.length
      },
      resultados
    });
    
  } catch (error) {
    console.error('Error en cron job de bitácoras semanales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

