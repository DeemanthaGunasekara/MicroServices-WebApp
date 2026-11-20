const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/db');

afterAll(async () => {
  // Closes the database pool so Jest exits cleanly
  await pool.end();
});

describe('User Service - Health & Metrics Endpoints', () => {
  it('GET /healthz should return 200 and status ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('user-service');
  });

  it('GET /metrics should return Prometheus formatted metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('process_cpu_user_seconds_total');
  });
});

describe('User Service - Authentication & User Endpoints', () => {
  const testUser = {
    name: 'John Doe',
    email: `john.${Date.now()}@example.com`,
    password: 'securePassword123',
    role: 'Customer',
  };

  it('POST /api/v1/auth/register should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(testUser.name);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.role).toBe(testUser.role);
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('POST /api/v1/auth/register should return 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Incomplete' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should return 400 if password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Short', email: 'short@example.com', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should return 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login should return 200 and a JWT token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/login should return 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongPassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/users should return all registered users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});