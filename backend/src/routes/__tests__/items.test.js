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

describe('Items API Tests', () => {
  const testDataPath = path.join(__dirname, 'test-items.json');
  
  // Test data with categories
  const testData = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
    { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
    { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 },
    { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
    { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 },
    { id: 6, name: 'Gaming Mouse', category: 'Electronics', price: 89 },
    { id: 7, name: 'Office Chair', category: 'Furniture', price: 299 }
  ];
  
  // Store original functions to restore them
  let originalReadFile, originalWriteFile;
  
  beforeAll(() => {
    // Store original functions
    originalReadFile = fs.readFile;
    originalWriteFile = fs.writeFile;
  });
  
  beforeEach(async () => {
    // Clear all mocks to avoid conflicts
    jest.clearAllMocks();
    
    // Restore original functions
    fs.readFile = originalReadFile;
    fs.writeFile = originalWriteFile;
    
    // Create test data file
    await fs.writeFile(testDataPath, JSON.stringify(testData, null, 2));
    
    // Mock fs.readFile to read from our test file
    fs.readFile = jest.fn().mockImplementation((filePath) => {
      if (filePath.includes('items.json')) {
        return originalReadFile(testDataPath, 'utf8');
      }
      return originalReadFile(filePath);
    });

    // Mock fs.writeFile to write to our test file
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

  afterAll(() => {
    // Restore original functions
    fs.readFile = originalReadFile;
    fs.writeFile = originalWriteFile;
  });

  describe('GET /api/items', () => {
    it('should return all items when no query parameters', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(7);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.items[0]).toHaveProperty('id');
      expect(response.body.items[0]).toHaveProperty('name');
      expect(response.body.items[0]).toHaveProperty('category');
      expect(response.body.items[0]).toHaveProperty('price');
    });

    it('should search items by name (original functionality)', async () => {
      const response = await request(app).get('/api/items?q=laptop');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Laptop Pro');
    });

    it('should search items by category (improved functionality)', async () => {
      const response = await request(app).get('/api/items?q=electronics');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(4);
      expect(response.body.items.every(item => item.category === 'Electronics')).toBe(true);
    });

    it('should search items by partial name match', async () => {
      const response = await request(app).get('/api/items?q=chair');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items.every(item => 
        item.name.toLowerCase().includes('chair')
      )).toBe(true);
    });

    it('should handle case insensitive search', async () => {
      const response = await request(app).get('/api/items?q=CHAIR');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items.every(item => 
        item.name.toLowerCase().includes('chair')
      )).toBe(true);
    });

    it('should handle empty search results', async () => {
      const response = await request(app).get('/api/items?q=nonexistent');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(0);
    });

    it('should limit results', async () => {
      const response = await request(app).get('/api/items?limit=3');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(3);
      expect(response.body.pagination.hasNext).toBe(true);
    });

    it('should combine search and limit', async () => {
      const response = await request(app).get('/api/items?q=electronics&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items.every(item => item.category === 'Electronics')).toBe(true);
    });

    it('should handle invalid limit gracefully', async () => {
      const response = await request(app).get('/api/items?limit=invalid');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(7); // Should return all items
    });

    it('should handle negative limit gracefully', async () => {
      const response = await request(app).get('/api/items?limit=-5');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(7); // Should return all items
    });

    it('should handle zero limit gracefully', async () => {
      const response = await request(app).get('/api/items?limit=0');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(7); // Should return all items
    });

    it('should handle whitespace in search query', async () => {
      const response = await request(app).get('/api/items?q=  laptop  ');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Laptop Pro');
    });

    it('should handle pagination with page parameter', async () => {
      const response = await request(app).get('/api/items?limit=3&page=2');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(3);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.hasPrev).toBe(true);
    });

    it('should return correct pagination metadata', async () => {
      const response = await request(app).get('/api/items?limit=3');
      
      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        total: 7,
        page: 1,
        limit: 3,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
        startItem: 1,
        endItem: 3
      });
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return item by id', async () => {
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Laptop Pro');
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app).get('/api/items/999');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });

    it('should handle string id parameter', async () => {
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });
  });

  describe('POST /api/items', () => {
    it('should create new item with valid data', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test',
        price: 100
      };
      
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
    });

    it('should generate unique ids for multiple items', async () => {
      const item1 = { name: 'Item 1', category: 'Test', price: 100 };
      const item2 = { name: 'Item 2', category: 'Test', price: 200 };
      
      const response1 = await request(app).post('/api/items').send(item1);
      const response2 = await request(app).post('/api/items').send(item2);
      
      expect(response1.body.id).not.toBe(response2.body.id);
    });

    describe('Validation Tests', () => {
      it('should reject item with missing name', async () => {
        const invalidItem = {
          category: 'Test',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toHaveLength(2);
        expect(response.body.errors[0].field).toBe('name');
      });

      it('should reject item with missing category', async () => {
        const invalidItem = {
          name: 'Test Item',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toHaveLength(2);
        expect(response.body.errors[0].field).toBe('category');
      });

      it('should reject item with missing price', async () => {
        const invalidItem = {
          name: 'Test Item',
          category: 'Test'
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].field).toBe('price');
      });

      it('should reject item with empty name', async () => {
        const invalidItem = {
          name: '',
          category: 'Test',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('name');
        expect(response.body.errors).toHaveLength(2);
      });

      it('should reject item with name too long', async () => {
        const invalidItem = {
          name: 'a'.repeat(101),
          category: 'Test',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('name');
      });

      it('should reject item with invalid characters in name', async () => {
        const invalidItem = {
          name: 'Test@Item#',
          category: 'Test',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('name');
      });

      it('should reject item with invalid characters in category', async () => {
        const invalidItem = {
          name: 'Test Item',
          category: 'Test@Category',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('category');
      });

      it('should reject item with negative price', async () => {
        const invalidItem = {
          name: 'Test Item',
          category: 'Test',
          price: -10
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('price');
      });

      it('should reject item with price too high', async () => {
        const invalidItem = {
          name: 'Test Item',
          category: 'Test',
          price: 1000000
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('price');
      });

      it('should reject item with non-numeric price', async () => {
        const invalidItem = {
          name: 'Test Item',
          category: 'Test',
          price: 'not a number'
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].field).toBe('price');
      });

      it('should accept item with valid special characters in name', async () => {
        const validItem = {
          name: 'Test Item (Special) - Version 2.0',
          category: 'Test',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(validItem);
        
        expect(response.status).toBe(201);
        expect(response.body.name).toBe(validItem.name);
      });

      it('should trim whitespace from name and category', async () => {
        const itemWithWhitespace = {
          name: '  Test Item  ',
          category: '  Test Category  ',
          price: 100
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(itemWithWhitespace);
        
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Item');
        expect(response.body.category).toBe('Test Category');
      });

      it('should handle multiple validation errors', async () => {
        const invalidItem = {
          name: '',
          category: '',
          price: -10
        };
        
        const response = await request(app)
          .post('/api/items')
          .send(invalidItem);
        
        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(5);
        expect(response.body.errors.map(e => e.field)).toContain('name');
        expect(response.body.errors.map(e => e.field)).toContain('category');
        expect(response.body.errors.map(e => e.field)).toContain('price');
      });
    });
  });
});
