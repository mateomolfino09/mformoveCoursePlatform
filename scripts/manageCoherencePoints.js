// Script para gestionar y probar el sistema de Unidades de Coherencia (U.C.)
// Uso: 
//   node scripts/manageCoherencePoints.js view <userId>          - Ver estado actual
//   node scripts/manageCoherencePoints.js reset <userId>        - Resetear todo
//   node scripts/manageCoherencePoints.js set <userId> <total>  - Establecer total de U.C.
//   node scripts/manageCoherencePoints.js test <userId>         - Simular completaciones para probar

// Cargar variables de entorno
async function loadEnv() {
  try {
    const dotenv = await import('dotenv');
    const fs = await import('fs');
    const path = await import('path');
    
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    const envPath = path.resolve(process.cwd(), '.env');
    
    if (fs.existsSync(envLocalPath)) {
      dotenv.config({ path: envLocalPath });
      console.log('✅ Variables de entorno cargadas desde .env.local');
    } else if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log('✅ Variables de entorno cargadas desde .env');
    } else {
      console.log('⚠️  No se encontró archivo .env.local o .env');
    }
  } catch (error) {
    console.log('⚠️  No se pudo cargar dotenv');
  }
}

async function main() {
  await loadEnv();
  
  const mongoose = (await import('mongoose')).default;
  
  // Conectar a MongoDB
  async function connectDB() {
    if (mongoose.connections[0]?.readyState === 1) {
      return;
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  }
  
  await connectDB();
  
  // Cargar modelos
  const CoherenceTracking = (await import('../src/models/coherenceTrackingModel.js')).default;
  const Users = (await import('../src/models/userModel.js')).default;
  
  const args = process.argv.slice(2);
  const command = args[0];
  const userId = args[1];
  const value = args[2];
  
  if (!command || !userId) {
    console.log(`
📋 Uso del script:
  node scripts/manageCoherencePoints.js <comando> <userId> [valor]

Comandos disponibles:
  view <userId>          - Ver estado actual del usuario
  reset <userId>         - Resetear todas las U.C. y completaciones
  set <userId> <total>   - Establecer total de U.C. (sin resetear completaciones)
  test <userId>          - Simular completaciones para probar el sistema

Ejemplos:
  node scripts/manageCoherencePoints.js view 66c3cdc4120e26a72a3a7a3e
  node scripts/manageCoherencePoints.js reset 66c3cdc4120e26a72a3a7a3e
  node scripts/manageCoherencePoints.js set 66c3cdc4120e26a72a3a7a3e 5
  node scripts/manageCoherencePoints.js test 66c3cdc4120e26a72a3a7a3e
    `);
    process.exit(1);
  }
  
  // Verificar que el usuario existe
  const user = await Users.findById(userId);
  if (!user) {
    console.error(`❌ Usuario con ID ${userId} no encontrado`);
    process.exit(1);
  }
  
  console.log(`\n👤 Usuario: ${user.name || user.email} (${userId})\n`);
  
  // Obtener o crear tracking
  let tracking = await CoherenceTracking.findOne({ userId });
  
  if (!tracking) {
    console.log('📝 Creando nuevo tracking para el usuario...');
    tracking = await CoherenceTracking.getOrCreate(userId);
  }
  
  switch (command) {
    case 'view':
      console.log('📊 Estado actual del tracking:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Total U.C.: ${tracking.totalUnits}`);
      console.log(`Racha actual: ${tracking.currentStreak}`);
      console.log(`Racha más larga: ${tracking.longestStreak}`);
      console.log(`Última completación: ${tracking.lastCompletedDate ? new Date(tracking.lastCompletedDate).toLocaleString() : 'Nunca'}`);
      console.log(`\nCompletaciones semanales: ${tracking.weeklyCompletions?.length || 0}`);
      
      if (tracking.weeklyCompletions && tracking.weeklyCompletions.length > 0) {
        console.log('\n📅 Detalle de semanas:');
        tracking.weeklyCompletions.forEach((week, index) => {
          console.log(`  Semana ${index + 1}:`);
          console.log(`    Fecha inicio: ${new Date(week.weekStartDate).toLocaleDateString()}`);
          console.log(`    Video completado: ${week.completedVideo ? '✅' : '❌'}`);
          console.log(`    Audio completado: ${week.completedAudio ? '✅' : '❌'}`);
          console.log(`    U.C. otorgadas: ${week.ucsOtorgadas || 0}`);
          console.log(`    Completado en: ${new Date(week.completedAt).toLocaleString()}`);
        });
      }
      
      console.log(`\nArrays de completados:`);
      console.log(`  Días: ${tracking.completedDays?.length || 0}`);
      console.log(`  Semanas: ${tracking.completedWeeks?.length || 0}`);
      console.log(`  Videos: ${tracking.completedVideos?.length || 0}`);
      console.log(`  Audios: ${tracking.completedAudios?.length || 0}`);
      
      if (tracking.completedDays && tracking.completedDays.length > 0) {
        console.log(`\n  Días completados: ${tracking.completedDays.slice(0, 5).join(', ')}${tracking.completedDays.length > 5 ? '...' : ''}`);
      }
      if (tracking.completedVideos && tracking.completedVideos.length > 0) {
        console.log(`  Videos completados: ${tracking.completedVideos.slice(0, 5).join(', ')}${tracking.completedVideos.length > 5 ? '...' : ''}`);
      }
      if (tracking.completedAudios && tracking.completedAudios.length > 0) {
        console.log(`  Audios completados: ${tracking.completedAudios.slice(0, 5).join(', ')}${tracking.completedAudios.length > 5 ? '...' : ''}`);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      break;
      
    case 'reset':
      console.log('🔄 Reseteando tracking...');
      tracking.totalUnits = 0;
      tracking.currentStreak = 0;
      tracking.longestStreak = 0;
      tracking.lastCompletedDate = null;
      tracking.weeklyCompletions = [];
      tracking.completedDays = [];
      tracking.completedWeeks = [];
      tracking.completedVideos = [];
      tracking.completedAudios = [];
      tracking.achievements = [];
      
      await tracking.save();
      console.log('✅ Tracking reseteado exitosamente');
      break;
      
    case 'set':
      if (!value || isNaN(parseInt(value))) {
        console.error('❌ Debes proporcionar un número válido para el total de U.C.');
        process.exit(1);
      }
      
      const newTotal = parseInt(value);
      console.log(`🔢 Estableciendo total de U.C. a ${newTotal}...`);
      tracking.totalUnits = newTotal;
      await tracking.save();
      console.log(`✅ Total de U.C. establecido a ${newTotal}`);
      break;
      
    case 'test':
      console.log('🧪 Simulando completaciones para probar el sistema...\n');
      
      const logbookId = '69334661939d2aaf630df1b5'; // ID de ejemplo, puedes cambiarlo
      const now = new Date();
      
      // Calcular inicio de semana actual (lunes)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - daysToMonday);
      weekStartDate.setHours(0, 0, 0, 0);
      
      console.log(`📅 Semana calendario actual: ${weekStartDate.toLocaleDateString()}`);
      console.log(`\n🔬 Simulando completaciones:\n`);
      
      // Simular completación 1: Video (debería otorgar 1 U.C.)
      console.log('1️⃣ Completando video de semana 1...');
      try {
        const result1 = await tracking.addCoherenceUnit(logbookId, 'visual');
        console.log(`   Resultado: ${result1.success ? '✅' : '❌'} ${result1.message || 'U.C. otorgada'}`);
        console.log(`   Total U.C. después: ${tracking.totalUnits}`);
        console.log(`   Es semana adicional: ${result1.esSemanaAdicional ? 'Sí' : 'No'}\n`);
      } catch (error) {
        console.error(`   Error: ${error.message}\n`);
      }
      
      // Recargar tracking para obtener estado actualizado
      tracking = await CoherenceTracking.findOne({ userId });
      
      // Simular completación 2: Audio (debería otorgar 1 U.C., total = 2)
      console.log('2️⃣ Completando audio de semana 1...');
      try {
        const result2 = await tracking.addCoherenceUnit(logbookId, 'audioText');
        console.log(`   Resultado: ${result2.success ? '✅' : '❌'} ${result2.message || 'U.C. otorgada'}`);
        console.log(`   Total U.C. después: ${tracking.totalUnits}`);
        console.log(`   Es semana adicional: ${result2.esSemanaAdicional ? 'Sí' : 'No'}\n`);
      } catch (error) {
        console.error(`   Error: ${error.message}\n`);
      }
      
      // Recargar tracking
      tracking = await CoherenceTracking.findOne({ userId });
      
      // Simular completación 3: Video de semana 2 (debería otorgar solo 1 U.C. porque ya tiene 2)
      console.log('3️⃣ Completando video de semana 2 (semana adicional)...');
      try {
        const result3 = await tracking.addCoherenceUnit(logbookId, 'visual');
        console.log(`   Resultado: ${result3.success ? '✅' : '❌'} ${result3.message || 'U.C. otorgada'}`);
        console.log(`   Total U.C. después: ${tracking.totalUnits}`);
        console.log(`   Es semana adicional: ${result3.esSemanaAdicional ? 'Sí (solo 1 U.C.)' : 'No'}\n`);
      } catch (error) {
        console.error(`   Error: ${error.message}\n`);
      }
      
      // Recargar tracking
      tracking = await CoherenceTracking.findOne({ userId });
      
      // Simular completación 4: Audio de semana 2 (debería fallar porque ya obtuvo la U.C. de semana adicional)
      console.log('4️⃣ Intentando completar audio de semana 2 (debería fallar)...');
      try {
        const result4 = await tracking.addCoherenceUnit(logbookId, 'audioText');
        console.log(`   Resultado: ${result4.success ? '✅' : '❌'} ${result4.message || 'U.C. otorgada'}`);
        console.log(`   Total U.C. después: ${tracking.totalUnits}`);
        console.log(`   Es semana adicional: ${result4.esSemanaAdicional ? 'Sí' : 'No'}\n`);
      } catch (error) {
        console.error(`   Error: ${error.message}\n`);
      }
      
      // Recargar tracking
      tracking = await CoherenceTracking.findOne({ userId });
      
      // Simular completación 5: Video de semana 3 (otra semana adicional, debería otorgar 1 U.C.)
      console.log('5️⃣ Completando video de semana 3 (otra semana adicional)...');
      try {
        const result5 = await tracking.addCoherenceUnit(logbookId, 'visual');
        console.log(`   Resultado: ${result5.success ? '✅' : '❌'} ${result5.message || 'U.C. otorgada'}`);
        console.log(`   Total U.C. después: ${tracking.totalUnits}`);
        console.log(`   Es semana adicional: ${result5.esSemanaAdicional ? 'Sí (solo 1 U.C.)' : 'No'}\n`);
      } catch (error) {
        console.error(`   Error: ${error.message}\n`);
      }
      
      // Recargar tracking final
      tracking = await CoherenceTracking.findOne({ userId });
      
      console.log('\n📊 Resultado final:');
      console.log(`   Total U.C.: ${tracking.totalUnits}`);
      console.log(`   Racha actual: ${tracking.currentStreak}`);
      console.log(`   Completaciones semanales: ${tracking.weeklyCompletions?.length || 0}`);
      
      if (tracking.weeklyCompletions && tracking.weeklyCompletions.length > 0) {
        const week = tracking.weeklyCompletions[0];
        console.log(`   U.C. otorgadas esta semana: ${week.ucsOtorgadas || 0}`);
        console.log(`   Video completado: ${week.completedVideo ? 'Sí' : 'No'}`);
        console.log(`   Audio completado: ${week.completedAudio ? 'Sí' : 'No'}`);
      }
      
      console.log('\n✅ Prueba completada\n');
      break;
      
    default:
      console.error(`❌ Comando desconocido: ${command}`);
      console.log('Comandos disponibles: view, reset, set, test');
      process.exit(1);
  }
  
  await mongoose.connection.close();
  console.log('✅ Conexión cerrada');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

