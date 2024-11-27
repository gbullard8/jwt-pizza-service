const fetch = require('node-fetch');
const config = require('./config'); // Dynamically load configuration values from config.js

class Metrics {
  constructor(config) {
    this.totalRequests = 0;
    this.config = config.metrics;
  }

  incrementRequests() {
    this.totalRequests++;
    this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
  }

  async sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${this.config.source},method=${httpMethod} ${metricName}=${metricValue}`;

    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        body: metric,
        headers: {
          Authorization: `Bearer ${this.config.userId}:${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to push metrics data to Grafana');
      } else {
        console.log(`Pushed metric: ${metric}`);
      }
    } catch (error) {
      console.error('Error pushing metrics to Grafana:', error);
    }
  }
}

// Create and export an instance of Metrics with the loaded configuration
module.exports = new Metrics(config);
