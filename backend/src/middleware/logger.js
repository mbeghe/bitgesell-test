const { log } = require('../utils/logger');

module.exports = (req, res, next) => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  log.info('REQUEST', `${method} ${url}`, {
    method,
    url,
    query: req.query,
    ip
  });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    log.info('RESPONSE', `${method} ${url} - ${res.statusCode}`, {
      method,
      url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};