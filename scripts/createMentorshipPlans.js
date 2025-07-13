const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api/payments';

// Planes de mentoría de ejemplo
const mentorshipPlans = [
  {
    name: "Mentoría Explorer",
    description: "Ideal para principiantes que quieren comenzar su viaje en el movimiento consciente. Sesiones personalizadas para establecer bases sólidas.",
    price: 99,
    currency: "USD",
    interval: "trimestral",
    level: "explorer",
    features: [
      "Sesión inicial de evaluación personal",
      "Plan de entrenamiento personalizado",
      "2 sesiones de mentoría por mes",
      "Acceso a recursos exclusivos",
      "Seguimiento semanal por email",
      "Comunidad privada de exploradores"
    ],
    stripePriceId: "price_explorer_quarterly",
    active: true,
    planType: "mentorship",
    useStripe: true,
    amount: 99,
    amountAnual: 99
  },
  {
    name: "Mentoría Practitioner",
    description: "Para practicantes intermedios que buscan profundizar en técnicas avanzadas y optimizar su rendimiento.",
    price: 149,
    currency: "USD",
    interval: "trimestral",
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
    stripePriceId: "price_practitioner_quarterly",
    active: true,
    planType: "mentorship",
    useStripe: true,
    amount: 149,
    amountAnual: 149
  },
  {
    name: "Mentoría Student",
    description: "Programa intensivo para estudiantes avanzados que buscan convertirse en instructores o alcanzar el siguiente nivel.",
    price: 199,
    currency: "USD",
    interval: "trimestral",
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
    stripePriceId: "price_student_quarterly",
    active: true,
    planType: "mentorship",
    useStripe: true,
    amount: 199,
    amountAnual: 199
  },
  {
    name: "Mentoría Explorer Anual",
    description: "Plan anual con descuento para exploradores comprometidos con su desarrollo a largo plazo.",
    price: 349,
    currency: "USD",
    interval: "anual",
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
    stripePriceId: "price_explorer_yearly",
    active: true,
    planType: "mentorship",
    useStripe: true,
    amount: 349,
    amountAnual: 349
  },
  {
    name: "Mentoría Practitioner Anual",
    description: "Plan anual premium para practicantes que buscan un compromiso a largo plazo con su desarrollo.",
    price: 499,
    currency: "USD",
    interval: "anual",
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
    stripePriceId: "price_practitioner_yearly",
    active: true,
    planType: "mentorship",
    useStripe: true,
    amount: 499,
    amountAnual: 499
  }
];

// Función para crear un plan
async function createPlan(planData) {
  try {
    console.log(`🔄 Creando plan: ${planData.name}...`);
    
    const response = await axios.post(`${API_BASE_URL}/createPlan`, planData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`✅ Plan creado exitosamente: ${planData.name}`);
      console.log(`   💰 Precio: $${planData.price} ${planData.currency}`);
      console.log(`   📅 Intervalo: ${planData.interval}`);
      console.log(`   🎯 Nivel: ${planData.level}`);
      console.log(`   🔗 Stripe ID: ${planData.stripePriceId}`);
      console.log('---');
    } else {
      console.log(`❌ Error al crear plan: ${planData.name}`);
      console.log(`   Error: ${response.data.message}`);
    }
  } catch (error) {
    console.log(`❌ Error al crear plan: ${planData.name}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data.error || error.response.data.message}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    console.log('---');
  }
}

// Función principal
async function createAllPlans() {
  console.log('🚀 Iniciando creación de planes de mentoría...');
  console.log('📊 Total de planes a crear:', mentorshipPlans.length);
  console.log('---');

  for (const plan of mentorshipPlans) {
    await createPlan(plan);
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🎉 Proceso completado!');
  console.log('📋 Verificar planes en: http://localhost:3000/admin/mentorship/plans');
}

// Función para verificar planes existentes
async function checkExistingPlans() {
  try {
    console.log('🔍 Verificando planes existentes...');
    
    const response = await axios.get(`${API_BASE_URL}/getPlans?type=mentorship`);
    
    if (response.data && response.data.length > 0) {
      console.log(`📊 Se encontraron ${response.data.length} planes existentes:`);
      response.data.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.level}) - $${plan.price}`);
      });
      console.log('---');
      
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        console.log('⚠️  Ya existen planes de mentoría.');
        console.log('   Para forzar la creación, ejecuta: node scripts/createMentorshipPlans.js --force');
        return false;
      }
    } else {
      console.log('✅ No se encontraron planes existentes.');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error al verificar planes existentes:', error.message);
    return true; // Continuar si hay error en la verificación
  }
}

// Función para mostrar información del script
function showHelp() {
  console.log('📖 Script de Creación de Planes de Mentoría');
  console.log('==========================================');
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/createMentorshipPlans.js        # Crear planes (con verificación)');
  console.log('  node scripts/createMentorshipPlans.js --force # Forzar creación');
  console.log('  node scripts/createMentorshipPlans.js --help  # Mostrar esta ayuda');
  console.log('');
  console.log('Requisitos:');
  console.log('  - Servidor corriendo en http://localhost:3000');
  console.log('  - Base de datos MongoDB conectada');
  console.log('  - Modelo MentorshipPlan configurado');
  console.log('');
  console.log('Planes que se crearán:');
  mentorshipPlans.forEach((plan, index) => {
    console.log(`  ${index + 1}. ${plan.name} - $${plan.price} (${plan.interval})`);
  });
}

// Ejecutar script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showHelp();
    return;
  }

  try {
    const shouldContinue = await checkExistingPlans();
    if (shouldContinue) {
      await createAllPlans();
    }
  } catch (error) {
    console.log('❌ Error general:', error.message);
    console.log('');
    console.log('💡 Asegúrate de que:');
    console.log('   1. El servidor esté corriendo en http://localhost:3000');
    console.log('   2. La base de datos esté conectada');
    console.log('   3. El modelo MentorshipPlan esté configurado');
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { createAllPlans, mentorshipPlans }; 