// Configuración global para tests
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/elnopal_test';
process.env.JWT_SECRET = 'test_secret_key';

// Suprimir logs durante testing
console.log = jest.fn();
console.info = jest.fn();
console.warn = jest.fn(); 