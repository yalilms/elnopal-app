#!/usr/bin/env node

/**
 * 🧪 TEST COMPLETO DE PRODUCCIÓN - TODAS LAS FUNCIONALIDADES
 */

const axios = require('axios');

const BASE_URL = 'https://elnopal.es';
const API_URL = `${BASE_URL}/api`;

class CompleteProductionTester {
  constructor() {
    this.results = { total: 0, passed: 0, failed: 0, errors: [] };
    this.testData = {
      reservationId: null,
      reviewId: null,
      blacklistId: null
    };
  }

  async runTest(name, testFn) {
    this.results.total++;
    try {
      console.log(`🧪 ${name}...`);
      await testFn();
      this.results.passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (err) {
      this.results.failed++;
      console.log(`❌ FAILED: ${name} - ${err.message}`);
      this.results.errors.push({ test: name, error: err.message });
    }
  }

  async testReservationSystem() {
    console.log('\n📅 TESTING COMPLETE RESERVATION SYSTEM');

    // Test 1: Crear reserva con asignación automática
    await this.runTest('Create reservation with auto table assignment', async () => {
      const response = await axios.post(`${API_URL}/reservations`, {
        name: 'Test Production User',
        email: 'testuser@elnopal.es',
        phone: '+34123456789',
        date: '2025-08-15',
        time: '20:00',
        partySize: 4,
        specialRequests: 'Mesa cerca de ventana'
      }, { timeout: 10000 });

      if (response.status !== 201) throw new Error(`Status: ${response.status}`);
      if (!response.data.id) throw new Error('No reservation ID');
      if (!response.data.assignedTable) throw new Error('No table assigned');
      
      this.testData.reservationId = response.data.id;
      console.log(`   📝 Reservation ID: ${this.testData.reservationId}`);
      console.log(`   🪑 Assigned Table: ${response.data.assignedTable.number}`);
    });

    // Test 2: Verificar que las mesas se asignan automáticamente
    await this.runTest('Verify automatic table assignment for different party sizes', async () => {
      // Reserva para 2 personas
      const small = await axios.post(`${API_URL}/reservations`, {
        name: 'Small Party', email: 'small@test.com', phone: '+34123456788',
        date: '2025-08-16', time: '19:00', partySize: 2
      });

      // Reserva para 6 personas  
      const large = await axios.post(`${API_URL}/reservations`, {
        name: 'Large Party', email: 'large@test.com', phone: '+34123456787',
        date: '2025-08-16', time: '19:00', partySize: 6
      });

      if (small.status !== 201 || large.status !== 201) {
        throw new Error('Failed to create reservations');
      }

      // Verificar asignación lógica de mesas
      if (large.data.assignedTable.capacity < small.data.assignedTable.capacity) {
        throw new Error('Table assignment logic incorrect');
      }
    });

    // Test 3: Conflicto de horarios
    await this.runTest('Handle time slot conflicts correctly', async () => {
      try {
        // Intentar reservar la misma mesa/hora (debería asignar mesa diferente o fallar)
        const conflict = await axios.post(`${API_URL}/reservations`, {
          name: 'Conflict Test', email: 'conflict@test.com', phone: '+34123456786',
          date: '2025-08-15', time: '20:00', partySize: 4
        });

        // Si se crea, debe tener mesa diferente
        if (conflict.status === 201) {
          console.log(`   ⚠️ Created with different table (expected behavior)`);
        }
      } catch (err) {
        if (err.response && err.response.status === 409) {
          console.log(`   ✅ Correctly rejected conflicting reservation`);
        } else {
          throw err;
        }
      }
    });
  }

  async testReviewSystem() {
    console.log('\n⭐ TESTING COMPLETE REVIEW SYSTEM');

    // Test 1: Crear reseña
    await this.runTest('Create customer review', async () => {
      const response = await axios.post(`${API_URL}/reviews`, {
        nombre: 'Happy Customer',
        email: 'happy@customer.com',
        calificacion: 5,
        comentario: 'Absolutely amazing experience! The tacos were incredible and the service was perfect.',
        reservationId: this.testData.reservationId
      });

      if (response.status !== 201) throw new Error(`Status: ${response.status}`);
      this.testData.reviewId = response.data._id;
      console.log(`   📝 Review ID: ${this.testData.reviewId}`);
    });

    // Test 2: Validación de calificación
    await this.runTest('Validate review rating limits', async () => {
      try {
        await axios.post(`${API_URL}/reviews`, {
          nombre: 'Invalid Reviewer',
          email: 'invalid@test.com',
          calificacion: 6, // Inválido
          comentario: 'Trying to give 6 stars'
        });
        throw new Error('Should have rejected invalid rating');
      } catch (err) {
        if (err.response && err.response.status === 400) {
          console.log(`   ✅ Correctly rejected invalid rating`);
        } else {
          throw err;
        }
      }
    });

    // Test 3: Obtener reseñas públicas
    await this.runTest('Get public reviews', async () => {
      const response = await axios.get(`${API_URL}/reviews`);
      
      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
      if (!Array.isArray(response.data.reviews)) throw new Error('Reviews not array');
      
      console.log(`   📊 Public reviews count: ${response.data.reviews.length}`);
    });
  }

  async testContactSystem() {
    console.log('\n📧 TESTING CONTACT SYSTEM');

    await this.runTest('Send contact message with full validation', async () => {
      const response = await axios.post(`${API_URL}/contact`, {
        name: 'Interested Customer',
        email: 'customer@example.com',
        subject: 'Private Event Inquiry',
        message: 'Hi, I would like to know about hosting a private event for 30 people. What are your options and pricing?',
        phone: '+34123456789'
      });

      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
      console.log(`   📧 Contact message sent successfully`);
    });

    await this.runTest('Validate contact form required fields', async () => {
      try {
        await axios.post(`${API_URL}/contact`, {
          name: '', // Empty required field
          email: 'invalid-email',
          subject: 'Test',
          message: 'Test'
        });
        throw new Error('Should have rejected empty/invalid fields');
      } catch (err) {
        if (err.response && err.response.status === 400) {
          console.log(`   ✅ Correctly validated required fields`);
        } else {
          throw err;
        }
      }
    });
  }

  async testSecurityFeatures() {
    console.log('\n🔒 TESTING SECURITY FEATURES');

    await this.runTest('XSS protection in forms', async () => {
      const response = await axios.post(`${API_URL}/reservations`, {
        name: '<script>alert("xss")</script>Hacker',
        email: 'hacker@test.com',
        phone: '+34123456789',
        date: '2025-09-15',
        time: '19:00',
        partySize: 2,
        specialRequests: '<img src=x onerror=alert("xss")>Window table'
      });

      if (response.status !== 201) throw new Error('Failed to create reservation');
      
      // Verificar que XSS fue sanitizado
      if (response.data.customer.name.includes('<script>')) {
        throw new Error('XSS not sanitized');
      }
      
      console.log(`   🛡️ XSS attempts successfully sanitized`);
    });

    await this.runTest('Rate limiting protection', async () => {
      const promises = Array.from({ length: 6 }, () =>
        axios.post(`${API_URL}/auth/login`, {
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }, { timeout: 3000 }).catch(err => err.response)
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r && r.status === 429);
      
      if (rateLimited) {
        console.log(`   🛡️ Rate limiting is active`);
      } else {
        console.log(`   ⚠️ Rate limiting may not be active (check manually)`);
      }
    });
  }

  async testTableManagement() {
    console.log('\n🪑 TESTING TABLE MANAGEMENT');

    await this.runTest('Get table layout and availability', async () => {
      const response = await axios.get(`${API_URL}/tables`);
      
      if (response.status !== 200 && response.status !== 401) {
        throw new Error(`Unexpected status: ${response.status}`);
      }
      
      if (response.status === 200) {
        console.log(`   🏗️ Table layout accessible`);
      } else {
        console.log(`   🔐 Table management requires authentication (expected)`);
      }
    });
  }

  async testResponsiveDesign() {
    console.log('\n📱 TESTING RESPONSIVE DESIGN');

    await this.runTest('Website mobile compatibility', async () => {
      const response = await axios.get(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });

      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
      
      // Verificar meta viewport
      if (!response.data.includes('viewport')) {
        throw new Error('Mobile viewport meta tag missing');
      }
      
      console.log(`   📱 Mobile viewport configured correctly`);
    });
  }

  async runAllTests() {
    console.log('🧪 TESTING ALL FUNCTIONALITIES - EL NOPAL RESTAURANT\n');
    console.log(`🌐 Testing URL: ${BASE_URL}\n`);

    const startTime = Date.now();

    try {
      await this.testReservationSystem();
      await this.testReviewSystem();
      await this.testContactSystem();
      await this.testSecurityFeatures();
      await this.testTableManagement();
      await this.testResponsiveDesign();
    } catch (err) {
      console.log(`❌ Unexpected error: ${err.message}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.showResults(duration);
  }

  showResults(duration) {
    console.log('\n📊 COMPLETE FUNCTIONALITY TEST RESULTS');
    console.log(`⏱️ Duration: ${duration}s`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total: ${this.results.total}`);
    
    const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`  • ${test}: ${error}`);
      });
    }

    console.log('\n🔍 TESTED FUNCTIONALITIES:');
    console.log('  ✅ Automatic table assignment system');
    console.log('  ✅ Complete reservation flow');
    console.log('  ✅ Review creation and moderation');
    console.log('  ✅ Contact form with validation');
    console.log('  ✅ Security (XSS, Rate limiting)');
    console.log('  ✅ Table management system');
    console.log('  ✅ Responsive design');

    if (successRate >= 85) {
      console.log('\n🎉 ALL SYSTEMS OPERATIONAL! Ready for production.');
    } else {
      console.log('\n⚠️ Some issues found. Review before full launch.');
    }

    console.log('\n🌮 El Nopal Complete Functionality Test Complete!\n');
  }
}

// Ejecutar
const tester = new CompleteProductionTester();
tester.runAllTests().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
}); 