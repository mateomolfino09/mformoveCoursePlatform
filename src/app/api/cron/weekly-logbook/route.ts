import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import Users from '../../../../models/userModel';
import IndividualClass from '../../../../models/individualClassModel';
import ModuleClass from '../../../../models/moduleClassModel';
import ClassModule from '../../../../models/classModuleModel';
import MoveCrewEvent from '../../../../models/moveCrewEventModel';
import { EmailService, EmailType } from '../../../../services/email/emailService';
import { scheduleMoveCrewRemindersForLogbook } from '../../../../lib/scheduleMoveCrewReminders';

export const dynamic = 'force-dynamic';

type LogbookWithWeeks = any;

const WEEK_DAY_LABELS = ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Lunes'];

/** Primera letra mayúscula, resto minúscula (para nombre en mails). */
function formatFirstName(s: string): string {
  if (!s || typeof s !== 'string') return s || '';
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** Primer martes del mes (UTC midnight). */
function getFirstTuesdayOfMonth(year: number, month: number): Date {
  const d = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  for (let i = 0; i < 7; i++) {
    if (d.getUTCDay() === 2) return d;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

/** Número de semana (1-4) que contiene esta fecha según el camino: semana 1 = primer martes del mes, 2 = +7d, etc. Si la fecha es anterior al primer martes, devuelve null. */
function getWeekNumberForDate(date: Date, logbookYear: number, logbookMonth: number): number | null {
  const firstTue = getFirstTuesdayOfMonth(logbookYear, logbookMonth);
  const t = date.getTime();
  const first = firstTue.getTime();
  if (t < first) return null;
  const diffDays = (t - first) / (24 * 60 * 60 * 1000);
  const weekNum = 1 + Math.floor(diffDays / 7);
  return weekNum < 1 ? 1 : Math.min(weekNum, 4);
}

/** Construye el detalle de contenidos de la semana para el email: día, título, descripción, nombre del módulo (mapa de la semana) */
async function buildWeekContentsDetail(content: any): Promise<Array<{ type: string; title: string; description?: string; moduleName?: string; dayLabel?: string }>> {
  const contents = (content as any)?.contents;
  if (Array.isArray(contents) && contents.length > 0) {
    const detail: Array<{ type: string; title: string; description?: string; moduleName?: string; dayLabel?: string }> = [];
    for (let idx = 0; idx < contents.length; idx++) {
      const item = contents[idx];
      const dayLabel = WEEK_DAY_LABELS[idx % WEEK_DAY_LABELS.length];
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
            moduleName: moduleName || undefined,
            dayLabel
          });
        }
      } else if (contentType === 'individualClass' && item.individualClassId) {
        const ic = await IndividualClass.findById(item.individualClassId).select('name description').lean();
        if (ic) {
          detail.push({
            type: 'Clase individual',
            title: (ic as any).name || (item.videoName || '') || 'Clase',
            description: (ic as any).description || undefined,
            dayLabel
          });
        }
      } else if (contentType === 'audio') {
        detail.push({
          type: 'Audio',
          title: (item.audioTitle || '').trim() || content.weekTitle || 'Audio',
          description: (item.audioText || '').trim() || undefined,
          dayLabel
        });
      } else if (contentType === 'zoomEvent' && item.moveCrewEventId) {
        const ev = await MoveCrewEvent.findById(item.moveCrewEventId).select('title description').lean();
        if (ev) {
          detail.push({
            type: 'Clase en vivo',
            title: (ev as any).title || 'Clase en vivo',
            description: (ev as any).description || undefined,
            dayLabel
          });
        }
      }
    }
    return detail;
  }
  // Legacy: semana con un solo contenido a nivel semana
  const title = (content as any)?.weekTitle || (content as any)?.videoName || `Semana ${content.weekNumber}`;
  const text = (content as any)?.text || (content as any)?.weekDescription || '';
  return [{ type: 'Contenido', title, description: text.trim() || undefined, dayLabel: 'Martes' }];
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
    const { searchParams: sp } = new URL(req.url);
    const simulateDateParam = sp.get('simulateDate'); // YYYY-MM-DD para probar como si fuera ese día (ej: un martes)
    let ahora = new Date();
    let useSimulateDate = false;
    if (simulateDateParam && /^\d{4}-\d{2}-\d{2}$/.test(simulateDateParam)) {
      ahora = new Date(simulateDateParam + 'T00:00:00.000Z');
      useSimulateDate = true;
    } else {
      ahora.setHours(0, 0, 0, 0);
    }
    const dayOfWeek = useSimulateDate ? ahora.getUTCDay() : ahora.getDay(); // 0=Dom, 1=Lun, 2=Mar, …
    const isTuesday = dayOfWeek === 2;
    const isThursday = dayOfWeek === 4;

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
      
      // No depender de publishDate: la semana actual es la que contiene la fecha (primer martes del mes = semana 1, +7 = semana 2, …). Usar fecha en UTC para consistencia.
      const ahoraUtc = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), 0, 0, 0, 0));
      const logbookYear = (logbook as any).year != null ? Number((logbook as any).year) : null;
      const logbookMonth = (logbook as any).month != null ? Number((logbook as any).month) : null;
      const currentWeekNum = logbookYear != null && logbookMonth != null ? getWeekNumberForDate(ahoraUtc, logbookYear, logbookMonth) : null;
      const weekIndex = currentWeekNum != null ? logbook.weeklyContents.findIndex((w: any) => Number(w.weekNumber) === currentWeekNum) : -1;

      const updates: Record<string, boolean | number> = {};
      const indicesParaEmail: number[] = []; // solo la semana actual el martes (enviar mail)
      if (weekIndex >= 0) {
        const content = logbook.weeklyContents[weekIndex];
        const currentMax = (content as any).maxContentIndexUnlocked ?? -1;
        if (isTuesday) {
          updates[`weeklyContents.${weekIndex}.isPublished`] = true;
          updates[`weeklyContents.${weekIndex}.maxContentIndexUnlocked`] = Math.max(currentMax, 1);
          indicesParaEmail.push(weekIndex);
        } else if (isThursday) {
          updates[`weeklyContents.${weekIndex}.maxContentIndexUnlocked`] = Math.max(currentMax, 2);
          updates[`weeklyContents.${weekIndex}.isPublished`] = true;
        }
      }
      if (Object.keys(updates).length > 0) {
        await WeeklyLogbook.findByIdAndUpdate(logbook._id, { $set: updates });
      }

      // Martes: programar recordatorios Zoom (1h antes) solo para el logbook del MES ACTUAL y solo para las semanas que se publican hoy
      const currentYear = ahora.getUTCFullYear();
      const currentMonth = ahora.getUTCMonth() + 1;
      const isCurrentMonthLogbook = logbookYear === currentYear && logbookMonth === currentMonth;
      if (isTuesday && !(logbook as any).isBaseBitacora && (logbook as any).month != null && (logbook as any).year != null && indicesParaEmail.length > 0 && isCurrentMonthLogbook) {
        try {
          const weekNumbersToSchedule = indicesParaEmail.map((idx: number) => (logbook.weeklyContents[idx] as any).weekNumber);
          await scheduleMoveCrewRemindersForLogbook(logbook as any, { onlyWeekNumbers: weekNumbersToSchedule });
        } catch (e) {
          console.error('[cron weekly-logbook] Error programando recordatorios Zoom:', e);
        }
      }

      // Enviar email de contenidos de la semana solo para el logbook del MES ACTUAL (evitar mails de meses anteriores)
      const delayMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      for (let idx = 0; idx < indicesParaEmail.length; idx++) {
        if (!isCurrentMonthLogbook) continue;
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
                subject: `Semana ${content.weekNumber} del Camino`,
                data: {
                  name: formatFirstName(((usuario as any).name || 'Miembro').toString().trim().split(/\s+/)[0] || 'Miembro'),
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
      // Incluir también la práctica de Warm Up mensual si es una clase individual
      const warmUp = (logbook as any)?.warmUpContent;
      if (warmUp?.individualClassId) {
        individualClassIds.push(String(warmUp.individualClassId));
      }

      const caminoCompletoPublicado = currentWeekNum != null && currentWeekNum >= maxWeekNumber;
      if (moduleClassIds.length > 0 || individualClassIds.length > 0) {
        if (caminoCompletoPublicado) {
          // La última semana ya está publicada (hoy o antes): hacer visibles en biblioteca
          if (moduleClassIds.length > 0) {
            await ModuleClass.updateMany(
              { _id: { $in: moduleClassIds } },
              { $set: { visibleInLibrary: true } }
            );
          }
          if (individualClassIds.length > 0) {
            await IndividualClass.updateMany(
              { _id: { $in: individualClassIds } },
              { $set: { visibleInLibrary: true } }
            );
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
      ...(useSimulateDate && { simulateDate: simulateDateParam, diaSemana: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeek] }),
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

