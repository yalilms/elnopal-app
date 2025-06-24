const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index'); // Necesitaremos modificar index.js para exportar app

describe('🍽️ El Nopal Restaurant API Tests', () => {
  let authToken;
  let testReservationId;

  beforeAll(async () => {
    // Conectar a base de datos de test
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/elnopal_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Limpiar base de datos de test
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('🔐 Authentication Tests', () => {
    test('Should register a new admin user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@elnopal.es',
          password: 'admin123456',
          name: 'Admin Test'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
    });

    test('Should login admin user and get token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@elnopal.es',
          password: 'admin123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    test('Should reject invalid login credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@elnopal.es',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('🪑 Tables API Tests', () => {
    test('Should get all tables', async () => {
      const response = await request(app)
        .get('/api/tables')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Should create a new table', async () => {
      const response = await request(app)
        .post('/api/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          number: 99,
          capacity: 4,
          zone: 'test',
          type: 'regular'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('number', 99);
    });

    test('Should reject duplicate table numbers', async () => {
      const response = await request(app)
        .post('/api/tables')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          number: 99, // Same number as above
          capacity: 4,
          zone: 'test',
          type: 'regular'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('📅 Reservations API Tests', () => {
    test('Should create a new reservation', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send({
          name: 'Juan Pérez',
          email: 'juan@ejemplo.com',
          phone: '+34123456789',
          date: '2025-07-15',
          time: '20:00',
          partySize: 4,
          specialRequests: 'Cerca de la ventana'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.customer).toHaveProperty('name', 'Juan Pérez');
      testReservationId = response.body.id;
    });

    test('Should get all reservations (admin only)', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.reservations)).toBe(true);
    });

    test('Should get reservations by date', async () => {
      const response = await request(app)
        .get('/api/reservations?date=2025-07-15')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reservations.length).toBeGreaterThan(0);
    });

    test('Should reject reservation without required fields', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send({
          name: 'Test',
          // Missing email, phone, date, time, partySize
        });

      expect(response.status).toBe(400);
    });

    test('Should cancel a reservation', async () => {
      const response = await request(app)
        .patch(`/api/reservations/${testReservationId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Test cancellation'
        });

      expect(response.status).toBe(200);
      expect(response.body.reservation).toHaveProperty('status', 'cancelled');
    });
  });

  describe('⭐ Reviews API Tests', () => {
    test('Should create a new review', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          nombre: 'María García',
          email: 'maria@ejemplo.com',
          calificacion: 5,
          comentario: 'Excelente comida y servicio!'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('nombre', 'María García');
    });

    test('Should get all reviews for admin', async () => {
      const response = await request(app)
        .get('/api/reviews/admin')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reviews');
    });

    test('Should reject review with invalid rating', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          nombre: 'Test User',
          email: 'test@ejemplo.com',
          calificacion: 6, // Invalid rating (max is 5)
          comentario: 'Test comment'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('🚫 Blacklist API Tests', () => {
    test('Should add customer to blacklist', async () => {
      const response = await request(app)
        .post('/api/blacklist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Test Blacklist',
          customerEmail: 'blacklist@ejemplo.com',
          customerPhone: '+34987654321',
          reason: 'Test reason',
          reservationId: testReservationId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('customerName', 'Test Blacklist');
    });

    test('Should get blacklist entries', async () => {
      const response = await request(app)
        .get('/api/blacklist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('📧 Contact API Tests', () => {
    test('Should send contact message', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test Contact',
          email: 'contact@ejemplo.com',
          subject: 'Test Subject',
          message: 'This is a test message'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('🔒 Security Tests', () => {
    test('Should reject requests without auth token for protected routes', async () => {
      const response = await request(app)
        .get('/api/reservations');

      expect(response.status).toBe(401);
    });

    test('Should reject malicious XSS attempts', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          nombre: '<script>alert("xss")</script>',
          email: 'test@ejemplo.com',
          calificacion: 5,
          comentario: 'Normal comment'
        });

      expect(response.status).toBe(201);
      // El nombre debería estar sanitizado
      expect(response.body.nombre).not.toContain('<script>');
    });

    test('Should handle rate limiting', async () => {
      // Hacer múltiples requests rápidos para activar rate limiting
      const promises = Array.from({ length: 20 }, () =>
        request(app).post('/api/auth/login').send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        })
      );

      const responses = await Promise.all(promises);
      const tooManyRequests = responses.some(response => response.status === 429);
      expect(tooManyRequests).toBe(true);
    });
  });

  describe('📊 Performance Tests', () => {
    test('Should respond to health check quickly', async () => {
      const start = Date.now();
      const response = await request(app).get('/api/health');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond in less than 1 second
    });

    test('Should handle concurrent reservations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/reservations')
          .send({
            name: `Concurrent User ${i}`,
            email: `user${i}@ejemplo.com`,
            phone: `+3412345678${i}`,
            date: '2025-08-15',
            time: '21:00',
            partySize: 2
          })
      );

      const responses = await Promise.all(promises);
      const successfulReservations = responses.filter(r => r.status === 201);
      expect(successfulReservations.length).toBeGreaterThan(0);
    });
  });
}); 