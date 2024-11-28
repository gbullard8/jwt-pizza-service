const fetch = require('node-fetch');
const config = require('./config.js');
const os = require('os');

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
    this.activeUsers = 0;
  }
  //part 1 http requests
  incrementRequests(method) {
    this.totalRequests++;
    console.log(`method ${method}`);
    
    this.methodCounts[method]++;
      
    
    this.sendHTTPMetricToGrafana('request', 'all', 'total', this.totalRequests);
    this.sendHTTPMetricToGrafana('request', method, 'total', this.methodCounts[method]);
  }

  async sendHTTPMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
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

  //part 2 active users
  incrementActiveUsers() {
    this.activeUsers++;
    console.log(`incremented ${this.activeUsers}`)
    this.sendActiveUserMetric();

  }
  decrementActiveUsers() {
    if (this.activeUsers > 0) {
      this.activeUsers--;
      console.log(`decremented ${this.activeUsers}`)
    }
    this.sendActiveUserMetric();
  }

  async sendActiveUserMetric() {
    console.log("Entered active users metric");
  
    const metric = `active_users,source=${config.metrics.source} count=${this.activeUsers}`;
  
    try {
      console.log("Entered active users metric");
      const response = await fetch(config.metrics.url, {
        method: 'POST',
        body: metric,
        headers: {
          Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}`,
          'Content-Type': 'application/json', 
        },
      });
  
      if (!response.ok) {
        console.error(`Failed to push active user metric to Grafana: ${response.status} - ${response.statusText}`);
      } else {
        console.log(`Pushed active user metric successfully: ${metric}`);
      }
    } catch (error) {
      console.error('Error pushing active user metric to Grafana:', error);
    }
  }


  getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
  }
  
  getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
  }

  sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
      try {
        const buf = new MetricBuilder();
        httpMetrics(buf);
        systemMetrics(buf);
        userMetrics(buf);
        purchaseMetrics(buf);
        authMetrics(buf);
  
        const metrics = buf.toString('\n');
        this.sendMetricToGrafana(metrics);
      } catch (error) {
        console.log('Error sending metrics', error);
      }
    }, period);
  }
  
}


module.exports = new Metrics(config);

