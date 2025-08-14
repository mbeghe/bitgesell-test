const pino = require('pino');

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: true,
      messageFormat: '{msg} | {type} | {timestamp}'
    }
  }
});

const log = {
  info: (type, message, meta = {}) => {
    pinoLogger.info({
      type,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    });
  },
  
  debug: (type, message, meta = {}) => {
    pinoLogger.debug({
      type,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    });
  },
  
  error: (type, message, meta = {}) => {
    pinoLogger.error({
      type,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    });
  },
  
  warn: (type, message, meta = {}) => {
    pinoLogger.warn({
      type,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger: pinoLogger,
  log
};
