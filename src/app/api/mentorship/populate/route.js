import connectDB from '../../../../config/connectDB';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import { NextResponse } from 'next/server';

connectDB();

export async function POST() {
  try {
    // Eliminar todos los planes de mentoría existentes
    await MentorshipPlan.deleteMany({});

    // Nuevos planes de mentoría adaptados al negocio de MForMove
    const newMentorshipPlans = [
      {
        name: "Mentoría Explorer",
        description: "Ideal para principiantes que quieren comenzar su viaje en el movimiento consciente. Sesiones personalizadas para establecer bases sólidas.",
        level: "explorer",
        features: [
          "Sesión inicial de evaluación personal",
          "Plan de entrenamiento personalizado",
          "2 sesiones de mentoría por mes",
          "Acceso a recursos exclusivos",
          "Seguimiento semanal por email",
          "Comunidad privada de exploradores"
        ],
        prices: [
          {
            interval: "trimestral",
            price: 99,
            currency: "USD",
            stripePriceId: "price_explorer_quarterly"
          }
        ],
        active: true
      },
      {
        name: "Mentoría Practitioner",
        description: "Para practicantes intermedios que buscan profundizar en técnicas avanzadas y optimizar su rendimiento.",
        level: "practitioner",
        features: [
          "Evaluación avanzada de movimientos",
          "3 sesiones de mentoría por mes",
          "Análisis de video personalizado",
          "Programa de progresión avanzado",
          "Acceso a workshops exclusivos",
          "Soporte prioritario",
          "Comunidad de practicantes"
        ],
        prices: [
          {
            interval: "trimestral",
            price: 149,
            currency: "USD",
            stripePriceId: "price_practitioner_quarterly"
          }
        ],
        active: true
      },
      {
        name: "Mentoría Student",
        description: "Programa intensivo para estudiantes avanzados que buscan convertirse en instructores o alcanzar el siguiente nivel.",
        level: "student",
        features: [
          "Mentoría 1-on-1 intensiva",
          "4 sesiones de mentoría por mes",
          "Certificación de instructor",
          "Acceso completo a todos los recursos",
          "Participación en eventos exclusivos",
          "Soporte 24/7",
          "Comunidad VIP de estudiantes"
        ],
        prices: [
          {
            interval: "trimestral",
            price: 199,
            currency: "USD",
            stripePriceId: "price_student_quarterly"
          }
        ],
        active: true
      },
      {
        name: "Mentoría Explorer Anual",
        description: "Plan anual con descuento para exploradores comprometidos con su desarrollo a largo plazo.",
        level: "explorer",
        features: [
          "Sesión inicial de evaluación personal",
          "Plan de entrenamiento personalizado",
          "2 sesiones de mentoría por mes",
          "Acceso a recursos exclusivos",
          "Seguimiento semanal por email",
          "Comunidad privada de exploradores",
          "Descuento del 30% vs plan trimestral"
        ],
        prices: [
          {
            interval: "anual",
            price: 349,
            currency: "USD",
            stripePriceId: "price_explorer_yearly"
          }
        ],
        active: true
      },
      {
        name: "Mentoría Practitioner Anual",
        description: "Plan anual premium para practicantes que buscan un compromiso a largo plazo con su desarrollo.",
        level: "practitioner",
        features: [
          "Evaluación avanzada de movimientos",
          "3 sesiones de mentoría por mes",
          "Análisis de video personalizado",
          "Programa de progresión avanzado",
          "Acceso a workshops exclusivos",
          "Soporte prioritario",
          "Comunidad de practicantes",
          "Descuento del 25% vs plan trimestral"
        ],
        prices: [
          {
            interval: "anual",
            price: 499,
            currency: "USD",
            stripePriceId: "price_practitioner_yearly"
          }
        ],
        active: true
      }
    ];

    // Insertar los nuevos planes de mentoría
    const createdPlans = await MentorshipPlan.insertMany(newMentorshipPlans);

    return NextResponse.json({
      success: true,
      message: `${createdPlans.length} planes de mentoría creados exitosamente`,
      plans: createdPlans
    }, { status: 200 });

  } catch (error) {
    console.error('Error al poblar planes de mentoría:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al poblar los planes de mentoría',
      error: error.message
    }, { status: 500 });
  }
} 