const request = require('supertest');
const app = require('../src/app');

describe('User Service - Health Probe', () => {
  it('GET /healthz should return HTTP 200 with healthy status', async () => {
    const response = await request(app).get('/healthz');
    
    // Assert status code is 200 OK
    expect(response.statusCode).toBe(200);
    // Assert response body matches expected JSON
    expect(response.body).toEqual({ status: 'healthy' });
  });
});