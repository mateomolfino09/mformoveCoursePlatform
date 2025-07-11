const fs = require('fs');
const path = require('path');

// Función para obtener el tamaño de archivo en formato legible
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para verificar si un archivo es temporal o innecesario
function isTempFile(filePath, fileName) {
  const tempPatterns = [
    /\.tmp$/i,
    /\.temp$/i,
    /\.log$/i,
    /\.cache$/i,
    /\.backup$/i,
    /\.bak$/i,
    /\.old$/i,
    /\.orig$/i,
    /\.swp$/i,
    /\.swo$/i,
    /\.DS_Store$/i,
    /Thumbs\.db$/i,
    /desktop\.ini$/i,
    /\.zip$/i,
    /\.tar\.gz$/i,
    /\.rar$/i
  ];
  
  return tempPatterns.some(pattern => pattern.test(fileName));
}

// Función para verificar si un archivo es grande y potencialmente innecesario
function isLargeFile(filePath, stat) {
  const largeFileThreshold = 5 * 1024 * 1024; // 5MB
  return stat.size > largeFileThreshold;
}

// Función para analizar archivos en un directorio
function analyzeFiles(dirPath, excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build']) {
  const files = [];
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          const subResult = analyzeFiles(fullPath, excludeDirs);
          files.push(...subResult.files);
          totalSize += subResult.totalSize;
        }
      } else if (stat.isFile()) {
        const relativePath = path.relative('.', fullPath);
        const isTemp = isTempFile(fullPath, item);
        const isLarge = isLargeFile(fullPath, stat);
        
        if (isTemp || isLarge) {
          files.push({
            path: fullPath,
            relativePath: relativePath,
            size: stat.size,
            sizeFormatted: formatFileSize(stat.size),
            isTemp: isTemp,
            isLarge: isLarge,
            fileName: item
          });
        }
        totalSize += stat.size;
      }
    }
  } catch (error) {
    console.error(`Error procesando directorio ${dirPath}:`, error.message);
  }
  
  return { files, totalSize };
}

// Función para generar recomendaciones de limpieza
function generateCleanupRecommendations(files) {
  const tempFiles = files.filter(f => f.isTemp);
  const largeFiles = files.filter(f => f.isLarge && !f.isTemp);
  
  console.log('🧹 ANÁLISIS DE LIMPIEZA:\n');
  
  if (tempFiles.length === 0 && largeFiles.length === 0) {
    console.log('✅ No se encontraron archivos temporales o innecesarios.');
    return;
  }
  
  if (tempFiles.length > 0) {
    console.log(`🗑️  ${tempFiles.length} archivos temporales encontrados:\n`);
    tempFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.relativePath} (${file.sizeFormatted})`);
    });
    console.log('');
  }
  
  if (largeFiles.length > 0) {
    console.log(`📦 ${largeFiles.length} archivos grandes encontrados:\n`);
    largeFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.relativePath} (${file.sizeFormatted})`);
      console.log(`   💡 Considera si este archivo es necesario`);
    });
    console.log('');
  }
  
  // Estadísticas
  const totalTempSize = tempFiles.reduce((sum, f) => sum + f.size, 0);
  const totalLargeSize = largeFiles.reduce((sum, f) => sum + f.size, 0);
  
  console.log('📊 ESTADÍSTICAS:');
  console.log(`   Archivos temporales: ${tempFiles.length} (${formatFileSize(totalTempSize)})`);
  console.log(`   Archivos grandes: ${largeFiles.length} (${formatFileSize(totalLargeSize)})`);
  console.log(`   Ahorro potencial: ${formatFileSize(totalTempSize + totalLargeSize)}`);
  
  console.log('\n🛠️  RECOMENDACIONES:');
  console.log('   1. Revisar archivos .backup (ya creados por el script de imágenes)');
  console.log('   2. Eliminar archivos .zip si no son necesarios');
  console.log('   3. Verificar archivos .glb grandes (modelos 3D)');
  console.log('   4. Limpiar logs y archivos temporales del sistema');
  
  return { tempFiles, largeFiles };
}

// Función para crear un script de limpieza manual
function createCleanupScript(files) {
  const tempFiles = files.filter(f => f.isTemp);
  const largeFiles = files.filter(f => f.isLarge && !f.isTemp);
  
  if (tempFiles.length === 0 && largeFiles.length === 0) return;
  
  let scriptContent = `# Script de limpieza manual
# Revisar cada archivo antes de eliminarlo

`;
  
  if (tempFiles.length > 0) {
    scriptContent += `# ARCHIVOS TEMPORALES (${tempFiles.length} archivos)\n`;
    tempFiles.forEach((file, index) => {
      scriptContent += `# ${index + 1}. ${file.relativePath} (${file.sizeFormatted})\n`;
      scriptContent += `# rm "${file.path}"\n\n`;
    });
  }
  
  if (largeFiles.length > 0) {
    scriptContent += `# ARCHIVOS GRANDES (${largeFiles.length} archivos)\n`;
    scriptContent += `# Revisar si estos archivos son necesarios antes de eliminar\n\n`;
    largeFiles.forEach((file, index) => {
      scriptContent += `# ${index + 1}. ${file.relativePath} (${file.sizeFormatted})\n`;
      scriptContent += `# Verificar si es necesario: ${file.fileName}\n`;
      scriptContent += `# rm "${file.path}"\n\n`;
    });
  }
  
  scriptContent += `# Después de la limpieza, ejecutar:
# npm run build
# npm run dev
# Para verificar que todo funciona correctamente
`;
  
  fs.writeFileSync('cleanup-manual.sh', scriptContent);
  console.log('\n📄 Script de limpieza manual creado: cleanup-manual.sh');
}

// Ejecutar el análisis
console.log('🔍 Analizando archivos temporales y innecesarios...\n');

const startTime = Date.now();
const result = analyzeFiles('.');
const endTime = Date.now();

// Ordenar por tamaño (más grandes primero)
result.files.sort((a, b) => b.size - a.size);

console.log(`📊 Total de archivos analizados`);
console.log(`⏱️  Tiempo de análisis: ${endTime - startTime}ms\n`);

// Generar recomendaciones
const recommendations = generateCleanupRecommendations(result.files);

// Crear script de limpieza manual
if (recommendations) {
  createCleanupScript(result.files);
}

console.log('\n✅ Análisis completado. Revisa las recomendaciones arriba.'); 