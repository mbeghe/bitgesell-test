const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { validateItem } = require('../middleware/validations');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let lastId = Date.now();

// Queue for write operations
let writeQueue = Promise.resolve();

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
  });
  
  // Wait for this specific write operation to complete
  await writeQueue;
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
    const items = await readData();
    const { limit, q } = req.query;
    
    let results = items;
    
    // Apply search
    results = searchItems(results, q);
    
    // Apply pagination
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        results = results.slice(0, limitNum);
      }
    }
    
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const items = await readData();
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