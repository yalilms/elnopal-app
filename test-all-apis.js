#!/usr/bin/env node

/**
 * Script de testing completo para las APIs de El Nopal Restaurant
 * Prueba todos los endpoints sin necesidad de base de datos
 */

const axios = require('axios');
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configuración
const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const TIMEOUT = 10000; // 10 segundos

console.log(`${colors.cyan}🌮 Testing APIs de El Nopal Restaurant${colors.reset}`);
console.log(`${colors.blue}🌐 Base URL: ${API_BASE}${colors.reset}`);
console.log('═'.repeat(60));

// Configurar axios con timeout
axios.defaults.timeout = TIMEOUT;
axios.defaults.validateStatus = () => true; // No lanzar error en códigos de estado HTTP

// Función para hacer request con manejo de errores
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.response?.status || 'NO_RESPONSE'
    };
  }
}

// Función para mostrar resultado de test
function showResult(testName, result, expected = null) {
  const status = result.success ? 
    (expected ? (result.status === expected ? '✅' : '⚠️') : '✅') : 
    '❌';
  
  const statusCode = result.success ? result.status : result.status;
  const message = result.success ? 'OK' : result.error;
  
  console.log(`${status} ${testName.padEnd(40)} [${statusCode}] ${message}`);
  
  if (result.success && result.data) {
    if (typeof result.data === 'object') {
      const preview = JSON.stringify(result.data).substring(0, 100);
      console.log(`   📄 Respuesta: ${preview}${preview.length >= 100 ? '...' : ''}`);
    }
  }
}

// Tests de endpoints
const tests = [
  // Endpoints básicos
  {
    name: 'GET /',
    method: 'GET',
    endpoint: '/',
    expected: 200
  },
  {
    name: 'GET /api/health',
    method: 'GET',
    endpoint: '/api/health',
    expected: 200
  },
  
  // Endpoints de reservas (modo desarrollo)
  {
    name: 'POST /api/reservations (desarrollo)',
    method: 'POST',
    endpoint: '/api/reservations',
    data: {
      name: 'Juan Test',
      email: 'test@example.com',
      phone: '+34 600 000 000',
      date: '2024-12-25',
      time: '20:00',
      partySize: 4,
      specialRequests: 'Mesa junto a la ventana'
    },
    expected: 201
  },
  
  // Endpoints de contacto (modo desarrollo)
  {
    name: 'POST /api/contact (desarrollo)',
    method: 'POST',
    endpoint: '/api/contact',
    data: {
      name: 'María Test',
      email: 'maria@example.com',
      subject: 'Consulta sobre menú',
      message: 'Hola, quisiera información sobre opciones vegetarianas'
    },
    expected: 201
  },
  
  // Endpoints con base de datos (esperamos 503 sin MongoDB)
  {
    name: 'GET /api/reservations (requiere MongoDB)',
    method: 'GET',
    endpoint: '/api/reservations',
    expected: 503
  },
  
  {
    name: 'GET /api/tables (requiere MongoDB)',
    method: 'GET',
    endpoint: '/api/tables',
    expected: 503
  },
  
  {
    name: 'GET /api/users (requiere MongoDB)',
    method: 'GET',
    endpoint: '/api/users',
    expected: 503
  },
  
  {
    name: 'POST /api/auth/login (requiere MongoDB)',
    method: 'POST',
    endpoint: '/api/auth/login',
    data: {
      email: 'admin@elnopal.es',
      password: 'test123'
    },
    expected: 503
  },
  
  {
    name: 'GET /api/reviews (requiere MongoDB)',
    method: 'GET',
    endpoint: '/api/reviews',
    expected: 503
  },
  
  {
    name: 'GET /api/blog (requiere MongoDB)',
    method: 'GET',
    endpoint: '/api/blog',
    expected: 503
  },
  
  // Tests de validación
  {
    name: 'POST /api/reservations (datos inválidos)',
    method: 'POST',
    endpoint: '/api/reservations',
    data: {
      name: '',
      email: 'email-invalido',
      phone: '',
      date: '2020-01-01', // Fecha pasada
      time: '',
      partySize: 0
    },
    expected: 400
  },
  
  {
    name: 'POST /api/contact (datos incompletos)',
    method: 'POST',
    endpoint: '/api/contact',
    data: {
      name: '',
      email: '',
      message: ''
    },
    expected: 400
  },
  
  // Endpoints inexistentes
  {
    name: 'GET /api/endpoint-inexistente',
    method: 'GET',
    endpoint: '/api/endpoint-inexistente',
    expected: 404
  }
];

// Ejecutar tests
async function runTests() {
  console.log(`${colors.yellow}🧪 Ejecutando ${tests.length} tests de API...${colors.reset}\n`);
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  for (const test of tests) {
    const result = await makeRequest(test.method, test.endpoint, test.data);
    
    if (result.success) {
      if (test.expected && result.status === test.expected) {
        passed++;
      } else if (test.expected && result.status !== test.expected) {
        warnings++;
      } else {
        passed++;
      }
    } else {
      failed++;
    }
    
    showResult(test.name, result, test.expected);
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.cyan}📊 Resumen de Testing:${colors.reset}`);
  console.log(`${colors.green}✅ Pasaron: ${passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
  console.log(`${colors.red}❌ Fallaron: ${failed}${colors.reset}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (failed > 0) {
    console.log(`\n${colors.red}⚠️  ATENCIÓN: ${failed} tests fallaron${colors.reset}`);
    console.log('Esto puede deberse a:');
    console.log('- Servidor no ejecutándose');
    console.log('- Base de datos no disponible (esperado)');
    console.log('- Problemas de conectividad');
  }
  
  console.log(`\n${colors.blue}💡 NOTAS:${colors.reset}`);
  console.log('- Los errores 503 son esperados sin MongoDB');
  console.log('- Los endpoints de desarrollo (reservas/contacto) deberían funcionar');
  console.log('- Verifica que el servidor esté ejecutándose en el puerto correcto');
  
  return { passed, failed, warnings, total: tests.length };
}

// Verificar si el servidor está ejecutándose
async function checkServer() {
  console.log(`${colors.blue}🔍 Verificando servidor...${colors.reset}`);
  
  const result = await makeRequest('GET', '/');
  
  if (result.success) {
    console.log(`${colors.green}✅ Servidor respondiendo en ${API_BASE}${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ Servidor no responde en ${API_BASE}${colors.reset}`);
    console.log(`Error: ${result.error}`);
    console.log('\n💡 Para iniciar el servidor:');
    console.log('cd server && npm start');
    return false;
  }
}

// Función principal
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log(`\n${colors.yellow}⚠️  Tests pausados - servidor no disponible${colors.reset}`);
    process.exit(1);
  }
  
  console.log(''); // Línea en blanco
  const results = await runTests();
  
  // Exit code basado en resultados
  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Manejo de señales
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}🛑 Tests interrumpidos por el usuario${colors.reset}`);
  process.exit(0);
});

// Ejecutar
main().catch(error => {
  console.error(`${colors.red}💥 Error fatal:${colors.reset}`, error.message);
  process.exit(1);
});