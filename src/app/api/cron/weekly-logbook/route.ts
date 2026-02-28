import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import Users from '../../../../models/userModel';
import IndividualClass from '../../../../models/individualClassModel';
import ModuleClass from '../../../../models/moduleClassModel';
import ClassModule from '../../../../models/classModuleModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export const dynamic = 'force-dynamic';

type LogbookWithWeeks = any;

/** Construye el detalle de contenidos de la semana para el email: título, descripción, nombre del módulo */
async function buildWeekContentsDetail(content: any): Promise<Array<{ type: string; title: string; description?: string; moduleName?: string }>> {
  const contents = (content as any)?.contents;
  if (Array.isArray(contents) && contents.length > 0) {
    const detail: Array<{ type: string; title: string; description?: string; moduleName?: string }> = [];
    for (const item of contents) {
      const contentType = item.contentType || 'moduleClass';
      if (contentType === 'moduleClass' && item.moduleClassId) {
        const mc = await ModuleClass.findById(item.moduleClassId).select('name description moduleId').lean();
        if (mc) {
          let moduleName = '';
          if ((mc as any).moduleId) {
            const mod = await ClassModule.findById((mc as any).moduleId).select('name').lean();
            if (mod && (mod as any).name) moduleName = (mod as any).name;
          }
          detail.push({
            type: 'Clase de módulo',
            title: (mc as any).name || 'Clase',
            description: (mc as any).description || undefined,
            moduleName: moduleName || undefined
          });
        }
      } else if (contentType === 'individualClass' && item.individualClassId) {
        const ic = await IndividualClass.findById(item.individualClassId).select('name description').lean();
        if (ic) {
          detail.push({
            type: 'Clase individual',
            title: (ic as any).name || (item.videoName || '') || 'Clase',
            description: (ic as any).description || undefined
          });
        }
      } else if (contentType === 'audio') {
        detail.push({
          type: 'Audio',
          title: (item.audioTitle || '').trim() || content.weekTitle || 'Audio',
          description: (item.audioText || '').trim() || undefined
        });
      }
    }
    return detail;
  }
  // Legacy: semana con un solo contenido a nivel semana
  const title = (content as any)?.weekTitle || (content as any)?.videoName || `Semana ${content.weekNumber}`;
  const text = (content as any)?.text || (content as any)?.weekDescription || '';
  return [{ type: 'Contenido', title, description: text.trim() || undefined }];
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
    
    // Buscar todas las caminos
    const logbooks = await WeeklyLogbook.find().lean();
    
    // Procesar cada camino
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
      
      // Marcar como publicadas y desbloqueadas TODAS las semanas con publishDate <= hoy
      const updates: Record<string, boolean> = {};
      const indicesParaEmail: number[] = []; // semanas que aún no estaban publicadas (enviar email)
      for (let i = 0; i < logbook.weeklyContents.length; i++) {
        const content = logbook.weeklyContents[i];
        const publishDate = new Date(content.publishDate);
        publishDate.setHours(0, 0, 0, 0);
        if (publishDate <= ahora) {
          updates[`weeklyContents.${i}.isPublished`] = true;
          updates[`weeklyContents.${i}.isUnlocked`] = true;
          if (!content.isPublished) indicesParaEmail.push(i);
        }
      }
      if (Object.keys(updates).length > 0) {
        await WeeklyLogbook.findByIdAndUpdate(logbook._id, { $set: updates });
      }

      // Enviar email solo por las semanas que se publican por primera vez (una pausa entre semanas evita que el proveedor colapse varios envíos al mismo destinatario)
      const delayMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      for (let idx = 0; idx < indicesParaEmail.length; idx++) {
        if (idx > 0) await delayMs(2000);
        const i = indicesParaEmail[idx];
        const content = logbook.weeklyContents[i];
        
        publicacionesEnEstaBitacora++;
        
        // Obtener todos los miembros activos de Move Crew
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
          // Imagen: primer video de la semana (contents[0] o legacy)
          const firstContent = (content as any)?.contents?.[0];
          let coverImage =
            (firstContent?.videoThumbnail) ||
            (content as any)?.videoThumbnail ||
            (content as any)?.thumbnailUrl ||
            null;
          
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
          const weekContentsDetail = await buildWeekContentsDetail(content);

          // 3. Enviar email a cada miembro
          const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://mateomove.com';
          const bitacoraLink = `${baseUrl}/weekly-path`;
          
          for (const usuario of miembrosActivos) {
            try {
              // Solo enviar a usuarios con email válido
              if (!usuario.email || usuario.validEmail !== 'yes') {
                continue;
              }
              
              await emailService.sendEmail({
                type: EmailType.WEEKLY_LOGBOOK_RELEASE,
                to: usuario.email,
                subject: `El Camino - Semana ${content.weekNumber} está disponible`,
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
                  logbookTitle: logbook.title || 'Camino',
                  isFirstWeek: content.weekNumber === 1 || content.weekNumber === '1',
                  weekContentsDetail
                }
              });
              
              emailsEnEstaBitacora++;
            } catch (error) {
              console.error(`[cron weekly-logbook] Error enviando email Semana ${content.weekNumber} a ${usuario.email}:`, error);
            }
          }

        if (content.weekNumber === maxWeekNumber) {
          ultimaSemanaPublicadaAhora = true;
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
      // Recolectar todas las clases (módulo e individuales) referenciadas en este camino
      const moduleClassIds: string[] = [];
      const individualClassIds: string[] = [];
      for (const wc of logbook.weeklyContents || []) {
        const contents = (wc as any)?.contents;
        if (Array.isArray(contents)) {
          for (const c of contents) {
            if (c.moduleClassId) moduleClassIds.push(String(c.moduleClassId));
            if (c.individualClassId) individualClassIds.push(String(c.individualClassId));
          }
        }
      }

      const lastWeekContent = logbook.weeklyContents?.find((w: any) => Number(w.weekNumber) === maxWeekNumber);
      const lastWeekPublishDate = lastWeekContent?.publishDate ? new Date(lastWeekContent.publishDate) : null;
      if (lastWeekPublishDate) lastWeekPublishDate.setHours(0, 0, 0, 0);
      const caminoCompletoPublicado = lastWeekPublishDate ? lastWeekPublishDate.getTime() <= ahora.getTime() : false;

      if (moduleClassIds.length > 0 || individualClassIds.length > 0) {
        if (caminoCompletoPublicado) {
          // La última semana ya está publicada (hoy o antes): hacer visibles en biblioteca
          if (moduleClassIds.length > 0) {
            const r = await ModuleClass.updateMany(
              { _id: { $in: moduleClassIds } },
              { $set: { visibleInLibrary: true } }
            );
            if (r.modifiedCount > 0) {
              console.log(`[cron weekly-logbook] visibleInLibrary=true para ${r.modifiedCount} ModuleClass(es) del camino ${logbook._id}`);
            }
          }
          if (individualClassIds.length > 0) {
            const r = await IndividualClass.updateMany(
              { _id: { $in: individualClassIds } },
              { $set: { visibleInLibrary: true } }
            );
            if (r.modifiedCount > 0) {
              console.log(`[cron weekly-logbook] visibleInLibrary=true para ${r.modifiedCount} IndividualClass(es) del camino ${logbook._id}`);
            }
          }
        } else {
          // Camino aún no terminado (última semana en el futuro): poblar con visibleInLibrary: false
          if (moduleClassIds.length > 0) {
            await ModuleClass.updateMany(
              { _id: { $in: moduleClassIds } },
              { $set: { visibleInLibrary: false } }
            );
          }
          if (individualClassIds.length > 0) {
            await IndividualClass.updateMany(
              { _id: { $in: individualClassIds } },
              { $set: { visibleInLibrary: false } }
            );
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

