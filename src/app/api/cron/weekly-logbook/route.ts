import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import Users from '../../../../models/userModel';
import IndividualClass from '../../../../models/individualClassModel';
import ClassFilters from '../../../../models/classFiltersModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const dynamic = 'force-dynamic';

type LogbookWithWeeks = any;

const buildIframeHtml = (src: string) =>
  `<iframe src="${src}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

const durationParts = (duration: number) => {
  const safeDuration = Number(duration || 0);
  return {
    hours: Math.floor(safeDuration / 3600),
    minutes: Math.floor((safeDuration % 3600) / 60),
    seconds: Math.floor(safeDuration % 60)
  };
};

async function createIndividualClassesForLogbook(logbook: LogbookWithWeeks) {
  try {
    const existingMax = await IndividualClass.findOne().sort({ id: -1 }).lean();
    let nextId = existingMax?.id || 0;

    const firstType = await ClassFilters.findOne().sort({ id: 1 }).lean();
    const typeName = process.env.BITACORA_CLASS_TYPE_NAME || firstType?.name || (firstType as any)?.value || 'fuerza';
    const fallbackImage =
      process.env.DEFAULT_CLASS_IMAGE_URL ||
      'https://mateomove.com/images/MFORMOVE_blanco.png';

    const classesToInsert: any[] = [];

    for (const content of logbook.weeklyContents || []) {
      const videoSource = content?.videoUrl || content?.videoId;
      if (!videoSource) {
        continue;
      }

      const duration = Number(content?.videoDuration || 0);
      const { hours, minutes, seconds } = durationParts(duration);
      const name =
        content?.weekTitle ||
        content?.videoName ||
        `Semana ${content?.weekNumber ?? ''}`.trim();
      const description =
        content?.weekDescription ||
        content?.text ||
        logbook?.description ||
        'Contenido de la Bitácora';
      const imageUrl =
        content?.videoThumbnail ||
        (content as any)?.thumbnailUrl ||
        content?.dailyContents?.[0]?.visualContent?.thumbnailUrl ||
        fallbackImage;
      const link = content?.videoId || content?.videoUrl;
      if (!link) {
        continue;
      }
      const html = buildIframeHtml(content?.videoUrl || content?.videoId);
      const tagBase = `${logbook?.month}-${logbook?.year}`;
      const tags = [
        { id: 1, title: 'Bitácora' },
        { id: 2, title: `Mes ${tagBase}` },
        { id: 3, title: `Semana ${content?.weekNumber ?? ''}` }
      ];

      nextId += 1;

      classesToInsert.push({
        id: nextId,
        name,
        description,
        image_url: imageUrl,
        totalTime: duration,
        seconds,
        minutes,
        hours,
        level: '1',
        type: typeName,
        isFree: false,
        image_base_link: imageUrl,
        html,
        link,
        tags
      });
    }

    if (classesToInsert.length === 0) {
      return { created: 0 };
    }

    await IndividualClass.insertMany(classesToInsert);
    await WeeklyLogbook.findByIdAndUpdate(logbook._id, {
      individualClassesCreated: true,
      updatedAt: new Date()
    });

    return { created: classesToInsert.length };
  } catch (error) {
    return { created: 0, error: (error as Error).message };
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar que es una llamada autorizada (desde Vercel Cron)
    // Vercel automáticamente inyecta CRON_SECRET en el header Authorization
    // También aceptamos el token como query parameter o header personalizado para pruebas manuales
    
    const { searchParams } = new URL(req.url);
    const tokenFromQuery = searchParams.get('token');
    
    let authHeader: string | null = null;
    
    // PRIORIDAD 1: Query parameter (más confiable para pruebas manuales)
    if (tokenFromQuery) {
      authHeader = `Bearer ${tokenFromQuery}`;
    }
    
    // PRIORIDAD 2: Header personalizado x-cron-secret (Vercel no modifica headers custom)
    if (!authHeader) {
      const customHeader = 
        req.headers.get('x-cron-secret') ||
        req.headers.get('X-Cron-Secret') ||
        req.headers.get('X-CRON-SECRET');
      if (customHeader) {
        authHeader = `Bearer ${customHeader}`;
      }
    }
    
    // PRIORIDAD 3: Header Authorization estándar (desde NextRequest)
    if (!authHeader) {
      authHeader = 
        req.headers.get('Authorization') || 
        req.headers.get('authorization') ||
        req.headers.get('AUTHORIZATION');
    }
    
    // PRIORIDAD 4: Desde headers() de Next.js (alternativa)
    if (!authHeader) {
      try {
        const headersList = await headers();
        authHeader = 
          headersList.get('Authorization') || 
          headersList.get('authorization') ||
          headersList.get('AUTHORIZATION');
      } catch (e) {
        // headers() puede fallar en algunos contextos, continuar con req.headers
      }
    }
    
    // PRIORIDAD 5: Buscar en todos los headers (case-insensitive)
    if (!authHeader) {
      const allHeaders = Object.fromEntries(req.headers.entries());
      const authKey = Object.keys(allHeaders).find(
        key => key.toLowerCase() === 'authorization'
      );
      if (authKey) {
        authHeader = allHeaders[authKey];
      }
    }
    
    // PRIORIDAD 6: Extraer desde x-vercel-sc-headers (solo si contiene nuestro CRON_SECRET)
    // NOTA: Vercel inyecta su propio JWT aquí, así que verificamos si contiene nuestro secret
    if (!authHeader) {
      const vercelScHeaders = req.headers.get('x-vercel-sc-headers');
      if (vercelScHeaders) {
        try {
          const parsedHeaders = JSON.parse(vercelScHeaders);
          const vercelAuth = parsedHeaders.Authorization || parsedHeaders.authorization;
          // Verificar si el token contiene nuestro CRON_SECRET (puede estar en el Bearer token)
          if (vercelAuth && process.env.CRON_SECRET) {
            // Si el token de Vercel contiene nuestro secret, usarlo
            // Pero normalmente Vercel inyecta su propio JWT, así que esto probablemente no funcione
            // Solo lo usamos si realmente contiene nuestro secret
            if (vercelAuth.includes(process.env.CRON_SECRET)) {
              authHeader = vercelAuth;
            }
          }
        } catch (e) {
          // Si no es JSON válido, continuar
        }
      }
    }
    
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader) {
      // Debug info para ayudar a identificar el problema
      const allHeaders = Object.fromEntries(req.headers.entries());
      return NextResponse.json({ 
        error: 'No se encontró header Authorization ni token en query',
        debug: {
          receivedHeaders: Object.keys(allHeaders),
          headerKeys: Object.keys(allHeaders).map(k => k.toLowerCase()),
          hasAuthHeader: !!req.headers.get('Authorization'),
          hasAuthHeaderLower: !!req.headers.get('authorization'),
          envSecretExists: !!process.env.CRON_SECRET,
          envSecretLength: process.env.CRON_SECRET?.length || 0,
          hasTokenQuery: !!tokenFromQuery
        }
      }, { status: 401 });
    }
    
    // Normalizar: remover espacios y comparar
    const normalizedAuth = authHeader.trim();
    const normalizedExpected = expectedAuth.trim();
    
    if (normalizedAuth !== normalizedExpected) {
      return NextResponse.json({ 
        error: 'Token de autorización inválido',
        debug: {
          received: normalizedAuth.substring(0, 20) + '...',
          receivedLength: normalizedAuth.length,
          expectedLength: normalizedExpected.length,
          secretExists: !!process.env.CRON_SECRET,
          secretLength: process.env.CRON_SECRET?.length || 0,
          matches: normalizedAuth === normalizedExpected
        }
      }, { status: 401 });
    }

    await connectDB();
    
    const emailService = EmailService.getInstance();
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    
    let totalPublicaciones = 0;
    let totalEmailsEnviados = 0;
    let clasesIndividualesCreadas = 0;
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
      let ultimaSemanaPublicadaAhora = false;
      const maxWeekNumber = Math.max(
        ...logbook.weeklyContents.map((w: any) => Number(w.weekNumber) || 0)
      );
      let resumenBitacora: any = null;
      
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
          
          // Preparar datos semanales (sin dailyContents)
          const emailText = content.text || '';
          const audioUrl = content.audioUrl || '';
          const audioTitle = content.weekTitle || `Semana ${content.weekNumber}`;
          // Obtener imagen con mejor calidad
          let coverImage = (content as any)?.videoThumbnail || (content as any)?.thumbnailUrl || null;
          
          // Mejorar calidad de imagen si es de Vimeo (reemplazar tamaño pequeño por Full HD)
          if (coverImage && coverImage.includes('vimeocdn.com')) {
            // Reemplazar tamaños pequeños por 1920x1080 (Full HD) para mejor calidad
            // Formato: ...-d_295x166?region=us -> ...-d_1920x1080?region=us
            // Intentar primero con Full HD (1920x1080), si no funciona Vimeo devolverá el más grande disponible
            coverImage = coverImage
              .replace(/-d_\d+x\d+/, '-d_1920x1080')  // Reemplazar cualquier tamaño por 1920x1080
              .replace(/_295x166/, '_1920x1080')
              .replace(/_640x360/, '_1920x1080')
              .replace(/_1280x720/, '_1920x1080');
          }
          
          // Mejorar calidad de imagen si es de YouTube (agregar maxresdefault)
          if (coverImage && coverImage.includes('ytimg.com')) {
            // Reemplazar diferentes tamaños de thumbnail por maxresdefault para mejor calidad
            coverImage = coverImage
              .replace(/\/hqdefault\.jpg/, '/maxresdefault.jpg')
              .replace(/\/mqdefault\.jpg/, '/maxresdefault.jpg')
              .replace(/\/sddefault\.jpg/, '/maxresdefault.jpg')
              .replace(/\/default\.jpg/, '/maxresdefault.jpg');
          }
          
          // Mejorar calidad si es de vumbnail.com (agregar parámetros de calidad)
          if (coverImage && coverImage.includes('vumbnail.com')) {
            // vumbnail.com ya proporciona buena calidad, pero podemos asegurar que no tenga parámetros de tamaño
            coverImage = coverImage.split('?')[0]; // Remover query params si existen
          }
          
          const videoDurationSeconds = (content as any)?.videoDuration || null;

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
                  text: emailText,
                  audioUrl,
                  audioTitle,
                  coverImage,
                  videoDurationSeconds,
                  bitacoraLink: bitacoraLink,
                  logbookTitle: logbook.title || 'Camino del Gorila',
                  isFirstWeek: content.weekNumber === 1 || content.weekNumber === '1'
                }
              });
              
              emailsEnEstaBitacora++;
            } catch (error) {
              // Error silencioso para no interrumpir el proceso
            }
          }

          if (content.weekNumber === maxWeekNumber) {
            ultimaSemanaPublicadaAhora = true;
          }
        }
      }
      
      totalPublicaciones += publicacionesEnEstaBitacora;
      totalEmailsEnviados += emailsEnEstaBitacora;
      
      if (publicacionesEnEstaBitacora > 0) {
        resumenBitacora = {
          logbookId: logbook._id,
          month: logbook.month,
          year: logbook.year,
          publicaciones: publicacionesEnEstaBitacora,
          emailsEnviados: emailsEnEstaBitacora
        };
        resultados.push(resumenBitacora);
      }
      if (ultimaSemanaPublicadaAhora && !logbook.individualClassesCreated) {
        const resultadoClases = await createIndividualClassesForLogbook(logbook);
        clasesIndividualesCreadas += resultadoClases.created;
        if (resultadoClases.created > 0) {
          if (resumenBitacora) {
            resumenBitacora.clasesIndividualesCreadas = resultadoClases.created;
          } else {
            resultados.push({
              logbookId: logbook._id,
              month: logbook.month,
              year: logbook.year,
              clasesIndividualesCreadas: resultadoClases.created
            });
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cron job ejecutado exitosamente',
      fechaEjecucion: ahora,
      resumen: {
        totalPublicaciones,
        totalEmailsEnviados,
        clasesIndividualesCreadas,
        bitacorasProcesadas: resultados.length
      },
      resultados
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}

