const app = require('./app');

// Read the port from the environment, defaulting to 3000 for local development
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});