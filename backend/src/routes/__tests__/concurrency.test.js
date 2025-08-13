const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Create a test app
const app = express();
app.use(express.json());

// Import the router
const itemsRouter = require('../items');
app.use('/api/items', itemsRouter);

// Error handling middleware for tests
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

describe('Concurrency Tests', () => {
  const testDataPath = path.join(__dirname, 'test-items.json');
  
  // Test data
  const testData = [
    { id: 1, name: 'Test Item 1', price: 10.99 },
    { id: 2, name: 'Test Item 2', price: 20.50 }
  ];
  
  beforeEach(async () => {
    // Create test data file
    await fs.writeFile(testDataPath, JSON.stringify(testData, null, 2));
    
    // Mock fs.readFile to read from our test file
    const originalReadFile = fs.readFile;
    fs.readFile = jest.fn().mockImplementation((filePath) => {
      if (filePath.includes('items.json')) {
        return originalReadFile(testDataPath, 'utf8');
      }
      return originalReadFile(filePath);
    });

    // Mock fs.writeFile to write to our test file
    const originalWriteFile = fs.writeFile;
    fs.writeFile = jest.fn().mockImplementation((filePath, data) => {
      if (filePath.includes('items.json')) {
        return originalWriteFile(testDataPath, data);
      }
      return originalWriteFile(filePath, data);
    });
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testDataPath);
    } catch (err) {
      // File doesn't exist, that's ok
    }
  });

  afterAll(async () => {
    // Final cleanup in case afterEach failed
    try {
      await fs.unlink(testDataPath);
    } catch (err) {
      // File doesn't exist, that's ok
    }
  });

  it('should handle concurrent POST requests without data loss', async () => {
    const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
      request(app)
        .post('/api/items')
        .send({ name: `Concurrent Item ${i + 1}`, price: 10 + i })
    );

    // Execute all requests simultaneously
    const responses = await Promise.all(concurrentRequests);

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBeDefined();
    });

    // All IDs should be unique
    const ids = responses.map(r => r.body.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);

    // Verify final state by reading the test file
    const finalData = JSON.parse(await fs.readFile(testDataPath, 'utf8'));
    expect(finalData).toHaveLength(7);

    responses.forEach(response => {
      expect(finalData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 
            id: response.body.id,
            name: response.body.name 
          })
        ])
      );
    });
  });

  it('should maintain data consistency under high concurrency', async () => {
    // Make 10 concurrent requests
    const concurrentRequests = Array.from({ length: 10 }, (_, i) => 
      request(app)
        .post('/api/items')
        .send({ name: `Stress Item ${i + 1}`, price: 100 + i })
    );

    const responses = await Promise.all(concurrentRequests);

    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    // Verify no data loss by reading the test file
    const finalData = JSON.parse(await fs.readFile(testDataPath, 'utf8'));
    expect(finalData).toHaveLength(12); // 2 initial + 10 new items

    // Verify all items have unique IDs
    const ids = finalData.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(12);
  });
});
