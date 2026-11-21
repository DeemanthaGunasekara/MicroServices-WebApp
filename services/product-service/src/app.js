const express = require('express');
const client = require('prom-client');
const { getProducts, getCategories } = require('./productCatalog');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// Initialize Prometheus metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Liveness & Readiness probe for Kubernetes
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-service' });
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

// Get product categories
app.get('/api/v1/products/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
  }
});

// Get all products (with optional ?category= and ?search= filtering)
app.get('/api/v1/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const products = await getProducts({ category, search });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
});

// Get single product by ID
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === parseInt(req.params.id, 10));

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve product' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
  });
}

module.exports = app;