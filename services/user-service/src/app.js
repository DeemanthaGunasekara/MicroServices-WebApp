const express = require('express');

const app = express();
app.use(express.json());

const users = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com' }
];

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/v1/users', (req, res) => {
  res.status(200).json(users);
});

module.exports = app;