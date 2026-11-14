const app = require('./app');

// Default to port 3001 to prevent collisions with user-service (port 3000)
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
});