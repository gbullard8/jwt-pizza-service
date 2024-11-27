const app = require('./service.js'); // Use the pre-configured app from service.js
const metrics = require('./metrics'); // Import metrics instance

const port = process.argv[2] || 3000;

// Middleware to track all requests and their methods
app.use((req, res, next) => {
  metrics.incrementRequests(req.method); // Track total requests and method-specific counts
  next();
});

// Example route
app.get('/hello/:name', (req, res) => {
  res.send({ message: `Hello, ${req.params.name}!` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});



