const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const Table = require('../src/models/Table');
const Reservation = require('../src/models/Reservation');
const Review = require('../src/models/Review');
const Blacklist = require('../src/models/Blacklist');

describe('🍽️ TESTS COMPLETOS - EL NOPAL', () => {
  let authToken;
  let testReservationId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/elnopal_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('🔐 SETUP', () => {
    test('Admin login', async () => {
      // Registrar admin
      await request(app).post('/api/auth/register').send({
        email: 'admin@elnopal.es', password: 'admin123456', name: 'Admin'
      });

      // Login
      const response = await request(app).post('/api/auth/login').send({
        email: 'admin@elnopal.es', password: 'admin123456'
      });
      
      authToken = response.body.token;
      expect(response.status).toBe(200);
    });

    test('Create restaurant tables', async () => {
      const tables = [
        { number: 1, capacity: 2, zone: 'terraza' },
        { number: 2, capacity: 4, zone: 'terraza' },
        { number: 3, capacity: 6, zone: 'interior' },
        { number: 4, capacity: 8, zone: 'vip' }
      ];

      for (const table of tables) {
        const response = await request(app)
          .post('/api/tables')
          .set('Authorization', `Bearer ${authToken}`)
          .send(table);
        expect(response.status).toBe(201);
      }
    });
  });

  describe('🪑 ASIGNACIÓN AUTOMÁTICA DE MESAS', () => {
    test('Auto-assign smallest suitable table', async () => {
      const response = await request(app).post('/api/reservations').send({
        name: 'Pareja Test', email: 'pareja@test.com', phone: '+34123456789',
        date: '2025-07-15', time: '20:00', partySize: 2
      });

      expect(response.status).toBe(201);
      expect(response.body.reservation.assignedTable.capacity).toBe(2);
      testReservationId = response.body.reservation._id;
    });

    test('Assign different table for same time', async () => {
      const response = await request(app).post('/api/reservations').send({
        name: 'Segunda Pareja', email: 'pareja2@test.com', phone: '+34123456788',
        date: '2025-07-15', time: '20:00', partySize: 2
      });

      expect(response.status).toBe(201);
      expect(response.body.reservation.assignedTable).toBeDefined();
    });

    test('Assign larger table for larger group', async () => {
      const response = await request(app).post('/api/reservations').send({
        name: 'Familia', email: 'familia@test.com', phone: '+34123456787',
        date: '2025-07-15', time: '20:00', partySize: 6
      });

      expect(response.status).toBe(201);
      expect(response.body.reservation.assignedTable.capacity).toBeGreaterThanOrEqual(6);
    });
  });

  describe('⭐ SISTEMA DE RESEÑAS', () => {
    let reviewId;

    test('Create review', async () => {
      const response = await request(app).post('/api/reviews').send({
        nombre: 'Cliente Feliz', email: 'cliente@test.com',
        calificacion: 5, comentario: 'Excelente servicio!'
      });

      expect(response.status).toBe(201);
      expect(response.body.estado).toBe('pendiente');
      reviewId = response.body._id;
    });

    test('Approve review', async () => {
      const response = await request(app)
        .patch(`/api/reviews/${reviewId}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.review.estado).toBe('aprobada');
    });

    test('Get public reviews', async () => {
      const response = await request(app).get('/api/reviews');
      
      expect(response.status).toBe(200);
      expect(response.body.reviews.every(r => r.estado === 'aprobada')).toBe(true);
    });
  });

  describe('🚫 LISTA NEGRA', () => {
    let blacklistId;

    test('Add to blacklist', async () => {
      const response = await request(app)
        .post('/api/blacklist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Cliente Problemático',
          customerEmail: 'problema@test.com',
          customerPhone: '+34987654321',
          reason: 'Comportamiento inapropiado'
        });

      expect(response.status).toBe(201);
      blacklistId = response.body._id;
    });

    test('Block blacklisted customer reservation', async () => {
      const response = await request(app).post('/api/reservations').send({
        name: 'Cliente Problemático', email: 'problema@test.com',
        phone: '+34987654321', date: '2025-08-15', time: '21:00', partySize: 2
      });

      expect(response.status).toBe(403);
    });

    test('Remove from blacklist', async () => {
      const response = await request(app)
        .delete(`/api/blacklist/${blacklistId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('📧 CONTACTO', () => {
    test('Send contact message', async () => {
      const response = await request(app).post('/api/contact').send({
        name: 'Cliente', email: 'cliente@test.com',
        subject: 'Consulta', message: 'Pregunta sobre eventos'
      });

      expect(response.status).toBe(200);
    });
  });

  describe('🔒 SEGURIDAD', () => {
    test('Sanitize XSS attempts', async () => {
      const response = await request(app).post('/api/reservations').send({
        name: '<script>alert("xss")</script>Hacker',
        email: 'hacker@test.com', phone: '+34123456789',
        date: '2025-09-15', time: '19:00', partySize: 2
      });

      expect(response.status).toBe(201);
      expect(response.body.reservation.customer.name).not.toContain('<script>');
    });

    test('Rate limiting on auth', async () => {
      const promises = Array.from({ length: 8 }, () =>
        request(app).post('/api/auth/login').send({
          email: 'fake@test.com', password: 'wrong'
        })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('📊 GESTIÓN DE RESERVAS', () => {
    test('Get all reservations', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.reservations)).toBe(true);
    });

    test('Confirm reservation', async () => {
      const response = await request(app)
        .patch(`/api/reservations/${testReservationId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('confirmed');
    });

    test('Cancel reservation', async () => {
      const response = await request(app)
        .patch(`/api/reservations/${testReservationId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test cancellation' });

      expect(response.status).toBe(200);
      expect(response.body.reservation.status).toBe('cancelled');
    });
  });
}); 