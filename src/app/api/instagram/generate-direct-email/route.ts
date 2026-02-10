import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '../../../../services/ai/aiService';

export async function POST(req: NextRequest) {
  try {
    const { concept } = await req.json();

    if (!concept) {
      return NextResponse.json(
        { error: 'Concepto es requerido' },
        { status: 400 }
      );
    }
    // Generar email directo con toda la personalidad de Mateo
    const emailPrompt = `
      Eres Mateo Molfino, experto en movimiento, biomecánica, salud postural, fuerza y flexibilidad.

      CONCEPTO A DESARROLLAR: "${concept}"

      Escribe un email educativo en tu estilo personal argentino, siendo TÚ (Mateo) quien enseña.

      CARACTERÍSTICAS DE TU ESTILO:
      - Usas "vos" y jerga uruguaya natural
      - Compartes experiencias personales reales
      - Enseñas con metodología clara y progresiva
      - Conectas emocionalmente antes de enseñar técnica
      - Usas ejemplos prácticos y anécdotas
      - Evitas repetir el concepto literalmente
      - Enfoque pedagógico como Ido Portal: progresión inteligente

      ESTRUCTURA DEL EMAIL:
      1. Hook personal/emocional (tu experiencia con este tema)
      2. Enseñanza técnica clara y accesible
      3. Progresión práctica paso a paso
      4. Call to action que invite a la acción

      Responde en JSON:
      {
        "subject": "Línea de asunto atractiva",
        "body": "Cuerpo completo del email en tu estilo",
        "cta": "Call to action específico",
        "hashtags": "#MForMove #MovimientoConsciente #[otros relevantes]"
      }

      Solo responde el JSON.
    `;

    const emailContent = await aiService.generateEmail({
      type: 'educational',
      content: emailPrompt,
      topic: concept
    });

    let email;
    try {
      email = JSON.parse(emailContent.html);
    } catch (error) {
      console.error('Error parsing email response:', error);
      // Email por defecto
      email = {
        subject: `Reflexiones sobre ${concept}`,
        body: `Hoy quiero compartirte algo sobre ${concept} que he estado pensando...

Como siempre digo, el movimiento es una conversación con tu cuerpo. Y ${concept} no es la excepción.

Te cuento mi experiencia con esto y cómo podés aplicarlo en tu práctica diaria.

¿Te pasa que a veces sentís que hay algo que no termina de hacer click? Bueno, eso me pasó a mí con este tema, hasta que entendí la clave.

La progresión es todo. Y acá te dejo los pasos que uso con mis estudiantes:

1. Primero, evaluamos donde estás parado
2. Trabajamos los fundamentos sin apuro  
3. Progresamos respetando tu cuerpo
4. Refinamos la técnica con práctica consciente

El secreto está en no saltearse pasos y confiar en el proceso.

¿Qué te parece si empezamos por el primer paso esta semana?`,
        cta: "Contame en los comentarios: ¿cuál es tu mayor desafío con este tema?",
        hashtags: "#MForMove #MovimientoConsciente #DesarrolloPersonal"
      };
    }


    return NextResponse.json({
      success: true,
      email: email
    });

  } catch (error) {
    console.error('Error generando email directo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}