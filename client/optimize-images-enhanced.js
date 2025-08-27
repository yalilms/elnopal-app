const fs = require('fs').promises;
const path = require('path');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  quality: {
    jpg: { quality: 85 },
    png: { quality: [0.6, 0.8] },
    webp: { quality: 80 }
  },
  directories: {
    input: './src/images',
    output: './src/images/optimized',
    webp: './src/images/webp'
  }
};

// Utilidades
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const calculateSavings = (original, optimized) => {
  const savings = original - optimized;
  const percentage = ((savings / original) * 100).toFixed(1);
  return { bytes: savings, percentage };
};

// Crear directorios necesarios
async function createDirectories() {
  const dirs = Object.values(OPTIMIZATION_CONFIG.directories);
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Directorio creado/verificado: ${dir}`);
    } catch (error) {
      console.warn(`⚠️  Error creando directorio ${dir}:`, error.message);
    }
  }
}

// Obtener archivos de imagen
async function getImageFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    return files.filter(file => /\.(jpe?g|png|gif)$/i.test(file));
  } catch (error) {
    console.warn(`⚠️  Error leyendo directorio ${directory}:`, error.message);
    return [];
  }
}

// Optimizar imágenes JPEG/PNG
async function optimizeImages() {
  console.log('🖼️  Optimizando imágenes JPEG/PNG...');
  
  const { input, output } = OPTIMIZATION_CONFIG.directories;
  const { jpg, png } = OPTIMIZATION_CONFIG.quality;
  
  try {
    const files = await imagemin([`${input}/*.{jpg,jpeg,png}`], {
      destination: output,
      plugins: [
        imageminMozjpeg(jpg),
        imageminPngquant(png)
      ]
    });

    let totalOriginal = 0;
    let totalOptimized = 0;

    console.log('\n📊 Resultados de optimización:');
    console.log('================================');

    for (const file of files) {
      const originalPath = path.join(input, path.basename(file.sourcePath));
      
      try {
        const originalStats = await fs.stat(originalPath);
        const optimizedSize = file.data.length;
        const savings = calculateSavings(originalStats.size, optimizedSize);

        totalOriginal += originalStats.size;
        totalOptimized += optimizedSize;

        console.log(`✅ ${path.basename(file.sourcePath)}`);
        console.log(`   Original: ${formatBytes(originalStats.size)}`);
        console.log(`   Optimizado: ${formatBytes(optimizedSize)}`);
        console.log(`   Ahorro: ${formatBytes(savings.bytes)} (${savings.percentage}%)`);
        console.log('');
      } catch (error) {
        console.warn(`⚠️  Error procesando ${file.sourcePath}:`, error.message);
      }
    }

    if (files.length > 0) {
      const totalSavings = calculateSavings(totalOriginal, totalOptimized);
      console.log('🎯 RESUMEN TOTAL:');
      console.log(`   Archivos procesados: ${files.length}`);
      console.log(`   Tamaño original: ${formatBytes(totalOriginal)}`);
      console.log(`   Tamaño optimizado: ${formatBytes(totalOptimized)}`);
      console.log(`   Ahorro total: ${formatBytes(totalSavings.bytes)} (${totalSavings.percentage}%)`);
    } else {
      console.log('ℹ️  No se encontraron archivos para optimizar');
    }

    return files;
  } catch (error) {
    console.error('❌ Error optimizando imágenes:', error.message);
    return [];
  }
}

// Generar versiones WebP
async function generateWebPVersions() {
  console.log('\n🌐 Generando versiones WebP...');
  
  const { input, webp } = OPTIMIZATION_CONFIG.directories;
  const { webp: webpQuality } = OPTIMIZATION_CONFIG.quality;
  
  try {
    const files = await imagemin([`${input}/*.{jpg,jpeg,png}`], {
      destination: webp,
      plugins: [
        imageminWebp(webpQuality)
      ]
    });

    console.log('\n📊 Versiones WebP generadas:');
    console.log('============================');

    for (const file of files) {
      const originalPath = path.join(input, path.basename(file.sourcePath));
      
      try {
        const originalStats = await fs.stat(originalPath);
        const webpSize = file.data.length;
        const savings = calculateSavings(originalStats.size, webpSize);

        console.log(`✅ ${path.basename(file.destinationPath)}`);
        console.log(`   Original: ${formatBytes(originalStats.size)}`);
        console.log(`   WebP: ${formatBytes(webpSize)}`);
        console.log(`   Ahorro: ${formatBytes(savings.bytes)} (${savings.percentage}%)`);
        console.log('');
      } catch (error) {
        console.warn(`⚠️  Error procesando WebP para ${file.sourcePath}:`, error.message);
      }
    }

    if (files.length > 0) {
      console.log(`🎯 Se generaron ${files.length} versiones WebP`);
    } else {
      console.log('ℹ️  No se pudieron generar versiones WebP');
    }

    return files;
  } catch (error) {
    console.error('❌ Error generando versiones WebP:', error.message);
    return [];
  }
}

// Generar manifiesto de imágenes
async function generateImageManifest(optimizedFiles, webpFiles) {
  console.log('\n📝 Generando manifiesto de imágenes...');
  
  const manifest = {
    generated: new Date().toISOString(),
    optimized: optimizedFiles.map(file => ({
      original: path.basename(file.sourcePath),
      optimized: path.basename(file.destinationPath),
      size: file.data.length
    })),
    webp: webpFiles.map(file => ({
      original: path.basename(file.sourcePath),
      webp: path.basename(file.destinationPath),
      size: file.data.length
    }))
  };

  try {
    const manifestPath = path.join(OPTIMIZATION_CONFIG.directories.input, 'image-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Manifiesto generado: ${manifestPath}`);
  } catch (error) {
    console.error('❌ Error generando manifiesto:', error.message);
  }
}

// Generar componente React para imágenes optimizadas
async function generateOptimizedImageComponent() {
  console.log('\n⚛️  Generando componente React para imágenes optimizadas...');
  
  const componentCode = `import React, { useState } from 'react';

// Componente para servir imágenes optimizadas con fallback
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generar rutas para versiones optimizadas
  const getOptimizedSrc = (originalSrc) => {
    const extension = originalSrc.split('.').pop().toLowerCase();
    const nameWithoutExt = originalSrc.replace(/\\.[^/.]+$/, "");
    
    return {
      webp: \`\${nameWithoutExt}.webp\`,
      optimized: originalSrc.replace('/images/', '/images/optimized/'),
      original: originalSrc
    };
  };

  const sources = getOptimizedSrc(src);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <img
        src={sources.original}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={handleLoad}
        {...props}
      />
    );
  }

  return (
    <picture className={className}>
      {/* Versión WebP para navegadores compatibles */}
      <source srcSet={sources.webp} type="image/webp" />
      
      {/* Versión optimizada como fallback */}
      <source srcSet={sources.optimized} />
      
      {/* Imagen original como último recurso */}
      <img
        src={sources.original}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={!isLoaded ? 'opacity-0 transition-opacity duration-300' : 'opacity-100 transition-opacity duration-300'}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
`;

  try {
    const componentPath = path.join('./src/components/common', 'OptimizedImageEnhanced.jsx');
    await fs.writeFile(componentPath, componentCode);
    console.log(`✅ Componente generado: ${componentPath}`);
  } catch (error) {
    console.error('❌ Error generando componente:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 INICIANDO OPTIMIZACIÓN AVANZADA DE IMÁGENES');
  console.log('==============================================');
  console.log(`Directorio de entrada: ${OPTIMIZATION_CONFIG.directories.input}`);
  console.log(`Directorio optimizado: ${OPTIMIZATION_CONFIG.directories.output}`);
  console.log(`Directorio WebP: ${OPTIMIZATION_CONFIG.directories.webp}`);
  console.log('');

  try {
    // Crear directorios
    await createDirectories();

    // Verificar que existe el directorio de entrada
    const inputFiles = await getImageFiles(OPTIMIZATION_CONFIG.directories.input);
    
    if (inputFiles.length === 0) {
      console.log('ℹ️  No se encontraron imágenes para optimizar');
      console.log(`📁 Coloca archivos .jpg, .jpeg o .png en: ${OPTIMIZATION_CONFIG.directories.input}`);
      return;
    }

    console.log(`📋 Encontradas ${inputFiles.length} imágenes para procesar:`);
    inputFiles.forEach(file => console.log(`   • ${file}`));
    console.log('');

    // Optimizar imágenes
    const optimizedFiles = await optimizeImages();

    // Generar versiones WebP
    const webpFiles = await generateWebPVersions();

    // Generar manifiesto
    await generateImageManifest(optimizedFiles, webpFiles);

    // Generar componente React
    await generateOptimizedImageComponent();

    console.log('\n🎉 OPTIMIZACIÓN COMPLETADA EXITOSAMENTE');
    console.log('======================================');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Usar OptimizedImageEnhanced.jsx en lugar de <img>');
    console.log('2. Configurar servidor web para servir WebP cuando sea compatible');
    console.log('3. Verificar que las rutas de imágenes optimizadas son correctas');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante la optimización:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  optimizeImages,
  generateWebPVersions,
  generateImageManifest,
  OPTIMIZATION_CONFIG
};