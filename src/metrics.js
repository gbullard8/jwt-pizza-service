const fetch = require('node-fetch');
const config = require('./config');

class Metrics {
  constructor(config) {
    this.totalRequests = 0;
    this.methodCounts = {
      GET: 0,
      POST: 0,
      PUT: 0,
      DELETE: 0,
    };
    this.config = config.metrics; 
  }

  incrementRequests(method) {
    this.totalRequests++;

    if (this.methodCounts[method]) {
      this.methodCounts[method]++;
    } else {
      console.warn(`Unhandled HTTP method: ${method}`);
    }

    this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
    this.sendMetricToGrafana('request', method, 'total', this.methodCounts[method]);
  }

  async sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    if (metricValue === undefined) return; 

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
        console.error(`Failed to push metric to Grafana: ${response.statusText}`);
      } else {
        console.log(`Successfully pushed metric: ${metric}`);
      }
    } catch (error) {
      console.error(`Error pushing metric to Grafana:`, error);
    }
  }
}

module.exports = new Metrics(config);


