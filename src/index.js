const app = require('./service.js'); // Use the pre-configured app from service.js
const metrics = require('./metrics'); // Import metrics instance

const port = process.argv[2] || 3000;

let greeting = 'hello';

// Route to update Grafana metrics explicitly
app.get('/hello/:name', (req, res) => {
  metrics.incrementRequests(); // Use metrics to track the request
  res.send({ [greeting]: req.params.name });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


