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
        // Procesar subdirectorios recursivamente
        const subImages = analyzeImages(fullPath);
        images.push(...subImages);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const relativePath = path.relative('.', fullPath);
          images.push({
            path: relativePath,
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

// Analizar imágenes en public/
console.log('🔍 Analizando imágenes del proyecto...\n');

const startTime = Date.now();
const allImages = analyzeImages('./public');
const endTime = Date.now();

// Ordenar por tamaño (más grandes primero)
allImages.sort((a, b) => b.size - a.size);

console.log(`📊 Total de imágenes encontradas: ${allImages.length}`);
console.log(`⏱️  Tiempo de análisis: ${endTime - startTime}ms\n`);

// Mostrar las 20 imágenes más grandes
console.log('🏆 TOP 20 IMÁGENES MÁS PESADAS:\n');
console.log('Tamaño\t\tExtensión\tRuta');
console.log('─'.repeat(80));

allImages.slice(0, 20).forEach((image, index) => {
  const size = image.sizeFormatted.padEnd(12);
  const ext = image.extension.padEnd(10);
  console.log(`${size}\t${ext}\t${image.path}`);
});

// Análisis por extensión
console.log('\n📈 ANÁLISIS POR EXTENSIÓN:\n');
const extensionStats = {};
allImages.forEach(image => {
  if (!extensionStats[image.extension]) {
    extensionStats[image.extension] = { count: 0, totalSize: 0 };
  }
  extensionStats[image.extension].count++;
  extensionStats[image.extension].totalSize += image.size;
});

Object.entries(extensionStats)
  .sort(([,a], [,b]) => b.totalSize - a.totalSize)
  .forEach(([ext, stats]) => {
    console.log(`${ext}: ${stats.count} archivos, ${formatFileSize(stats.totalSize)} total`);
  });

// Recomendaciones
console.log('\n💡 RECOMENDACIONES:\n');

const largeImages = allImages.filter(img => img.size > 1024 * 1024); // > 1MB
if (largeImages.length > 0) {
  console.log(`⚠️  ${largeImages.length} imágenes son mayores a 1MB:`);
  largeImages.forEach(img => {
    console.log(`   - ${img.path} (${img.sizeFormatted})`);
  });
  console.log('\n🔄 Considera optimizar estas imágenes:');
  console.log('   - Convertir a WebP para mejor compresión');
  console.log('   - Reducir la resolución si no es necesaria');
  console.log('   - Usar herramientas como TinyPNG o ImageOptim');
}

const totalSize = allImages.reduce((sum, img) => sum + img.size, 0);
console.log(`\n📦 Tamaño total de todas las imágenes: ${formatFileSize(totalSize)}`);

if (totalSize > 50 * 1024 * 1024) { // > 50MB
  console.log('🚨 El tamaño total de las imágenes es muy alto. Considera optimizar.');
} 