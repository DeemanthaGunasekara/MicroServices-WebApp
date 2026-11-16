const request = require('supertest');
const app = require('../src/app');

describe('Product Service - Health Probe', () => {
  it('GET /healthz should return HTTP 200 with healthy status', async () => {
    const response = await request(app).get('/healthz');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });
});

describe('Product Service - Products API', () => {
  it('GET /api/v1/products should return a list of catalog products', async () => {
    const response = await request(app).get('/api/v1/products');

    expect(response.statusCode).toBe(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    
    expect(response.body[0]).toMatchObject({
      id: '101',
      name: 'Laptop Pro 16'
    });
  });
});