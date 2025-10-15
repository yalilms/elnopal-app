// Script para inicializar la base de datos con colecciones y datos básicos
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Configuración de MongoDB
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

// Modelos
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
  active: { type: Boolean, default: true },
  created: { type: Date, default: Date.now }
});

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  location: { type: String, enum: ['interior', 'terraza'], default: 'interior' },
  active: { type: Boolean, default: true }
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  author: { type: String, default: 'Admin' },
  created: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  slug: { type: String, unique: true },
  tags: [{ type: String }]
});

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  created: { type: Date, default: Date.now }
});

// Registrar modelos
mongoose.model('User', userSchema);
mongoose.model('Table', tableSchema);
mongoose.model('Post', postSchema);
mongoose.model('Review', reviewSchema);

// Datos iniciales
// NOTA: Cambiar contraseñas antes de usar en producción
const initialUsers = [
  {
    name: process.env.ADMIN_NAME || 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!',
    role: 'admin'
  },
  {
    name: process.env.STAFF_NAME || 'Empleado',
    email: process.env.STAFF_EMAIL || 'staff@example.com',
    password: process.env.STAFF_PASSWORD || 'ChangeThisPassword123!',
    role: 'staff'
  }
];

const initialTables = [
  { number: 1, capacity: 2, location: 'interior' },
  { number: 2, capacity: 4, location: 'interior' },
  { number: 3, capacity: 6, location: 'interior' },
  { number: 4, capacity: 8, location: 'interior' },
  { number: 5, capacity: 2, location: 'terraza' },
  { number: 6, capacity: 4, location: 'terraza' },
  { number: 7, capacity: 6, location: 'terraza' }
];

const initialPosts = [
  {
    title: 'Bienvenidos al blog de El Nopal',
    content: 'Nos complace darles la bienvenida al blog oficial de El Nopal Restaurant, donde compartiremos recetas, eventos y mucho más sobre la auténtica cocina mexicana.',
    author: 'Admin',
    slug: 'bienvenidos-al-blog',
    tags: ['bienvenida', 'novedades']
  },
  {
    title: 'Historia de la cocina mexicana',
    content: 'La gastronomía mexicana tiene una historia fascinante que se remonta a las civilizaciones precolombinas. Los aztecas y mayas ya utilizaban ingredientes como el maíz, los chiles y el cacao, que hoy son fundamentales en la cocina mexicana.',
    author: 'Chef Carlos',
    slug: 'historia-cocina-mexicana',
    tags: ['historia', 'gastronomía', 'cultura']
  },
  {
    title: 'Especial Día de Muertos',
    content: 'El Día de Muertos es una de las tradiciones más representativas de México. En El Nopal celebraremos con un menú especial que incluirá pan de muerto y otros platillos tradicionales.',
    author: 'Admin',
    slug: 'especial-dia-de-muertos',
    tags: ['eventos', 'tradiciones']
  }
];

const initialReviews = [
  {
    name: 'María López',
    email: 'maria@ejemplo.com',
    rating: 5,
    comment: 'Excelente comida, auténticos sabores mexicanos. ¡Volveré pronto!',
    status: 'approved'
  },
  {
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    rating: 4,
    comment: 'Muy buen servicio y ambiente acogedor. Los tacos estaban deliciosos.',
    status: 'approved'
  },
  {
    name: 'Ana García',
    email: 'ana@ejemplo.com',
    rating: 5,
    comment: 'La mejor cocina mexicana que he probado en España. Totalmente recomendable.',
    status: 'approved'
  }
];

// Función para inicializar la base de datos
async function initDatabase() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(mongodbUri, mongoOptions);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener modelos
    const User = mongoose.model('User');
    const Table = mongoose.model('Table');
    const Post = mongoose.model('Post');
    const Review = mongoose.model('Review');
    
    // Borrar colecciones existentes (opcional)
    console.log('🧹 Eliminando colecciones existentes...');
    await User.deleteMany({});
    await Table.deleteMany({});
    await Post.deleteMany({});
    await Review.deleteMany({});
    
    // Crear usuarios
    console.log('👥 Creando usuarios iniciales...');
    for (const userData of initialUsers) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      await User.create({
        ...userData,
        password: hashedPassword
      });
    }
    
    // Crear mesas
    console.log('🪑 Creando mesas iniciales...');
    await Table.insertMany(initialTables);
    
    // Crear posts
    console.log('📝 Creando posts iniciales...');
    await Post.insertMany(initialPosts);
    
    // Crear reseñas
    console.log('⭐ Creando reseñas iniciales...');
    await Review.insertMany(initialReviews);
    
    // Mostrar resumen
    const userCount = await User.countDocuments();
    const tableCount = await Table.countDocuments();
    const postCount = await Post.countDocuments();
    const reviewCount = await Review.countDocuments();
    
    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('📊 Resumen:');
    console.log(`   - Usuarios: ${userCount}`);
    console.log(`   - Mesas: ${tableCount}`);
    console.log(`   - Posts: ${postCount}`);
    console.log(`   - Reseñas: ${reviewCount}`);
    
    console.log('\n🔐 Credenciales de administrador:');
    console.log(`   - Email: ${initialUsers[0].email}`);
    console.log(`   - Contraseña: ${initialUsers[0].password}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar la inicialización
initDatabase();
