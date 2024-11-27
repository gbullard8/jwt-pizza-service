const fetch = require('node-fetch');
const config = require('./config.js');

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
    console.log(`method ${method}`);
    
    this.methodCounts[method]++;
      
    
    this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
    this.sendMetricToGrafana('request', method, 'total', this.methodCounts[method]);
  }

  async sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`;

    try {
      const response = await fetch(config.metrics.url, {
        method: 'POST',
        body: metric,
        headers: {
          Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}`,
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

module.exports = new Metrics(config);

