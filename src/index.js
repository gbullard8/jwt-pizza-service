const app = require('./service.js');
const metrics = require('./metrics');
const fetch = require('node-fetch');

const port = process.argv[2] || 3000;

// Update Grafana metrics each time the script runs
const updateMetrics = async () => {
  try {
    const response = await fetch(`${process.argv[3] || 'http://localhost:3000'}/metrics`);
    if (response.ok) {
      console.log('Metrics updated in Grafana.');
    } else {
      console.error('Failed to update metrics in Grafana.');
    }
  } catch (error) {
    console.error('Error updating metrics in Grafana:', error);
  }
};

// Start server and update Grafana metrics
app.listen(port, async () => {
  console.log(`Server started on port ${port}`);
  await updateMetrics();
});

