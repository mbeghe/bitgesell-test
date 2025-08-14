const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { validateItem } = require('../middleware/validations');
const { log } = require('../utils/logger');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let lastId = Date.now();

// Queue for write operations
let writeQueue = Promise.resolve();

let itemsCache = null;
let lastModified = null;

async function readData() {
  const raw = await fs.readFile(DATA_PATH);
  return JSON.parse(raw);
}

function generateUniqueId() {
  lastId = Math.max(lastId + 1, Date.now());
  return lastId;
}

async function writeData(newItem) {
  // Add to queue and wait for previous operations to complete
  writeQueue = writeQueue.then(async () => {
    log.info('WRITE', `Adding new item: ${newItem.name}`, {
      operation: 'adding',
      itemName: newItem.name,
      itemId: newItem.id
    });
    
    const currentData = await readData();
    currentData.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(currentData, null, 2));
    
    itemsCache = null;
    lastModified = null;
    
    log.info('WRITE', `Successfully added item: ${newItem.name}`, {
      operation: 'success',
      itemName: newItem.name,
      itemId: newItem.id
    });
  });
  
  // Wait for this specific write operation to complete
  await writeQueue;
}

async function isCacheValid() {
  if (!itemsCache || !lastModified) return false;
  
  try {
    const stats = await fs.stat(DATA_PATH);
    return stats.mtime.getTime() === lastModified;
  } catch (err) {
    return false;
  }
}

async function updateCache() {
  log.debug('CACHE', 'Updating items cache', {
    operation: 'updating'
  });
  
  const items = await readData();
  const stats = await fs.stat(DATA_PATH);
  
  itemsCache = items;
  lastModified = stats.mtime.getTime();
  
  log.debug('CACHE', `Cache updated with ${items.length} items`, {
    operation: 'updated',
    itemCount: items.length
  });
  
  return items;
}

async function getItemsWithCache() {
  if (await isCacheValid()) {
    log.debug('CACHE', 'Using cached items data', {
      operation: 'hit'
    });
    return itemsCache;
  } else {
    return await updateCache();
  }
}

// Improved substring search function
function searchItems(items, query) {
  if (!query) return items;
  
  const searchTerm = query.toLowerCase().trim();
  
  const results = items.filter(item => {
    // Search in multiple fields: name, category
    return item.name.toLowerCase().includes(searchTerm) ||
           (item.category && item.category.toLowerCase().includes(searchTerm));
  });
  
  log.debug('SEARCH', `Found ${results.length} items matching "${searchTerm}"`, {
    query: searchTerm,
    resultsCount: results.length
  });
  
  return results;
}

router.get('/', async (req, res, next) => {
  try {
    const items = await getItemsWithCache();
    const { limit, q, page = 1 } = req.query;
    
    let results = items;
    
    // Apply search
    results = searchItems(results, q);
    
    const totalItems = results.length;
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = limit ? parseInt(limit) : totalItems;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        results = results.slice(offset, offset + limitNum);
      }
    }
    
    res.json({
      items: results,
      pagination: {
        total: totalItems,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: totalPages,
        hasNext: limit ? currentPage < totalPages : false,
        hasPrev: limit ? currentPage > 1 : false,
        startItem: limit ? offset + 1 : 1,
        endItem: limit ? Math.min(offset + itemsPerPage, totalItems) : totalItems
      }
    });
  } catch (err) {
    log.error('ERROR', 'Error in GET /api/items', {
      context: 'GET /api/items',
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const items = await getItemsWithCache();
    const item = items.find(item => item.id == req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    log.error('ERROR', `Error in GET /api/items/${req.params.id}`, {
      context: `GET /api/items/${req.params.id}`,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
});

router.post('/', validateItem, async (req, res, next) => {
  try {
    const item = req.body;
    item.id = generateUniqueId();
    await writeData(item);
    res.status(201).json(item);
  } catch (err) {
    log.error('ERROR', 'Error in POST /api/items', {
      context: 'POST /api/items',
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
});

module.exports = router;