import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Por ahora retornamos planes estáticos
    // En el futuro esto puede conectarse a una base de datos
    const mentorshipPlans = [
      {
        id: 1,
        name: "Explorador de Movimiento",
        price: 350,
        currency: "USD",
        interval: "trimestral",
        description: "Seguimiento cada 6 semanas. Plan personalizado básico para quienes quieren empezar su viaje de movimiento consciente.",
        features: [
          "Evaluación inicial personalizada",
          "Plan de entrenamiento único",
          "Seguimiento cada 6 semanas",
          "Feedback por video",
          "Acceso a comunidad exclusiva",
          "Material de estudio básico"
        ],
        level: "explorer",
        stripePriceId: "price_explorer_mentorship", // Placeholder
        dlocalPriceId: "explorer_mentorship_quarterly" // Placeholder
      },
      {
        id: 2,
        name: "Practicante de Movimiento",
        price: 550,
        currency: "USD",
        interval: "trimestral",
        description: "Seguimiento semanal con llamada trimestral. Para quienes quieren profundizar en su práctica de movimiento.",
        features: [
          "Todo del plan Explorador",
          "Seguimiento semanal",
          "Llamada trimestral 1:1",
          "Plan avanzado personalizado",
          "Material de estudio completo",
          "Prioridad en consultas"
        ],
        level: "practitioner",
        stripePriceId: "price_practitioner_mentorship", // Placeholder
        dlocalPriceId: "practitioner_mentorship_quarterly" // Placeholder
      },
      {
        id: 3,
        name: "Estudiante de Movimiento",
        price: 750,
        currency: "USD",
        interval: "trimestral",
        description: "Seguimiento semanal intensivo con formación teórica. Para quienes quieren enseñar a otros.",
        features: [
          "Todo del plan Practicante",
          "Seguimiento semanal intensivo",
          "Llamada mensual",
          "Formación teórica completa",
          "Preparación para enseñanza",
          "Mentoría exclusiva"
        ],
        level: "student",
        stripePriceId: "price_student_mentorship", // Placeholder
        dlocalPriceId: "student_mentorship_quarterly" // Placeholder
      }
    ];

    return NextResponse.json(mentorshipPlans);
  } catch (error) {
    console.error('Error fetching mentorship plans:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 