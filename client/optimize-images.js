// Función para verificar si un módulo está disponible
function tryRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    console.log(`⚠️  Módulo ${moduleName} no disponible:`, error.message);
    return null;
  }
}

// Intentar cargar dependencias
const imagemin = tryRequire('imagemin');
const imageminMozjpeg = tryRequire('imagemin-mozjpeg');
const imageminPngquant = tryRequire('imagemin-pngquant');
const imageminWebp = tryRequire('imagemin-webp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  console.log('🖼️  Optimizando imágenes para El Nopal...');
  
  // Verificar si las dependencias están disponibles
  if (!imagemin) {
    console.log('⚠️  Dependencias de optimización no disponibles. Instalando...');
    const { execSync } = require('child_process');
    try {
      console.log('📦 Instalando dependencias de optimización...');
      execSync('npm install --save-dev imagemin imagemin-mozjpeg imagemin-pngquant imagemin-webp', { stdio: 'inherit' });
      console.log('✅ Dependencias instaladas. Reinicie el script.');
      return;
    } catch (error) {
      console.log('❌ Error instalando dependencias. Continuando sin optimización...');
      return;
    }
  }
  
  try {
    // Crear directorios si no existen
    const optimizedDir = path.join(__dirname, 'src/images/optimized');
    const webpDir = path.join(__dirname, 'src/images/webp');
    
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true });
      console.log('📁 Directorio optimized creado');
    }
    
    if (!fs.existsSync(webpDir)) {
      fs.mkdirSync(webpDir, { recursive: true });
      console.log('📁 Directorio webp creado');
    }

    // Verificar que existen imágenes para optimizar
    const imageDir = path.join(__dirname, 'src/images');
    if (!fs.existsSync(imageDir)) {
      console.log('⚠️  Directorio src/images no encontrado');
      return;
    }
    
    const images = fs.readdirSync(imageDir).filter(file => 
      /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(file)
    );
    
    if (images.length === 0) {
      console.log('⚠️  No se encontraron imágenes para optimizar');
      return;
    }
    
    console.log(`📸 Encontradas ${images.length} imágenes para optimizar`);

    // Optimizar JPGs y JPEGs
    if (imageminMozjpeg) {
      console.log('🔄 Optimizando archivos JPEG...');
      try {
        const jpgFiles = await imagemin(['src/images/*.{jpg,jpeg,JPG,JPEG}'], {
          destination: 'src/images/optimized',
          plugins: [
            imageminMozjpeg({
              quality: 80,
              progressive: true
            })
          ]
        });
        console.log(`✅ ${jpgFiles.length} archivos JPEG optimizados`);
      } catch (error) {
        console.log('⚠️  Error optimizando JPEG:', error.message);
      }
    }

    // Optimizar PNGs  
    if (imageminPngquant) {
      console.log('🔄 Optimizando archivos PNG...');
      try {
        const pngFiles = await imagemin(['src/images/*.{png,PNG}'], {
          destination: 'src/images/optimized',
          plugins: [
            imageminPngquant({
              quality: [0.7, 0.9]
            })
          ]
        });
        console.log(`✅ ${pngFiles.length} archivos PNG optimizados`);
      } catch (error) {
        console.log('⚠️  Error optimizando PNG:', error.message);
      }
    }

    // Generar versiones WebP
    if (imageminWebp) {
      console.log('🔄 Generando versiones WebP...');
      try {
        const webpFiles = await imagemin(['src/images/*.{jpg,jpeg,png,JPG,JPEG,PNG}'], {
          destination: 'src/images/webp',
          plugins: [
            imageminWebp({
              quality: 85
            })
          ]
        });
        console.log(`✅ ${webpFiles.length} archivos WebP generados`);
      } catch (error) {
        console.log('⚠️  Error generando WebP:', error.message);
      }
    }

    // Calcular ahorro de espacio
    const originalSize = getDirectorySize(path.join(__dirname, 'src/images'));
    const optimizedSize = getDirectorySize(optimizedDir);
    const webpSize = getDirectorySize(webpDir);
    
    console.log('');
    console.log('📊 RESUMEN DE OPTIMIZACIÓN:');
    console.log(`📁 Tamaño original: ${formatBytes(originalSize)}`);
    console.log(`📁 Tamaño optimizado: ${formatBytes(optimizedSize)}`);
    console.log(`📁 Tamaño WebP: ${formatBytes(webpSize)}`);
    
    if (originalSize > 0 && optimizedSize > 0) {
      console.log(`💾 Ahorro estimado: ${formatBytes(originalSize - optimizedSize)} (${Math.round((1 - optimizedSize/originalSize) * 100)}%)`);
    }
    
    console.log('');
    console.log('✅ ¡Optimización completada!');
    console.log('📁 Archivos optimizados en: src/images/optimized/');
    console.log('📁 Archivos WebP en: src/images/webp/');
    
  } catch (error) {
    console.error('❌ Error general en la optimización:', error);
    console.log('🔄 Continuando sin optimización de imágenes...');
  }
}

// Función auxiliar para calcular tamaño de directorio
function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

// Función auxiliar para formatear bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  optimizeImages().catch(console.error);
}

module.exports = optimizeImages; 