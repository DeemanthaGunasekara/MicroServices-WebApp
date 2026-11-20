const express = require('express');
const client = require('prom-client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, getAllUsers, findUserByEmail, createUser } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cloud-native-super-secret-key-2026';

// Middleware to parse JSON request bodies
app.use(express.json());

// Auto-initialize DB schema on startup
initDb().catch(err => console.error('[Database Init Error]:', err));

// Initialize Prometheus metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Liveness & Readiness probe for Kubernetes
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

// Prometheus metrics scraping endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Get all registered users (stored in PostgreSQL)
app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
});

// Register new user (hashed password stored in PostgreSQL)
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      name,
      email,
      passwordHash,
      role: role || 'Customer',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login user & issue JWT token
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
  });
}

module.exports = app;