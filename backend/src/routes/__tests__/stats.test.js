const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const statsRouter = require('../stats');
app.use('/api/stats', statsRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

describe('Stats Cache Tests', () => {
  const testDataPath = path.join(__dirname, 'test-stats-items.json');
  
  const testData = [
    { id: 1, name: 'Item 1', category: 'Electronics', price: 10.00 },
    { id: 2, name: 'Item 2', category: 'Furniture', price: 20.00 },
    { id: 3, name: 'Item 3', category: 'Electronics', price: 30.00 }
  ];
  
  let originalReadFile, originalStat;
  
  beforeAll(() => {
    // Store original functions
    originalReadFile = fs.readFile;
    originalStat = fs.stat;
  });
  
  beforeEach(async () => {
    // Clear all mocks to avoid conflicts
    jest.clearAllMocks();
    
    // Restore original functions
    fs.readFile = originalReadFile;
    fs.stat = originalStat;
    
    await fs.writeFile(testDataPath, JSON.stringify(testData, null, 2));
    
    fs.readFile = jest.fn().mockImplementation((filePath) => {
      if (filePath.includes('items.json')) {
        return originalReadFile(testDataPath, 'utf8');
      }
      return originalReadFile(filePath);
    });

    fs.stat = jest.fn().mockImplementation((filePath) => {
      if (filePath.includes('items.json')) {
        return originalStat(testDataPath);
      }
      return originalStat(filePath);
    });
  });

  afterEach(async () => {
    // Clean up ONLY the test file, not the real data file
    try {
      await fs.unlink(testDataPath);
    } catch (err) {
      // Test file doesn't exist, that's ok
    }
  });
  
  afterAll(() => {
    fs.readFile = originalReadFile;
    fs.stat = originalStat;
  });

  it('should return correct stats on first request', async () => {
    const response = await request(app).get('/api/stats');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 3,
      averagePrice: 20.00
    });
  });

  it('should use cache on subsequent requests', async () => {
    // First request - should calculate stats
    const response1 = await request(app).get('/api/stats');
    expect(response1.status).toBe(200);
    expect(response1.body.total).toBe(3);

    // Second request - should use cache
    const response2 = await request(app).get('/api/stats');
    expect(response2.status).toBe(200);
    expect(response2.body).toEqual(response1.body);
  });

  it('should invalidate cache when file changes', async () => {
    // First request
    const response1 = await request(app).get('/api/stats');
    expect(response1.body.total).toBe(3);

    // Modify the file
    const newData = [
      { id: 1, name: 'Item 1', category: 'Electronics', price: 10.00 },
      { id: 2, name: 'Item 2', category: 'Furniture', price: 20.00 }
    ];
    await fs.writeFile(testDataPath, JSON.stringify(newData, null, 2));

    const response2 = await request(app).get('/api/stats');
    expect(response2.status).toBe(200);
    expect(response2.body.total).toBe(2);
    expect(response2.body.averagePrice).toBe(15.00);
  });

  it('should handle empty file', async () => {
    await fs.writeFile(testDataPath, JSON.stringify([], null, 2));
    
    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 0,
      averagePrice: 0
    });
  });

  it('should handle file not found', async () => {
    // Remove the test file
    try {
      await fs.unlink(testDataPath);
    } catch (err) {
      // Test file doesn't exist, that's ok
    }
    
    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(500);
  });
});
