const { log } = require('../utils/logger');

// Production-safe error handler middleware
const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error details for debugging
  log.error('ERROR', `${req.method} ${req.originalUrl} - ${status}: ${message}`, {
    context: `${req.method} ${req.originalUrl}`,
    statusCode: status,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    stack: err.stack
  });
  
  res.status(status).json({
    error: {
      message: status === 500 ? 'Internal Server Error' : message,
      status: status
    }
  });
};

module.exports = { notFound, errorHandler };