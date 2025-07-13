import connectDB from '../../../../config/connectDB';
import FAQs from '../../../../models/faqModel';
import { NextResponse } from 'next/server';

connectDB();

export async function POST() {
  try {
    // Eliminar todas las FAQs existentes
    await FAQs.deleteMany({});

    // Nuevas preguntas frecuentes adaptadas al negocio
    const newFAQs = [
      // MEMBRESÍA
      {
        question: "¿Qué incluye la membresía 'Movete conmigo'?",
        answer: "La membresía incluye acceso completo a nuestra biblioteca de clases en video, ejercicios de respiración, entrenamiento basado en capacidades orgánicas, y contenido exclusivo actualizado regularmente. También tienes acceso a la comunidad de miembros y soporte técnico.",
        category: "membresia",
        order: 1
      },
      {
        question: "¿Puedo cancelar mi membresía en cualquier momento?",
        answer: "Sí, puedes cancelar tu membresía en cualquier momento desde tu panel de cuenta. La cancelación será efectiva al final del período de facturación actual y mantendrás acceso hasta esa fecha.",
        category: "membresia",
        order: 2
      },
      {
        question: "¿Hay diferentes niveles de membresía?",
        answer: "Actualmente ofrecemos una membresía completa que incluye todo nuestro contenido. Estamos trabajando en planes diferenciados para diferentes necesidades y niveles de experiencia.",
        category: "membresia",
        order: 3
      },
      {
        question: "¿Puedo acceder desde múltiples dispositivos?",
        answer: "Sí, puedes acceder a tu membresía desde cualquier dispositivo con conexión a internet. Tu cuenta está vinculada a tu email y puedes iniciar sesión desde computadoras, tablets y smartphones.",
        category: "membresia",
        order: 4
      },

      // MENTORÍA
      {
        question: "¿Qué es la mentoría personalizada?",
        answer: "La mentoría es un proceso de transformación guiado con acompañamiento directo y un plan hecho específicamente para ti. No es solo entrenamiento, es tener un sostén en el camino, alguien que te escuche, te guíe y te desafíe a crecer en tu práctica de forma real y sostenida.",
        category: "mentoria",
        order: 5
      },
      {
        question: "¿Cómo funciona el seguimiento por video?",
        answer: "Envías videos de tu práctica regularmente según tu plan personalizado. Mateo revisa cada video personalmente, proporciona feedback detallado, y ajusta tu programa según tu progreso. Es como tener una sesión de entrenamiento personal, pero de forma asíncrona y más frecuente.",
        category: "mentoria",
        order: 6
      },
      {
        question: "¿Por qué el compromiso de tres meses?",
        answer: "El compromiso de tres meses es clave para que el proceso tenga sentido y dé resultados reales. La transformación requiere tiempo y consistencia. Si no podés sostenerlo ahora, está bien - podés sumarte más adelante cuando estés listo.",
        category: "mentoria",
        order: 7
      },
      {
        question: "¿Qué diferencia hay entre la membresía y la mentoría?",
        answer: "La membresía te da acceso a contenido pre-grabado y la comunidad. La mentoría es un acompañamiento personalizado 1:1 con Mateo, con un plan específico para tus objetivos, seguimiento constante y ajustes en tiempo real según tu progreso.",
        category: "mentoria",
        order: 8
      },

      // PAGOS
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos tarjetas de crédito y débito a través de Stripe, que es una plataforma segura y confiable. También puedes usar Apple Pay y Google Pay en dispositivos compatibles.",
        category: "pagos",
        order: 9
      },
      {
        question: "¿Es seguro pagar en la plataforma?",
        answer: "Sí, utilizamos Stripe como procesador de pagos, que es una de las plataformas más seguras del mundo. No almacenamos información de tarjetas en nuestros servidores y todas las transacciones están encriptadas.",
        category: "pagos",
        order: 10
      },
      {
        question: "¿Puedo cambiar mi método de pago?",
        answer: "Sí, puedes actualizar tu método de pago en cualquier momento desde tu panel de cuenta en la sección de facturación. Los cambios se aplicarán para la próxima facturación.",
        category: "pagos",
        order: 11
      },
      {
        question: "¿Ofrecen reembolsos?",
        answer: "Para la membresía, ofrecemos una garantía de 7 días. Para la mentoría, debido a la naturaleza personalizada del servicio, no ofrecemos reembolsos, pero puedes cancelar en cualquier momento.",
        category: "pagos",
        order: 12
      },

      // TÉCNICO
      {
        question: "¿Qué necesito para acceder a las clases?",
        answer: "Solo necesitas un dispositivo con conexión a internet (computadora, tablet o smartphone) y una cuenta activa. Las clases se reproducen directamente en el navegador web.",
        category: "tecnico",
        order: 13
      },
      {
        question: "¿Puedo descargar las clases?",
        answer: "Por el momento, las clases solo están disponibles para streaming online. Esto nos permite mantener la calidad del contenido y proteger los derechos de autor.",
        category: "tecnico",
        order: 14
      },
      {
        question: "¿Qué hago si tengo problemas técnicos?",
        answer: "Si tienes problemas técnicos, puedes contactarnos a través de Instagram @mateo.move o enviarnos un email a info@mateomove.com. Nuestro equipo te responderá lo antes posible.",
        category: "tecnico",
        order: 15
      },
      {
        question: "¿Funciona en todos los navegadores?",
        answer: "La plataforma funciona mejor en Chrome, Firefox, Safari y Edge. Te recomendamos mantener tu navegador actualizado para la mejor experiencia.",
        category: "tecnico",
        order: 16
      },

      // GENERAL
      {
        question: "¿Quién es Mateo Molfino?",
        answer: "Mateo Molfino es un entrenador especializado en movimiento funcional, respiración y capacidades orgánicas. Con años de experiencia, ha ayudado a cientos de personas a transformar su relación con el movimiento y el bienestar.",
        category: "general",
        order: 17
      },
      {
        question: "¿Es para principiantes o avanzados?",
        answer: "Nuestro contenido está diseñado para todos los niveles. Tenemos clases para principiantes que te introducen a los conceptos básicos, y contenido más avanzado para quienes ya tienen experiencia. La mentoría se adapta específicamente a tu nivel actual.",
        category: "general",
        order: 18
      },
      {
        question: "¿Puedo hacer las clases desde casa?",
        answer: "¡Absolutamente! Todas nuestras clases están diseñadas para realizarse en casa con poco o ningún equipamiento. Solo necesitas espacio para moverte y tu cuerpo.",
        category: "general",
        order: 19
      },
      {
        question: "¿Con qué frecuencia se actualiza el contenido?",
        answer: "Agregamos nuevo contenido regularmente. Las clases nuevas se publican semanalmente, y también actualizamos contenido existente basándonos en el feedback de nuestra comunidad.",
        category: "general",
        order: 20
      }
    ];

    // Insertar las nuevas FAQs
    const createdFAQs = await FAQs.insertMany(newFAQs);

    return NextResponse.json({
      success: true,
      message: `${createdFAQs.length} preguntas frecuentes creadas exitosamente`,
      faqs: createdFAQs
    }, { status: 200 });

  } catch (error) {
    console.error('Error al poblar FAQs:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al poblar las preguntas frecuentes',
      error: error.message
    }, { status: 500 });
  }
} 