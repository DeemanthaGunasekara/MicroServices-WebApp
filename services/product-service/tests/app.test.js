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

    // 1. Status 200 OK
    expect(response.statusCode).toBe(200);
    
    // 2. Response is an array
    expect(Array.isArray(response.body)).toBe(true);
    
    // 3. Has at least 3 products
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    
    // 4. Verify first product details
    expect(response.body[0]).toMatchObject({
      id: '101',
      name: 'Laptop Pro 16'
    });
  });
});