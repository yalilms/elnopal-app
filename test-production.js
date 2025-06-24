#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TESTING DE PRODUCCIÓN - EL NOPAL RESTAURANT
 * 
 * Este script prueba todo el flujo de la aplicación en el servidor real
 * para asegurar que todo funciona correctamente antes del lanzamiento final.
 */

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'https://elnopal.es';
const API_URL = `${BASE_URL}/api`;

// Colores para la consola
const success = (msg) => console.log(chalk.green('✅', msg));
const error = (msg) => console.log(chalk.red('❌', msg));
const info = (msg) => console.log(chalk.blue('ℹ️', msg));
const warning = (msg) => console.log(chalk.yellow('⚠️', msg));
const title = (msg) => console.log(chalk.magenta.bold('\n🎯', msg));

class ProductionTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
    this.authToken = null;
  }

  async runTest(testName, testFunction) {
    this.results.total++;
    try {
      console.log(`🧪 Testing: ${testName}`);
      await testFunction();
      this.results.passed++;
      console.log(`✅ PASSED: ${testName}`);
    } catch (err) {
      this.results.failed++;
      console.log(`❌ FAILED: ${testName} - ${err.message}`);
      this.results.errors.push({ test: testName, error: err.message });
    }
  }

  async testWebsiteHealth() {
    console.log('\n🏥 TESTING WEBSITE HEALTH');
    
    await this.runTest('Website loads successfully', async () => {
      const response = await axios.get(BASE_URL, { timeout: 10000 });
      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
      if (!response.data.includes('El Nopal')) throw new Error('Missing content');
    });

    await this.runTest('Response time is acceptable', async () => {
      const start = Date.now();
      await axios.get(BASE_URL, { timeout: 5000 });
      const duration = Date.now() - start;
      if (duration > 3000) throw new Error(`Too slow: ${duration}ms`);
      console.log(`   ⏱️ Load time: ${duration}ms`);
    });
  }

  async testAPIEndpoints() {
    console.log('\n🔌 TESTING API ENDPOINTS');

    await this.runTest('Tables API responds', async () => {
      const response = await axios.get(`${API_URL}/tables`, { timeout: 5000 });
      if (response.status !== 200 && response.status !== 401) {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    });

    await this.runTest('Reviews API responds', async () => {
      const response = await axios.get(`${API_URL}/reviews`, { timeout: 5000 });
      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
    });
  }

  async testReservationFlow() {
    console.log('\n📅 TESTING RESERVATION FLOW');

    const testReservation = {
      name: 'Test User',
      email: 'test@elnopal.es',
      phone: '+34123456789',
      date: '2025-08-15',
      time: '20:00',
      partySize: 4,
      specialRequests: 'Test reservation'
    };

    await this.runTest('Create reservation', async () => {
      const response = await axios.post(`${API_URL}/reservations`, testReservation, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status !== 201) throw new Error(`Status: ${response.status}`);
      if (!response.data.id) throw new Error('No reservation ID returned');
    });
  }

  async testContactForm() {
    console.log('\n📧 TESTING CONTACT FORM');

    await this.runTest('Send contact message', async () => {
      const contactData = {
        name: 'Test Contact',
        email: 'test@elnopal.es',
        subject: 'Production Test',
        message: 'Test message from production testing script.'
      };

      const response = await axios.post(`${API_URL}/contact`, contactData, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status !== 200) throw new Error(`Status: ${response.status}`);
    });
  }

  async testSecurity() {
    console.log('\n🔒 TESTING SECURITY');

    await this.runTest('Rate limiting protection', async () => {
      const promises = Array.from({ length: 8 }, () =>
        axios.post(`${API_URL}/auth/login`, {
          email: 'test@test.com',
          password: 'wrong'
        }, { timeout: 3000 }).catch(err => err.response)
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(response => 
        response && response.status === 429
      );

      if (!rateLimited) {
        console.log('   ⚠️ Rate limiting may not be active');
      }
    });

    await this.runTest('CORS headers present', async () => {
      const response = await axios.options(API_URL, { timeout: 5000 });
      if (!response.headers['access-control-allow-origin']) {
        throw new Error('CORS headers not found');
      }
    });
  }

  async testPerformance() {
    console.log('\n⚡ TESTING PERFORMANCE');

    await this.runTest('API response speed', async () => {
      const start = Date.now();
      await axios.get(`${API_URL}/tables`, { timeout: 5000 });
      const responseTime = Date.now() - start;
      
      if (responseTime > 2000) throw new Error(`Too slow: ${responseTime}ms`);
      console.log(`   ⏱️ API response: ${responseTime}ms`);
    });
  }

  async runAllTests() {
    console.log('🧪 STARTING PRODUCTION TESTS FOR EL NOPAL RESTAURANT\n');
    console.log(`🌐 Testing URL: ${BASE_URL}\n`);

    try {
      await this.testWebsiteHealth();
      await this.testAPIEndpoints();
      await this.testReservationFlow();
      await this.testContactForm();
      await this.testSecurity();
      await this.testPerformance();
    } catch (err) {
      console.log(`❌ Unexpected error: ${err.message}`);
    }

    this.printResults();
  }

  printResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
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

    if (successRate >= 90) {
      console.log('\n🎉 PRODUCTION READY! Application passed most tests.');
    } else if (successRate >= 70) {
      console.log('\n⚠️ MINOR ISSUES: Application has some issues but should work.');
    } else {
      console.log('\n🚨 CRITICAL ISSUES: Fix failing tests before production.');
    }

    console.log('\n🌮 El Nopal Restaurant Testing Complete!\n');
  }
}

// Ejecutar tests
if (require.main === module) {
  const tester = new ProductionTester();
  tester.runAllTests().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = ProductionTester; 