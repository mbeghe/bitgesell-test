const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { mean } = require('../utils/stats');
const { log } = require('../utils/logger');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Cache for stats
let statsCache = null;
let lastModified = null;

// Calculate stats from items data using utility functions
function calculateStats(items) {
  log.debug('STATS', `Calculating stats for ${items.length} items`, {
    operation: 'calculating',
    itemCount: items.length
  });
  
  const prices = items.map(item => item.price);
  const result = {
    total: items.length,
    averagePrice: items.length > 0 ? mean(prices) : 0
  };
  
  log.debug('STATS', `Calculated stats - Total: ${result.total}, Average Price: $${result.averagePrice.toFixed(2)}`, {
    operation: 'calculated',
    total: result.total,
    averagePrice: result.averagePrice.toFixed(2)
  });
  
  return result;
}

// Check if cache is still valid
async function isCacheValid() {
  if (!statsCache || !lastModified) return false;
  
  try {
    const stats = await fs.stat(DATA_PATH);
    return stats.mtime.getTime() === lastModified.getTime();
  } catch (err) {
    return false;
  }
}

async function updateCache() {
  try {
    log.debug('STATS', 'Updating stats cache', {
      operation: 'updating'
    });
    
    const raw = await fs.readFile(DATA_PATH);
    const items = JSON.parse(raw);
    
    statsCache = calculateStats(items);
    const stats = await fs.stat(DATA_PATH);
    lastModified = stats.mtime;
    
    log.debug('STATS', 'Stats cache updated successfully', {
      operation: 'updated'
    });
    
    return statsCache;
  } catch (err) {
    log.error('ERROR', 'Error updating stats cache', {
      context: 'stats cache update',
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Check if cache is valid
    if (await isCacheValid()) {
      log.debug('STATS', 'Returning cached stats', {
        operation: 'cache_hit'
      });
      return res.json(statsCache);
    }
    
    // Cache invalid or doesn't exist, update it
    log.debug('STATS', 'Cache invalid, recalculating stats', {
      operation: 'cache_miss'
    });
    
    const stats = await updateCache();
    res.json(stats);
  } catch (err) {
    log.error('ERROR', 'Error in GET /api/stats', {
      context: 'GET /api/stats',
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
});

module.exports = router;