import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';
import InstagramService from '../../../../services/instagram/instagramService';

// Verificar webhook de Instagram
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar token (debe coincidir con el configurado en Instagram)
  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ [WEBHOOK] Instagram webhook verificado exitosamente');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('❌ [WEBHOOK] Verificación fallida:', { mode, token, expected: verifyToken });
  return new NextResponse('Forbidden', { status: 403 });
}

// Recibir notificaciones de Instagram
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📱 [WEBHOOK] Recibida notificación de Instagram:', JSON.stringify(body, null, 2));

    // Verificar que es una notificación válida de Instagram
    if (body.object !== 'instagram') {
      console.log('⚠️ [WEBHOOK] Notificación no es de Instagram, ignorando');
      return NextResponse.json({ success: true, message: 'Ignored' });
    }

    // Procesar cada entrada
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        await processInstagramChange(change);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [WEBHOOK] Error procesando webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Procesar cambios de Instagram
async function processInstagramChange(change: any) {
  try {
    console.log('🔄 [WEBHOOK] Procesando cambio:', change.field);

    switch (change.field) {
      case 'mentions':
        await handleMentions(change.value);
        break;
      case 'media':
        await handleMediaChange(change.value);
        break;
      case 'story_mentions':
        await handleStoryMentions(change.value);
        break;
      default:
        console.log('ℹ️ [WEBHOOK] Campo no procesado:', change.field);
    }

  } catch (error) {
    console.error('❌ [WEBHOOK] Error procesando cambio:', error);
  }
}

// Manejar menciones (nuevos posts/reels)
async function handleMentions(value: any) {
  console.log('📸 [WEBHOOK] Nueva mención detectada:', value.media_id);
  
  try {
    const instagramService = InstagramService.getInstance();
    
    // Obtener detalles del media
    const mediaDetails = await instagramService.getMediaById(value.media_id);
    
    if (!mediaDetails) {
      console.log('⚠️ [WEBHOOK] No se pudo obtener detalles del media');
      return;
    }

    // Verificar si es un reel
    if (mediaDetails.media_type === 'REELS' || mediaDetails.media_type === 'VIDEO') {
      console.log('🎬 [WEBHOOK] Nuevo reel detectado, generando email automático...');
      await generateAutoEmail(mediaDetails);
    } else {
      console.log('📷 [WEBHOOK] Media no es reel, ignorando:', mediaDetails.media_type);
    }

  } catch (error) {
    console.error('❌ [WEBHOOK] Error procesando mención:', error);
  }
}

// Manejar cambios de media
async function handleMediaChange(value: any) {
  console.log('📱 [WEBHOOK] Cambio de media detectado:', value.id);
  
  try {
    const instagramService = InstagramService.getInstance();
    const mediaDetails = await instagramService.getMediaById(value.id);
    
    if (mediaDetails && (mediaDetails.media_type === 'REELS' || mediaDetails.media_type === 'VIDEO')) {
      console.log('🎬 [WEBHOOK] Nuevo reel detectado en media change');
      await generateAutoEmail(mediaDetails);
    }

  } catch (error) {
    console.error('❌ [WEBHOOK] Error procesando cambio de media:', error);
  }
}

// Manejar menciones en stories
async function handleStoryMentions(value: any) {
  console.log('📖 [WEBHOOK] Menciones en stories detectadas');
  // Por ahora no procesamos stories, solo reels
}

// Generar email automático desde reel
async function generateAutoEmail(mediaDetails: any) {
  try {
    console.log('📧 [AUTO-EMAIL] Generando email desde reel:', mediaDetails.id);

    // Verificar si ya procesamos este reel
    const alreadyProcessed = await checkIfAlreadyProcessed(mediaDetails.id);
    if (alreadyProcessed) {
      console.log('⚠️ [AUTO-EMAIL] Reel ya procesado, ignorando');
      return;
    }

    // Generar email con IA
    const emailContent = await aiService.generateEmail({
      type: 'newsletter',
      content: mediaDetails.caption || 'Nuevo reel de Instagram',
      topic: 'auto_generated_from_reel'
    });

    // Guardar email generado
    const savedEmail = await saveAutoGeneratedEmail({
      reelId: mediaDetails.id,
      caption: mediaDetails.caption,
      mediaUrl: mediaDetails.media_url,
      permalink: mediaDetails.permalink,
      generatedEmail: emailContent,
      status: 'pending_review'
    });

    // Enviar notificación
    await sendNotification({
      type: 'new_email_ready',
      email: emailContent,
      reelId: mediaDetails.id,
      savedEmailId: savedEmail.id
    });

    console.log('✅ [AUTO-EMAIL] Email generado y guardado exitosamente');

  } catch (error) {
    console.error('❌ [AUTO-EMAIL] Error generando email automático:', error);
  }
}

// Verificar si el reel ya fue procesado
async function checkIfAlreadyProcessed(reelId: string): Promise<boolean> {
  try {
    // Aquí implementarías la lógica para verificar en tu base de datos
    // Por ahora retornamos false para procesar todos
    return false;
  } catch (error) {
    console.error('❌ [AUTO-EMAIL] Error verificando reel procesado:', error);
    return false;
  }
}

// Guardar email generado automáticamente
async function saveAutoGeneratedEmail(data: {
  reelId: string;
  caption?: string;
  mediaUrl?: string;
  permalink?: string;
  generatedEmail: any;
  status: string;
}) {
  try {
    // Aquí implementarías la lógica para guardar en tu base de datos
    // Por ahora simulamos el guardado
    const savedEmail = {
      id: `auto_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    };

    console.log('💾 [AUTO-EMAIL] Email guardado:', savedEmail.id);
    return savedEmail;

  } catch (error) {
    console.error('❌ [AUTO-EMAIL] Error guardando email:', error);
    throw error;
  }
}

// Enviar notificación
async function sendNotification(data: {
  type: string;
  email: any;
  reelId: string;
  savedEmailId: string;
}) {
  try {
    console.log('📢 [NOTIFICATION] Enviando notificación:', data.type);

    // Notificación por email
    if (process.env.EMAIL_INFO) {
      await sendEmailNotification(data);
    }

    // Notificación por WhatsApp (opcional)
    if (process.env.NOTIFICATION_WHATSAPP) {
      await sendWhatsAppNotification(data);
    }

    console.log('✅ [NOTIFICATION] Notificación enviada exitosamente');

  } catch (error) {
    console.error('❌ [NOTIFICATION] Error enviando notificación:', error);
  }
}

// Enviar notificación por email
async function sendEmailNotification(data: any) {
  try {
    const emailContent = `
      <h2>🎬 Nuevo Email Generado Automáticamente</h2>
      <p><strong>Reel ID:</strong> ${data.reelId}</p>
      <p><strong>Asunto:</strong> ${data.email.subject}</p>
      <p><strong>Estado:</strong> Pendiente de revisión</p>
      <hr>
      <h3>Preview del Email:</h3>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
        ${data.email.html}
      </div>
      <hr>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/auto-emails/${data.savedEmailId}">Revisar y Aprobar Email</a></p>
    `;

    // Aquí implementarías el envío real del email
    console.log('📧 [EMAIL] Notificación enviada a:', process.env.EMAIL_INFO);

  } catch (error) {
    console.error('❌ [EMAIL] Error enviando notificación por email:', error);
  }
}

// Enviar notificación por WhatsApp
async function sendWhatsAppNotification(data: any) {
  try {
    const message = `🎬 ¡Nuevo email generado automáticamente!

Reel ID: ${data.reelId}
Asunto: ${data.email.subject}

Revisá tu dashboard para aprobar y enviar.

${process.env.NEXT_PUBLIC_BASE_URL}/admin/auto-emails/${data.savedEmailId}`;

    // Aquí implementarías el envío real por WhatsApp
    console.log('📱 [WHATSAPP] Notificación enviada a:', process.env.NOTIFICATION_WHATSAPP);

  } catch (error) {
    console.error('❌ [WHATSAPP] Error enviando notificación por WhatsApp:', error);
  }
} 