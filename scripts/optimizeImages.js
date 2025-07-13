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

// Función para analizar imágenes en un directorio
function analyzeImages(dirPath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.glb'];
  const images = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subImages = analyzeImages(fullPath);
        images.push(...subImages);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const relativePath = path.relative('.', fullPath);
          images.push({
            path: fullPath,
            relativePath: relativePath,
            size: stat.size,
            sizeFormatted: formatFileSize(stat.size),
            extension: ext
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error procesando directorio ${dirPath}:`, error.message);
  }
  
  return images;
}

// Función para crear un backup de una imagen
function createBackup(imagePath) {
  const backupPath = imagePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(imagePath, backupPath);
    console.log(`📦 Backup creado: ${backupPath}`);
  }
}

// Función para verificar si una imagen necesita optimización
function needsOptimization(image) {
  // Optimizar imágenes mayores a 1MB
  return image.size > 1024 * 1024;
}

// Función para generar recomendaciones de optimización
function generateOptimizationRecommendations(images) {
  const largeImages = images.filter(needsOptimization);
  
  console.log('🔍 ANÁLISIS DE OPTIMIZACIÓN:\n');
  
  if (largeImages.length === 0) {
    console.log('✅ Todas las imágenes están en un tamaño razonable.');
    return;
  }
  
  console.log(`⚠️  ${largeImages.length} imágenes necesitan optimización:\n`);
  
  largeImages.forEach((image, index) => {
    console.log(`${index + 1}. ${image.relativePath}`);
    console.log(`   Tamaño actual: ${image.sizeFormatted}`);
    console.log(`   Extensión: ${image.extension}`);
    
    // Recomendaciones específicas por tipo
    if (image.extension === '.jpg' || image.extension === '.jpeg') {
      console.log(`   💡 Recomendación: Convertir a WebP o reducir calidad a 80%`);
    } else if (image.extension === '.png') {
      console.log(`   💡 Recomendación: Convertir a WebP o usar PNG optimizado`);
    } else if (image.extension === '.glb') {
      console.log(`   💡 Recomendación: Verificar si este archivo 3D es necesario`);
    }
    console.log('');
  });
  
  // Estadísticas
  const totalSize = largeImages.reduce((sum, img) => sum + img.size, 0);
  const estimatedSavings = totalSize * 0.6; // Estimación de 60% de reducción
  
  console.log('📊 ESTADÍSTICAS:');
  console.log(`   Tamaño total de imágenes grandes: ${formatFileSize(totalSize)}`);
  console.log(`   Ahorro estimado con optimización: ${formatFileSize(estimatedSavings)}`);
  console.log(`   Reducción estimada: 60%`);
  
  console.log('\n🛠️  HERRAMIENTAS RECOMENDADAS:');
  console.log('   1. TinyPNG (https://tinypng.com/) - Para PNG y JPEG');
  console.log('   2. Squoosh (https://squoosh.app/) - Para conversión a WebP');
  console.log('   3. ImageOptim - Para optimización local');
  console.log('   4. Next.js Image Optimization - Para optimización automática');
  
  console.log('\n📝 PLAN DE ACCIÓN:');
  console.log('   1. Crear backups de las imágenes originales');
  console.log('   2. Optimizar las imágenes más grandes primero');
  console.log('   3. Convertir a formatos modernos (WebP)');
  console.log('   4. Implementar lazy loading en el frontend');
  console.log('   5. Usar Next.js Image component para optimización automática');
}

// Función para crear un script de optimización manual
function createOptimizationScript(images) {
  const largeImages = images.filter(needsOptimization);
  
  if (largeImages.length === 0) return;
  
  const scriptContent = `# Script de optimización manual para imágenes grandes
# Ejecutar estos comandos para optimizar las imágenes

${largeImages.map((image, index) => {
  const fileName = path.basename(image.path);
  return `# ${index + 1}. ${fileName} (${image.sizeFormatted})
# Opción 1: Usar TinyPNG online
# Visitar: https://tinypng.com/ y subir: ${image.relativePath}

# Opción 2: Usar ImageOptim (macOS)
# imageoptim "${image.path}"

# Opción 3: Usar Squoosh para convertir a WebP
# Visitar: https://squoosh.app/ y convertir: ${image.relativePath}
`;
}).join('\n')}

# Después de optimizar, verificar que las imágenes funcionen correctamente
# y eliminar los archivos .backup si todo está bien
`;
  
  fs.writeFileSync('optimize-images-manual.sh', scriptContent);
  console.log('\n📄 Script de optimización manual creado: optimize-images-manual.sh');
}

// Ejecutar el análisis
console.log('🔍 Analizando imágenes para optimización...\n');

const startTime = Date.now();
const allImages = analyzeImages('./public');
const endTime = Date.now();

// Ordenar por tamaño (más grandes primero)
allImages.sort((a, b) => b.size - a.size);

console.log(`📊 Total de imágenes encontradas: ${allImages.length}`);
console.log(`⏱️  Tiempo de análisis: ${endTime - startTime}ms\n`);

// Generar recomendaciones
generateOptimizationRecommendations(allImages);

// Crear script de optimización manual
createOptimizationScript(allImages);

// Crear backups de las imágenes más grandes
console.log('\n📦 Creando backups de imágenes grandes...');
const largeImages = allImages.filter(needsOptimization);
largeImages.forEach(image => {
  createBackup(image.path);
});

console.log('\n✅ Análisis completado. Revisa las recomendaciones arriba.'); 