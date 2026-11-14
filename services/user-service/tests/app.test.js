const request = require('supertest');
const app = require('../src/app');

describe('User Service - Health Probe', () => {
  it('GET /healthz should return HTTP 200 with healthy status', async () => {
    const response = await request(app).get('/healthz');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });
});

describe('User Service - Users API', () => {
  it('GET /api/v1/users should return a list of users', async () => {
    const response = await request(app).get('/api/v1/users');
    
    expect(response.statusCode).toBe(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    
    expect(response.body[0]).toMatchObject({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com'
    });
  });
});