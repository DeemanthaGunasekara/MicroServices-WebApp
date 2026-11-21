const request = require('supertest');
const app = require('../src/app');

describe('Product Service - Health & Metrics Endpoints', () => {
  it('GET /healthz should return 200 and status ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('product-service');
  });

  it('GET /metrics should return Prometheus formatted metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('process_cpu_user_seconds_total');
  });
});

describe('Product Service - Catalog & Filter Endpoints', () => {
  it('GET /api/v1/products should return rich e-commerce catalog', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const sample = res.body.data[0];
    expect(sample).toHaveProperty('id');
    expect(sample).toHaveProperty('title');
    expect(sample).toHaveProperty('price');
    expect(sample).toHaveProperty('thumbnail');
    expect(sample).toHaveProperty('category');
  });

  it('GET /api/v1/products/categories should return available categories list', async () => {
    const res = await request(app).get('/api/v1/products/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toContain('all');
  });

  it('GET /api/v1/products?category=... should filter products by category', async () => {
    const res = await request(app).get('/api/v1/products?category=smartphones');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0].category.toLowerCase()).toBe('smartphones');
    }
  });

  it('GET /api/v1/products?search=... should filter products by keyword', async () => {
    const res = await request(app).get('/api/v1/products?search=Pro');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/products/1 should return product with id 1', async () => {
    const res = await request(app).get('/api/v1/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  it('GET /api/v1/products/999999 should return 404 for non-existent product', async () => {
    const res = await request(app).get('/api/v1/products/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Product not found');
  });
});