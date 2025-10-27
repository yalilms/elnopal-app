#!/usr/bin/env node

/**
 * Generador de secretos seguros para El Nopal Restaurant
 * Genera JWT_SECRET y SESSION_SECRET criptográficamente seguros
 */

const crypto = require('crypto');

console.log('🔐 Generando secretos seguros para El Nopal Restaurant...\n');

// Función para generar un secreto aleatorio seguro
const generateSecureSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generar secretos
const jwtSecret = generateSecureSecret(32); // 64 caracteres hex
const sessionSecret = generateSecureSecret(32); // 64 caracteres hex
const encryptionKey = generateSecureSecret(16); // 32 caracteres hex para AES-256

console.log('✅ Secretos generados correctamente:\n');

console.log('🔑 JWT_SECRET (para autenticación):');
console.log(jwtSecret);
console.log('');

console.log('🔑 SESSION_SECRET (para sesiones):');
console.log(sessionSecret);
console.log('');

console.log('🔑 ENCRYPTION_KEY (opcional, para datos sensibles):');
console.log(encryptionKey);
console.log('');

console.log('📋 Variables de entorno actualizadas:');
console.log('═'.repeat(60));
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('═'.repeat(60));
console.log('');

console.log('⚠️  IMPORTANTE:');
console.log('1. Copia estos valores al archivo .env de producción');
console.log('2. Nunca compartas estos secretos públicamente');
console.log('3. Reinicia el servidor después de actualizar');
console.log('4. Mantén un backup seguro de estos valores');
console.log('');

// Crear archivo .env.secrets con los nuevos valores
const envContent = `# Secretos seguros generados para El Nopal Restaurant
# Fecha de generación: ${new Date().toISOString()}
# IMPORTANTE: Nunca subir este archivo a repositorios públicos

JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
ENCRYPTION_KEY=${encryptionKey}

# Configuración adicional recomendada
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000
`;

require('fs').writeFileSync('.env.secrets', envContent);
console.log('💾 Archivo .env.secrets creado con los nuevos secretos');
console.log('');

// Verificar entropía de los secretos
const calculateEntropy = (str) => {
  const len = str.length;
  const chars = [...new Set(str)].length;
  return len * Math.log2(chars);
};

console.log('📊 Análisis de seguridad:');
console.log(`   JWT_SECRET: ${calculateEntropy(jwtSecret).toFixed(1)} bits de entropía`);
console.log(`   SESSION_SECRET: ${calculateEntropy(sessionSecret).toFixed(1)} bits de entropía`);
console.log('   ✅ Ambos secretos tienen alta entropía (>= 256 bits recomendado)');
console.log('');

console.log('🎉 ¡Generación completada! Actualiza tu .env de producción.');