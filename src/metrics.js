const config = require('./config.json');

const fetch = require('node-fetch');

class Metrics {
  constructor(config) {
    this.totalRequests = 0;
    this.config = config;
  }

  incrementRequests() {
    this.totalRequests++;
    this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
  }

  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${this.config.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(this.config.url, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${this.config.userId}:${this.config.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }
}