const fs = require('fs');
const path = require('path');

// Función para limpiar console.logs de un archivo
function cleanConsoleLogs(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Patrones para detectar console.logs
    const patterns = [
      /console\.log\([^)]*\);?\s*/g,  // console.log(...);
      /console\.log\([^)]*\)\s*/g,    // console.log(...) sin punto y coma
      /\/\/\s*console\.log\([^)]*\);?\s*/g,  // console.logs comentados
    ];
    
    let cleanedContent = content;
    let removedCount = 0;
    
    patterns.forEach(pattern => {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        removedCount += matches.length;
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    });
    
    // Solo escribir si se hicieron cambios
    if (removedCount > 0) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ Limpiados ${removedCount} console.logs de: ${filePath}`);
      return removedCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

// Función recursiva para procesar directorios
function processDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let totalRemoved = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Saltar node_modules y .git
        if (item !== 'node_modules' && item !== '.git' && item !== '.next') {
          totalRemoved += processDirectory(fullPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          totalRemoved += cleanConsoleLogs(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando directorio ${dirPath}:`, error.message);
  }
  
  return totalRemoved;
}

// Ejecutar la limpieza
console.log('🧹 Iniciando limpieza de console.logs...\n');

const startTime = Date.now();
const totalRemoved = processDirectory('./src');
const endTime = Date.now();

console.log(`\n🎉 ¡Limpieza completada!`);
console.log(`📊 Total de console.logs removidos: ${totalRemoved}`);
console.log(`⏱️  Tiempo de ejecución: ${endTime - startTime}ms`);

if (totalRemoved > 0) {
  console.log('\n💡 Recomendaciones:');
  console.log('   - Revisa los archivos modificados');
  console.log('   - Ejecuta las pruebas para asegurar que todo funciona');
  console.log('   - Considera usar un logger en producción');
} else {
  console.log('\n✨ ¡No se encontraron console.logs para limpiar!');
} 