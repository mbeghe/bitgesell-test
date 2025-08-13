const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { validateItem } = require('../middleware/validations');
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
    const currentData = await readData();
    currentData.push(newItem);
    await fs.writeFile(DATA_PATH, JSON.stringify(currentData, null, 2));
    
    itemsCache = null;
    lastModified = null;
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
  const items = await readData();
  const stats = await fs.stat(DATA_PATH);
  
  itemsCache = items;
  lastModified = stats.mtime.getTime();
  
  return items;
}

async function getItemsWithCache() {
  if (await isCacheValid()) {
    return itemsCache;
  } else {
    return await updateCache();
  }
}

// Improved substring search function
function searchItems(items, query) {
  if (!query) return items;
  
  const searchTerm = query.toLowerCase().trim();
  
  return items.filter(item => {
    // Search in multiple fields: name, category
    return item.name.toLowerCase().includes(searchTerm) ||
           (item.category && item.category.toLowerCase().includes(searchTerm));
  });
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
    next(err);
  }
});

module.exports = router;