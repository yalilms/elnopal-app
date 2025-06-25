const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  console.log('🖼️  Optimizando imágenes...');
  
  try {
    // Crear directorio optimizado si no existe
    const optimizedDir = path.join(__dirname, 'src/images/optimized');
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true });
    }

    // Optimizar JPGs
    console.log('📸 Optimizando JPGs...');
    await imagemin(['src/images/*.{jpg,jpeg,JPG,JPEG}'], {
      destination: 'src/images/optimized',
      plugins: [
        imageminMozjpeg({
          quality: 80, // Calidad 80% (buen balance)
          progressive: true
        })
      ]
    });

    // Optimizar PNGs  
    console.log('🎨 Optimizando PNGs...');
    await imagemin(['src/images/*.{png,PNG}'], {
      destination: 'src/images/optimized',
      plugins: [
        imageminPngquant({
          quality: [0.7, 0.9] // Calidad 70-90%
        })
      ]
    });

    // Generar versiones WebP
    console.log('🚀 Generando versiones WebP...');
    await imagemin(['src/images/*.{jpg,jpeg,png,JPG,JPEG,PNG}'], {
      destination: 'src/images/webp',
      plugins: [
        imageminWebp({
          quality: 85
        })
      ]
    });

    console.log('✅ Optimización completada!');
    console.log('📁 Imágenes optimizadas en: src/images/optimized/');
    console.log('📁 Versiones WebP en: src/images/webp/');
    
  } catch (error) {
    console.error('❌ Error optimizando imágenes:', error);
  }
}

optimizeImages(); 