#!/usr/bin/env node

/**
 * 🧪 TEST SIMPLE DE PRODUCCIÓN - El Nopal
 */

const axios = require('axios');

// URL del servidor (puerto 5000 encontrado en los logs)
const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, method, endpoint, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: PASSED`);
      return { success: true };
    } else {
      console.log(`❌ ${name}: Status ${response.status}, esperado ${expectedStatus}`);
      return { success: false };
    }
  } catch (error) {
    const status = error.response?.status || 'error';
    const message = error.response?.data?.message || error.message;
    
    // Errores de validación esperados son éxitos
    if (expectedStatus >= 400 && status === expectedStatus) {
      console.log(`✅ ${name}: PASSED (validation error as expected)`);
      return { success: true };
    }
    
    console.log(`❌ ${name}: FAILED (${status}) - ${message}`);
    return { success: false };
  }
}

async function runTests() {
  console.log('🧪 Tests de Producción El Nopal');
  console.log('=' .repeat(50));
  console.log(`🎯 Servidor: ${BASE_URL}`);
  console.log('');
  
  const results = [];
  
  // 1. Health Check
  results.push(await testEndpoint('Health Check', 'GET', '/health'));
  
  // 2. Crear reserva
  const reservationData = {
    name: 'Test Cliente',
    email: `test-${Date.now()}@example.com`,
    phone: '123456789',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:30',
    partySize: 4
  };
  results.push(await testEndpoint('Crear Reserva', 'POST', '/reservations', reservationData, 201));
  
  // 3. Obtener mesas
  results.push(await testEndpoint('Obtener Mesas', 'GET', '/tables'));
  
  // 4. Crear review
  const reviewData = {
    name: 'Cliente Feliz',
    email: `review-${Date.now()}@example.com`,
    rating: 5,
    comment: 'Excelente servicio!'
  };
  results.push(await testEndpoint('Crear Review', 'POST', '/reviews', reviewData, 201));
  
  // 5. Obtener reviews públicos
  results.push(await testEndpoint('Obtener Reviews', 'GET', '/reviews/public'));
  
  // 6. Contacto
  const contactData = {
    name: 'Test Contacto',
    email: `contact-${Date.now()}@example.com`,
    subject: 'Prueba',
    message: 'Mensaje de prueba'
  };
  results.push(await testEndpoint('Formulario Contacto', 'POST', '/contact', contactData, 201));
  
  // 7. Validación (error esperado)
  const invalidData = { name: '', email: 'invalid', partySize: 0 };
  results.push(await testEndpoint('Validación de Datos', 'POST', '/reservations', invalidData, 400));
  
  // 8. Ruta no encontrada (error esperado)
  results.push(await testEndpoint('Ruta No Encontrada', 'GET', '/no-existe', null, 404));
  
  // Resumen
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`📊 RESULTADO: ${passed}/${total} tests pasaron (${percentage}%)`);
  
  if (percentage >= 80) {
    console.log('🎉 SISTEMA LISTO PARA PRODUCCIÓN');
  } else if (percentage >= 60) {
    console.log('⚠️  SISTEMA REQUIERE ATENCIÓN');
  } else {
    console.log('❌ SISTEMA NO LISTO');
  }
  
  return { passed, total, percentage: parseFloat(percentage) };
}

// Ejecutar
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 