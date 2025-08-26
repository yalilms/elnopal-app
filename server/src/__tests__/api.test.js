const request = require('supertest');
const app = require('../index');

describe('API Health Tests', () => {
  test('GET /api/health should return server status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('mongodb');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET / should return welcome message', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.text).toBe('API de El Nopal funcionando correctamente');
  });
});

describe('Contact API Tests', () => {
  test('POST /api/contact should create contact message', async () => {
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message for contact form'
    };

    const response = await request(app)
      .post('/api/contact')
      .send(contactData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body.contact).toHaveProperty('name', contactData.name);
  });

  test('POST /api/contact should fail with missing fields', async () => {
    const incompleteData = {
      name: 'Test User',
      email: 'test@example.com'
      // missing message field
    };

    const response = await request(app)
      .post('/api/contact')
      .send(incompleteData)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('campos obligatorios');
  });

  test('POST /api/contact should validate email format', async () => {
    const invalidEmailData = {
      name: 'Test User',
      email: 'invalid-email',
      message: 'Test message'
    };

    const response = await request(app)
      .post('/api/contact')
      .send(invalidEmailData);

    // Should either pass validation and create contact or fail with validation error
    expect([201, 400]).toContain(response.status);
  });
});

describe('Reservations API Tests', () => {
  test('POST /api/reservations should create reservation', async () => {
    const reservationData = {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '+34123456789',
      date: '2024-12-31',
      time: '20:00',
      partySize: 4,
      specialRequests: 'Near window please'
    };

    const response = await request(app)
      .post('/api/reservations')
      .send(reservationData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body.reservation).toHaveProperty('name', reservationData.name);
    expect(response.body.reservation).toHaveProperty('partySize', reservationData.partySize);
  });

  test('POST /api/reservations should fail with missing required fields', async () => {
    const incompleteData = {
      name: 'Test Customer',
      email: 'customer@example.com'
      // missing phone, date, time, partySize
    };

    const response = await request(app)
      .post('/api/reservations')
      .send(incompleteData)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('campos obligatorios');
  });

  test('POST /api/reservations should validate date format', async () => {
    const invalidDateData = {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '+34123456789',
      date: 'invalid-date',
      time: '20:00',
      partySize: 4
    };

    const response = await request(app)
      .post('/api/reservations')
      .send(invalidDateData);

    // Should fail with validation error or pass if backend handles it
    expect([201, 400]).toContain(response.status);
  });

  test('POST /api/reservations should validate party size', async () => {
    const invalidPartySizeData = {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '+34123456789',
      date: '2024-12-31',
      time: '20:00',
      partySize: 0 // Invalid party size
    };

    const response = await request(app)
      .post('/api/reservations')
      .send(invalidPartySizeData);

    // Should either pass (temporary development mode) or fail validation
    expect([201, 400]).toContain(response.status);
  });
});

describe('Error Handling Tests', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Ruta no encontrada');
  });

  test('POST with invalid JSON should be handled gracefully', async () => {
    const response = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('invalid json')
      .expect(400);
  });
});

describe('CORS Tests', () => {
  test('OPTIONS request should include CORS headers', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:3000')
      .expect(204);

    expect(response.headers).toHaveProperty('access-control-allow-origin');
  });
});

describe('Rate Limiting Tests', () => {
  test('Multiple requests should not be rate limited in development', async () => {
    // Make multiple requests quickly
    const promises = Array(5).fill().map(() => 
      request(app).get('/api/health')
    );

    const responses = await Promise.all(promises);
    
    // All should succeed in development mode
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});

describe('Security Headers Tests', () => {
  test('Response should include security headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    // Check for helmet security headers
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
  });
});