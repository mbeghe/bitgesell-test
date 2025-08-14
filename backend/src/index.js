const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { log } = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

// Global error handler - must be last
app.use(errorHandler);

app.listen(port, () => {
  log.info('SERVER', 'Backend server started', {
    port,
    environment: process.env.NODE_ENV || 'development'
  });
});