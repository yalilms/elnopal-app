// Script para crear un usuario administrador en El Nopal
require('dotenv').config({ path: './server/.env' });
const mongoose = require('./server/node_modules/mongoose');
const bcrypt = require('./server/node_modules/bcrypt');

// Esquema de usuario basado en el modelo existente
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'user'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// Configuración de la base de datos
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elnopal';
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

// Configuración de mongoose
mongoose.set('strictQuery', false);

// Datos del administrador
const adminData = {
  name: 'Administrador',
  email: 'admin@elnopal.es',
  password: 'AdminElNopal2024!',
  role: 'admin'
};

// Función para crear administrador
async function createAdmin() {
  try {
    // Conectar a la base de datos
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(mongodbUri, mongoOptions);
    console.log('✅ Conectado a MongoDB');
    
    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️ El administrador ya existe. No se creará uno nuevo.');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rol: ${existingAdmin.role}`);
      console.log(`   Creado: ${existingAdmin.created}`);
      await mongoose.disconnect();
      return;
    }
    
    // Hashear la contraseña
    console.log('🔐 Hasheando contraseña...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Crear el administrador
    console.log('👤 Creando usuario administrador...');
    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });
    
    // Guardar el administrador
    await admin.save();
    console.log('✅ Administrador creado exitosamente');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: ${adminData.password} (sin hashear, para referencia)`);
    console.log(`   Rol: ${admin.role}`);
    
    console.log('\n🔐 Credenciales para iniciar sesión:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: ${adminData.password}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar la función
createAdmin();
