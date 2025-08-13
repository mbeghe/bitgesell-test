const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Cache for stats
let statsCache = null;
let lastModified = null;

// Calculate stats from items data
function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.length > 0 ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length : 0
  };
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
    const raw = await fs.readFile(DATA_PATH);
    const items = JSON.parse(raw);
    
    statsCache = calculateStats(items);
    const stats = await fs.stat(DATA_PATH);
    lastModified = stats.mtime;
    
    return statsCache;
  } catch (err) {
    throw err;
  }
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Check if cache is valid
    if (await isCacheValid()) {
      return res.json(statsCache);
    }
    
    // Cache invalid or doesn't exist, update it
    const stats = await updateCache();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;