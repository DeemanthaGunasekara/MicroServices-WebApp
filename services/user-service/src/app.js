const express = require('express');
const client = require('prom-client');

const app = express();
app.use(express.json());

client.collectDefaultMetrics();

const users = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com' }
];

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.get('/api/v1/users', (req, res) => {
  res.status(200).json(users);
});

module.exports = app;