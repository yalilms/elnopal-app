// Script para verificar la conexión a la base de datos MongoDB
const path = require('path');
const serverPath = path.join(__dirname, 'server');
const dotenv = require(`${serverPath}/node_modules/dotenv`);
const mongoose = require(`${serverPath}/node_modules/mongoose`);

// Cargar variables de entorno
dotenv.config({ path: path.join(serverPath, '.env') });

// Opciones de conexión optimizadas
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  family: 4,
};

// URL de conexión desde el archivo .env
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elnopal';

console.log('🔄 Verificando conexión a MongoDB...');
console.log(`🌐 URL: ${mongodbUri.replace(/:[^:@]*@/, ':****@')}`); // Ocultar contraseña

// Configuración de Mongoose para evitar warnings
mongoose.set('strictQuery', false);

async function testConnection() {
  try {
    // Intentar conexión
    const conn = await mongoose.connect(mongodbUri, mongoOptions);
    console.log('✅ Conexión a MongoDB exitosa!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`📁 Base de datos: ${conn.connection.name}`);
    
    // Verificar las colecciones existentes
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`\n📋 Colecciones disponibles (${collections.length}):`);
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name}`);
    });
    
    // Si hay colecciones, mostrar ejemplo de documentos
    if (collections.length > 0) {
      for (const collection of collections) {
        const count = await conn.connection.db.collection(collection.name).countDocuments();
        console.log(`\n📊 Colección '${collection.name}' tiene ${count} documentos`);
        
        if (count > 0) {
          // Mostrar un documento de ejemplo
          const sampleDoc = await conn.connection.db.collection(collection.name).findOne();
          console.log('   📄 Ejemplo de documento:');
          console.log(JSON.stringify(sampleDoc, null, 2).split('\n').map(line => '      ' + line).join('\n'));
        }
      }
    } else {
      console.log('\n⚠️ No hay colecciones en la base de datos. La base de datos está vacía.');
    }
    
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:');
    console.error(err);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('\n👋 Verificación completada y conexión cerrada');
  }
}

// Ejecutar prueba
testConnection().catch(console.error);
