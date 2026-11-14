const express = require('express');

const app = express();
app.use(express.json());

// In-memory catalog database
const products = [
  { id: '101', name: 'Laptop Pro 16', price: 1299.99, stock: 15 },
  { id: '102', name: 'Wireless Headphones', price: 199.99, stock: 40 },
  { id: '103', name: 'Mechanical Keyboard', price: 89.99, stock: 25 }
];

// Kubernetes Liveness Probe
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// REST API: Get all products
app.get('/api/v1/products', (req, res) => {
  res.status(200).json(products);
});

module.exports = app;