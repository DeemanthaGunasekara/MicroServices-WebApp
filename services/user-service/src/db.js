const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@localhost:5432/users_db';

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 2000,
});

let isDbConnected = false;

// In-memory fallback starts completely empty (zero mock users)
let fallbackUsers = [];

/**
 * Initializes database tables (no mock data)
 */
async function initDb() {
  try {
    const client = await pool.connect();
    isDbConnected = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('[Database] Connected to PostgreSQL (users_db) and initialized clean schema.');
  } catch (err) {
    isDbConnected = false;
    console.warn('[Database] PostgreSQL not reachable. Operating with in-memory resilient fallback.');
  }
}

/**
 * Fetches all registered users (excluding sensitive password hashes)
 */
async function getAllUsers() {
  if (isDbConnected) {
    const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    return rows;
  }
  return fallbackUsers.map(({ id, name, email, role, created_at }) => ({ id, name, email, role, created_at }));
}

/**
 * Finds a single user by email (including password_hash for authentication)
 */
async function findUserByEmail(email) {
  if (isDbConnected) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }
  return fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Creates a new user record with hashed password
 */
async function createUser({ name, email, passwordHash, role = 'Customer' }) {
  if (isDbConnected) {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, passwordHash, role]
    );
    return rows[0];
  }
  const newUser = {
    id: fallbackUsers.length + 1,
    name,
    email,
    password_hash: passwordHash,
    role,
    created_at: new Date().toISOString()
  };
  fallbackUsers.push(newUser);
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    created_at: newUser.created_at
  };
}

module.exports = {
  pool,
  initDb,
  getAllUsers,
  findUserByEmail,
  createUser,
};