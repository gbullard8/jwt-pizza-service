const config = require('./config');
const fetch = require('node-fetch');

class Logger {
    httpLogger = (req, res, next) => {
        const originalSend = res.send;  
        res.send = (body) => {
          res.on('finish', () => {
            this.logRequestResponse(req, res, body);
          });
    
          return originalSend.call(res, body);
        };
    
        next();
      };

  logRequestResponse(req, res, resBody) {
    const logData = {
      authorized: !!req.headers.authorization,
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      reqBody: JSON.stringify(req.body),
      resBody: JSON.stringify(resBody),
      clientIp: req.ip,
    };
    const level = this.statusToLogLevel(res.statusCode);
    this.log(level, 'http', logData);
  }

  log(level, type, logData) {
    const labels = { 
      component: config.logging.source, 
      level: level, 
      type: type,
      method: logData.method,
      path: logData.path
    };
    const values = [this.nowString(), this.sanitize(logData)];
    const logEvent = { streams: [{ stream: labels, values: [values] }] };

    this.sendLogToGrafana(logEvent);
  }

  statusToLogLevel(statusCode) {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
  }

  nowString() {
    return (Math.floor(Date.now()) * 1000000).toString();
  }

  sanitize(logData) {
    logData = JSON.stringify(logData);
    return logData.replace(/\\"password\\":\s*\\"[^"]*\\"/g, '\\"password\\": \\"*****\\"');
  }

  async sendLogToGrafana(event) {
    const body = JSON.stringify(event);
    try {
      const res = await fetch(`${config.logging.url}`, {
        method: 'post',
        body: body,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.logging.userId}:${config.logging.apiKey}`,
        },
      });
      if (!res.ok) {
        console.error(`Failed to send log to Grafana: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to send log to Grafana:', error);
    }
  }
}

module.exports = new Logger();
